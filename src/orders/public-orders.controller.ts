import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Public Orders')
@Controller('public/orders')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo pedido (público)' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per 60 seconds
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener pedidos de un usuario (público)' })
  @ApiResponse({ status: 200, description: 'Pedidos del usuario' })
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ordersService.getOrdersByUser(userId);
  }
}

