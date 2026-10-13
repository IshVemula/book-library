"use client";

import { Trash2 } from "lucide-react";
import { removeBook } from "@/app/actions";

export function DeleteButton({ id, title }: { id: number; title: string }) {
  return (
    <form
      action={removeBook}
      onSubmit={(e) => {
        if (!confirm(`Delete “${title}” from your library?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="button danger">
        <Trash2 aria-hidden /> Delete
      </button>
    </form>
  );
}
