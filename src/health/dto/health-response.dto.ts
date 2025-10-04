import { ApiProperty } from '@nestjs/swagger';

export class BasicHealthResponseDto {
  @ApiProperty({ example: true, description: 'Health status' })
  ok: boolean;

  @ApiProperty({ example: 'Service is running', description: 'Status message', required: false })
  message?: string;
}

export class DatabaseHealthResponseDto extends BasicHealthResponseDto {
  @ApiProperty({ example: 'successful', description: 'Connection status', required: false })
  connection?: string;

  @ApiProperty({ example: '2025-09-07T15:55:54.666Z', description: 'Current timestamp', required: false })
  now?: string;

  @ApiProperty({ example: 'postgres', description: 'Database user', required: false })
  role?: string;

  @ApiProperty({ example: 'postgres', description: 'Database name', required: false })
  db?: string;

  @ApiProperty({ example: 'PostgreSQL 15.14...', description: 'Database version', required: false })
  version?: string;

  @ApiProperty({ example: 'Connection failed', description: 'Error message', required: false })
  error?: string;
}