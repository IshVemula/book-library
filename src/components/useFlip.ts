"use client";

import { useLayoutEffect, useRef } from "react";
import { playFlip } from "./flip";

// Attach to a shelf: replays FLIP whenever its list of books changes.
export function useFlip<T extends HTMLElement>(deps: unknown) {
  const ref = useRef<T>(null);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    playFlip(ref.current, { firstMount: !mounted.current });
    mounted.current = true;
  }, [deps]);
  return ref;
}
