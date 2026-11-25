/**
 * The app window, still, with notes that explain its parts one at a time as the page scrolls:
 * the category cards, the list, the views, the accounts and the four folders.
 */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "motion/react";

import { ARRIVALS, CATEGORIES, CHIPS, LAST_WEEK, PINNED, YESTERDAY, type CategoryId } from "~/lib/demo";
import { EASE } from "~/lib/motion";
import { CardHead, CardPlate, ChipLine, ListGroupHeading, ThreadRow } from "~/parts/mail";
import { Stage, stageRect, useStage } from "~/parts/stage";
import { AppWindow, ListHeader, Rail } from "~/parts/window";

export const HERO_W = 1240;
export const HERO_H = 760;
const SHOWN: CategoryId[] = ["invitations", "notifications", "codes", "receipts", "newsletters"];
const TODAY = ARRIVALS.filter((a) => !a.to).map((a) => a.row);

export interface Note {
  target: "cards" | "list" | "views" | "accounts" | "folders";
  title: string;
  text: string;
  /** Where the note sits from the part it explains. */
  place: "below" | "above";
  align: "start" | "end";
}

export const NOTES: Note[] = [
  {
    target: "cards",
    title: "Categories",
    text: "Invitations, notifications, codes, receipts and newsletters each fold into one card. They sort themselves.",
    place: "below",
    align: "start",
  },
  {
    target: "list",
    title: "Your list",
    text: "What is left is the mail written to you, by day, with what you pinned on top.",
    place: "above",
    align: "end",
  },
  {
    target: "views",
    title: "Three views",
    text: "Smart groups mail as above, Sender gathers it by who sent it, and List shows every conversation.",
    place: "below",
    align: "start",
  },
  {
    target: "accounts",
    title: "Every account in one list",
    text: "Gmail, Outlook and any IMAP account together, or one at a time.",
    place: "below",
    align: "start",
  },
  {
    target: "folders",
    title: "Four places",
    text: "Inbox, Archive, Trash and Spam: the only places mail can be. Turn on any of them to see what is in it.",
    place: "below",
    align: "end",
  },
];

/** The window; `progress` (0 to 1, from the page's scroll) picks the note shown. */
export function HeroScene({ progress, maxHeight, phone = false }: { progress: MotionValue<number>; maxHeight?: number; phone?: boolean }) {
  if (phone) return <PhoneHero progress={progress} />;
  return (
    <Stage width={HERO_W} height={HERO_H} maxHeight={maxHeight}>
      <HeroWindow progress={progress} />
    </Stage>
  );
}

/** The tour is cut into equal stretches: the window alone, one per note, then the window alone again, sharp. */
export const TOUR_STRETCHES = NOTES.length + 2;

/** The note shown at a scroll `value` (0 to 1), or -1 for none. */
export function noteFor(value: number): number {
  const index = Math.floor(value * TOUR_STRETCHES) - 1;
  return index >= NOTES.length ? -1 : Math.max(-1, index);
}

