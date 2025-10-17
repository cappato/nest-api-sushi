import { ApiProperty } from '@nestjs/swagger';

export class ZoneResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Centro' })
  name: string;

  @ApiProperty({ example: 500 })
  deliveryFee: number;

  @ApiProperty({
    example: [
      [-38.0, -57.55],
      [-38.0, -57.54],
      [-38.01, -57.54],
      [-38.01, -57.55],
      [-38.0, -57.55],
    ],
    description: 'Polígono de la zona en formato [[lat, lng], ...]',
  })
  polygon: number[][];

  @ApiProperty({ example: 10 })
  priority: number;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ example: '2025-10-11T12:00:00.000Z' })
  updatedAt: Date;
}

