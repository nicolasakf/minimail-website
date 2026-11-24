/**
 * How mail is categorized and filtered: first, new mail being filed into a category card; then (in categories.tsx)
 * the editor where categories are described; then, here again, priority, mute and block deciding who gets through.
 */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellOff, ShieldBan, Trash2, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { B, CATEGORIES, CHIPS, P, type Category, type CategoryId, type Chip, type Sender } from "~/lib/demo";
import { EASE, useLoop } from "~/lib/motion";
import { Avatar, CardHead, CardPlate, ChipLine, GroupTile } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";
import { FOLDER_ACTIVE } from "~/parts/window";

/** New mail, filed into a category card. */
export function MinimumSection() {
  return (
    <Section id="minimum">
      <div className="mx-auto max-w-[760px] text-center">
        <Title>Your mail sorts itself.</Title>
        <Lead className="mx-auto mt-5 max-w-[620px]">
          New mail lands in your Inbox and is filed into a category card: receipts, newsletters, notifications. Whatever is left
          stays in your list.
        </Lead>
      </div>
      <Reveal className="mt-14">
        <Stage width={FW} height={FH}>
          <Flow />
        </Stage>
      </Reveal>
    </Section>
  );
}

/** Priority, mute and block. */
export function RulesSection() {
  return (
    <Section id="rules">
      <div className="mx-auto max-w-[760px] text-center">
        <Title>You decide who gets through.</Title>
        <Lead className="mx-auto mt-5 max-w-[620px]">
          Mark a sender as priority, mute one you don't need to hear from, or block one for good. Each works on an address or a
          whole domain.
        </Lead>
      </div>
      <Reveal className="mt-14">
        <Stage width={RW} height={RH}>
          <Rules />
        </Stage>
      </Reveal>
    </Section>
  );
}

/* ---------------------------------------------------------------- The flow ---------------------------------------------------------------- */

const FW = 1160;
const FH = 500;

type Target = CategoryId | "list";

interface Mail {
  id: string;
  from: Sender;
  subject: string;
  to: Target;
}

const MAILS: Mail[] = [
  { id: "f1", from: B.wingtip, subject: "Receipt for order #4417", to: "receipts" },
  { id: "f2", from: P.ana, subject: "Thursday?", to: "list" },
  { id: "f3", from: B.lucerne, subject: "Five ideas for a slower weekend", to: "newsletters" },
  { id: "f4", from: B.adatum, subject: "Build passed on main", to: "notifications" },
];

const CARDS: CategoryId[] = ["receipts", "newsletters", "notifications"];

// Where things sit on the stage (its own pixels).
const SOURCE = { x: 20, y: 200 };
const PILL_W = 260;
const CARD = { x: 400, y: 40, width: 230, gap: 24 };
const cardX = (i: number) => CARD.x + i * (CARD.width + CARD.gap);
const LIST = { x: 400, y: 320, width: 3 * CARD.width + 2 * CARD.gap, height: 150 };

function targetPoint(to: Target): { x: number; y: number } {
  if (to === "list") return { x: LIST.x, y: LIST.y + 60 };
  return { x: cardX(CARDS.indexOf(to)) + CARD.width / 2, y: CARD.y + 226 };
}

// Per mail: it arrives, it travels to its place, it lands.
const PHASES = [800, 1100, 900];
const STEPS = MAILS.flatMap(() => PHASES).concat([2600]);

