import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Public Business')
@Controller('public/business')
export class BusinessController {
  private readonly TIMEZONE = 'America/Argentina/Buenos_Aires';

  constructor(private readonly configService: ConfigService) {}

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado del negocio (abierto/cerrado)' })
  @ApiResponse({
    status: 200,
    description: 'Estado del negocio',
    schema: {
      type: 'object',
      properties: {
        isOpen: { type: 'boolean' },
        message: { type: 'string' },
        currentHour: { type: 'number' },
        currentDay: { type: 'number' },
        openingHour: { type: 'number' },
        closingHour: { type: 'number' },
      },
    },
  })
  getStatus() {
    const now = new Date();
    const argentinaTime = new Date(
      now.toLocaleString('en-US', { timeZone: this.TIMEZONE }),
    );
    const hour = argentinaTime.getHours();
    const day = argentinaTime.getDay();

    const openingHour = this.configService.get<number>('business.openHour', 18);
    const closingHour = this.configService.get<number>('business.closeHour', 3);
    const closedDays = this.configService.get<number[]>('business.closedDays', []);

    // Check if closed day
    if (closedDays.includes(day)) {
      return {
        isOpen: false,
        message: 'Estamos cerrados los lunes. ¡Te esperamos mañana!',
        currentHour: hour,
        currentDay: day,
        openingHour,
        closingHour,
      };
    }

    // Check if within business hours (handles midnight crossing)
    let isOpen: boolean;
    if (closingHour < openingHour) {
      // Crosses midnight (e.g., 18:00 - 03:00)
      isOpen = hour >= openingHour || hour < closingHour;
    } else {
      // Same day (e.g., 09:00 - 17:00)
      isOpen = hour >= openingHour && hour < closingHour;
    }

    const message = isOpen
      ? `Estamos abiertos. Horario: ${openingHour}:00 - ${closingHour}:00`
      : `Estamos cerrados. Abrimos a las ${openingHour}:00`;

    return {
      isOpen,
      message,
      currentHour: hour,
      currentDay: day,
      openingHour,
      closingHour,
    };
  }
}

