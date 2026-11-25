import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

import { cn } from "@/lib/utils";

interface StageInfo {
  scale: number;
  ref: RefObject<HTMLDivElement | null>;
}

const StageContext = createContext<StageInfo>({ scale: 1, ref: { current: null } });

/**
 * A scene is drawn at the app's real size (`width` × `height` CSS pixels, like the app's window) and shrunk to fit
 * the column it sits in, never enlarged. So the UI looks exactly as it does in the app, on any screen.
 */
export function Stage({
  width,
  height,
  children,
  className,
  innerClassName,
  maxHeight,
  surface = false,
}: {
  /** Fill the stage with the plastic (for a scene that has no window of its own). */
  surface?: boolean;
  width: number;
  height: number;
  /** Also shrink to fit this many pixels of height. */
  maxHeight?: number;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const node = outer.current;
    if (!node) return;
    const measure = () => setScale(Math.min(1, node.clientWidth / width, maxHeight ? Math.max(0.3, maxHeight / height) : 1));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [width, height, maxHeight]);

  return (
    // The scene's own width never widens the column it sits in (on a phone it would push the whole page wider).
    <div ref={outer} className={cn("w-full", className)} style={{ contain: "inline-size" }}>
      <div className="mx-auto" style={{ width: width * scale, height: height * scale }}>
        <div
          ref={inner}
          className={cn("relative origin-top-left text-foreground", surface && "plastic", innerClassName)}
          style={{ width, height, transform: scale === 1 ? undefined : `scale(${scale})` }}
        >
          <StageContext.Provider value={{ scale, ref: inner }}>{children}</StageContext.Provider>
        </div>
      </div>
    </div>
  );
}

export function useStage() {
  return useContext(StageContext);
}

/** Where an element is inside the stage, in the stage's own (unscaled) pixels. */
export function stageRect(stage: StageInfo, element: Element | null) {
  const root = stage.ref.current;
  if (!root || !element) return null;
  const a = root.getBoundingClientRect();
  const b = element.getBoundingClientRect();
  const s = stage.scale || 1;
  return { x: (b.left - a.left) / s, y: (b.top - a.top) / s, width: b.width / s, height: b.height / s };
}
