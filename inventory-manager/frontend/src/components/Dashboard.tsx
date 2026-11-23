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
    { label: 'Total products', value: stats ? String(stats.totalProducts) : '—' },
    {
      label: 'Inventory value',
      value: stats ? formatCurrency(stats.inventoryValue) : '—',
    },
    { label: 'Low-stock items', value: stats ? String(stats.lowStockCount) : '—' },
  ];

  return (
    <section className="dashboard" aria-label="Inventory summary">
      {cards.map((card) => (
        <div className="stat-card" key={card.label}>
          <span className="stat-label">{card.label}</span>
          <span className="stat-value">{loading ? '…' : card.value}</span>
        </div>
      ))}
    </section>
  );
}
