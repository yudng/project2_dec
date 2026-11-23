interface SearchFilterBarProps {
  name: string;
  category: string;
  categories: string[];
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onAdd: () => void;
}

export default function SearchFilterBar({
  name,
  category,
  categories,
  onNameChange,
  onCategoryChange,
  onSearch,
  onReset,
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
      <button className="btn btn-accent" type="button" onClick={onAdd}>
        + Add product
      </button>
    </div>
  );
}
