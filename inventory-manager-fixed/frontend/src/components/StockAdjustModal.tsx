import { useState } from 'react';
import { api, ApiException } from '../api/client';
import type { Product } from '../types';

interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
  onAdjusted: () => void;
}

export default function StockAdjustModal({ product, onClose, onAdjusted }: StockAdjustModalProps) {
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const [delta, setDelta] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [saving, setSaving] = useState(false);

  const projectedQuantity = currentProduct.quantity + (Number.isNaN(delta) ? 0 : delta);

  async function handleReloadLatest() {
    try {
      const latest = await api.getProduct(currentProduct.id);
      setCurrentProduct(latest);
      setConflictDetected(false);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Failed to reload product.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConflictDetected(false);

    if (!Number.isInteger(delta) || delta === 0) {
      setError('Adjustment quantity must be a non-zero integer.');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required for stock adjustment.');
      return;
    }
    if (projectedQuantity < 0) {
      setError(`Resulting stock cannot be negative (current: ${currentProduct.quantity}).`);
      return;
    }

    setSaving(true);
    try {
      await api.adjustStock(currentProduct.id, {
        delta,
        reason: reason.trim(),
        version: currentProduct.version,
      });
      onAdjusted();
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
        if (err.status === 409) {
          setConflictDetected(true);
        }
      } else {
        setError('Could not reach the server.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Adjust stock"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Adjust stock — {currentProduct.sku}</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="confirm-message">
          <strong>{currentProduct.name}</strong> · Current quantity: <strong>{currentProduct.quantity}</strong> (v{currentProduct.version})
        </p>

        {error && (
          <div className="form-error" role="alert">
            <p className="error-text">{error}</p>
            {conflictDetected && (
              <button className="btn btn-small btn-primary" type="button" onClick={() => void handleReloadLatest()}>
                Reload latest data
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="adjust-delta">Adjustment delta (+ to add, - to deduct)</label>
            <input
              id="adjust-delta"
              className="input"
              type="number"
              step="1"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              required
            />
            <span className="field-hint">
              Projected quantity: <strong>{projectedQuantity}</strong>
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="adjust-reason">Reason</label>
            <textarea
              id="adjust-reason"
              className="input"
              rows={3}
              maxLength={500}
              placeholder="e.g. Monthly supplier restock / Damaged in transit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Applying…' : 'Confirm adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
