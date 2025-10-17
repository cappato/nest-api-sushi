import { Order, OrderItem, Product, Zone } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type OrderItemWithProduct = OrderItem & {
  product?: Product | null;
};

type OrderWithRelations = Order & {
  items?: OrderItemWithProduct[];
  user?: any;
  zone?: Zone | null;
};

/**
 * Transforma Prisma Decimal y BigInt a Number para serialización JSON
 */
export function transformOrderResponse(order: OrderWithRelations): any {
  return {
    ...order,
    totalAmount: order.totalAmount ? Number(order.totalAmount) : null,
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      product: item.product ? {
        ...item.product,
        externalId: Number(item.product.externalId),
        price: Number(item.product.price),
        cost: item.product.cost ? Number(item.product.cost) : null,
      } : null,
    })),
  };
}

/**
 * Transforma array de pedidos
 */
export function transformOrdersResponse(orders: OrderWithRelations[]): any[] {
  return orders.map(transformOrderResponse);
}

