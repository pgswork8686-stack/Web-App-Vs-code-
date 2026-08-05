import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @Get()
  async getHealth() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
