/**
 * How mail is categorized and filtered: first, new mail being filed into a category card; then (in categories.tsx)
 * the editor where categories are described; then, here again, priority, mute and block deciding who gets through.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellOff, ListX, ShieldBan, Trash2, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { B, P, type Sender } from "~/lib/demo";
import { EASE, useLoop } from "~/lib/motion";
import { usePhone } from "~/lib/phone";
import { Avatar, CardPlate, ChipLine, GroupTile } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";
import { SortingScene } from "~/scenes/sorting";
import { FOLDER_ACTIVE } from "~/parts/window";

/** New mail, filed into a category card. */
export function MinimumSection() {
  const phone = usePhone();
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
        <SortingScene phone={phone} />
      </Reveal>
    </Section>
  );
}

/** Priority, mute and block. */
export function RulesSection() {
  const phone = usePhone();
  return (
    <Section id="rules">
      <div className="mx-auto max-w-[760px] text-center">
        <Title>You decide what gets through.</Title>
        <Lead className="mx-auto mt-5 max-w-[620px]">
          Mark a conversation, sender or domain as priority to get pinged right away, mute one you don't need to hear from, block one for good, or unsubscribe from a list.
        </Lead>
      </div>
      <Reveal className="mt-10 md:mt-14">
        {phone ? (
          <PhoneRules />
        ) : (
          <Stage width={RW} height={RH}>
            <Rules />
          </Stage>
        )}
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
const CARD_H = 380;
const RH = CARD_H + 96;

const PRIORITY_CARD = { hue: 40, icon: "Zap" as const };

interface Rule {
  id: "priority" | "mute" | "block" | "unsub";
  label: string;
  icon: typeof Zap;
  tone: string;
  who: Sender;
  subject: string;
  /** One line under the card: what the rule does. */
  text: string;
}

const RULES: Rule[] = [
  { id: "priority", label: "Priority", icon: Zap, tone: "text-amber", who: B.northwindMarket, subject: "Your refund was approved", text: "Always notifies you, and gathers their mail in a Priority card." },
  { id: "mute", label: "Muted", icon: BellOff, tone: "text-purple", who: B.litware, subject: "Weekly activity summary", text: "Their mail still arrives, but you won't be notified." },
  { id: "block", label: "Blocked", icon: ShieldBan, tone: "text-destructive", who: B.wingtip, subject: "LAST CHANCE: 70% off", text: "Their mail goes straight to the Trash, before you see it." },
  { id: "unsub", label: "Unsubscribe", icon: ListX, tone: "text-foreground", who: B.lucerne, subject: "This week: 12 stories", text: "Unsubscribe from a mailing list with one click." },
];

function Rules() {
  const ref = useRef<HTMLDivElement>(null);
  // the rules, the mail arriving, what happens to it, a pause
  const { step } = useLoop(ref, [1000, 1100, 4200, 500], 2);
  return (
    <div ref={ref} className="absolute inset-0 grid grid-cols-4 gap-5">
      {RULES.map((rule, i) => (
        <RuleColumn key={rule.id} rule={rule} step={step} delay={i * 0.35} />
      ))}
    </div>
  );
}

/** On a phone: one card at a time, swiped sideways, each at a size that can be read. */
function PhoneRules() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1000, 1100, 4200, 500], 2);
  // One column of the desktop grid: (1200 - 3 gaps of 20) / 4.
  const width = (RW - 3 * 20) / 4;
  return (
    <div ref={ref} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
      {RULES.map((rule) => (
        <div key={rule.id} className="w-[82%] max-w-[300px] shrink-0 snap-center">
          <Stage width={width} height={RH}>
            <div className="absolute inset-0 flex flex-col">
              <RuleColumn rule={rule} step={step} delay={0} />
            </div>
          </Stage>
        </div>
      ))}
    </div>
  );
}

function RuleColumn({ rule, step, delay }: { rule: Rule; step: number; delay: number }) {
  return (
    <div className="flex flex-col">
      <RuleCard rule={rule} step={step} delay={delay} />
      <p className="mt-4 px-2 text-[17px] leading-snug text-muted-foreground">{rule.text}</p>
    </div>
  );
}

