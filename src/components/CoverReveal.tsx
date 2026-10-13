"use client";

import { motion } from "motion/react";

// The cover on a book's page eases in with a slight tilt, like it's being set down.
export function CoverReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="cover-reveal"
      initial={{ opacity: 0, y: 24, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
    >
      {children}
    </motion.div>
  );
}
