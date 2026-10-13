"use client";

import { LibraryBig, List, Search, SquareLibrary, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SORTS, STATUSES, type Status } from "@/lib/types";
import { GROUPS } from "@/lib/group";
import { recordPositions } from "./flip";

export type View = "shelf" | "spines" | "list";

type Props = {
  q: string;
  status: Status | "";
  group: string;
  sort: string;
  view: View;
  counts: Record<Status | "all", number>;
};

const VIEWS: [View, string, LucideIcon][] = [
  ["shelf", "Cover view", LibraryBig],
  ["spines", "Spine view", SquareLibrary],
  ["list", "List view", List],
];

// The highlight behind the selected option glides between options.
function Pill({ id }: { id: string }) {
  return <motion.span layoutId={id} className="pill" aria-hidden />;
}

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
    recordPositions(); // so books can glide from where they are now
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
          <Search size={16} aria-hidden />
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
              {status === value && <Pill id="status-pill" />}
              <span className="pill-label">
                {label}
                <span className="count">{counts[value || "all"]}</span>
              </span>
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
          {VIEWS.map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => remember("view", value)}
              title={label}
            >
              {view === value && <Pill id="view-pill" />}
              <span className="pill-label">
                <Icon size={18} aria-hidden />
                <span className="sr-only">{label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
