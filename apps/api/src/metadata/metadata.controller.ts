import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { ActiveProfileGuard } from '../auth/active-profile.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Metadata Lookups')
@ApiBearerAuth()
@UseGuards(SupabaseJwtGuard, ActiveProfileGuard)
@Controller()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('roles')
  async getRoles() {
    const list = await this.metadataService.getRoles();
    return {
      data: list,
      meta: {},
      error: null,
    };
  }

  @Get('departments')
  async getDepartments() {
    const list = await this.metadataService.getDepartments();
    return {
      data: list,
      meta: {},
      error: null,
    };
  }

  @Get('customer-organizations')
  async getCustomerOrganizations() {
    const list = await this.metadataService.getCustomerOrganizations();
    return {
      data: list,
      meta: {},
      error: null,
    };
  }
}
