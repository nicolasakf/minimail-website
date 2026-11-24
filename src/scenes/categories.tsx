/**
 * "Describe categories your way": the Categories editor. In turn, Receipts gets a description of its own with an
 * exception, a new category is added for a company's workflow, and Notifications is narrowed to what matters.
 * Every description is short enough to be read whole on its collapsed row.
 */
import { useRef } from "react";
import { motion } from "motion/react";
import { Bell, CalendarPlus, ClipboardCheck, GripVertical, Megaphone, Newspaper, Pencil, Receipt, Trash2, type LucideIcon } from "lucide-react";

import { FLAT_KEY_IN } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "~/lib/demo";
import { EASE, useLoop, useTyping } from "~/lib/motion";
import { Lead, Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";

const W = 640;
const H = 660;

const describe = (id: string) => CATEGORIES.find((c) => c.id === id)!.description;

const RECEIPTS_TEXT = "Receipts and invoices. AIRLINE TICKETS DON'T BELONG HERE.";
const APPROVALS_NAME = "Approvals";
const APPROVALS_TEXT = "Needs my sign-off: expenses, purchase orders, time off.";
const NOTIFICATIONS_TEXT = "Alerts from GitHub, Linear and our servers. No social apps.";

// idle, Receipts, Receipts done, a new category, it is done, Notifications, saved and held.
const STEPS = [900, 3000, 1000, 4600, 1000, 3300, 3200];

export function CategoriesSection() {
  return (
    <Section id="categories">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_640px]">
        <div>
          <Title>Describe categories your way.</Title>
          <Lead className="mt-5">
            Add, rename or remove categories, and write what belongs in each one in plain words. AI files
            your mail according to your descriptions.
          </Lead>
        </div>
        <Reveal>
          <Stage width={W} height={H}>
            <EditorScene />
          </Stage>
        </Reveal>
      </div>
    </Section>
  );
}

function EditorScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, STEPS, STEPS.length - 1);

  const receipts = useTyping(RECEIPTS_TEXT, step === 1, 32, 400);
  const approvalsName = useTyping(APPROVALS_NAME, step === 3, 12, 500);
  const approvals = useTyping(APPROVALS_TEXT, step === 3, 32, 1500);
  const notifications = useTyping(NOTIFICATIONS_TEXT, step === 5, 32, 400);

  // What each row says now: its own text, the one being typed, or the one it ended on.
  const text = (original: string, final: string, typed: string, at: number) => (step < at ? original : step === at ? typed : final);

  const rows: RowState[] = [
    { id: "invitations", name: "Invitations", hue: 265, icon: CalendarPlus, description: describe("invitations") },
    {
      id: "notifications",
      name: "Notifications",
      hue: 150,
      icon: Bell,
      description: text(describe("notifications"), NOTIFICATIONS_TEXT, notifications, 5),
      editing: step === 5,
    },
    {
      id: "receipts",
      name: "Receipts",
      hue: 95,
      icon: Receipt,
      description: text(describe("receipts"), RECEIPTS_TEXT, receipts, 1),
      editing: step === 1,
    },
    { id: "newsletters", name: "Newsletters", hue: 210, icon: Newspaper, description: describe("newsletters") },
    { id: "ads", name: "Ads", hue: 340, icon: Megaphone, description: describe("ads") },
    {
      id: "approvals",
      name: step === 3 ? approvalsName : APPROVALS_NAME,
      hue: 25,
      icon: ClipboardCheck,
      description: text("", APPROVALS_TEXT, approvals, 3),
      editing: step === 3,
      added: step >= 3,
    },
  ];

  return (
    <div ref={ref} className="absolute inset-0">
      <div className="plate-1 corner-squircle absolute inset-x-0 top-0 flex flex-col rounded-[30px] p-6">
        <h3 className="text-[22px] font-semibold">Categories</h3>
        <div className="mt-5 flex flex-col">
          {rows.map((row) => (
            <EditorRow key={row.id} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface RowState {
  id: string;
  name: string;
  hue: number;
  icon: LucideIcon;
  description: string;
  /** Open for editing: a name field, and the description in a box of its own. */
  editing?: boolean;
  /** A row the person adds: not there until its step. */
  added?: boolean;
}

const CLOSED = 62;
const OPEN = 176;

function Tile({ hue, icon: Icon }: { hue: number; icon: LucideIcon }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px]" style={{ background: `hsl(${hue} 70% 55% / 0.16)`, color: `hsl(${hue} 70% 62%)` }}>
      <Icon className="size-5" />
    </span>
  );
}

function EditorRow({ row }: { row: RowState }) {
  const exists = row.added === undefined || row.added;
  const open = Boolean(row.editing);
  const height = !exists ? 0 : open ? OPEN : CLOSED;
  return (
    <motion.div
      initial={false}
      animate={{ height: height + (exists ? 12 : 0), opacity: exists ? 1 : 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative"
    >
      <div className="plate-1 corner-squircle absolute inset-x-0 top-0 overflow-hidden rounded-[18px]" style={{ height }}>
        {/* Closed: the name and its description, in one line. */}
        <div className={cn("absolute inset-x-0 top-0 flex items-center gap-2.5 p-2.5 transition-opacity duration-300", open ? "opacity-0" : "opacity-100")}>
          <GripVertical className="size-4 shrink-0 text-muted-foreground" />
          <Tile hue={row.hue} icon={row.icon} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium leading-tight">{row.name}</div>
            <div className="mt-0.5 truncate text-[13px] text-muted-foreground">{row.description}</div>
          </div>
          <span className={cn("flex size-8 items-center justify-center rounded-[10px]", FLAT_KEY_IN)}>
            <Pencil className="size-4" />
          </span>
          <span className={cn("flex size-8 items-center justify-center rounded-[10px]", FLAT_KEY_IN)}>
            <Trash2 className="size-4" />
          </span>
        </div>
        {/* Open: a name, a color, and the description to write. */}
        <div className={cn("absolute inset-x-0 top-0 p-2.5 transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")}>
          <div className="flex items-center gap-2.5">
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
            <Tile hue={row.hue} icon={row.icon} />
            <span className="plate-2 corner-squircle flex h-9 flex-1 items-center rounded-[12px] px-3 text-[15px] font-medium">{row.name}</span>
            <span className="size-6 shrink-0 rounded-full shadow-raise-3" style={{ background: `hsl(${row.hue} 70% 55%)` }} />
            <span className="plate-2 corner-squircle flex h-9 items-center rounded-[12px] px-3.5 text-sm font-medium">Done</span>
            <span className={cn("flex size-8 items-center justify-center rounded-[10px]", FLAT_KEY_IN)}>
              <Trash2 className="size-4" />
            </span>
          </div>
          <div className="plate-2 corner-squircle mt-2.5 h-[96px] rounded-[14px] px-3.5 py-3 text-[15px] leading-[1.5]">
            {row.description}
            {open && <span className="ml-px inline-block h-[15px] w-[1.5px] translate-y-[3px] animate-pulse bg-foreground" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
