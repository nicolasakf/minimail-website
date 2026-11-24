/**
 * Between the question and its answer: traditional email is bloated, and sorting is all you need.
 * The picture sets a crowded old mail client (invented folders and counts) against MiniMail's four places.
 */
import { useRef } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Folder,
  Inbox,
  Mail,
  MoreHorizontal,
  Search,
  Send,
  ShieldAlert,
  SquarePen,
  StickyNote,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE, useLoop } from "~/lib/motion";
import { Lead, Reveal, Section } from "~/parts/site";
import { Stage } from "~/parts/stage";
import { FOLDER_ACTIVE } from "~/parts/window";

const W = 720;
const H = 520;

interface TreeRow {
  label: string;
  depth: number;
  count?: number;
  /** What the count grows by while the picture plays. */
  more?: number;
  alert?: boolean;
  bold?: boolean;
  open?: boolean;
  account?: string;
  selected?: boolean;
  red?: boolean;
}

const TREE: TreeRow[] = [
  { label: "Favorites", depth: 0, open: true },
  { label: "Inbox – All Accounts", depth: 1, count: 1247, more: 38, bold: true },
  { label: "Unread Mail", depth: 1, count: 1204, more: 38, bold: true },
  { label: "Flagged for Follow-up", depth: 1, count: 88, red: true },
  { label: "alex@contoso.example", depth: 0, account: "E", open: true },
  { label: "Inbox", depth: 1, count: 23, more: 6, bold: true, open: true },
  { label: "Clients", depth: 2, open: true },
  { label: "Active", depth: 3, open: true },
  { label: "Acme Corp", depth: 4, count: 4, more: 1, bold: true, alert: true },
  { label: "Globex – Q3 renewal (FINAL_v2)", depth: 4, selected: true },
  { label: "FYI", depth: 2, open: true },
  { label: "This Week", depth: 3, count: 1, more: 2, bold: true },
  { label: "Drafts", depth: 1, count: 4, bold: true },
  { label: "Junk E-mail", depth: 1, count: 91, more: 12, red: true, bold: true },
  { label: "Sync Issues", depth: 1, count: 12, more: 3, red: true, alert: true },
  { label: "alex.morgan@gmail.example", depth: 0, account: "G", open: true },
  { label: "Inbox", depth: 1, count: 118, more: 14, bold: true },
  { label: "All Mail", depth: 1, count: 11832 },
  { label: "Spam", depth: 1, count: 312, red: true },
];

const ROW = 21;
const ACCOUNT_TONE: Record<string, string> = { E: "bg-[#3b6fd4]", G: "bg-[#c8453b]" };