function RuleCard({ rule, step, delay }: { rule: Rule; step: number; delay: number }) {
  const arrived = step >= 1 && step < 3;
  const outcome = step === 2;
  const Icon = rule.icon;
  return (
    <div className="plate-1 corner-squircle relative flex flex-col overflow-hidden rounded-[26px] p-5" style={{ height: CARD_H }}>
      {/* The rule */}
      <div className="flex items-center gap-2.5">
        <span className={cn("plate-2 flex size-9 items-center justify-center rounded-full", rule.tone)}>
          <Icon className={cn("size-[18px]", rule.id === "priority" && "fill-amber")} />
        </span>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold">{rule.label}</div>
          <div className="truncate text-[12.5px] text-muted-foreground">
            {rule.id === "unsub" ? `${rule.who.name} list` : `${rule.id === "block" ? "promo@" : "@"}${rule.who.email.split("@")[1]}`}
          </div>
        </div>
      </div>

      {/* The notification area, at the top right of the screen. */}
      <div className="mt-5 h-[76px]">
        {rule.id === "unsub" && <UnsubNotice outcome={outcome} />}
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
              <BellOff className="size-4 text-purple" /> No notification
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
                  <MiniRow from={rule.who} subject={rule.subject} unread icon={<BellOff className="size-3.5 shrink-0 text-purple" />} />
                </motion.div>
              )}
            </AnimatePresence>
            <MiniRow from={P.marcus} subject="Dinner on Friday?" />
            <MiniRow from={P.miguel} subject="Staff engineer role" />
          </div>
        )}
        {rule.id === "unsub" && (
          <div className="corner-squircle rounded-2xl p-2 shadow-raise-3">
            <AnimatePresence initial={false}>
              {arrived && (
                <motion.div key="new" initial={{ height: 0, opacity: 0 }} animate={{ height: 40, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, delay, ease: EASE }}>
                  <MiniRow from={rule.who} subject={rule.subject} unread />
                </motion.div>
              )}
            </AnimatePresence>
            <MiniRow from={rule.who} subject="Last week: 11 stories" />
            <MiniRow from={P.dana} subject="Photos from Saturday" />
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

/** Unsubscribing asks first, since it can't be undone; then the list is told to drop the address. */
function UnsubNotice({ outcome }: { outcome: boolean }) {
  // 0 asking, 1 the button pressed, 2 done
  const [stage, setStage] = useState(0);
  useEffect(() => {
    setStage(0);
    if (!outcome) return;
    const press = window.setTimeout(() => setStage(1), 1700);
    const done = window.setTimeout(() => setStage(2), 1950);
    return () => {
      window.clearTimeout(press);
      window.clearTimeout(done);
    };
  }, [outcome]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {outcome && stage < 2 && (
        <motion.div
          key="ask"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE, delay: stage === 0 ? 0.2 : 0 }}
          className="plate-2 corner-squircle rounded-[16px] p-2.5 shadow-overlay"
        >
          <div className="text-[13px] font-semibold leading-tight">Unsubscribe?</div>
          <div className="mt-1.5 flex items-center gap-2 text-[12.5px] font-medium">
            <span className="flex h-7 items-center rounded-[9px] px-2.5 text-muted-foreground">Cancel</span>
            <span
              className={cn(
                "grain corner-squircle flex h-7 items-center rounded-[9px] bg-primary px-3 text-primary-foreground transition-all duration-150",
                stage === 1 ? "shadow-pressed" : "shadow-raise-1",
              )}
            >
              Unsubscribe
            </span>
          </div>
        </motion.div>
      )}
      {outcome && stage === 2 && (
        <motion.div
          key="done"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="corner-squircle flex h-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-foreground/15 text-[13px] font-medium text-muted-foreground"
        >
          <ListX className="size-4" /> No more mail
        </motion.div>
      )}
    </AnimatePresence>
  );
}
