import { useState } from 'react';
import { api, ApiException } from '../api/client';
import { emptyProductInput, type Product, type ProductInput } from '../types';

interface ProductFormModalProps {
  product: Product | null; // null => create mode
  onClose: () => void;
  onSaved: () => void;
}

const FIELDS: { key: keyof Omit<ProductInput, 'version'>; label: string; type: string; step?: string }[] = [
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
          version: product.version,
        }
      : { ...emptyProductInput },
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = product !== null;

  function updateField(key: keyof Omit<ProductInput, 'version'>, rawValue: string) {
    const numericKeys: (keyof ProductInput)[] = ['quantity', 'price', 'lowStockThreshold'];
    const value = numericKeys.includes(key)
      ? Number(rawValue)
      : key === 'sku'
        ? rawValue.toUpperCase()
        : rawValue;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleReloadLatest() {
    if (!product) return;
    setReloading(true);
    try {
      const latest = await api.getProduct(product.id);
      setForm({
        sku: latest.sku,
        name: latest.name,
        category: latest.category ?? '',
        quantity: latest.quantity,
        price: latest.price,
        lowStockThreshold: latest.lowStockThreshold,
        version: latest.version,
      });
      setConflictDetected(false);
      setGeneralError(null);
      setFieldErrors({});
    } catch (err) {
      setGeneralError(
        err instanceof ApiException ? err.message : 'Failed to reload the latest product data.',
      );
    } finally {
      setReloading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setConflictDetected(false);

    const normalizedPayload: ProductInput = {
      ...form,
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category.trim(),
    };
    setForm(normalizedPayload);

    setSaving(true);
    try {
      if (product) {
        await api.updateProduct(product.id, normalizedPayload);
      } else {
        await api.createProduct(normalizedPayload);
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        } else {
          setGeneralError(err.message);
          if (err.status === 409 && !err.message.toLowerCase().includes('sku')) {
            setConflictDetected(true);
          }
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
        aria-label={isEditMode ? 'Edit product' : 'Add product'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditMode ? `Edit product (v${form.version ?? 0})` : 'Add product'}</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {generalError && (
            <div className="form-error" role="alert">
              <p className="error-text">{generalError}</p>
              {conflictDetected && isEditMode && (
                <button
                  className="btn btn-small btn-primary"
                  type="button"
                  onClick={() => void handleReloadLatest()}
                  disabled={reloading}
                >
                  {reloading ? 'Reloading…' : 'Reload latest data'}
                </button>
              )}
            </div>
          )}

          {FIELDS.map(({ key, label, type, step }) => {
            const disabled = isEditMode && key === 'quantity';
            return (
              <div className="form-field" key={key}>
                <label htmlFor={`field-${key}`}>{label}</label>
                <input
                  id={`field-${key}`}
                  className={`input${fieldErrors[key] ? ' input-error' : ''}`}
                  type={type}
                  step={step}
                  min={type === 'number' ? 0 : undefined}
                  value={form[key]}
                  disabled={disabled}
                  onChange={(e) => updateField(key, e.target.value)}
                  onBlur={() => {
                    if (key === 'sku') {
                      setForm((prev) => ({ ...prev, sku: prev.sku.trim().toUpperCase() }));
                    }
                  }}
                  required={key === 'sku' || key === 'name'}
                />
                {disabled && (
                  <span className="field-hint">
                    Quantity is locked during Edit. Use &quot;Adjust&quot; to update stock with a reason.
                  </span>
                )}
                {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
              </div>
            );
          })}

          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEditMode ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
