import { useCallback, useEffect, useState } from 'react';
import { api, ApiException } from '../api/client';
import type { AuditAction, AuditLog } from '../types';

interface AuditLogModalProps {
  onClose: () => void;
}

export default function AuditLogModal({ onClose }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (action: AuditAction | '', searchKeyword: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listAuditLogs({ action, keyword: searchKeyword, page: 0, size: 50 });
      setLogs(res.content);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs(actionFilter, '');
  }, [actionFilter, loadLogs]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label="Audit logs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>System Audit Log</h2>
          <button className="btn btn-ghost btn-small" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="toolbar">
          <input
            className="input search-input"
            type="search"
            placeholder="Filter by actor, SKU, product or details…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void loadLogs(actionFilter, keyword);
            }}
          />
          <select
            className="input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as AuditAction | '')}
          >
            <option value="">All actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="ADJUST_STOCK">ADJUST_STOCK</option>
            <option value="DELETE">DELETE</option>
          </select>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => void loadLogs(actionFilter, keyword)}
          >
            Filter
          </button>
        </div>

        {loading && <p className="empty-state">Loading audit logs…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="empty-state">No audit log records found.</p>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                    <td>{entry.actor}</td>
                    <td>
                      <span className="badge badge-neutral">{entry.action}</span>
                    </td>
                    <td className="mono">{entry.productSku}</td>
                    <td>{entry.productName}</td>
                    <td>{entry.details}</td>
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
