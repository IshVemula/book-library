"use client";

import { animate } from "motion/react";

// FLIP animation for books moving between shelves: remember where every book
// is just before the toolbar changes the page, then after the new shelves
// render, start each book at its old spot and spring it to the new one.
// Elements opt in with data-flip="<unique id>".

const before = new Map<string, DOMRect>();
let clearTimer: ReturnType<typeof setTimeout> | undefined;

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function recordPositions() {
  before.clear();
  document.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
    before.set(el.dataset.flip!, el.getBoundingClientRect());
  });
}

export function playFlip(root: HTMLElement | null, { firstMount }: { firstMount: boolean }) {
  if (!root || reduceMotion()) return;
  const items = [...root.querySelectorAll<HTMLElement>("[data-flip]")];

  // First load: books settle onto the shelf one after another.
  if (before.size === 0) {
    if (firstMount) {
      items.forEach((el, i) =>
        animate(el, { opacity: [0, 1], y: [14, 0] }, { duration: 0.35, delay: Math.min(i * 0.025, 0.4) }),
      );
    }
    return;
  }

  items.forEach((el) => {
    const old = before.get(el.dataset.flip!);
    if (!old) {
      animate(el, { opacity: [0, 1], scale: [0.92, 1] }, { duration: 0.3 }); // newly visible book
      return;
    }
    const now = el.getBoundingClientRect();
    const x = old.left - now.left;
    const y = old.top - now.top;
    if (Math.abs(x) < 1 && Math.abs(y) < 1) return;
    animate(el, { x: [x, 0], y: [y, 0] }, { type: "spring", stiffness: 260, damping: 30 });
  });

  // Every shelf in this update plays from the same snapshot; then forget it.
  clearTimeout(clearTimer);
  clearTimer = setTimeout(() => before.clear(), 200);
}
