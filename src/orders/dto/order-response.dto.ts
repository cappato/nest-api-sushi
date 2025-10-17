import { DeliveryType, PaymentMethod, OrderStatus } from '@prisma/client';

export class OrderItemResponseDto {
  id: number;
  productId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class OrderResponseDto {
  id: number;
  userId?: number;
  deliveryType: DeliveryType;
  address?: any;
  comments?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalAmount?: number;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

