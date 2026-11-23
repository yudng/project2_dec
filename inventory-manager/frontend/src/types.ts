export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  quantity: number;
  price: number;
  lowStockThreshold: number;
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
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
}

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