function Flow() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, STEPS, STEPS.length - 1);
  const done = step >= MAILS.length * PHASES.length;
  const index = done ? MAILS.length - 1 : Math.floor(step / PHASES.length);
  const phase = done ? 2 : step % PHASES.length;
  const mail = MAILS[index];
  const landed = MAILS.filter((_, i) => i < index || (i === index && phase === 2));

  const end = targetPoint(mail.to);
  const pill =
    phase === 0
      ? { x: SOURCE.x, y: SOURCE.y, opacity: 1, scale: 1 }
      : phase === 1
        ? mail.to === "list"
          ? { x: LIST.x + 20, y: LIST.y + 38, opacity: 1, scale: 0.9 }
          : { x: end.x - PILL_W / 2, y: end.y - 14, opacity: 1, scale: 0.85 }
        : mail.to === "list"
          ? { x: LIST.x + 20, y: LIST.y + 38, opacity: 0, scale: 0.9 }
          : { x: end.x - PILL_W / 2, y: end.y - 100, opacity: 0, scale: 0.8 };

  const litTarget: Target | null = phase >= 1 ? mail.to : null;

  return (
    <div ref={ref} className="absolute inset-0">
      <Heading x={SOURCE.x} width={PILL_W}>
        New mail
      </Heading>
      <Heading x={CARD.x} width={LIST.width}>
        Filed into a category, or left in your list
      </Heading>

      <svg className="absolute inset-0" width={FW} height={FH} fill="none">
        {([...CARDS, "list"] as Target[]).map((to) => {
          const p = targetPoint(to);
          return (
            <Wire
              key={to}
              from={{ x: SOURCE.x + PILL_W + 6, y: SOURCE.y + 30 }}
              to={to === "list" ? p : { x: p.x, y: p.y + 4 }}
              lit={phase === 1 && litTarget === to}
              vertical={to !== "list"}
            />
          );
        })}
      </svg>

      {/* The incoming slot. */}
      <div className="corner-squircle absolute rounded-[16px]" style={{ left: SOURCE.x - 6, top: SOURCE.y - 6, width: PILL_W + 12, height: 72, boxShadow: "var(--pressed)" }} />

      {/* The category cards. */}
      {CARDS.map((id, i) => (
        <div key={id} className="absolute" style={{ left: cardX(i), top: CARD.y, width: CARD.width }}>
          <FlowCard category={CATEGORIES.find((c) => c.id === id)!} added={landed.filter((m) => m.to === id)} lit={litTarget === id && phase >= 1} />
        </div>
      ))}

      {/* What stays a row of its own. */}
      <div
        className={cn(
          "corner-squircle absolute rounded-2xl p-2 transition-[box-shadow,background-color] duration-300",
          litTarget === "list" ? "grain bg-sidebar-primary/[0.1] shadow-raise-1" : "shadow-raise-3",
        )}
        style={{ left: LIST.x, top: LIST.y, width: LIST.width, height: LIST.height }}
      >
        <div className="px-2 pb-1 text-[13px] font-medium text-muted-foreground">Your list</div>
        <AnimatePresence initial={false}>
          {landed
            .filter((m) => m.to === "list")
            .map((m) => (
              <motion.div key={m.id} initial={{ height: 0, opacity: 0 }} animate={{ height: 40, opacity: 1 }} transition={{ duration: 0.4, ease: EASE }}>
                <MiniRow from={m.from} subject={m.subject} unread />
              </motion.div>
            ))}
        </AnimatePresence>
        <MiniRow from={P.noor} subject="Kitchen renovation quote" />
        <MiniRow from={P.ravi} subject="Draft agenda for Thursday's workshop" />
      </div>

      {/* The mail on its way. */}
      <motion.div
        key={mail.id}
        className="absolute left-0 top-0 z-10"
        initial={{ x: SOURCE.x - 30, y: SOURCE.y, opacity: 0, scale: 1 }}
        animate={pill}
        transition={{ duration: phase === 0 ? 0.45 : 0.8, ease: EASE }}
        style={{ width: PILL_W }}
      >
        <div className="plate-2 corner-squircle flex h-[60px] items-center gap-2.5 rounded-[14px] px-3 text-[13px] shadow-overlay">
          <span className="size-2 shrink-0 rounded-full bg-unread" />
          <Avatar sender={mail.from} size={28} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{mail.from.name}</div>
            <div className="truncate text-muted-foreground">{mail.subject}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Heading({ x, width, children }: { x: number; width: number; children: ReactNode }) {
  return (
    <div className="absolute top-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground" style={{ left: x, width }}>
      {children}
    </div>
  );
}

/** A connector of the chart: a groove at rest, the highlight color while mail travels along it. */
function Wire({ from, to, lit, vertical = false }: { from: { x: number; y: number }; to: { x: number; y: number }; lit: boolean; vertical?: boolean }) {
  const d = vertical
    ? `M ${from.x} ${from.y} C ${from.x + 60} ${from.y}, ${to.x} ${to.y + 80}, ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} C ${from.x + 70} ${from.y}, ${to.x - 70} ${to.y}, ${to.x} ${to.y}`;
  return (
    <>
      <path d={d} stroke="rgb(var(--shade-rgb) / 0.16)" strokeWidth={2} strokeDasharray="2 6" strokeLinecap="round" />
      <motion.path
        d={d}
        stroke="hsl(var(--sidebar-primary))"
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
        transition={{ duration: lit ? 0.7 : 0.3, ease: EASE }}
      />
    </>
  );
}

function FlowCard({ category, added, lit }: { category: Category; added: Mail[]; lit: boolean }) {
  const chips: Chip[] = [...added.map((m) => ({ id: m.id, from: m.from, unread: true })), ...CHIPS[category.id]].slice(0, 5);
  return (
    <CardPlate lifted={lit}>
      <CardHead category={category} count={category.count + added.length} unread={category.unread + added.length} />
      <div className="flex flex-col overflow-hidden px-1.5" style={{ height: 5 * 28 }}>
        <AnimatePresence initial={false}>
          {chips.map((chip) => (
            <motion.div key={chip.id} initial={{ height: 0, opacity: 0 }} animate={{ height: 28, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="shrink-0">
              <ChipLine chip={{ ...chip, code: undefined }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CardPlate>
  );
}

function MiniRow({ from, subject, unread, icon }: { from: Sender; subject: string; unread?: boolean; icon?: ReactNode }) {
  return (
    <div className="flex h-10 items-center gap-2.5 rounded-xl px-2 text-[13px]">
      <span className={cn("size-2 shrink-0 rounded-full", unread && "bg-unread")} />
      <Avatar sender={from} size={24} />
      <span className={cn("w-[130px] shrink-0 truncate", unread ? "font-semibold" : "font-medium")}>{from.name}</span>
      {icon}
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{subject}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- The rules ---------------------------------------------------------------- */

const RW = 1200;
const RH = 380;

const PRIORITY_CARD = { hue: 40, icon: "Zap" as const };

interface Rule {
  id: "priority" | "mute" | "block";
  label: string;
  icon: typeof Zap;
  tone: string;
  who: Sender;
  subject: string;
}

const RULES: Rule[] = [
  { id: "priority", label: "Priority", icon: Zap, tone: "text-amber", who: B.northwindMarket, subject: "Your refund was approved" },
  { id: "mute", label: "Muted", icon: BellOff, tone: "text-muted-foreground", who: B.litware, subject: "Weekly activity summary" },
  { id: "block", label: "Blocked", icon: ShieldBan, tone: "text-destructive", who: B.wingtip, subject: "LAST CHANCE: 70% off" },
];

function Rules() {
  const ref = useRef<HTMLDivElement>(null);
  // the rules, the mail arriving, what happens to it, a pause
  const { step } = useLoop(ref, [1000, 1100, 3400, 500], 2);
  return (
    <div ref={ref} className="absolute inset-0 grid grid-cols-3 gap-6">
      {RULES.map((rule, i) => (
        <RuleColumn key={rule.id} rule={rule} step={step} delay={i * 0.35} />
      ))}
    </div>
  );
}

function RuleColumn({ rule, step, delay }: { rule: Rule; step: number; delay: number }) {
  const arrived = step >= 1 && step < 3;
  const outcome = step === 2;
  const Icon = rule.icon;
  return (
    <div className="plate-1 corner-squircle relative flex flex-col overflow-hidden rounded-[26px] p-5">
      {/* The rule */}
      <div className="flex items-center gap-2.5">
        <span className={cn("plate-2 flex size-9 items-center justify-center rounded-full", rule.tone)}>
          <Icon className={cn("size-[18px]", rule.id === "priority" && "fill-amber")} />
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold">{rule.label}</div>
          <div className="truncate text-[12.5px] text-muted-foreground">{rule.id === "block" ? "promo@" : "@"}{rule.who.email.split("@")[1]}</div>
        </div>
      </div>

      {/* The notification area, at the top right of the screen. */}
      <div className="mt-5 h-[76px]">
        <AnimatePresence>
          {outcome && rule.id === "priority" && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, delay: delay + 0.2, ease: EASE }}
              className="plate-2 corner-squircle flex items-center gap-3 rounded-[16px] p-3 shadow-overlay"
            >
              <img src="/app-icon.png" alt="" className="size-9" />
              <div className="min-w-0 text-[12.5px]">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">MiniMail</div>
                <div className="truncate font-semibold">{rule.who.name}</div>
                <div className="truncate text-muted-foreground">{rule.subject}</div>
              </div>
            </motion.div>
          )}
          {outcome && rule.id === "mute" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, delay: delay + 0.2 }}
              className="corner-squircle flex h-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-foreground/15 text-[13px] font-medium text-muted-foreground"
            >
              <BellOff className="size-4" /> No notification
            </motion.div>
          )}
          {outcome && rule.id === "block" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, delay: delay + 0.2 }}
              className="corner-squircle flex h-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-foreground/15 text-[13px] font-medium text-muted-foreground"
            >
              <Trash2 className="size-4" /> Moved to the Trash
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Where the mail ends up. */}
      <div className="mt-4 flex-1">
        {rule.id === "priority" && (
          <CardPlate lifted={outcome}>
            <div className="flex items-center gap-2.5 py-2.5 pl-3">
              <GroupTile category={PRIORITY_CARD} />
              <div className="font-semibold">Priority</div>
            </div>
            <div className="px-1.5" style={{ height: 3 * 28 }}>
              <AnimatePresence initial={false}>
                {arrived && (
                  <motion.div key="new" initial={{ height: 0, opacity: 0 }} animate={{ height: 28, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, delay, ease: EASE }}>
                    <ChipLine chip={{ id: "p", from: rule.who, unread: true }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <ChipLine chip={{ id: "p1", from: P.noor }} />
              <ChipLine chip={{ id: "p2", from: B.acmeBilling }} />
            </div>
          </CardPlate>
        )}
        {rule.id === "mute" && (
          <div className="corner-squircle rounded-2xl p-2 shadow-raise-3">
            <AnimatePresence initial={false}>
              {arrived && (
                <motion.div key="new" initial={{ height: 0, opacity: 0 }} animate={{ height: 40, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, delay, ease: EASE }}>
                  <MiniRow from={rule.who} subject={rule.subject} unread icon={<BellOff className="size-3.5 shrink-0 text-muted-foreground" />} />
                </motion.div>
              )}
            </AnimatePresence>
            <MiniRow from={P.marcus} subject="Dinner on Friday?" />
            <MiniRow from={P.miguel} subject="Staff engineer role" />
          </div>
        )}
        {rule.id === "block" && (
          <div className="relative h-full">
            <AnimatePresence>
              {arrived && (
                <motion.div
                  key="new"
                  className="corner-squircle absolute inset-x-0 top-0 rounded-2xl p-2 shadow-raise-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={outcome ? { opacity: 0, y: 70, scale: 0.6 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: outcome ? 0.7 : 0.4, delay: outcome ? delay + 0.4 : delay, ease: EASE }}
                >
                  <MiniRow from={rule.who} subject={rule.subject} unread icon={<ShieldBan className="size-3.5 shrink-0 text-destructive" />} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <span
                className={cn(
                  "corner-squircle flex size-16 items-center justify-center rounded-[18px] transition-all duration-300",
                  outcome ? FOLDER_ACTIVE.trash : "text-foreground shadow-raise-1",
                )}
              >
                <Trash2 className="size-7" strokeWidth={1.7} />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
