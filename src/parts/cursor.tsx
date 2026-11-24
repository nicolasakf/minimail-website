import { motion } from "motion/react";

import { EASE } from "~/lib/motion";

/** A pointer that glides to (x, y) in the stage and dips when it clicks. */
export function Cursor({ x, y, pressed = false, visible = true }: { x: number; y: number; pressed?: boolean; visible?: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-30"
      initial={false}
      animate={{ x, y, opacity: visible ? 1 : 0, scale: pressed ? 0.86 : 1 }}
      transition={{ x: { duration: 0.7, ease: EASE }, y: { duration: 0.7, ease: EASE }, scale: { duration: 0.12 }, opacity: { duration: 0.3 } }}
    >
      <svg width="22" height="24" viewBox="0 0 22 24" style={{ filter: "drop-shadow(1px 2px 2px rgb(72 64 55 / 0.35))" }}>
        <path d="M2 1.5v18.2l5.1-4.6 3.2 7.3 3.3-1.4-3.2-7.2 6.9-.4L2 1.5Z" fill="#1f1d1a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}
