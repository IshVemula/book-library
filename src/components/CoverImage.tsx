"use client";

import { useState } from "react";

// If an online cover fails to load (e.g. the image host is down), hide it so
// the generated cloth cover underneath shows instead of a broken-image icon.
export function CoverImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
