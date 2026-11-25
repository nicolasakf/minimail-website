import { useEffect, useRef, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * A scene's clock: steps through `durations` (ms per step) while the scene is on screen, then starts again
 * (with `once`, it stays on the last step instead).
 * Off screen it pauses where it is. With reduced motion it stays on `still` (the scene's finished picture).
 */
export function useLoop(ref: RefObject<Element | null>, durations: number[], still = durations.length - 1, once = false) {
  const inView = useInView(ref, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduced || !inView || (once && step === durations.length - 1)) return;
    const timer = window.setTimeout(() => {
      setStep((current) => {
        const next = (current + 1) % durations.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, durations[step]);
    return () => window.clearTimeout(timer);
  }, [step, inView, reduced, durations, once]);

  // In development, `?freeze=<step>` holds every scene on one step, for checking a frame.
  const freeze = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("freeze") : null;
  if (freeze !== null) return { step: Math.min(Number(freeze), durations.length - 1), cycle, reduced: true, inView };
  return { step: reduced ? still : step, cycle, reduced: Boolean(reduced), inView };
}

/** Types `text` one character at a time while `active`, at about `cps` characters a second. */
export function useTyping(text: string, active: boolean, cps = 40, startDelay = 0) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();
  const started = useRef(false);

  useEffect(() => {
    if (!active) {
      setCount(0);
      started.current = false;
      return;
    }
    if (reduced) {
      setCount(text.length);
      return;
    }
    let raf = 0;
    const begin = performance.now() + startDelay;
    const tick = (now: number) => {
      const n = Math.max(0, Math.min(text.length, Math.floor(((now - begin) / 1000) * cps)));
      setCount(n);
      if (n < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, cps, startDelay, reduced]);

  return text.slice(0, count);
}

export const EASE = [0.22, 1, 0.36, 1] as const;

/** The window's inner height, kept current. */
export function useViewportHeight() {
  const [height, setHeight] = useState(() => (typeof window === "undefined" ? 900 : window.innerHeight));
  useEffect(() => {
    const update = () => setHeight(window.innerHeight);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return height;
}
