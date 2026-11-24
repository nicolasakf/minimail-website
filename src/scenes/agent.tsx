/**
 * "Bring your own AI agent": an agent in a terminal uses the `minimail` CLI, and the app shows what it does:
 * rows picked, moved with an Undo, and a send that waits for the person's answer.
 */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, SquareArrowOutUpRight, SquareTerminal, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FLAT_KEY } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { B, P, type Row } from "~/lib/demo";
import { EASE, useLoop, useTyping } from "~/lib/motion";
import { Cursor } from "~/parts/cursor";
import { ThreadRow } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";
import { AppWindow, ListHeader, Rail } from "~/parts/window";

const W = 1200;
const H = 640;

const ROWS: Row[] = [
  { id: "ana", from: P.ana, subject: "Thursday?", snippet: "Are we still on for Thursday at two? I can bring the printouts.", unread: true, account: "gmail", time: "10:04" },
  { id: "n1", from: B.lucerne, subject: "Five ideas for a slower weekend", snippet: "This week: bread, bicycles and the case for doing less.", account: "gmail", time: "8:00" },
  { id: "n2", from: B.tally, subject: "Monday: the week in eleven charts", snippet: "Rates held, the rail strike ended, and a small dog won a big prize.", account: "gmail", time: "Nov 23" },
  { id: "n3", from: B.field, subject: "Notes from the north shore", snippet: "Tide pools, a lighthouse, and the best soup in the county.", account: "uni", time: "Nov 21" },
  { id: "n4", from: B.proseware, subject: "What we read in November", snippet: "Twelve long reads, three short ones and a poem.", account: "outlook", time: "Nov 19" },
  { id: "r1", from: P.ravi, subject: "Draft agenda for Thursday's workshop", snippet: "Hi Alex and Priya, I'm attaching the draft agenda for Thursday's workshop.", attachment: true, account: "uni", time: "Nov 20" },
  { id: "r2", from: P.miguel, subject: "Staff engineer role on the platform team", snippet: "Hi Alex, your open source work caught my eye.", account: "outlook", time: "Nov 17" },
  { id: "r3", from: B.fabrikam, subject: "Order #77194 is delayed", snippet: "Hi Alex, thanks for your reply. We cannot find a tracking number yet.", account: "gmail", time: "Nov 16" },
];
const NEWSLETTERS = ["n1", "n2", "n3", "n4"];

type Line = { kind: "user" | "agent" | "cmd" | "out" | "wait"; text: string; at: number };

const LINES: Line[] = [
  { kind: "user", text: "Archive this week's newsletters, and tell Ana that Thursday works.", at: 0 },
  { kind: "agent", text: "I'll find the newsletters first.", at: 1 },
  { kind: "cmd", text: "minimail search category:newsletters after:2026-11-17", at: 2 },
  { kind: "out", text: '{ "matches": 4, "messages": [ { "id": "inbox|…|812", "from": "Lucerne Weekly", … }, … ] }', at: 3 },
  { kind: "cmd", text: 'minimail archive "inbox|…|812" "inbox|…|815" "inbox|…|820" "inbox|…|823"', at: 4 },
  { kind: "out", text: '{ "done": "archive", "changes": [ … 4 … ] }', at: 5 },
  { kind: "cmd", text: 'minimail draft reply "inbox|…|807" --body "Thursday works for me. See you at two."', at: 6 },
  { kind: "out", text: '{ "draft": "cli-1", "to": ["ana.lima@studio.example"] }', at: 7 },
  { kind: "cmd", text: "minimail send cli-1", at: 8 },
  { kind: "wait", text: "Waiting for an answer in MiniMail…", at: 9 },
  { kind: "out", text: '{ "sent": true, "asked": true }', at: 12 },
  { kind: "agent", text: "Done: four newsletters are in the Archive, and your reply to Ana is sent.", at: 13 },
];

//            0     1    2     3     4     5     6     7    8    9     10   11   12    13
const STEPS = [2300, 900, 1700, 1700, 1700, 2000, 2000, 900, 900, 1400, 900, 400, 1100, 3200];

export function AgentSection() {
  return (
    <Section id="agents">
      <div className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-end">
        <div>
          <Title>Bring your own AI agent.</Title>
        </div>
        <Lead>
          MiniMail has no chat assistant built in by design. Claude Code, Codex, Cursor, Gemini CLI or Copilot can work with your mail through the <code className="plate-3 corner-squircle rounded-md px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">minimail</code> CLI, as far as you allow in Settings.
          What can't be undone asks you first.
        </Lead>
      </div>
      <Reveal className="mt-14">
        <Stage width={W} height={H}>
          <AgentScene />
        </Stage>
      </Reveal>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <Point title="One agent that knows your work.">
          Every app is adding its own little agent, each with its own chat, memory and bill. MiniMail is made to be connected to, not to be one
          more.
        </Point>
        <Point title="The one you chose and pay for.">
          It can combine your mail with everything else it can reach: your calendar, your code, your notes.
        </Point>
        <Point title="Mail is data, never instructions.">
          Sign-in codes are withheld, links are shortened to their host unless you allow more, and every change by the CLI has an Undo.
        </Point>
      </div>
    </Section>
  );
}

function Point({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    </Reveal>
  );
}

function AgentScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { step, cycle } = useLoop(ref, STEPS, STEPS.length - 1);
  const checked = step >= 3 && step < 5;
  const archived = step >= 5;
  const asking = step >= 9 && step < 12;
  const rows = ROWS.filter((r) => !(archived && NEWSLETTERS.includes(r.id))).map((r) => (r.id === "ana" && step >= 12 ? { ...r, unread: false, count: 2 } : r));
  return (
    <div ref={ref} className="absolute inset-0 flex gap-6">
      <Terminal step={step} cycle={cycle} />
      <div className="relative min-w-0 flex-1">
        <AppWindow className="absolute inset-0 flex">
          <Rail />
          <div className="flex min-w-0 flex-1 flex-col">
            <ListHeader compact title="Inbox" />
            <div className="mt-2 pr-2">
              <AnimatePresence initial={false}>
                {rows.map((row) => {
                  const i = NEWSLETTERS.indexOf(row.id);
                  const on = checked && i >= 0;
                  const run = i === 0 ? "run-top !rounded-b-none" : i === 3 ? "run-bottom !rounded-t-none" : "run-mid !rounded-none";
                  return (
                    <motion.div
                      key={row.id}
                      initial={false}
                      exit={{ height: 0, opacity: 0, x: 40 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <ThreadRow
                        row={row}
                        nameWidth={130}
                        showAccount={false}
                        className={cn("transition-[box-shadow,background-color] duration-300", on && cn("grain sel-tint", run))}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          <AnimatePresence>
            {step >= 5 && step < 8 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="plate-1 corner-squircle absolute bottom-5 left-[calc(50%+36px)] flex w-max items-center gap-3 whitespace-nowrap rounded-[16px] py-2.5 pl-4 pr-2 text-sm shadow-overlay"
                style={{ x: "-50%" }}
              >
                <Check className="size-4 text-success" />
                <span className="font-medium">Moved 4 conversations to Archive</span>
                <span className="text-muted-foreground">via CLI</span>
                <span className={cn("ml-1 flex items-center gap-1 rounded-[10px] px-2 py-1 text-xs font-medium", FLAT_KEY, "plate-2")}>
                  <Undo2 className="size-3.5" /> Undo
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>{asking && <AskFirst pressed={step === 11} />}</AnimatePresence>
        </AppWindow>
        <Cursor x={step >= 10 ? 322 : 520} y={step >= 10 ? 390 : 600} pressed={step === 11} visible={step >= 9 && step <= 12} />
      </div>
    </div>
  );
}

function AskFirst({ pressed }: { pressed: boolean }) {
  return (
    <motion.div className="absolute inset-0 z-20 flex items-center justify-center bg-foreground/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="plate-1 corner-squircle grid w-[520px] gap-4 rounded-[24px] p-6 shadow-overlay"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SquareTerminal className="size-3.5" /> via CLI
          </div>
          <h4 className="text-lg font-semibold leading-none tracking-tight">Send this message?</h4>
          <p className="text-sm text-muted-foreground">An AI agent using the MiniMail CLI wants to send this message. Once sent, it can't be taken back.</p>
        </div>
        <dl className="space-y-2">
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 text-sm">
            <dt className="text-muted-foreground">To</dt>
            <dd>Ana Lima &lt;ana.lima@studio.example&gt;</dd>
          </div>
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 text-sm">
            <dt className="text-muted-foreground">Subject</dt>
            <dd>Re: Thursday?</dd>
          </div>
          <div className="corner-squircle rounded-xl p-3 font-mono text-xs shadow-pressed">Thursday works for me. See you at two.</div>
        </dl>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline">Reject</Button>
          <Button className={cn(pressed && "translate-x-[0.4px] translate-y-[0.4px] shadow-pressed")}>Allow once</Button>
          <Button variant="outline">
            <SquareArrowOutUpRight /> Open in composer
          </Button>
          <Button variant="outline">Always allow sending to these people</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Terminal({ step, cycle }: { step: number; cycle: number }) {
  const shown = LINES.filter((line) => line.at <= step);
  const current = shown[shown.length - 1];
  return (
    <div className="grain corner-squircle relative flex w-[520px] shrink-0 flex-col overflow-hidden rounded-[22px] bg-primary text-primary-foreground shadow-raise-1">
      <div className="flex h-11 shrink-0 items-center gap-2 px-4">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="size-3 rounded-full" style={{ background: c }} />
        ))}
        <span className="ml-3 text-[12px] font-medium text-primary-foreground/50">your agent — ~/notes</span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-5 pb-5 font-mono text-[12.5px] leading-[1.55]">
        {shown.map((line) => (
          <TerminalLine key={`${cycle}-${line.text}`} line={line} typing={line === current && (line.kind === "cmd" || line.kind === "user")} />
        ))}
      </div>
    </div>
  );
}

function TerminalLine({ line, typing }: { line: Line; typing: boolean }) {
  const typed = useTyping(line.text, true, line.kind === "user" ? 48 : 60);
  const text = typing ? typed : line.text;
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="break-words">
      {line.kind === "user" && (
        <div className="rounded-[12px] bg-primary-foreground/[0.07] px-3 py-2 font-sans text-[14px]">
          <span className="text-primary-foreground/50">› </span>
          {text}
        </div>
      )}
      {line.kind === "agent" && (
        <div className="font-sans text-[14px]">
          <span className="text-[#8fb0ff]">● </span>
          {text}
        </div>
      )}
      {line.kind === "cmd" && (
        <div>
          <span className="text-[#9be39b]">$ </span>
          {text}
          {typing && text.length < line.text.length && <span className="ml-px inline-block h-[13px] w-[7px] translate-y-[2px] bg-primary-foreground/70" />}
        </div>
      )}
      {line.kind === "out" && <div className="text-primary-foreground/55">{text}</div>}
      {line.kind === "wait" && <div className="text-[#f2c46b]">{text}</div>}
    </motion.div>
  );
}
