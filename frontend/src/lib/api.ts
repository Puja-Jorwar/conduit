import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Customer ───────────────────────────────────────────
export const registerCustomer = (data: { name: string; email: string; password: string }) =>
  api.post('/api/customers/register', data).then(r => r.data);

export const loginCustomer = (data: { email: string; password: string }) =>
  api.post('/api/customers/login', data).then(r => r.data);

export const getCustomer = (id: string) =>
  api.get(`/api/customers/${id}`).then(r => r.data);

// ─── Integrations ────────────────────────────────────────
export const getIntegrations = (customerId: string) =>
  api.get(`/api/integrations/customer/${customerId}`).then(r => r.data);

export const createIntegration = (data: {
  customerId: string;
  name: string;
  sourceType: string;
  destinationType: string;
  config: Record<string, string>;
  schedule?: string;
}) => api.post('/api/integrations', data).then(r => r.data);

export const triggerSync = (integrationId: string) =>
  api.post(`/api/integrations/${integrationId}/sync`).then(r => r.data);

export const deleteIntegration = (integrationId: string) =>
  api.delete(`/api/integrations/${integrationId}`).then(r => r.data);

// ─── Logs ────────────────────────────────────────────────
export const getLogs = (customerId: string, status?: string, limit?: number) =>
  api.get(`/api/logs/customer/${customerId}`, {
    params: { status, limit }
  }).then(r => r.data);

export const getStats = (customerId: string) =>
  api.get(`/api/logs/stats/${customerId}`).then(r => r.data);

export const checkHealth = () =>
  api.get('/health').then(r => r.data);

export default api;
