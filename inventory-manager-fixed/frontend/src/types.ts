export type Role = 'ADMIN' | 'STAFF';

export interface AuthSession {
  token: string;
  username: string;
  fullName: string;
  role: Role;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  version: number;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  version?: number;
}

/** Mirrors Spring Data's Page<T> JSON shape. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface InventoryStats {
  totalProducts: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface StockAdjustment {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  delta: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

export interface AdjustStockInput {
  delta: number;
  reason: string;
  version: number;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ADJUST_STOCK';

export interface AuditLog {
  id: number;
  actor: string;
  action: AuditAction;
  entityType: string;
  entityId: number;
  productSku: string;
  productName: string;
  details: string;
  createdAt: string;
}

export type SortField = 'sku' | 'name' | 'category' | 'quantity' | 'price' | 'value';
export type SortDirection = 'asc' | 'desc';

/** Mirrors the backend ApiError JSON shape. */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export const emptyProductInput: ProductInput = {
  sku: '',
  name: '',
  category: '',
  quantity: 0,
  price: 0,
  lowStockThreshold: 5,
};
