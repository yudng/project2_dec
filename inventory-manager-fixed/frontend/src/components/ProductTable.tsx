import type { Product, SortDirection, SortField } from '../types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  isAdmin: boolean;
  sortField: SortField;
  sortDir: SortDirection;
  onSort: (field: SortField) => void;
  onAdjust: (product: Product) => void;
  onHistory: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const SORTABLE_COLUMNS: { field: SortField; label: string; numeric?: boolean }[] = [
  { field: 'sku', label: 'SKU' },
  { field: 'name', label: 'Name' },
  { field: 'category', label: 'Category' },
  { field: 'quantity', label: 'Quantity', numeric: true },
  { field: 'price', label: 'Price', numeric: true },
  { field: 'value', label: 'Value', numeric: true },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function getStockStatus(product: Product): {
  label: 'Out of stock' | 'Low stock' | 'In stock';
  badgeClass: string;
  rowClass?: string;
} {
  if (product.quantity === 0) {
    return { label: 'Out of stock', badgeClass: 'badge-danger', rowClass: 'row-out-of-stock' };
  }
  if (product.quantity <= product.lowStockThreshold) {
    return { label: 'Low stock', badgeClass: 'badge-warning', rowClass: 'row-low-stock' };
  }
  return { label: 'In stock', badgeClass: 'badge-ok' };
}

export default function ProductTable({
  products,
  loading,
  isAdmin,
  sortField,
  sortDir,
  onSort,
  onAdjust,
  onHistory,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (loading) {
    return <p className="empty-state">Loading products…</p>;
  }

  if (products.length === 0) {
    return <p className="empty-state">No products found. Try adjusting your search or add a new product.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            {SORTABLE_COLUMNS.map((col) => {
              const active = sortField === col.field;
              const indicator = active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕';
              return (
                <th key={col.field} className={col.numeric ? 'num' : undefined}>
                  <button
                    type="button"
                    className={`sort-header-btn${active ? ' sort-active' : ''}`}
                    onClick={() => onSort(col.field)}
                    aria-label={`Sort by ${col.label}`}
                  >
                    <span>{col.label}</span>
                    <span className="sort-indicator">{indicator}</span>
                  </button>
                </th>
              );
            })}
            <th>Status</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getStockStatus(product);
            return (
              <tr key={product.id} className={status.rowClass}>
                <td className="mono">{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category ?? '—'}</td>
                <td className="num">{product.quantity}</td>
                <td className="num">{formatCurrency(product.price)}</td>
                <td className="num">{formatCurrency(product.quantity * product.price)}</td>
                <td>
                  <span className={`badge ${status.badgeClass}`}>{status.label}</span>
                </td>
                <td className="actions-col">
                  <button className="btn btn-small btn-ghost" type="button" onClick={() => onHistory(product)}>
                    History
                  </button>
                  {isAdmin && (
                    <>
                      <button className="btn btn-small btn-accent-outline" type="button" onClick={() => onAdjust(product)}>
                        Adjust
                      </button>
                      <button className="btn btn-small" type="button" onClick={() => onEdit(product)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        type="button"
                        onClick={() => onDelete(product)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
