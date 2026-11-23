import { useCallback, useEffect, useState } from 'react';
import { api, ApiException } from './api/client';
import Dashboard from './components/Dashboard';
import SearchFilterBar from './components/SearchFilterBar';
import ProductTable from './components/ProductTable';
import ProductFormModal from './components/ProductFormModal';
import ConfirmDialog from './components/ConfirmDialog';
import type { InventoryStats, Page, Product } from './types';

const PAGE_SIZE = 10;

export default function App() {
  const [page, setPage] = useState<Page<Product> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameDraft, setNameDraft] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const loadProducts = useCallback(async (pageNum: number, name: string, category: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.listProducts({
        page: pageNum,
        size: PAGE_SIZE,
        sort: 'name,asc',
        name: name || undefined,
        category: category || undefined,
      });
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
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await api.getStats());
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await api.listCategories());
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    void loadProducts(pageIndex, nameFilter, categoryFilter);
  }, [pageIndex, nameFilter, categoryFilter, loadProducts]);

  useEffect(() => {
    void loadStats();
    void loadCategories();
  }, [loadStats, loadCategories]);

  function refreshAll() {
    void loadProducts(pageIndex, nameFilter, categoryFilter);
    void loadStats();
    void loadCategories();
  }

  function handleSearch() {
    setPageIndex(0);
    setNameFilter(nameDraft.trim());
  }

  function handleReset() {
    setNameDraft('');
    setNameFilter('');
    setCategoryFilter('');
    setPageIndex(0);
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
      setDeleteTarget(null);
      refreshAll();
    } catch (err) {
      setError(
        err instanceof ApiException ? err.message : 'Failed to delete the product.',
      );
      setDeleteTarget(null);
    }
  }

  const totalPages = page?.totalPages ?? 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>📦 Inventory Manager</h1>
          <p className="subtitle">Track products, quantities and stock levels</p>
        </div>
      </header>

      <main className="container">
        <Dashboard stats={stats} loading={statsLoading} />

        <SearchFilterBar
          name={nameDraft}
          category={categoryFilter}
          categories={categories}
          onNameChange={setNameDraft}
          onCategoryChange={(value) => {
            setCategoryFilter(value);
            setPageIndex(0);
          }}
          onSearch={handleSearch}
          onReset={handleReset}
          onAdd={openCreateModal}
        />

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
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
        />

        {totalPages > 1 && (
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
              Page {pageIndex + 1} of {totalPages} ({page?.totalElements ?? 0} products)
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
