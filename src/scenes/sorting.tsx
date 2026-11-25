/**
 * "Your mail sorts itself": the Inbox as the app shows it, category cards above the list. New mail arrives at the top
 * of the list; mail that belongs to a category lifts out of the list and lands on its card, the rest stays a row.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { B, CATEGORIES, CHIPS, P, YESTERDAY, type CategoryId, type Chip, type Row } from "~/lib/demo";
import { EASE } from "~/lib/motion";
import { Cursor } from "~/parts/cursor";
import { Avatar, CardHead, CardPlate, ChipLine, ListGroupHeading, ThreadRow } from "~/parts/mail";
import { Stage, stageRect, useStage } from "~/parts/stage";
import { AppWindow, ListHeader } from "~/parts/window";

const W = 1040;
const H = 456;
/** On a phone: a narrow window, so the cards and rows stay large enough to read. */
const PHONE_W = 440;
const PHONE_H = 480;
const CARDS: CategoryId[] = ["receipts", "newsletters", "notifications"];

interface Arrival {
  row: Row;
  to: CategoryId | null;
  /** Filed in the wrong place on purpose: the person drags it to the right card. */
  fix?: CategoryId;
}

const ARRIVALS: Arrival[] = [
  {
    to: "receipts",
    row: { id: "s1", from: B.wingtip, subject: "Your order is on its way", snippet: "Order #20417: two items shipped today.", unread: true, account: "gmail", time: "9:41" },
  },
  {
    to: null,
    row: { id: "s2", from: P.ana, subject: "Thursday?", snippet: "Are we still on for Thursday at two? I can bring the printouts.", unread: true, account: "gmail", time: "9:44" },
  },
  {
    to: "newsletters",
    row: { id: "s3", from: B.lucerne, subject: "Five ideas for a slower weekend", snippet: "This week: bread, bicycles and the case for doing less.", unread: true, account: "outlook", time: "9:50" },
  },
  {
    to: "notifications",
    row: { id: "s4", from: B.humongous, subject: "Your policy documents are ready", snippet: "Your renewed home policy is ready to view.", unread: true, account: "uni", time: "9:55" },
  },
  {
    to: "notifications",
    fix: "receipts",
    row: { id: "s5", from: B.proseBilling, subject: "Invoice #3302 is ready", snippet: "Your invoice for November is attached.", unread: true, account: "gmail", time: "10:02" },
  },
];

type Phase = { kind: "arrive"; i: number } | { kind: "file"; i: number } | { kind: "grab" } | { kind: "drag" } | { kind: "hold" } | { kind: "reset" };

const PHASES: Phase[] = [
  ...ARRIVALS.flatMap((a, i): Phase[] => (a.to ? [{ kind: "arrive", i }, { kind: "file", i }] : [{ kind: "arrive", i }])),
  { kind: "grab" },
  { kind: "drag" },
  { kind: "hold" },
  { kind: "reset" },
];
const DURATION: Record<Phase["kind"], number> = { arrive: 1500, file: 1400, grab: 1700, drag: 1500, hold: 2800, reset: 800 };
const FIXED_ID = "s5";

/** The finished picture, for reduced motion. */
function finalState() {
  const added: Partial<Record<CategoryId, Chip[]>> = {};
  const list: Row[] = [];
  for (const a of ARRIVALS) {
    const place = a.fix ?? a.to;
    if (place) added[place] = [{ id: a.row.id, from: a.row.from, unread: true }, ...(added[place] ?? [])];
    else list.unshift(a.row);
  }
  return { added, list };
}

export function SortingScene({ phone = false }: { phone?: boolean }) {
  return (
    <Stage width={phone ? PHONE_W : W} height={phone ? PHONE_H : H}>
      <Inbox phone={phone} />
    </Stage>
  );
}

interface Flight {
  chip: Chip;
  from: { x: number; y: number };
  to: { x: number; y: number; width: number } | null;
  /** The person is carrying it with the pointer. */
  carried?: boolean;
}

