import { readRange, appendRows, updateRange } from '../services/google-sheets.js';
import { v4 as uuidv4 } from 'uuid';

export class CustomerRepository {
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.sheetName = 'Customers';
  }

  async getAllCustomers(tenantId) {
    try {
      const range = `${this.sheetName}!A:K`;
      const response = await readRange(this.spreadsheetId, range);
      const [headers, ...rows] = response.values || [];

      if (!headers) return [];

      return rows
        .filter(row => row[1] === tenantId) // Filter by tenant_id
        .map(row => this._mapRowToCustomer(headers, row));
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  async getCustomer(tenantId, customerId) {
    try {
      const customers = await this.getAllCustomers(tenantId);
      return customers.find(c => c.id === customerId);
    } catch (error) {
      console.error('Error getting customer:', error);
      return null;
    }
  }

  async createCustomer(tenantId, data) {
    try {
      const customer = {
        id: uuidv4(),
        tenant_id: tenantId,
        first_name: data.first_name,
        last_name: data.last_name || '',
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        pipeline_id: data.pipeline_id || '',
        stage_id: data.stage_id || '',
        owner_id: data.owner_id || '',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const row = [
        customer.id,
        customer.tenant_id,
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.company,
        customer.pipeline_id,
        customer.stage_id,
        customer.owner_id,
        customer.status,
        customer.created_at,
        customer.updated_at
      ];

      await appendRows(this.spreadsheetId, `${this.sheetName}!A:M`, [row]);
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(tenantId, customerId, data) {
    try {
      const customers = await this.getAllCustomers(tenantId);
      const index = customers.findIndex(c => c.id === customerId);

      if (index === -1) throw new Error('Customer not found');

      const customer = customers[index];
      const updated = {
        ...customer,
        ...data,
        updated_at: new Date().toISOString()
      };

      const row = [
        updated.id,
        updated.tenant_id,
        updated.first_name,
        updated.last_name,
        updated.email,
        updated.phone,
        updated.company,
        updated.pipeline_id,
        updated.stage_id,
        updated.owner_id,
        updated.status,
        updated.created_at,
        updated.updated_at
      ];

      const rowNumber = index + 2; // +2 because of header and 1-based indexing
      await updateRange(this.spreadsheetId, `${this.sheetName}!A${rowNumber}:M${rowNumber}`, [row]);

      return updated;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(tenantId, customerId) {
    try {
      const customers = await this.getAllCustomers(tenantId);
      const index = customers.findIndex(c => c.id === customerId);

      if (index === -1) throw new Error('Customer not found');

      // In Google Sheets, we mark as deleted or remove row
      // For now, we'll update status to 'deleted'
      await this.updateCustomer(tenantId, customerId, { status: 'deleted' });

      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  _mapRowToCustomer(headers, row) {
    return {
      id: row[0],
      tenant_id: row[1],
      first_name: row[2] || '',
      last_name: row[3] || '',
      email: row[4] || '',
      phone: row[5] || '',
      company: row[6] || '',
      pipeline_id: row[7] || '',
      stage_id: row[8] || '',
      owner_id: row[9] || '',
      status: row[10] || 'active',
      created_at: row[11] || new Date().toISOString(),
      updated_at: row[12] || new Date().toISOString()
    };
  }
}
