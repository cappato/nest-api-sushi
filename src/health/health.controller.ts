import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import {
  BasicHealthResponseDto,
  DatabaseHealthResponseDto
} from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiOkResponse({ description: 'Service is healthy', type: BasicHealthResponseDto })
  healthz(): BasicHealthResponseDto {
    return { ok: true, message: 'API is running' };
  }

  @Get('db')
  @ApiOperation({ summary: 'Database health check' })
  @ApiOkResponse({ description: 'Database connection status', type: DatabaseHealthResponseDto })
  async checkDatabase(): Promise<DatabaseHealthResponseDto> {
    return this.databaseService.checkHealth();
  }
}
