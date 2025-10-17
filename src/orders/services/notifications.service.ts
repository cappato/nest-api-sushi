import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Placeholder para notificaciones (Email / WhatsApp)
   *
   * Métodos a implementar:
   * - sendOrderConfirmation(orderId: number): Promise<void>
   * - sendOrderStatusUpdate(orderId: number, status: string): Promise<void>
   * - sendWhatsAppNotification(phone: string, message: string): Promise<void>
   * - sendEmailNotification(email: string, subject: string, body: string): Promise<void>
   */

  async sendOrderConfirmation(orderId: number): Promise<void> {
    // TODO: Implementar envío de confirmación
    this.logger.log(`Sending order confirmation for order ${orderId}`);
  }

  async sendOrderStatusUpdate(orderId: number, status: string): Promise<void> {
    // TODO: Implementar notificación de cambio de estado
    this.logger.log(`Sending status update for order ${orderId}: ${status}`);
  }

  async sendWhatsAppNotification(phone: string, message: string): Promise<void> {
    // TODO: Implementar integración con WhatsApp Business API
    this.logger.log(`Sending WhatsApp to ${phone}: ${message}`);
  }

  async sendEmailNotification(
    email: string,
    subject: string,
    body: string,
  ): Promise<void> {
    // TODO: Implementar envío de email (SendGrid, Resend, etc.)
    this.logger.log(`Sending email to ${email}: ${subject}`);
  }
}

