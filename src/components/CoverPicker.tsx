"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";

const MAX_W = 600;
const MAX_H = 900;

// Shrink any image to at most 600×900 and re-encode as JPEG, so uploads stay
// around 100–300 KB whatever the source.
async function toCoverDataUrl(blob: Blob) {
  if (!blob.type.startsWith("image/")) throw new Error("That isn't an image.");
  const bitmap = await createImageBitmap(blob).catch(() => {
    throw new Error("That image format isn't supported. Try a JPG or PNG.");
  });
  const scale = Math.min(1, MAX_W / bitmap.width, MAX_H / bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// Google result pages wrap the real image: google.com/imgres?imgurl=<image>
function unwrapLink(link: string) {
  try {
    const url = new URL(link);
    return (url.hostname.includes("google.") && url.searchParams.get("imgurl")) || link;
  } catch {
    return link;
  }
}

async function blobFromLink(link: string) {
  const target = unwrapLink(link.trim());
  if (target.startsWith("data:image/")) return (await fetch(target)).blob();
  if (!/^https?:\/\//i.test(target)) throw new Error("Paste an image, or a link starting with https://");
  const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(target)}`);
  if (!res.ok) throw new Error((await res.text()) || "Couldn't download that image.");
  return res.blob();
}

export function CoverPicker({ onPick }: { onPick: (dataUrl: string) => void }) {
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function applyImage(source: Blob | string) {
    setBusy(true);
    setError(null);
    try {
      const blob = typeof source === "string" ? await blobFromLink(source) : source;
      onPick(await toCoverDataUrl(blob));
      setLink("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that image.");
    } finally {
      setBusy(false);
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const file = [...e.clipboardData.files].find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      applyImage(file);
      return;
    }
    const text = e.clipboardData.getData("text").trim();
    if (/^(https?:\/\/|data:image\/)/i.test(text)) {
      e.preventDefault();
      applyImage(text);
    }
  }

  return (
    <div
      className={`cover-picker${dragging ? " dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
        const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
        if (file) applyImage(file);
        else if (url) applyImage(url);
      }}
    >
      <p className="cover-picker-title">Change the cover</p>
      <label className="button cover-upload">
        <ImagePlus aria-hidden /> Upload image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) applyImage(file);
          }}
        />
      </label>
      <input
        className="cover-link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onPaste={onPaste}
        onKeyDown={(e) => {
          if (e.key === "Enter" && link.trim()) {
            e.preventDefault();
            applyImage(link);
          }
        }}
        placeholder="…or paste image or link"
        aria-label="Paste an image or an image link"
        disabled={busy}
      />
      <p className="cover-picker-hint" aria-live="polite">
        {busy ? "Fetching that image…" : "Drop an image here, or copy one from Google and paste it."}
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
