"use client";

export interface FilterState {
  categories: string[];
  types: string[];
  locations: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export function InternshipFilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const toggleFilter = (section: keyof FilterState, value: string) => {
    const current = filters[section];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [section]: updated });
  };

  const clearAll = () => {
    onChange({ categories: [], types: [], locations: [] });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.types.length > 0 ||
    filters.locations.length > 0;

  return (
    <aside className="h-fit rounded-[24px] border border-black/8 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-black/5">
        <h3 className="text-base font-bold text-[#1b2a5c]">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-[#12939b] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category Section */}
      <div className="mt-5">
        <h4 className="text-sm font-bold text-[#1b2a5c]">Category</h4>
        <div className="mt-3 flex flex-col gap-2.5">
          {["UI/UX", "Software", "Marketing"].map((item) => {
            const checked = filters.categories.includes(item);
            return (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 text-xs text-[#1b2a5c]/80 transition-colors hover:text-[#1b2a5c]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFilter("categories", item)}
                  className="size-4 rounded-md border-gray-300 text-[#12939b] focus:ring-[#12939b]"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="my-5 border-t border-black/5" />

      {/* Type Section */}
      <div>
        <h4 className="text-sm font-bold text-[#1b2a5c]">Type</h4>
        <div className="mt-3 flex flex-col gap-2.5">
          {["Full-Time", "Part-Time"].map((item) => {
            const checked = filters.types.includes(item);
            return (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 text-xs text-[#1b2a5c]/80 transition-colors hover:text-[#1b2a5c]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFilter("types", item)}
                  className="size-4 rounded-md border-gray-300 text-[#12939b] focus:ring-[#12939b]"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="my-5 border-t border-black/5" />

      {/* Location Section */}
      <div>
        <h4 className="text-sm font-bold text-[#1b2a5c]">Location</h4>
        <div className="mt-3 flex flex-col gap-2.5">
          {["Remote", "In-Site", "Hybrid"].map((item) => {
            const checked = filters.locations.includes(item);
            return (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 text-xs text-[#1b2a5c]/80 transition-colors hover:text-[#1b2a5c]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFilter("locations", item)}
                  className="size-4 rounded-md border-gray-300 text-[#12939b] focus:ring-[#12939b]"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
