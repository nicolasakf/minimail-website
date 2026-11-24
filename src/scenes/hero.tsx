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
export function HeroScene({ progress, maxHeight }: { progress: MotionValue<number>; maxHeight?: number }) {
  return (
    <Stage width={HERO_W} height={HERO_H} maxHeight={maxHeight}>
      <HeroWindow progress={progress} />
    </Stage>
  );
}

function noteFor(value: number): number {
  // The first stretch of the scroll shows the window alone, then one note per stretch.
  const index = Math.floor(value * (NOTES.length + 1)) - 1;
  return Math.max(-1, Math.min(NOTES.length - 1, index));
}

function HeroWindow({ progress }: { progress: MotionValue<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(() => noteFor(progress.get()));
  useMotionValueEvent(progress, "change", (v) => setIndex(noteFor(v)));

  return (
    <div ref={root} className="absolute inset-0">
      <AppWindow className="absolute inset-0 flex">
        <Rail />
        <div className="flex min-w-0 flex-1 flex-col">
          <ListHeader />
          <div data-note="cards" className="grid grid-cols-5 gap-4 py-4 pl-1 pr-5">
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
      <Spotlight root={root} index={index} />
    </div>
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
        const box = stageRect(stage, root.current?.querySelector(`[data-note="${note.target}"]`) ?? null);
        if (box) found[note.target] = box;
      }
      setBoxes(found);
    };
    measure();
    const fonts = document.fonts?.ready.then(measure);
    void fonts;
  }, [stage, root, stage.scale]);

  const note = index >= 0 ? NOTES[index] : null;
  const box = note ? boxes[note.target] : null;
  const pad = 8;
  const hole = box ? { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 } : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[22px]">
      <AnimatePresence>
        {hole && (
          <motion.div
            key="hole"
            className="absolute rounded-[18px]"
            style={{ boxShadow: "0 0 0 2000px rgb(38 34 29 / 0.32), 0 0 0 2px hsl(218.8 61.5% 52.2% / 0.85), 0 0 24px 4px hsl(218.8 61.5% 52.2% / 0.3)" }}
            initial={{ opacity: 0, ...hole }}
            animate={{ opacity: 1, ...hole }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
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
            className="absolute w-[360px]"
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
    <div className="light-plate corner-squircle rounded-[18px] p-4 pr-5 text-[15px]">
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-[hsl(218.8_61.5%_52.2%)] text-[12px] font-bold text-white">
          {index + 1}
        </span>
        <span className="font-semibold">{note.title}</span>
        <span className="ml-auto text-[12px] font-medium text-[hsl(32_6%_45%)]">
          {index + 1} / {NOTES.length}
        </span>
      </div>
      <p className="mt-1.5 leading-snug text-[hsl(32_6%_32%)]">{note.text}</p>
    </div>
  );
}
