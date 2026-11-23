import type { ApiErrorBody, InventoryStats, Page, Product, ProductInput } from '../types';

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

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

async function parseJson<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) return undefined;
  return JSON.parse(text) as T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await parseJson<T>(response);
  if (!response.ok) {
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
  async listProducts(query: ProductQuery = {}): Promise<Page<Product>> {
    const response = await fetch(
      `${API_BASE}/products${buildQuery({
        page: query.page ?? 0,
        size: query.size ?? 10,
        sort: query.sort ?? 'name,asc',
        name: query.name,
        category: query.category,
      })}`,
    );
    return handleResponse<Page<Product>>(response);
  },

  async getStats(): Promise<InventoryStats> {
    const response = await fetch(`${API_BASE}/products/stats`);
    return handleResponse<InventoryStats>(response);
  },

  async listCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/products/categories`);
    return handleResponse<string[]>(response);
  },

  async createProduct(input: ProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Product>(response);
  },

  async updateProduct(id: number, input: ProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return handleResponse<Product>(response);
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    await handleResponse<void>(response);
  },
};
