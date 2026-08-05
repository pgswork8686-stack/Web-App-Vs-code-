import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { roles, departments, customerOrganizations } from '@pgs/database';

@Injectable()
export class MetadataService {
  constructor(private readonly dbService: DatabaseService) {}

  async getRoles() {
    return this.dbService.db.select().from(roles);
  }

  async getDepartments() {
    return this.dbService.db.select().from(departments);
  }

  async getCustomerOrganizations() {
    return this.dbService.db.select().from(customerOrganizations);
  }
}
