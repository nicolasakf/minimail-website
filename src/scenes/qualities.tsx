/** Four tiles, each a small loop of the real UI: Fast, Nothing fails silently, Sandboxed mail, One inbox. */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, ImageOff, Info, KeyRound, LockKeyhole, ScrollText, Undo2 } from "lucide-react";

import { FLAT_KEY } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { B, LAST_WEEK, P, PINNED, YESTERDAY, type AccountId, type Row } from "~/lib/demo";
import { EASE, useLoop } from "~/lib/motion";
import { Cursor } from "~/parts/cursor";
import { AccountMark, Avatar, ThreadRow } from "~/parts/mail";
import { Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";

const TW = 560;
const TH = 330;

export function QualitiesSection() {
  return (
    <Section id="qualities">
      <div className="max-w-[760px]">
        <Title>Your mail stays findable. The app around it stays out of the way.</Title>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        <Tile title="Fast and responsive." text="Your inbox is on screen as soon as the window opens, and saved mail opens without waiting for the network.">
          <Fast />
        </Tile>
        <Tile title="Nothing fails silently." text="A send is confirmed or the error is shown, and every failure or server-side update is transparent to you." delay={0.08}>
          <Failures />
        </Tile>
        <Tile title="Sandboxed mail." text="No scripts, no forms, and no remote images unless you allow them.">
          <Sandbox />
        </Tile>
        <Tile title="One inbox, no server." text="Gmail, Outlook, Zoho or any other IMAP account in one list. Credentials stay in your OS keychain." delay={0.08}>
          <OneInbox />
        </Tile>
      </div>
    </Section>
  );
}

function Tile({ title, text, children, delay = 0 }: { title: string; text: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} className="plate-1 corner-squircle flex flex-col overflow-hidden rounded-[30px]">
      <div className="px-7 pt-7">
        <h3 className="text-[22px] font-bold">{title}</h3>
        <p className="mt-1.5 max-w-[440px] text-[15px] leading-snug text-muted-foreground">{text}</p>
      </div>
      <div className="mt-6 px-4 pb-4">
        <div className="corner-squircle overflow-hidden rounded-[22px]" style={{ boxShadow: "var(--pressed)" }}>
          <Stage width={TW} height={TH}>
            {children}
          </Stage>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------- Fast and responsive: keys move, archive and open at once. ---------- */

const KEYS = [
  { key: "↓", label: "Move" },
  { key: "E", label: "Archive" },
  { key: "↵", label: "Open" },
  { key: "Esc", label: "Back" },
];

function Fast() {
  const ref = useRef<HTMLDivElement>(null);
  // still, ↓, ↓, E, ↵, reading, Esc
  const { step } = useLoop(ref, [900, 550, 550, 1000, 700, 1900, 700], 2);
  const archived = step >= 3 && step < 6;
  const rows: Row[] = [PINNED, ...YESTERDAY, ...LAST_WEEK.slice(0, 4)].filter((r) => !(archived && r.id === "l1"));
  const cursor = step === 0 ? 0 : step === 1 ? 1 : 2;
  const pressed = step === 1 || step === 2 ? "↓" : step === 3 ? "E" : step === 4 ? "↵" : step === 6 ? "Esc" : null;
  const open = step === 4 || step === 5;
  const openRow = rows[2];
  return (
    <div ref={ref} className="absolute inset-0">
      <div className="absolute inset-x-3 top-3 h-[236px] overflow-hidden">
        <AnimatePresence initial={false}>
          {rows.map((row, i) => (
            <motion.div
              key={row.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0, x: 60 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <ThreadRow row={row} selected={!open && i === cursor} nameWidth={120} showAccount={false} className="mx-0 transition-none" />
            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {open && openRow && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.15 }}
              className="plate-1 corner-squircle absolute inset-0 rounded-[18px] p-4"
            >
              <div className="text-[17px] font-semibold">{openRow.subject}</div>
              <div className="mt-3 flex items-center gap-2.5">
                <Avatar sender={openRow.from} size={30} />
                <div className="text-[13px]">
                  <div className="font-semibold">{openRow.from.name}</div>
                  <div className="text-muted-foreground">to Alex · {openRow.time}</div>
                </div>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/85">{openRow.snippet}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-3">
        {KEYS.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "corner-squircle flex h-10 min-w-10 items-center justify-center rounded-[11px] px-2.5 text-[15px] font-semibold transition-all duration-100",
                pressed === key ? "translate-x-px translate-y-px text-sidebar-primary shadow-pressed" : "plate-1",
              )}
            >
              {key}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Nothing fails silently: the Log, with a send confirmed, an error explained and an Undo. ---------- */

const LOG = [
  { icon: Check, tone: "text-muted-foreground", title: "Sent “Draft agenda for Thursday”", detail: "To Priya Nair and Ravi Menon", area: "Send", time: "9:41" },
  { icon: Info, tone: "text-muted-foreground", title: "Moved 3 conversations to Archive", detail: "From the Inbox", area: "Mail", time: "9:43", undo: true },
  {
    icon: CircleAlert,
    tone: "text-destructive",
    title: "Could not send “Kitchen renovation quote”",
    detail: "The server refused the message: the attachment is over the 25 MB limit. It is back in Drafts.",
    area: "Send",
    time: "9:46",
  },
];

function Failures() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [700, 1100, 1100, 1300, 2800, 500], 4);
  const shown = LOG.slice(0, Math.min(LOG.length, Math.max(0, step - 0))).reverse();
  return (
    <div ref={ref} className="absolute inset-0">
      <div className="absolute bottom-4 left-4 top-4 flex w-[52px] flex-col items-center justify-end">
        <span className={cn("relative flex size-9 items-center justify-center rounded-full", FLAT_KEY, step >= 1 && "shadow-pressed text-sidebar-primary")}>
          <ScrollText className="size-5" />
          {step >= 3 && <span className="absolute right-0 top-0 size-2 rounded-full bg-destructive ring-2 ring-background" />}
        </span>
      </div>
      <AnimatePresence>
        {step >= 1 && step < 5 && (
          <motion.div
            initial={{ opacity: 0, x: -12, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="plate-1 corner-squircle absolute bottom-4 left-[78px] right-4 top-4 overflow-hidden rounded-[22px] shadow-overlay"
          >
            <div className="edge-b flex items-center justify-between px-4 py-3">
              <h4 className="text-sm font-semibold">Log</h4>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="py-1.5">
              <AnimatePresence initial={false}>
                {shown.map((event) => (
                  <motion.div
                    key={event.title}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <div className="corner-squircle relative mx-2 flex gap-2.5 rounded-xl px-3 py-2">
                      <event.icon className={cn("mt-0.5 size-4 shrink-0", event.tone)} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="block pr-14 text-sm font-medium">{event.title}</span>
                        <span className="block text-xs text-muted-foreground">{event.detail}</span>
                        <span className="block text-xs text-muted-foreground">
                          <span className="uppercase tracking-wide">{event.area}</span> · {event.time}
                        </span>
                      </div>
                      {event.undo && (
                        <span className={cn("absolute right-2 top-2 flex items-center gap-1 rounded-[10px] px-1.5 py-0.5 text-xs font-medium text-muted-foreground", FLAT_KEY, "plate-3")}>
                          <Undo2 className="size-3.5" /> Undo
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Sandboxed mail: remote images stay blocked until you load them. ---------- */

function Sandbox() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1300, 900, 350, 2600, 600], 1);
  const loaded = step >= 3;
  return (
    <div ref={ref} className="absolute inset-0 p-4">
      <div className="plate-1 corner-squircle flex h-full flex-col overflow-hidden rounded-[20px]">
        <div className="flex items-center gap-3 px-4 pb-2 pt-3.5">
          <Avatar sender={B.wingtip} size={30} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">Your weekly picks are here</div>
            <div className="text-xs text-muted-foreground">Wingtip Toys · 9:12</div>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {!loaded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mx-3 mb-2 flex items-center gap-2 rounded-[12px] px-3 py-2 text-[12px]" style={{ boxShadow: "var(--pressed)" }}>
                <ImageOff className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 text-muted-foreground">Remote images are blocked so senders cannot track when you open this.</span>
                <span className={cn("shrink-0 rounded-[10px] px-2 py-1 font-semibold", step >= 1 ? "plate-2" : "", step === 2 && "shadow-pressed")}>Load images</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid flex-1 grid-cols-3 gap-2.5 px-4 pb-4">
          {["#e7a04a", "#5c8fd6", "#7bb36a"].map((color, i) => (
            <div key={color} className="flex flex-col gap-1.5">
              <div className="relative flex-1 overflow-hidden rounded-[10px]" style={{ boxShadow: loaded ? "var(--raise-3)" : "var(--pressed)" }}>
                <AnimatePresence>
                  {loaded ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 72% 28%, #fff9 0 7%, transparent 7.5%), radial-gradient(120% 70% at 25% 110%, #0002 0 45%, transparent 46%), radial-gradient(110% 60% at 85% 115%, #0001 0 50%, transparent 51%), linear-gradient(170deg, ${color}cc, ${color})`,
                      }}
                    />
                  ) : (
                    <div key="blocked" className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                      <ImageOff className="size-5" />
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <span className="h-2 w-4/5 rounded bg-foreground/15" />
              <span className="h-2 w-1/2 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>
      <Cursor x={step === 0 ? 300 : 470} y={step === 0 ? 260 : 96} pressed={step === 2} visible={step < 3} />
    </div>
  );
}

/* ---------- One inbox, no server: three accounts, one list, keys in the keychain. ---------- */

const MIXED: { row: Row; account: AccountId | "zoho" }[] = [
  { account: "gmail", row: { id: "m1", from: P.ana, subject: "Thursday?", snippet: "", unread: true, account: "gmail", time: "10:04" } },
  { account: "outlook", row: { id: "m2", from: P.miguel, subject: "Staff engineer role", snippet: "", account: "outlook", time: "9:58" } },
  { account: "zoho", row: { id: "m3", from: B.coho, subject: "Your wine club box shipped", snippet: "", account: "gmail", time: "9:31" } },
  { account: "uni", row: { id: "m4", from: P.ravi, subject: "Draft agenda", snippet: "", account: "uni", time: "9:12" } },
];

function OneInbox() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [800, 700, 700, 700, 700, 2800], 5);
  const shown = MIXED.slice(0, Math.max(0, step));
  return (
    <div ref={ref} className="absolute inset-0 flex gap-4 p-4">
      <div className="flex w-[150px] shrink-0 flex-col gap-2.5">
        {(["gmail", "outlook", "zoho", "uni"] as const).map((account, i) => (
          <div
            key={account}
            className={cn(
              "corner-squircle flex h-[56px] items-center gap-2.5 rounded-[16px] px-3 transition-shadow duration-300",
              step === i + 1 ? "plate-1 shadow-raise-1" : "plate-1",
            )}
          >
            <span className="plate-3 flex size-8 items-center justify-center rounded-full">
              <AccountMark account={account} size={18} />
            </span>
            <span className="text-[13px] font-medium">{{ gmail: "Gmail", outlook: "Outlook", zoho: "Zoho", uni: "IMAP" }[account]}</span>
          </div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="plate-1 corner-squircle h-full rounded-[20px] p-2 pt-3">
          <div className="px-3 pb-2 text-[15px] font-semibold">All Mail</div>
          <AnimatePresence initial={false}>
            {shown.map(({ row, account }) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -40, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 44 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="mx-1 flex h-10 items-center gap-2.5 rounded-xl px-2 text-[13px]">
                  <span className={cn("size-2 shrink-0 rounded-full", row.unread && "bg-unread")} />
                  <Avatar sender={row.from} size={24} />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-semibold">{row.from.name}</span>
                    <span className="ml-2 text-muted-foreground">{row.subject}</span>
                  </div>
                  <AccountMark account={account} size={15} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <motion.div
          animate={{ opacity: step >= 5 ? 1 : 0, y: step >= 5 ? 0 : 8 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="plate-2 corner-squircle absolute bottom-3 right-3 flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-[12px] font-medium"
        >
          <LockKeyhole className="size-3.5 text-success" />
          Passwords in your keychain
          <KeyRound className="size-3.5 text-amber" />
        </motion.div>
      </div>
    </div>
  );
}