function HeroWindow({ progress }: { progress: MotionValue<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(() => noteFor(progress.get()));
  useMotionValueEvent(progress, "change", (v) => setIndex(noteFor(v)));

  return (
    <div ref={root} className="absolute inset-0">
      <WindowContents />
      <Spotlight root={root} index={index} />
    </div>
  );
}

/** The still app window the tour explains. */
function WindowContents() {
  return (
    <AppWindow className="absolute inset-0 flex">
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <ListHeader />
        <div data-note="cards" data-fit="children" className="grid grid-cols-5 gap-4 py-4 pl-1 pr-5">
          {SHOWN.map((id) => {
            const category = CATEGORIES.find((c) => c.id === id)!;
            return (
              <CardPlate key={id}>
                <CardHead category={category} />
                <div className="flex flex-col px-1.5">
                  {CHIPS[id].map((chip) => (
                    <ChipLine key={chip.id} chip={chip} />
                  ))}
                </div>
              </CardPlate>
            );
          })}
        </div>
        <div data-note="list" className="min-h-0 flex-1 overflow-hidden pr-3">
          <ListGroupHeading>Pinned</ListGroupHeading>
          <ThreadRow row={PINNED} />
          <ListGroupHeading>Today</ListGroupHeading>
          {TODAY.map((row) => (
            <ThreadRow key={row.id} row={row} />
          ))}
          <ListGroupHeading>Yesterday</ListGroupHeading>
          {YESTERDAY.map((row) => (
            <ThreadRow key={row.id} row={row} />
          ))}
          <ListGroupHeading>Last Week</ListGroupHeading>
          {LAST_WEEK.map((row) => (
            <ThreadRow key={row.id} row={row} />
          ))}
        </div>
      </div>
    </AppWindow>
  );
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Dims the window around the part a note is about, and shows the note beside it. */
function Spotlight({ root, index }: { root: RefObject<HTMLDivElement | null>; index: number }) {
  const stage = useStage();
  const [boxes, setBoxes] = useState<Partial<Record<Note["target"], Box>>>({});

  useLayoutEffect(() => {
    const measure = () => {
      const found: Partial<Record<Note["target"], Box>> = {};
      for (const note of NOTES) {
        const element = root.current?.querySelector(`[data-note="${note.target}"]`) ?? null;
        // A part with padding of its own (the card row) is outlined by what is inside it, not by its padding.
        const parts = element?.getAttribute("data-fit") === "children" ? Array.from(element.children) : [element];
        const boxes = parts.map((part) => stageRect(stage, part)).filter((b): b is Box => b !== null);
        if (boxes.length === 0) continue;
        const x = Math.min(...boxes.map((b) => b.x));
        const y = Math.min(...boxes.map((b) => b.y));
        found[note.target] = {
          x,
          y,
          width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
          height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
        };
      }
      setBoxes(found);
    };
    measure();
    const fonts = document.fonts?.ready.then(measure);
    void fonts;
  }, [stage, root, stage.scale]);

  const note = index >= 0 ? NOTES[index] : null;
  const box = note ? boxes[note.target] : null;
  const pad = 12;
  const hole = box ? { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 } : null;

  // The part being explained rises a little; the rest of the window is blurred.
  useLayoutEffect(() => {
    root.current?.querySelectorAll<HTMLElement>("[data-note]").forEach((el) => {
      el.toggleAttribute("data-lift", el.dataset.note === note?.target);
    });
  }, [root, note?.target]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[22px]">
      <AnimatePresence>
        {hole && note && (
          <motion.div
            key={note.target}
            className="absolute inset-0 backdrop-blur-[5px]"
            style={{ ...cutout(hole), backgroundColor: "rgb(235 230 221 / 0.18)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {note && hole && (
          <motion.div
            key={note.target}
            initial={{ opacity: 0, y: note.place === "below" ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
            className="absolute w-[300px]"
            style={{
              left: note.align === "start" ? Math.max(16, hole.x) : undefined,
              right: note.align === "end" ? Math.max(16, HERO_W - (hole.x + hole.width)) : undefined,
              top: note.place === "below" ? hole.y + hole.height + 14 : undefined,
              bottom: note.place === "above" ? HERO_H - hole.y + 14 : undefined,
            }}
          >
            <Callout index={index} note={note} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The note itself: light plastic, like the page around the window. */
function Callout({ index, note }: { index: number; note: Note }) {
  return (
    <div className="note-plate corner-squircle rounded-[14px] px-3.5 py-3 text-[13px]">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{note.title}</span>
        <span className="ml-auto text-[11px] font-medium tabular-nums text-[hsl(36_20%_74%)]">
          {index + 1} / {NOTES.length}
        </span>
      </div>
      <p className="mt-1 leading-snug text-[hsl(36_24%_90%)]">{note.text}</p>
    </div>
  );
}

/** A mask that is opaque everywhere except a rounded hole, so only the rest of the window is blurred. */
function cutout(hole: Box): React.CSSProperties {
  const { x, y, width: w, height: h } = hole;
  const r = 20;
  const d =
    `M0 0H${HERO_W}V${HERO_H}H0Z ` +
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${HERO_W}' height='${HERO_H}'><path fill-rule='evenodd' d='${d}'/></svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return { maskImage: url, WebkitMaskImage: url, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" };
}

/* ---------------------------------------------------------------- On a phone ---------------------------------------------------------------- */

/** Where an element sits inside the window, in window pixels, whatever the camera is doing (offsets ignore transforms). */
function offsetBox(root: HTMLElement, element: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

function union(boxes: Box[]): Box {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, width: Math.max(...boxes.map((b) => b.x + b.width)) - x, height: Math.max(...boxes.map((b) => b.y + b.height)) - y };
}

/** The four rectangles of the window around a hole. */
function around(hole: Box): React.CSSProperties[] {
  const right = hole.x + hole.width;
  const bottom = hole.y + hole.height;
  return [
    { left: 0, top: 0, width: HERO_W, height: Math.max(0, hole.y) },
    { left: 0, top: bottom, width: HERO_W, height: Math.max(0, HERO_H - bottom) },
    { left: 0, top: hole.y, width: Math.max(0, hole.x), height: hole.height },
    { left: right, top: hole.y, width: Math.max(0, HERO_W - right), height: hole.height },
  ];
}

/** What the phone camera looks at for each note: a part small enough to read on a phone. */
function phoneFocus(root: HTMLElement, target: Note["target"]): Box | null {
  const element = root.querySelector<HTMLElement>(`[data-note="${target}"]`);
  if (!element) return null;
  if (target === "cards") {
    // The first two cards: all five would be too small to read.
    return union(Array.from(element.children).slice(0, 2).map((child) => offsetBox(root, child as HTMLElement)));
  }
  const box = offsetBox(root, element);
  // The top left of the list: the names and subjects of the first rows.
  if (target === "list") return { x: box.x, y: box.y, width: Math.min(box.width, 470), height: Math.min(box.height, 300) };
  return box;
}

/**
 * The tour on a phone: the window is too wide to read whole, so a camera frames the part each note is about, the rest
 * blurred around it, and the note is a card of its own under the frame.
 */
function PhoneHero({ progress }: { progress: MotionValue<number> }) {
  const frame = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [focus, setFocus] = useState<Partial<Record<Note["target"], Box>>>({});
  const [index, setIndex] = useState(() => noteFor(progress.get()));
  useMotionValueEvent(progress, "change", (v) => setIndex(noteFor(v)));

  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => {
      setWidth(node.clientWidth);
      const found: Partial<Record<Note["target"], Box>> = {};
      for (const note of NOTES) {
        const box = root.current ? phoneFocus(root.current, note.target) : null;
        if (box) found[note.target] = box;
      }
      setFocus(found);
    };
    measure();
    void document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const note = index >= 0 ? NOTES[index] : null;
  const box = note ? focus[note.target] : null;
  const pad = 12;
  const hole = box ? { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 } : null;

  // The part being explained rises a little, as on the desktop.
  useLayoutEffect(() => {
    root.current?.querySelectorAll<HTMLElement>("[data-note]").forEach((el) => {
      el.toggleAttribute("data-lift", el.dataset.note === note?.target);
    });
  }, [note?.target]);

  // The camera: the whole window to begin and end with, otherwise the part, as large as it fits (never past real size).
  const frameW = width || 1;
  const frameH = Math.round(frameW * 0.82);
  let camera = { x: 0, y: (frameH - HERO_H * (frameW / HERO_W)) / 2, scale: frameW / HERO_W };
  if (hole) {
    const margin = 10;
    const scale = Math.min(0.9, frameW / (hole.width + margin * 2), frameH / (hole.height + margin * 2));
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const x = clamp(frameW / 2 - (hole.x + hole.width / 2) * scale, frameW - HERO_W * scale, 0);
    const y = clamp(frameH / 2 - (hole.y + hole.height / 2) * scale, frameH - HERO_H * scale, 0);
    camera = { x, y, scale };
  }

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <div ref={frame} className="corner-squircle relative overflow-hidden rounded-[22px]" style={{ height: frameH }}>
        <motion.div
          className="absolute left-0 top-0 origin-top-left text-foreground"
          style={{ width: HERO_W, height: HERO_H }}
          initial={false}
          animate={camera}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div ref={root} className="absolute inset-0">
            <WindowContents />
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[22px]">
              <AnimatePresence>
                {hole && note && (
                  <motion.div key={note.target} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                    {/* Four panels around the part rather than one masked layer: a mask doesn't cut the blur inside the moving camera. */}
                    {around(hole).map((panel, i) => (
                      <div key={i} className="absolute backdrop-blur-[5px]" style={{ ...panel, backgroundColor: "rgb(235 230 221 / 0.18)" }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      {/* The note, at a size a phone can read; the space is kept so the frame doesn't jump. */}
      <div className="mt-3 min-h-[118px]">
        <AnimatePresence mode="wait">
          {note && (
            <motion.div
              key={note.target}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="note-plate corner-squircle rounded-[16px] px-4 py-3.5 text-[15px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{note.title}</span>
                <span className="ml-auto text-[12px] font-medium tabular-nums text-[hsl(36_20%_74%)]">
                  {index + 1} / {NOTES.length}
                </span>
              </div>
              <p className="mt-1 leading-snug text-[hsl(36_24%_90%)]">{note.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
