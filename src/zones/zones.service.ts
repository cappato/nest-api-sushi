import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon as turfPolygon } from '@turf/helpers';

import { ZoneResponseDto } from './dto/zone-response.dto';

@Injectable()
export class ZonesService {


  constructor(private readonly prisma: PrismaService, private readonly logger: AppLogger) {}

  /**
   * Obtiene todas las zonas activas
   */
  async getActiveZones(): Promise<ZoneResponseDto[]> {
    const zones = await this.prisma.zone.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        deliveryFee: true,
        polygon: true,
        priority: true,
        version: true,
        updatedAt: true,
      },
      orderBy: { priority: 'desc' },
    });

    this.logger.debug(`Found ${zones.length} active zones`);

    return zones.map((zone) => ({
      ...zone,
      polygon: zone.polygon as number[][],
    }));
  }

  /**
   * Encuentra la zona que contiene un punto (lat, lng)
   * Usa algoritmo ray-casting para point-in-polygon
   */
  async findZoneByCoordinates(
    lat: number,
    lng: number,
  ): Promise<ZoneResponseDto | null> {
    const zones = await this.getActiveZones();

    // Buscar zonas que contengan el punto, ordenadas por prioridad
    for (const zone of zones) {
      if (this.pointInPolygon([lat, lng], zone.polygon)) {
        this.logger.debug(
          `Point [${lat}, ${lng}] found in zone: ${zone.name}`,
        );
        return zone;
      }
    }

    this.logger.debug(`Point [${lat}, ${lng}] not found in any zone`);
    return null;
  }

  /**
   * Algoritmo ray-casting para determinar si un punto está dentro de un polígono
   * @param point [lat, lng]
   * @param polygon [[lat, lng], ...]
   */
  private pointInPolygon([lat, lng]: number[], poly: number[][]) {
    return booleanPointInPolygon(point([lng, lat]), turfPolygon([poly.map(([la, lo]) => [lo, la])]));
  }
}

