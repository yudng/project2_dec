interface SearchFilterBarProps {
  name: string;
  category: string;
  categories: string[];
  isAdmin: boolean;
  exporting: boolean;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onExportCsv: () => void;
  onOpenAuditLog: () => void;
  onAdd: () => void;
}

export default function SearchFilterBar({
  name,
  category,
  categories,
  isAdmin,
  exporting,
  onNameChange,
  onCategoryChange,
  onSearch,
  onReset,
  onExportCsv,
  onOpenAuditLog,
  onAdd,
}: SearchFilterBarProps) {
  return (
    <div className="toolbar">
      <input
        className="input search-input"
        type="search"
        placeholder="Search by name…"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch();
        }}
        aria-label="Search products by name"
      />
      <select
        className="input"
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" type="button" onClick={onSearch}>
        Search
      </button>
      <button className="btn btn-ghost" type="button" onClick={onReset}>
        Reset
      </button>
      <button className="btn btn-ghost" type="button" onClick={onExportCsv} disabled={exporting}>
        {exporting ? 'Exporting…' : 'Export CSV'}
      </button>
      {isAdmin && (
        <button className="btn btn-ghost" type="button" onClick={onOpenAuditLog}>
          Audit Log
        </button>
      )}
      {isAdmin && (
        <button className="btn btn-accent" type="button" onClick={onAdd}>
          + Add product
        </button>
      )}
    </div>
  );
}