function Inbox({ phone }: { phone: boolean }) {
  const stage = useStage();
  const scope = useRef<HTMLDivElement>(null);
  const inView = useInView(scope, { amount: 0.35 });
  const reduced = useReducedMotion();
  const freeze = import.meta.env.DEV && new URLSearchParams(window.location.search).has("freeze");

  const [phase, setPhase] = useState(0);
  const ran = useRef(-1);
  const [list, setList] = useState<Row[]>([]);
  const [added, setAdded] = useState<Partial<Record<CategoryId, Chip[]>>>({});
  const [hidden, setHidden] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [lifted, setLifted] = useState<CategoryId | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number; visible: boolean; pressed: boolean }>({ x: 0, y: 0, visible: false, pressed: false });

  useEffect(() => {
    if (reduced || freeze) {
      const end = finalState();
      setList(end.list);
      setAdded(end.added);
    }
  }, [reduced, freeze]);

  useEffect(() => {
    if (reduced || freeze || !inView) return;
    const p = PHASES[phase];
    if (ran.current !== phase) {
      ran.current = phase;
      if (p.kind === "arrive") {
        const { row } = ARRIVALS[p.i];
        setList((rows) => [row, ...rows.filter((r) => r.id !== row.id)]);
        setFresh(row.id);
      } else if (p.kind === "file") {
        const { row, to } = ARRIVALS[p.i];
        const box = stageRect(stage, stage.ref.current?.querySelector(`[data-row-id="${row.id}"]`) ?? null);
        const chip: Chip = { id: row.id, from: row.from, unread: true };
        setFresh(null);
        setLifted(to);
        setHidden(chip.id);
        setAdded((current) => ({ ...current, [to!]: [chip, ...(current[to!] ?? [])] }));
        setList((rows) => rows.filter((r) => r.id !== row.id));
        setFlight({ chip, from: box ? { x: box.x + 32, y: box.y + 6 } : { x: 60, y: 360 }, to: null });
      } else if (p.kind === "grab") {
        const box = stageRect(stage, stage.ref.current?.querySelector(`[data-chip-id="${FIXED_ID}"]`) ?? null);
        const target = box ? { x: box.x + 90, y: box.y + 8 } : { x: 760, y: 150 };
        setPointer({ x: target.x + 170, y: target.y + 150, visible: true, pressed: false });
        window.setTimeout(() => setPointer({ x: target.x, y: target.y, visible: true, pressed: false }), 80);
        window.setTimeout(() => setPointer((c) => ({ ...c, pressed: true })), 1300);
      } else if (p.kind === "drag") {
        const arrival = ARRIVALS.find((a) => a.row.id === FIXED_ID)!;
        const box = stageRect(stage, stage.ref.current?.querySelector(`[data-chip-id="${FIXED_ID}"]`) ?? null);
        const chip: Chip = { id: FIXED_ID, from: arrival.row.from, unread: true };
        setPointer((c) => ({ ...c, visible: false }));
        setLifted(arrival.fix!);
        setHidden(FIXED_ID);
        setAdded((current) => ({
          ...current,
          notifications: (current.notifications ?? []).filter((c) => c.id !== FIXED_ID),
          [arrival.fix!]: [chip, ...(current[arrival.fix!] ?? [])],
        }));
        setFlight({ chip, from: box ? { x: box.x + 6, y: box.y } : { x: 760, y: 150 }, to: null, carried: true });
      } else if (p.kind === "reset") {
        setFresh(null);
        setList([]);
        setAdded({});
        setPointer((c) => ({ ...c, visible: false, pressed: false }));
      }
    }
    const timer = window.setTimeout(() => setPhase((n) => (n + 1) % PHASES.length), DURATION[p.kind]);
    return () => window.clearTimeout(timer);
  }, [phase, inView, reduced, freeze, stage]);

  // Once the empty line is in its card, the flight knows where to land.
  useLayoutEffect(() => {
    if (!flight || flight.to) return;
    const box = stageRect(stage, stage.ref.current?.querySelector(`[data-chip-id="${flight.chip.id}"]`) ?? null);
    if (box) setFlight({ ...flight, to: { x: box.x + 6, y: box.y, width: box.width - 12 } });
  }, [flight, stage]);

  const land = () => {
    setHidden(null);
    setFlight(null);
    window.setTimeout(() => setLifted(null), 500);
  };

  return (
    <div ref={scope} className="absolute inset-0">
      <AppWindow className="absolute inset-0 flex flex-col">
        <div className="pl-[84px]">
          <ListHeader compact title="Inbox" />
        </div>
        <div className={cn("grid grid-cols-3", phone ? "gap-2 px-3 pb-2 pt-2" : "gap-4 px-5 pb-3 pt-3")}>
          {CARDS.map((id) => (
            <SortCard key={id} id={id} added={added[id] ?? []} hidden={hidden} lifted={lifted === id} narrow={phone} />
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-1">
          <ListGroupHeading>Today</ListGroupHeading>
          <AnimatePresence initial={false}>
            {list.map((row) => (
              <motion.div
                key={row.id}
                data-row-id={row.id}
                className="py-px"
                initial={{ height: 0, opacity: 0, y: -8 }}
                animate={{ height: 42, opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.35, ease: EASE } }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <ThreadRow row={row} hovered={fresh === row.id} nameWidth={phone ? 104 : 170} className="transition-shadow duration-500" />
              </motion.div>
            ))}
          </AnimatePresence>
          <ThreadRow row={{ id: "pin", from: P.noor, subject: "Kitchen renovation quote", snippet: "Thanks for the quick reply. Attached is the revised quote.", account: "gmail", time: "8:12" }} nameWidth={phone ? 104 : 170} />
          <ListGroupHeading>Yesterday</ListGroupHeading>
          {YESTERDAY.map((row) => (
            <ThreadRow key={row.id} row={row} nameWidth={phone ? 104 : 170} />
          ))}
        </div>
      </AppWindow>

      {flight?.to && <Flyer chip={flight.chip} from={flight.from} to={flight.to} carried={flight.carried} onDone={land} />}
      <Cursor x={pointer.x} y={pointer.y} pressed={pointer.pressed} visible={pointer.visible} />
    </div>
  );
}

function SortCard({ id, added, hidden, lifted, narrow }: { id: CategoryId; added: Chip[]; hidden: string | null; lifted: boolean; narrow: boolean }) {
  const category = CATEGORIES.find((c) => c.id === id)!;
  const chips = [...added, ...CHIPS[id]].slice(0, 5);
  const landed = added.filter((chip) => chip.id !== hidden);
  return (
    <CardPlate lifted={lifted}>
      <CardHead category={category} count={category.count + landed.length} unread={category.unread + landed.length} narrow={narrow} />
      <div className="flex flex-col overflow-hidden px-1.5" style={{ height: 4 * 28 }}>
        <AnimatePresence initial={false}>
          {chips.map((chip) => (
            <motion.div
              key={chip.id}
              data-chip-id={chip.id}
              initial={{ height: 0 }}
              animate={{ height: 28 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="shrink-0"
            >
              <ChipLine chip={{ ...chip, code: undefined }} className={cn("transition-opacity duration-200", chip.id === hidden ? "opacity-0" : "opacity-100")} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CardPlate>
  );
}

/** The sender lifting out of the list and landing on its card; when `carried`, a pointer holds it all the way. */
function Flyer({ chip, from, to, carried, onDone }: { chip: Chip; from: { x: number; y: number }; to: { x: number; y: number; width: number }; carried?: boolean; onDone: () => void }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (
    <motion.div
      className="pointer-events-none absolute z-20"
      style={{ left: from.x, top: from.y, width: Math.max(140, to.width) }}
      initial={{ x: 0, y: 0, scale: 1.08 }}
      animate={carried ? { x: [0, dx], y: [0, dy], scale: [1.08, 1.08] } : { x: [0, dx * 0.3, dx], y: [0, dy * 0.6 - 24, dy], scale: [1.08, 1.12, 1] }}
      transition={carried ? { duration: 1.1, ease: EASE } : { duration: 0.9, ease: EASE, times: [0, 0.45, 1] }}
      onAnimationComplete={onDone}
    >
      <div className="plate-2 corner-squircle flex h-7 items-center gap-2 rounded-[10px] px-1.5 text-sm shadow-overlay">
        <Avatar sender={chip.from} size={18} />
        <span className="min-w-0 flex-1 truncate">{chip.from.name}</span>
        <span className="size-1.5 shrink-0 rounded-full bg-unread" />
      </div>
      {carried && (
        <svg width="22" height="24" viewBox="0 0 22 24" className="absolute left-[88px] top-[8px]" style={{ filter: "drop-shadow(1px 2px 2px rgb(72 64 55 / 0.35))" }}>
          <path d="M2 1.5v18.2l5.1-4.6 3.2 7.3 3.3-1.4-3.2-7.2 6.9-.4L2 1.5Z" fill="#1f1d1a" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )}
    </motion.div>
  );
}
