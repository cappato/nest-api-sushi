import { Injectable } from '@nestjs/common';

import { AppLogger } from '../../common/logger/logger.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly logger: AppLogger) {}

  /**
   * Placeholder para integración con Mercado Pago / Walla
   *
   * Métodos a implementar:
   * - createPaymentLink(orderId: number, amount: number): Promise<string>
   * - verifyPayment(paymentId: string): Promise<boolean>
   * - processRefund(paymentId: string): Promise<void>
   */

  async createPaymentLink(orderId: number, amount: number): Promise<string> {
    // TODO: Implementar integración con Mercado Pago
    this.logger.log(`Creating payment link for order ${orderId}, amount: ${amount}`);
    return 'https://payment-link-placeholder.com';
  }

  async verifyPayment(paymentId: string): Promise<boolean> {
    // TODO: Implementar verificación de pago
    this.logger.log(`Verifying payment ${paymentId}`);
    return false;
  }

  async processRefund(paymentId: string): Promise<void> {
    // TODO: Implementar reembolso
    this.logger.log(`Processing refund for payment ${paymentId}`);
  }
}

