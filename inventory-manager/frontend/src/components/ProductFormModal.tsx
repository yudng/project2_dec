import { useState } from 'react';
import { api, ApiException } from '../api/client';
import { emptyProductInput, type Product, type ProductInput } from '../types';

interface ProductFormModalProps {
  product: Product | null; // null => create mode
  onClose: () => void;
  onSaved: () => void;
}

const FIELDS: { key: keyof ProductInput; label: string; type: string; step?: string }[] = [
  { key: 'sku', label: 'SKU', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'price', label: 'Price (USD)', type: 'number', step: '0.01' },
  { key: 'lowStockThreshold', label: 'Low-stock threshold', type: 'number' },
];

export default function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductInput>(() =>
    product
      ? {
          sku: product.sku,
          name: product.name,
          category: product.category ?? '',
          quantity: product.quantity,
          price: product.price,
          lowStockThreshold: product.lowStockThreshold,
        }
      : { ...emptyProductInput },
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(key: keyof ProductInput, rawValue: string) {
    const numericKeys: (keyof ProductInput)[] = ['quantity', 'price', 'lowStockThreshold'];
    const value = numericKeys.includes(key) ? Number(rawValue) : rawValue;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setSaving(true);
    try {
      if (product) {
        await api.updateProduct(product.id, form);
      } else {
        await api.createProduct(form);
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Could not reach the server. Is the backend running?');
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
        aria-label={product ? 'Edit product' : 'Add product'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{product ? 'Edit product' : 'Add product'}</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {generalError && <p className="form-error">{generalError}</p>}
          {FIELDS.map(({ key, label, type, step }) => (
            <div className="form-field" key={key}>
              <label htmlFor={`field-${key}`}>{label}</label>
              <input
                id={`field-${key}`}
                className={`input${fieldErrors[key] ? ' input-error' : ''}`}
                type={type}
                step={step}
                min={type === 'number' ? 0 : undefined}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                required={key === 'sku' || key === 'name'}
              />
              {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
            </div>
          ))}
          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
