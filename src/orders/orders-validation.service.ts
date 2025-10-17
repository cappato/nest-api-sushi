import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';

// Tolerancia para comparación de decimales (centavos)
const EPSILON = 0.01;

// Zona horaria de Argentina
const TIMEZONE = 'America/Argentina/Buenos_Aires';


// Nombres de días como constante de módulo
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Injectable()
export class OrdersValidationService {
  constructor(private readonly configService: ConfigService) {}

  validateBusinessHours(): void {
    // Saltear validación si está en modo test
    if (process.env.SKIP_BUSINESS_HOURS_VALIDATION === 'true') {
      return;
    }

    // Obtener hora actual en zona horaria de Argentina
    const now = new Date();
    const argentinaTime = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    const hour = argentinaTime.getHours();
    const day = argentinaTime.getDay();

    const openHour = this.configService.get<number>('business.openHour', 18);
    const closeHour = this.configService.get<number>('business.closeHour', 3);
    const closedDays = this.configService.get<number[]>('business.closedDays', []);

    // Verificar si el día está cerrado
    if (closedDays.includes(day)) {
      throw new BadRequestException(`El local no recibe pedidos los ${DAY_NAMES[day]}`);
    }

    // Maneja horarios que cruzan medianoche (ej: 18:00 a 03:00)
    const isOpen =
      openHour < closeHour
        ? hour >= openHour && hour < closeHour  // Horario normal (ej: 10:00 a 18:00)
        : hour >= openHour || hour < closeHour; // Cruza medianoche (ej: 18:00 a 03:00)

    if (!isOpen) {
      const closeDisplay = closeHour === 0 ? '00:00' : `${closeHour.toString().padStart(2, '0')}:00`;
      throw new BadRequestException(
        `Los pedidos solo se pueden realizar entre las ${openHour}:00 y las ${closeDisplay}`,
      );
    }
  }

  validateOrderItems(dto: CreateOrderDto): void {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El carrito no puede estar vacío');
    }

    const calculatedTotal = dto.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    dto.items.forEach((item, index) => {
      const expectedTotal = item.unitPrice * item.quantity;
      const diff = Math.abs(expectedTotal - item.totalPrice);

      if (diff > EPSILON) {
        throw new BadRequestException(
          `El total del item ${index + 1} no coincide con el cálculo (esperado: ${expectedTotal}, recibido: ${item.totalPrice})`,
        );
      }
    });
  }

  validateDeliveryAddress(dto: CreateOrderDto): void {
    if (dto.deliveryType === 'ENVIO' && !dto.address) {
      throw new BadRequestException(
        'La dirección es obligatoria para pedidos con envío',
      );
    }

    if (dto.deliveryType === 'ENVIO' && dto.address) {
      if (!dto.address.street || !dto.address.city) {
        throw new BadRequestException(
          'La dirección debe incluir al menos calle y ciudad',
        );
      }
    }
  }

  validateContactInfo(dto: CreateOrderDto): void {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'Debe proporcionar al menos un email o teléfono de contacto',
      );
    }
  }

  validateAll(dto: CreateOrderDto): void {
    this.validateBusinessHours();
    this.validateOrderItems(dto);
    this.validateDeliveryAddress(dto);
    this.validateContactInfo(dto);
  }
}

