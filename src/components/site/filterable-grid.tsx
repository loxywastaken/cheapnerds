"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FilterItem = { id: string; filter: string; searchText: string; node: ReactNode };

/**
 * Client-side search + filter over server-rendered cards. The selected filter and query
 * are mirrored to the URL (?filter=&q=) so results can be shared and survive reloads.
 */
export function FilterableGrid({
  items,
  filters,
  searchPlaceholder,
  emptyLabel = "Nothing matches your search.",
  columns = "sm:grid-cols-2 lg:grid-cols-3",
  showSearch = true,
}: {
  items: FilterItem[];
  filters: { value: string; label: string }[];
  searchPlaceholder?: string;
  emptyLabel?: string;
  columns?: string;
  showSearch?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const searchId = useId();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate state from the URL once on mount
    if (f && filters.some((x) => x.value === f)) setFilter(f);
    const q = params.get("q");
    if (q) setQuery(q.slice(0, 100));
  }, [filters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [filter, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const item of items) map[item.filter] = (map[item.filter] ?? 0) + 1;
    return map;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => (filter === "all" || item.filter === filter) && (!q || item.searchText.toLowerCase().includes(q)));
  }, [items, filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0">
          {[{ value: "all", label: "All" }, ...filters].map((f) => {
            const active = filter === f.value;
            const count = counts[f.value] ?? 0;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                disabled={f.value !== "all" && count === 0}
                className={cn(
                  "relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-[2.5px] border-outline bg-white px-4 font-display text-sm font-semibold shadow-[0_3px_0_var(--color-outline)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40",
                  active ? "text-[#ffd43b]" : "text-strong",
                )}
              >
                {active && (
                  <motion.span layoutId="filter-pill" className="absolute -inset-[2.5px] rounded-full bg-outline" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{f.label}</span>
                <span className={cn("relative font-mono text-[0.7rem]", active ? "text-[#ffd43b]/70" : "text-subtle")}>{count}</span>
              </button>
            );
          })}
        </div>

        {showSearch && (
          <div className="relative w-full lg:w-80">
            <label htmlFor={searchId} className="sr-only">
              Search
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder ?? "Search…"}
              maxLength={100}
              className="h-11 w-full rounded-full border-[2.5px] border-outline bg-white pl-11 pr-10 text-sm font-medium text-strong shadow-[0_3px_0_var(--color-outline)] placeholder:text-subtle focus:outline-none focus:ring-4 focus:ring-white/70 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-subtle hover:bg-tint/10 hover:text-strong"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} result{visible.length === 1 ? "" : "s"}
      </p>

      <motion.ul layout className={cn("mt-8 grid gap-5", columns)}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {item.node}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <div className="panel mt-8 flex flex-col items-center px-6 py-14 text-center">
          <p className="text-strong">{emptyLabel}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-3 text-sm text-brand-soft hover:text-strong"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
