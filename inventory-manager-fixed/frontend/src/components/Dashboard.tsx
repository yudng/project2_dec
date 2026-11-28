import type { InventoryStats } from '../types';

interface DashboardProps {
  stats: InventoryStats | null;
  loading: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function Dashboard({ stats, loading }: DashboardProps) {
  const cards = [
    { label: 'Total products', value: stats ? String(stats.totalProducts) : '—', className: '' },
    {
      label: 'Inventory value',
      value: stats ? formatCurrency(stats.inventoryValue) : '—',
      className: '',
    },
    { label: 'Low-stock items', value: stats ? String(stats.lowStockCount) : '—', className: '' },
    {
      label: 'Out-of-stock items',
      value: stats ? String(stats.outOfStockCount) : '—',
      className: stats && stats.outOfStockCount > 0 ? 'stat-card-danger' : '',
    },
  ];

  return (
    <section className="dashboard" aria-label="Inventory summary">
      {cards.map((card) => (
        <div className={`stat-card ${card.className}`.trim()} key={card.label}>
          <span className="stat-label">{card.label}</span>
          <span className="stat-value">{loading ? '…' : card.value}</span>
        </div>
      ))}
    </section>
  );
}
