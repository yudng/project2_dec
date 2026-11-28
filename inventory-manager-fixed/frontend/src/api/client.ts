import type {
  AdjustStockInput,
  ApiErrorBody,
  AuditAction,
  AuditLog,
  AuthSession,
  InventoryStats,
  Page,
  Product,
  ProductInput,
  StockAdjustment,
} from '../types';

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const SESSION_KEY = 'inventory_auth_session';

let authToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorizedCallback = handler;
}

export function loadStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed?.token && parsed?.username && parsed?.role) {
      authToken = parsed.token;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession | null): void {
  if (session) {
    authToken = session.token;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    authToken = null;
    localStorage.removeItem(SESSION_KEY);
  }
}

export class ApiException extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function buildHeaders(includeJson = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function parseJson<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;
  return JSON.parse(text) as T;
}

async function handleResponse<T>(response: Response, notifyOn401 = true): Promise<T> {
  const data = await parseJson<T>(response);
  if (!response.ok) {
    if (response.status === 401 && notifyOn401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    const err = data as unknown as ApiErrorBody | undefined;
    throw new ApiException(
      err?.message ?? `Request failed with status ${response.status}`,
      response.status,
      err?.fieldErrors,
    );
  }
  return data as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.append(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export interface ProductQuery {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  category?: string;
}

export const api = {
  async login(username: string, password: string): Promise<AuthSession> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<AuthSession>(response, false);
  },

  async me(): Promise<Omit<AuthSession, 'token'>> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: buildHeaders(false),
    });
    return handleResponse<Omit<AuthSession, 'token'>>(response);
  },

  async listProducts(query: ProductQuery = {}): Promise<Page<Product>> {
    const response = await fetch(
      `${API_BASE}/products${buildQuery({
        page: query.page ?? 0,
        size: query.size ?? 10,
        sort: query.sort ?? 'name,asc',
        name: query.name,
        category: query.category,
      })}`,
      { headers: buildHeaders(false) },
    );
    return handleResponse<Page<Product>>(response);
  },

  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      headers: buildHeaders(false),
    });
    return handleResponse<Product>(response);
  },

  async exportProductsCsv(query: Omit<ProductQuery, 'page' | 'size'> = {}): Promise<{ blob: Blob; filename: string }> {
    const response = await fetch(
      `${API_BASE}/products/export${buildQuery({
        sort: query.sort ?? 'name,asc',
        name: query.name,
        category: query.category,
      })}`,
      { headers: buildHeaders(false) },
    );
    if (!response.ok) {
      await handleResponse<void>(response);
    }
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const match = /filename="?([^"]+)"?/i.exec(disposition);
    const filename = match?.[1] ?? 'products.csv';
    const blob = await response.blob();
    return { blob, filename };
  },

  async getStats(): Promise<InventoryStats> {
    const response = await fetch(`${API_BASE}/products/stats`, {
      headers: buildHeaders(false),
    });
    return handleResponse<InventoryStats>(response);
  },

  async listCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/products/categories`, {
      headers: buildHeaders(false),
    });
    return handleResponse<string[]>(response);
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(input),
    });
    return handleResponse<Product>(response);
  },

  async updateProduct(id: number, input: ProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: buildHeaders(true),
      body: JSON.stringify(input),
    });
    return handleResponse<Product>(response);
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(false),
    });
    await handleResponse<void>(response);
  },

  async adjustStock(id: number, input: AdjustStockInput): Promise<StockAdjustment> {
    const response = await fetch(`${API_BASE}/products/${id}/adjustments`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(input),
    });
    return handleResponse<StockAdjustment>(response);
  },

  async listAdjustments(id: number, page = 0, size = 20): Promise<Page<StockAdjustment>> {
    const response = await fetch(
      `${API_BASE}/products/${id}/adjustments${buildQuery({ page, size })}`,
      { headers: buildHeaders(false) },
    );
    return handleResponse<Page<StockAdjustment>>(response);
  },

  async listAuditLogs(params: { action?: AuditAction | ''; keyword?: string; page?: number; size?: number } = {}): Promise<Page<AuditLog>> {
    const response = await fetch(
      `${API_BASE}/audit-logs${buildQuery({
        action: params.action || undefined,
        keyword: params.keyword?.trim() || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      })}`,
      { headers: buildHeaders(false) },
    );
    return handleResponse<Page<AuditLog>>(response);
  },
};