function OldClient({ grown, cycle }: { grown: boolean; cycle: number }) {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[14px] bg-[#f7f5ef] text-[12px] text-[#2b2a27] shadow-raise-2">
      <div className="m-1.5 flex h-6 items-center gap-1.5 rounded-[4px] border border-black/20 bg-white px-2 text-[11px] text-black/50">
        <Search className="size-3" /> Search All Mailboxes (Ctrl+E)
      </div>
      <motion.div
        initial={false}
        animate={{ height: grown ? 24 : 0, opacity: grown ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mx-1.5 overflow-hidden"
      >
        <div className="flex h-[22px] items-center gap-1.5 whitespace-nowrap border border-[#d9c46a] bg-[#fdf1b4] px-1.5 text-[11px]">
          <AlertTriangle className="size-3 shrink-0 text-[#a46b00]" /> Mailbox 98% full · 12 sync issues · Click to fix
        </div>
      </motion.div>
      <div className="relative min-h-0 flex-1 overflow-hidden px-1 pt-1">
        {TREE.map((row, i) => {
          const count = row.count === undefined ? undefined : row.count + (grown ? (row.more ?? 0) : 0);
          return (
            <motion.div
              key={`${cycle}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.035, ease: EASE }}
              className={cn("flex items-center gap-1 whitespace-nowrap", row.selected && "bg-[#cfd6e4]")}
              style={{ height: ROW, paddingLeft: row.depth * 14 }}
            >
              {row.open === undefined ? (
                <span className="w-3 shrink-0" />
              ) : row.open ? (
                <ChevronDown className="size-3 shrink-0 text-black/50" />
              ) : (
                <ChevronRight className="size-3 shrink-0 text-black/50" />
              )}
              {row.account ? (
                <span className={cn("flex size-3.5 shrink-0 items-center justify-center rounded-[3px] text-[9px] font-bold text-white", ACCOUNT_TONE[row.account])}>{row.account}</span>
              ) : (
                <Folder className="size-3.5 shrink-0 fill-[#f0c35a] text-[#c99a2e]" />
              )}
              <span className={cn("truncate", (row.bold || row.account) && "font-semibold")}>{row.label}</span>
              {count !== undefined && (
                <span className={cn("tabular-nums transition-colors", row.red ? "text-[#c33]" : "text-[#2f5fb8]")}>
                  {row.label === "Drafts" ? `[${count}]` : `(${count.toLocaleString("en-US")})`}
                </span>
              )}
              {row.alert && <span className="ml-auto mr-1 flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[#d62b2b] text-[9px] font-bold text-white">!</span>}
            </motion.div>
          );
        })}
      </div>
      <div className="flex h-[46px] shrink-0 items-center justify-between border-t border-black/10 bg-[#efece4] px-2.5">
        {[
          { icon: Mail, badge: "99+" },
          { icon: Calendar, badge: "3" },
          { icon: User },
          { icon: CheckSquare, badge: "47" },
          { icon: StickyNote },
          { icon: MoreHorizontal },
        ].map(({ icon: Icon, badge }, i) => (
          <span key={i} className="relative flex size-7 items-center justify-center text-black/60">
            <Icon className="size-4" />
            {badge && <span className="absolute -right-1.5 -top-1 rounded-full bg-[#d62b2b] px-1 text-[8px] font-bold leading-[13px] text-white">{badge}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

interface PlaceInfo {
  icon: LucideIcon;
  label: string;
  on?: boolean;
}

/** A row of places: the keys sit in one plate, and their names are written under it, as in the app's own picture. */
function Places({ items, show, delay, className }: { items: PlaceInfo[]; show: boolean; delay: number; className?: string }) {
  const motionProps = (i: number) => ({
    initial: false,
    animate: { opacity: show ? 1 : 0, scale: show ? 1 : 0.8, y: show ? 0 : 10 },
    transition: { duration: 0.45, delay: show ? delay + i * 0.1 : 0, ease: EASE },
  });
  return (
    <div className={className}>
      <div className="plate-1 corner-squircle flex justify-between rounded-[26px] p-2">
        {items.map(({ icon: Icon, label, on }, i) => (
          <motion.span
            key={label}
            {...motionProps(i)}
            className={cn("corner-squircle flex size-[66px] items-center justify-center rounded-[20px]", on ? FOLDER_ACTIVE.inbox : "text-foreground")}
          >
            <Icon className="size-8" strokeWidth={1.7} />
          </motion.span>
        ))}
      </div>
      <div className="mt-2.5 flex justify-between px-2">
        {items.map(({ label, on }, i) => (
          <motion.span key={label} {...motionProps(i)} className={cn("w-[66px] text-center text-[15px] font-medium", on ? "text-sidebar-primary" : "text-muted-foreground")}>
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function BloatScene() {
  const ref = useRef<HTMLDivElement>(null);
  // the old client fills in, its counts and warnings grow, then MiniMail answers, and a hold
  const { step, cycle } = useLoop(ref, [1400, 2600, 1500, 4600], 3);
  const grown = step >= 1;
  const answered = step >= 2;
  return (
    <div ref={ref} className="absolute inset-0">
      {/* Traditional email */}
      <div className="absolute left-0 top-0 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground" style={{ top: 4 }}>
        Traditional email
      </div>
      <motion.div className="absolute left-0 w-[330px]" style={{ top: 34, height: 400 }} initial={false} animate={{ opacity: answered ? 0.4 : 1, scale: answered ? 0.98 : 1 }} transition={{ duration: 0.6, ease: EASE }}>
        <OldClient grown={grown} cycle={cycle} />
      </motion.div>
      <p className="absolute left-0 w-[330px] text-[17px] text-muted-foreground" style={{ top: 452 }}>
        Folders to build, nest and keep tidy.
      </p>

      {/* The way across */}
      <motion.span
        className="absolute flex size-11 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-raise-2"
        style={{ left: 349, top: 198 }}
        initial={false}
        animate={{ scale: answered ? 1 : 0.7, opacity: answered ? 1 : 0.25 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
      >
        <ArrowRight className="size-5" />
      </motion.span>

      {/* MiniMail */}
      <div className="absolute text-[12px] font-semibold uppercase tracking-[0.2em] text-sidebar-primary" style={{ left: 410, top: 4 }}>
        MiniMail
      </div>
      <div className="absolute" style={{ left: 410, top: 34, width: 310 }}>
        <Places
          show={answered}
          delay={0.1}
          items={[
            { icon: Inbox, label: "Inbox", on: true },
            { icon: Archive, label: "Archive" },
            { icon: Trash2, label: "Trash" },
            { icon: ShieldAlert, label: "Spam" },
          ]}
        />
        <Places
          className="mx-auto mt-6 w-[172px]"
          show={answered}
          delay={0.6}
          items={[
            { icon: Send, label: "Sent" },
            { icon: SquarePen, label: "Drafts" },
          ]}
        />
      </div>
      <motion.p
        className="absolute text-[17px] font-medium"
        style={{ left: 410, top: 452, width: 310 }}
        initial={false}
        animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 6 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        Four places. The rest sorts itself.
      </motion.p>
    </div>
  );
}

export function BloatSection() {
  return (
    <Section id="sorting" className="-mt-12 pt-0 md:-mt-20 md:pt-0">
      <div className="plate-1 corner-squircle grid items-center gap-12 rounded-[40px] p-7 md:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <Lead>
            Traditional email clients are bloated with features you don't need: folders inside folders, labels, filters and rules,
            flags, colors, tasks, notes, calendars and badges that count everything.
          </Lead>
          <Lead className="mt-5">After talking to many users, we came to one conclusion:</Lead>
          <motion.h3
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="mt-3 text-balance text-[44px] font-bold leading-[1.02] tracking-[-0.03em] text-sidebar-primary md:text-[60px]"
          >
            Sorting is all you need.
          </motion.h3>
          <Lead className="mt-6">
            Once your mail is sorted the right way, what matters becomes clear. That's what comes next: categories that sort
            themselves, categories you define, and rules to block, mute or prioritize.
          </Lead>
        </div>
        <Reveal>
          <Stage width={W} height={H}>
            <BloatScene />
          </Stage>
        </Reveal>
      </div>
    </Section>
  );
}
