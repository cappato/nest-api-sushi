import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZonesService } from './zones.service';
import { AppLogger } from '../common/logger/logger.service';

import { ZoneResponseDto } from './dto/zone-response.dto';

@ApiTags('Zones')
@Controller('public/zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService, private readonly logger: AppLogger) {}

  @Get()
  @ApiOperation({ summary: 'Obtener zonas de envío activas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de zonas activas',
    type: [ZoneResponseDto],
  })
  async getActiveZones(): Promise<ZoneResponseDto[]> {
    this.logger.log('GET /public/zones');
    return this.zonesService.getActiveZones();
  }
}

