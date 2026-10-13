"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SORTS, STATUSES, type Status } from "@/lib/types";
import { GROUPS } from "@/lib/group";

export type View = "shelf" | "spines" | "list";

type Props = {
  q: string;
  status: Status | "";
  group: string;
  sort: string;
  view: View;
  counts: Record<Status | "all", number>;
};

const STATUS_TABS: [Status | "", string][] = [
  ["", "All"],
  ["reading", "Reading"],
  ["read", "Read"],
  ["want", "Want to read"],
  ["dnf", "DNF"],
];

export function Toolbar({ q, status, group, sort, view, counts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(q);
  const [pending, startTransition] = useTransition();

  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Remember layout choices so the library opens the way it was left.
  function remember(key: "view" | "group", value: string) {
    document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    update({ [key]: value });
  }

  // Search as you type, debounced.
  useEffect(() => {
    if (query === (searchParams.get("q") ?? "")) return;
    const timer = setTimeout(() => update({ q: query.trim() }), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="toolbar" aria-busy={pending}>
      <div className="toolbar-row">
        <label className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author, series, notes…"
            aria-label="Search books"
          />
        </label>

        <div className="segmented" role="group" aria-label="Reading status">
          {STATUS_TABS.map(([value, label]) => (
            <button
              key={value || "all"}
              type="button"
              aria-pressed={status === value}
              onClick={() => update({ status: value })}
              title={value ? STATUSES[value] : "All books"}
            >
              {label}
              <span className="count">{counts[value || "all"]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-row toolbar-row-end">
        <label className="inline-select">
          <span>Group by</span>
          <select value={group} onChange={(e) => remember("group", e.target.value)}>
            {Object.entries(GROUPS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-select">
          <span>Sort</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value === "added" ? "" : e.target.value })}>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="segmented icons" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "shelf"} onClick={() => remember("view", "shelf")} title="Cover view">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="10" y="5" width="4" height="12" rx="1" />
              <path d="m16.5 6.5 3.5-1 3 11-3.5 1z" transform="translate(-2 0)" />
              <path d="M2 21h20" />
            </svg>
            <span className="sr-only">Covers</span>
          </button>
          <button type="button" aria-pressed={view === "spines"} onClick={() => remember("view", "spines")} title="Spine view">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 20V6M8 20V3M12 20V8M16 20V5M20 20V9" />
            </svg>
            <span className="sr-only">Spines</span>
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => remember("view", "list")} title="List view">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            <span className="sr-only">List</span>
          </button>
        </div>
      </div>
    </div>
  );
}
