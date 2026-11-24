/**
 * How mail is categorized and filtered: first, new mail being filed into a category card; then (in categories.tsx)
 * the editor where categories are described; then, here again, priority, mute and block deciding who gets through.
 */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellOff, ShieldBan, Trash2, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { B, P, type Sender } from "~/lib/demo";
import { EASE, useLoop } from "~/lib/motion";
import { Avatar, CardPlate, ChipLine, GroupTile } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";
import { SortingScene } from "~/scenes/sorting";
import { FOLDER_ACTIVE } from "~/parts/window";

/** New mail, filed into a category card. */
export function MinimumSection() {
  return (
    <Section id="minimum">
      <div className="mx-auto max-w-[760px] text-center">
        <Title>Your mail sorts itself.</Title>
        <Lead className="mx-auto mt-5 max-w-[620px]">
          Receipts, newsletters and notifications each fold into their own card the moment they arrive. Mail from people stays in
          your focused list.
        </Lead>
        <p className="mx-auto mt-4 max-w-[520px] text-sm text-muted-foreground">
          You're still in control: you can fix a category yourself at any time, just drag a message to another card.
        </p>
      </div>
      <Reveal className="mt-14">
        <SortingScene />
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
