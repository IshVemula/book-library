"use client";

import { ImageDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fillMissingCovers } from "@/app/actions";

// Runs the online cover search in small batches until every book without a
// cover has been checked. Used on the shelves and after an import.
export function useFindCovers() {
  const router = useRouter();
  const [progress, setProgress] = useState<{ checked: number; found: number } | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    let checked = 0;
    let found = 0;
    try {
      for (let round = 0; round < 200; round++) {
        const result = await fillMissingCovers();
        if (result.checked === 0) break;
        checked += result.checked;
        found += result.found;
        setProgress({ checked, found });
      }
    } finally {
      setRunning(false);
      setProgress({ checked, found });
      router.refresh();
    }
  }
  return { run, running, progress };
}

export function MissingCovers({ count }: { count: number }) {
  const { run, running, progress } = useFindCovers();
  if (count === 0 && !progress) return null;

  return (
    <p className="missing-covers">
      <ImageDown className="inline-icon" aria-hidden />{" "}
      {running
        ? `Looking for covers… ${progress?.checked ?? 0} checked, ${progress?.found ?? 0} found`
        : progress
          ? `Found ${progress.found} of ${progress.checked} covers.${progress.found < progress.checked ? " The rest keep their cloth bindings." : ""}`
          : `${count} ${count === 1 ? "book has" : "books have"} no cover yet.`}{" "}
      {!running && count > 0 && (
        <button type="button" className="link-button" onClick={run}>
          Find covers
        </button>
      )}
    </p>
  );
}
