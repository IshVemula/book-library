"use client";

import { MotionConfig } from "motion/react";

// MotionConfig so people who prefer reduced motion get no animation.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 32 }}>
      {children}
    </MotionConfig>
  );
}
