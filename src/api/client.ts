import type { Bank } from '../types/api';

const API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:3001/api/v1';

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const token = localStorage.getItem('otc_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}/otc${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Backend unreachable. Please try again later.');
  }

  const body = await response.json();

  if (!response.ok || !body.success) {
    const message = body?.error?.message || body?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ data: { token: string; user: { id: string; name: string; email: string } } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),

  register: (email: string, password: string, name: string, companyName?: string, country?: string) =>
    request<{ data: { token: string; user: { id: string; name: string; email: string; companyName?: string; country?: string } } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, name, companyName, country }) },
    ),

  getOverview: () => request<{ data: { totalClients: number; activeClients: number; volumeToday: number; volumeThisWeek: number; recentTransactions: any[] } }>('/overview', { method: 'GET' }),

  getClients: (search?: string, status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return request(`/clients?${params.toString()}`, { method: 'GET' });
  },

  getClient: (id: string) => request(`/clients/${id}`, { method: 'GET' }),

  createClient: (data: any) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),

  updateClient: (id: string, data: any) => request(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteClient: (id: string) => request(`/clients/${id}`, { method: 'DELETE' }),

  toggleAutoSettlement: (id: string, autoSettlement: boolean) =>
    request(`/clients/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ autoSettlement }) }),

  getTransactions: (clientId?: string, status?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (status && status !== 'all') params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return request(`/transactions?${params.toString()}`, { method: 'GET' });
  },

  getTransaction: (id: string) => request(`/transactions/${id}`, { method: 'GET' }),

  getRates: () => request<{ data: { usdtToGhs: number; usdtToNgn: number; lastUpdated: string } }>('/rates', { method: 'GET' }),

  getAssets: () => request<{ data: { assets: Array<{ id: string; name: string; symbol: string; identifier?: string; network?: string; minimum?: number; minDeposit?: number; testnet?: boolean; rate?: Record<string, number> }> } }>('/assets', { method: 'GET' }),

  verifyBankAccount: (bankCode: string, accountNumber: string) =>
    request<{ data: { accountNumber: string; type: string; bankName: string; accountName: string } }>(
      '/verify-bank',
      { method: 'POST', body: JSON.stringify({ bankCode, accountNumber }) },
    ),

  getBanks: async (): Promise<{ data: { banks: Bank[] } }> => {
    const token = localStorage.getItem('otc_token');
    const res = await fetch(`${API_URL}/otc/banks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch banks from Breet');
    const body = await res.json();
    if (!body.success) throw new Error(body.message || 'Breet banks unavailable');
    return body;
  },

  getSettings: () => request<{ data: { defaultMarkup: number; exchangeName: string; webhookStatus: string } }>('/settings', { method: 'GET' }),

  updateMarkup: (markupPercent: number) => request('/settings/markup', { method: 'PUT', body: JSON.stringify({ markupPercent }) }),
};
