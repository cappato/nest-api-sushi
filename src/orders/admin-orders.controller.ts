import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@ApiSecurity('api-key')
@ApiTags('Admin Orders')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los pedidos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  @ApiResponse({ status: 403, description: 'API key inválida o faltante' })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getAllOrders(
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  @ApiResponse({ status: 403, description: 'API key inválida o faltante' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de un pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'API key inválida o faltante' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateStatusDto.status);
  }
}

