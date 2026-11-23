import type { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
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
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th className="num">Quantity</th>
            <th className="num">Price</th>
            <th className="num">Value</th>
            <th>Status</th>
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const lowStock = product.quantity <= product.lowStockThreshold;
            return (
              <tr key={product.id} className={lowStock ? 'row-low-stock' : undefined}>
                <td className="mono">{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category ?? '—'}</td>
                <td className="num">{product.quantity}</td>
                <td className="num">{formatCurrency(product.price)}</td>
                <td className="num">{formatCurrency(product.quantity * product.price)}</td>
                <td>
                  {lowStock ? (
                    <span className="badge badge-warning">Low stock</span>
                  ) : (
                    <span className="badge badge-ok">In stock</span>
                  )}
                </td>
                <td className="actions-col">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
