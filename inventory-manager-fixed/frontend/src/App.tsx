import { useCallback, useEffect, useState } from 'react';
import {
  api,
  ApiException,
  loadStoredSession,
  saveStoredSession,
  setUnauthorizedHandler,
} from './api/client';
import AuditLogModal from './components/AuditLogModal';
import ConfirmDialog from './components/ConfirmDialog';
import Dashboard from './components/Dashboard';
import LoginForm from './components/LoginForm';
import ProductFormModal from './components/ProductFormModal';
import ProductTable from './components/ProductTable';
import SearchFilterBar from './components/SearchFilterBar';
import StockAdjustModal from './components/StockAdjustModal';
import StockHistoryModal from './components/StockHistoryModal';
import type {
  AuthSession,
  InventoryStats,
  Page,
  Product,
  SortDirection,
  SortField,
} from './types';

const PAGE_SIZE = 10;

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const [page, setPage] = useState<Page<Product> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const [nameDraft, setNameDraft] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Product | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      saveStoredSession(null);
      setSession(null);
      setSessionNotice('Your session expired or is unauthorized. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const loadProducts = useCallback(
    async (
      pageNum: number,
      name: string,
      category: string,
      field: SortField,
      dir: SortDirection,
    ) => {
      if (!session) return;
      setLoading(true);
      setError(null);
      try {
        const result = await api.listProducts({
          page: pageNum,
          size: PAGE_SIZE,
          sort: `${field},${dir}`,
          name: name || undefined,
          category: category || undefined,
        });
        // HC-02 safety net: if current page became empty while items remain, jump to last valid page.
        if (result.content.length === 0 && result.totalPages > 0 && pageNum >= result.totalPages) {
          setPageIndex(Math.max(0, result.totalPages - 1));
          return;
        }
        setPage(result);
      } catch (err) {
        setPage(null);
        setError(
          err instanceof ApiException
            ? err.message
            : 'Could not reach the server. Is the backend running on port 8080?',
        );
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  const loadStats = useCallback(async () => {
    if (!session) return;
    setStatsLoading(true);
    try {
      setStats(await api.getStats());
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [session]);

  const loadCategories = useCallback(async () => {
    if (!session) return;
    try {
      setCategories(await api.listCategories());
    } catch {
      setCategories([]);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    void loadProducts(pageIndex, nameFilter, categoryFilter, sortField, sortDir);
  }, [session, pageIndex, nameFilter, categoryFilter, sortField, sortDir, loadProducts]);

  useEffect(() => {
    if (!session) return;
    void loadStats();
    void loadCategories();
  }, [session, loadStats, loadCategories]);

  function refreshAll() {
    void loadProducts(pageIndex, nameFilter, categoryFilter, sortField, sortDir);
    void loadStats();
    void loadCategories();
  }

  function handleLoginSuccess(newSession: AuthSession) {
    saveStoredSession(newSession);
    setSession(newSession);
    setSessionNotice(null);
    setPageIndex(0);
  }

  function handleLogout() {
    saveStoredSession(null);
    setSession(null);
    setPage(null);
    setStats(null);
    setError(null);
    setInfoNotice(null);
  }

  function handleSearch() {
    setInfoNotice(null);
    setPageIndex(0);
    setNameFilter(nameDraft.trim());
  }

  function handleReset() {
    setInfoNotice(null);
    setNameDraft('');
    setNameFilter('');
    setCategoryFilter('');
    setSortField('name');
    setSortDir('asc');
    setPageIndex(0);
  }

  function handleSort(field: SortField) {
    setInfoNotice(null);
    setPageIndex(0);
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  async function handleExportCsv() {
    setInfoNotice(null);
    setError(null);
    if ((page?.totalElements ?? 0) === 0) {
      setInfoNotice('No products match the current filter to export.');
      return;
    }
    setExporting(true);
    try {
      const { blob, filename } = await api.exportProductsCsv({
        name: nameFilter || undefined,
        category: categoryFilter || undefined,
        sort: `${sortField},${sortDir}`,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiException ? err.message : 'Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  }

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    try {
      await api.deleteProduct(deleteTarget.id);
      const isLastItemOnPage = (page?.content.length ?? 0) <= 1 && pageIndex > 0;
      setDeleteTarget(null);
      if (isLastItemOnPage) {
        setPageIndex((i) => Math.max(0, i - 1));
        void loadStats();
        void loadCategories();
      } else {
        refreshAll();
      }
    } catch (err) {
      setError(
        err instanceof ApiException ? err.message : 'Failed to delete the product.',
      );
      setDeleteTarget(null);
    }
  }

  if (!session) {
    return <LoginForm onSuccess={handleLoginSuccess} sessionNotice={sessionNotice} />;
  }

  const isAdmin = session.role === 'ADMIN';
  const totalPages = page?.totalPages ?? 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="container header-inner">
          <div>
            <h1>📦 Inventory Manager</h1>
            <p className="subtitle">Track products, quantities, stock movements and audit history</p>
          </div>
          <div className="user-bar">
            <span className="user-pill">
              {session.fullName} ({session.role})
            </span>
            <button className="btn btn-small btn-header-logout" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <Dashboard stats={stats} loading={statsLoading} />

        <SearchFilterBar
          name={nameDraft}
          category={categoryFilter}
          categories={categories}
          isAdmin={isAdmin}
          exporting={exporting}
          onNameChange={setNameDraft}
          onCategoryChange={(value) => {
            setInfoNotice(null);
            setCategoryFilter(value);
            setPageIndex(0);
          }}
          onSearch={handleSearch}
          onReset={handleReset}
          onExportCsv={() => void handleExportCsv()}
          onOpenAuditLog={() => setAuditOpen(true)}
          onAdd={openCreateModal}
        />

        {infoNotice && (
          <div className="alert alert-info" role="status">
            {infoNotice}
          </div>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
            <button className="btn btn-small btn-ghost" type="button" onClick={refreshAll}>
              Retry
            </button>
          </div>
        )}

        <ProductTable
          products={page?.content ?? []}
          loading={loading}
          isAdmin={isAdmin}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onAdjust={setAdjustTarget}
          onHistory={setHistoryTarget}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
        />

        {(totalPages > 1 || pageIndex > 0) && (
          <div className="pagination">
            <button
              className="btn btn-small"
              type="button"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            >
              ← Previous
            </button>
            <span className="pagination-info">
              Page {pageIndex + 1} of {Math.max(1, totalPages)} ({page?.totalElements ?? 0} products)
            </span>
            <button
              className="btn btn-small"
              type="button"
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPageIndex((i) => i + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            refreshAll();
          }}
        />
      )}

      {adjustTarget && (
        <StockAdjustModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onAdjusted={() => {
            setAdjustTarget(null);
            refreshAll();
          }}
        />
      )}

      {historyTarget && (
        <StockHistoryModal
          product={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {auditOpen && <AuditLogModal onClose={() => setAuditOpen(false)} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete product"
          message={`Are you sure you want to delete "${deleteTarget.name}" (${deleteTarget.sku})? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => void handleDeleteConfirmed()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
