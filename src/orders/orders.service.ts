import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ZonesService } from '../zones/zones.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, DeliveryType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { OrdersValidationService } from './orders-validation.service';
import { transformOrderResponse, transformOrdersResponse } from './orders.transformer';
import { AppLogger } from '../common/logger/logger.service';


@Injectable()
export class OrdersService {


  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly validationService: OrdersValidationService,
    private readonly zonesService: ZonesService,
    private readonly logger: AppLogger,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    this.validationService.validateAll(dto);

    this.logger.debug(`Creando pedido para ${dto.fullName}`);

    // Validar zona y calcular costo de envío ANTES de la transacción
    let shippingFee = 0;
    let zoneId: number | null = null;

    if (dto.deliveryType === DeliveryType.ENVIO) {
      // Validar que se proporcionen coordenadas
      if (!dto.lat || !dto.lng) {
        throw new BadRequestException(
          'Las coordenadas (lat, lng) son obligatorias para envíos'
        );
      }

      // Buscar zona que contenga las coordenadas
      const zone = await this.zonesService.findZoneByCoordinates(
        dto.lat,
        dto.lng,
      );

      if (!zone) {
        throw new BadRequestException(
          'OUT_OF_ZONE: La dirección está fuera de las zonas de envío disponibles'
        );
      }

      shippingFee = zone.deliveryFee;
      zoneId = zone.id;

      this.logger.debug(
        `Zona encontrada: ${zone.name} - Costo de envío: ${shippingFee}`,
      );
    } else {
      this.logger.debug('Tipo de entrega: RETIRO - Sin costo de envío');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
      // Validar que los productos existan
      const productIds = dto.items
        .map(item => item.productId)
        .filter((id): id is number => id !== undefined && id !== null);

      if (productIds.length > 0) {
        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true },
        });

        const foundIds = products.map(p => p.id);
        const missingIds = productIds.filter(id => !foundIds.includes(id));

        if (missingIds.length > 0) {
          throw new NotFoundException(
            `Productos no encontrados: ${missingIds.join(', ')}`
          );
        }
      }

      let user: { id: number } | null = null;

      if (dto.email || dto.phone) {
        // Normalizar teléfono
        const normalizedPhone = dto.phone?.replace(/[\s\-\(\)]/g, '');

        // Buscar usuario existente por email o phone dentro de la transacción
        const existing = await tx.user.findFirst({
          where: {
            OR: [
              ...(dto.email ? [{ email: dto.email }] : []),
              ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
            ],
          },
        });

        if (existing) {
          this.logger.debug(`Actualizando usuario existente: ${existing.id}`);
          user = await tx.user.update({
            where: { id: existing.id },
            data: {
              fullName: dto.fullName,
              email: dto.email,
              phone: normalizedPhone,
            },
          });
        } else {
          this.logger.debug(`Creando nuevo usuario: ${dto.fullName}`);
          user = await tx.user.create({
            data: {
              fullName: dto.fullName,
              email: dto.email,
              phone: normalizedPhone,
            },
          });
        }
      }

      const subtotal = dto.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalAmount = subtotal + shippingFee;

      // Log calculated total for auditing
      this.logger.debug(
        `Subtotal: $${subtotal} + Envío: $${shippingFee} = Total: $${totalAmount} (${dto.items.length} items)`,
      );

      const order = await tx.order.create({
        data: {
          userId: user?.id,
          deliveryType: dto.deliveryType,
          address: dto.address,
          comments: dto.comments,
          paymentMethod: dto.paymentMethod,
          status: OrderStatus.PENDIENTE,
          totalAmount: new Decimal(totalAmount),
          shippingFee,
          zoneId,
          lat: dto.lat,
          lng: dto.lng,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId || null,
              name: item.name,
              quantity: item.quantity,
              unitPrice: new Decimal(item.unitPrice),
              totalPrice: new Decimal(item.totalPrice),
            })),
          },
        },
        include: {
          items: true,
          user: true,
          zone: true,
        },
      });

      this.logger.debug(`Orden creada exitosamente: ID ${order.id}`);

      return transformOrderResponse(order);
      });
    } catch (error) {
      this.logger.error(`Error creando orden: ${error.message}`, error.stack);
      this.logger.error(`Error code: ${error.code}`);
      this.logger.error(`Error meta: ${JSON.stringify(error.meta)}`);
      throw error;
    }
  }

  async getOrdersByUser(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transformOrdersResponse(orders);
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return transformOrderResponse(order);
  }

  async updateOrderStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: true,
      },
    });

    return transformOrderResponse(updatedOrder);
  }

  async getAllOrders(
    status?: OrderStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: status ? { status } : undefined,
        include: {
          items: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.order.count({
        where: status ? { status } : undefined,
      }),
    ]);

    return {
      data: transformOrdersResponse(orders),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
