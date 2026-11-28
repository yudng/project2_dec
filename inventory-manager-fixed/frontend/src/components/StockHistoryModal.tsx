import { useEffect, useState } from 'react';
import { api, ApiException } from '../api/client';
import type { Product, StockAdjustment } from '../types';

interface StockHistoryModalProps {
  product: Product;
  onClose: () => void;
}

export default function StockHistoryModal({ product, onClose }: StockHistoryModalProps) {
  const [items, setItems] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.listAdjustments(product.id, 0, 50);
        if (!cancelled) {
          setItems(res.content);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiException ? err.message : 'Failed to load stock history.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label="Stock adjustment history"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Stock History — {product.sku} ({product.name})</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {loading && <p className="empty-state">Loading adjustment history…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="empty-state">No stock adjustments recorded for this product yet.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th className="num">Delta</th>
                  <th className="num">Before → After</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.adjustedAt).toLocaleString()}</td>
                    <td>{item.adjustedBy}</td>
                    <td className="num">
                      <span className={item.delta >= 0 ? 'badge badge-ok' : 'badge badge-danger'}>
                        {item.delta > 0 ? `+${item.delta}` : item.delta}
                      </span>
                    </td>
                    <td className="num">
                      {item.previousQuantity} → {item.newQuantity}
                    </td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
