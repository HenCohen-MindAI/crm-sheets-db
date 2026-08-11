import { CustomerRepository } from '../repositories/customer.repository.js';

// Cache repositories per tenant
const repositories = new Map();

export function getCustomerRepository(tenantId, spreadsheetId) {
  if (!spreadsheetId) {
    // Return mock repository if no spreadsheet configured
    return {
      getAllCustomers: async () => [],
      getCustomer: async () => null,
      createCustomer: async (tid, data) => ({ ...data, id: 'temp-id' }),
      updateCustomer: async (tid, id, data) => data,
      deleteCustomer: async () => true
    };
  }

  const key = `${tenantId}:${spreadsheetId}`;

  if (!repositories.has(key)) {
    repositories.set(key, new CustomerRepository(spreadsheetId));
  }

  return repositories.get(key);
}

// Clear cache when needed
export function clearCache(tenantId) {
  const keysToDelete = Array.from(repositories.keys()).filter(k => k.startsWith(tenantId));
  keysToDelete.forEach(key => repositories.delete(key));
}
