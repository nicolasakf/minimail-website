/**
 * "Email got overcomplicated": four very short stories, drawn in the app's own design language (plates, rows, pills).
 * Each one shows a single thing going wrong and ends on one plain sentence.
 */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, LoaderCircle, Search, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { B, P, type Sender } from "~/lib/demo";
import { EASE, useLoop, useTyping } from "~/lib/motion";
import { Avatar } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";

/** A small screen of the app: one plate set into the card. */
function Screen({ children, verdict, tone = "muted" }: { children: ReactNode; verdict?: ReactNode; tone?: "muted" | "bad" }) {
  return (
    <div className="plate-2 corner-squircle relative h-[230px] overflow-hidden rounded-[20px] p-3">
      {children}
      <AnimatePresence>
        {verdict && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              "plate-3 corner-squircle absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-[12px] px-3 py-2 text-center text-[13px] font-semibold",
              tone === "bad" ? "text-destructive" : "text-foreground",
            )}
          >
            {verdict}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ from, title, sub, unread, className }: { from: Sender; title: string; sub?: string; unread?: boolean; className?: string }) {
  return (
    <div className={cn("flex h-[42px] items-center gap-2.5 rounded-xl px-1.5", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", unread && "bg-unread")} />
      <Avatar sender={from} size={26} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className={cn("truncate text-[13px]", unread ? "font-semibold" : "font-medium")}>{title}</div>
        {sub && <div className="truncate text-[11.5px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Slow: the list never fills in. ---------- */

function Slow() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [900, 1100, 1300, 3000], 3);
  const seconds = [3, 9, 21, 34][step];
  return (
    <Screen verdict={step === 3 ? "Still loading." : undefined}>
      <div ref={ref}>
        <div className="flex h-8 items-center px-1.5">
          <span className="text-[15px] font-semibold">Inbox</span>
          <span className="ml-auto flex items-center gap-2 text-[13px] tabular-nums text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin text-sidebar-primary" />0:{String(seconds).padStart(2, "0")}
          </span>
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex h-[42px] items-center gap-2.5 px-1.5">
            <span className="size-2" />
            <span className="size-[26px] shrink-0 animate-pulse rounded-lg bg-foreground/10" style={{ animationDelay: `${i * 150}ms` }} />
            <div className="flex-1 space-y-1.5">
              <span className="block h-2.5 w-1/2 animate-pulse rounded bg-foreground/10" style={{ animationDelay: `${i * 150}ms` }} />
              <span className="block h-2 w-4/5 animate-pulse rounded bg-foreground/[0.07]" style={{ animationDelay: `${i * 150 + 80}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- Unreliable: it said sent, and it never arrived. One message, one status that changes. ---------- */

function Unreliable() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1300, 1700, 3300], 2);
  return (
    <Screen verdict={step === 2 ? "No error. No explanation." : undefined} tone="bad">
      <div ref={ref} className="flex h-[calc(100%-52px)] flex-col justify-center gap-5">
        <div className="plate-1 corner-squircle flex items-center gap-3 rounded-[16px] px-3 py-3">
          <Avatar sender={P.sam} size={34} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[14px] font-semibold">Signed contract</div>
            <div className="truncate text-[12px] text-muted-foreground">To Sam Okafor</div>
          </div>
        </div>
        <div className="flex justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="plate-3 corner-squircle flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold"
            >
              {step === 0 && (
                <>
                  <LoaderCircle className="size-4 animate-spin text-muted-foreground" /> Sending…
                </>
              )}
              {step === 1 && (
                <>
                  <Check className="size-4 text-success" /> Sent
                </>
              )}
              {step === 2 && (
                <>
                  <TriangleAlert className="size-4 text-amber" /> Sam never got it
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </Screen>
  );
}

/* ---------- Overwhelming: ads pile in and push the real mail out of view. ---------- */

const ADS: { from: Sender; title: string }[] = [
  { from: B.wingtip, title: "FLASH SALE: 60% off everything" },
  { from: B.coho, title: "We miss you! Here's 20% off" },
  { from: B.alpine, title: "Last chance: deals end tonight" },
  { from: B.fourth, title: "You've been selected for a reward" },
  { from: B.blueYonder, title: "New arrivals you'll love" },
];

function Overwhelming() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1200, 650, 650, 650, 650, 650, 2800], 6);
  const ads = ADS.slice(0, Math.min(step, ADS.length)).reverse();
  return (
    <Screen verdict={step === 6 ? "The mail that matters is buried." : undefined}>
      <div ref={ref}>
        <div className="flex h-8 items-center px-1.5 text-[15px] font-semibold">Inbox</div>
        <AnimatePresence initial={false}>
          {ads.map((ad) => (
            <motion.div key={ad.title} initial={{ height: 0, opacity: 0 }} animate={{ height: 42, opacity: 1 }} transition={{ duration: 0.3, ease: EASE }}>
              <Row from={ad.from} title={ad.title} sub={ad.from.name} unread />
            </motion.div>
          ))}
        </AnimatePresence>
        <Row from={P.noor} title="Kitchen renovation quote" sub="Noor Haddad" unread />
      </div>
    </Screen>
  );
}

/* ---------- Hard to search: slow, and not what you asked for. ---------- */

function HardToSearch() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [2000, 1500, 3200], 2);
  const typed = useTyping("invoice from acme", true, 14);
  const text = step === 0 ? typed : "invoice from acme";
  return (
    <Screen verdict={step === 2 ? "Not the invoice." : undefined}>
      <div ref={ref}>
        <div className="corner-squircle flex h-10 items-center gap-2 rounded-[12px] px-3 text-[14px] shadow-pressed">
          <Search className="size-4 text-muted-foreground" />
          <span>{text}</span>
          {step === 0 && <span className="h-4 w-px animate-pulse bg-foreground" />}
          {step === 1 && <LoaderCircle className="ml-auto size-4 animate-spin text-sidebar-primary" />}
        </div>
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
            <Row from={B.acme} title="Acme newsletter: March" sub="Newsletter" />
            <Row from={B.acme} title="Acme spring party" sub="Invitation" />
          </motion.div>
        )}
      </div>
    </Screen>
  );
}

const PROBLEMS = [
  { title: "Slow.", text: "Mail takes forever to load, open and search.", scene: <Slow /> },
  { title: "Unreliable.", text: "Sync stalls and sends fail, and it's hard to understand why.", scene: <Unreliable /> },
  { title: "Overwhelming.", text: "Ads, spam and mail you never asked for bury the mail that matters.", scene: <Overwhelming /> },
  { title: "Hard to search.", text: "By sender, subject or attachment: slow, and often the wrong results.", scene: <HardToSearch /> },
];

export function ProblemsSection() {
  return (
    <Section id="why">
      <div className="max-w-[720px]">
        <Title>Email got overcomplicated.</Title>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map((problem, i) => (
          <Reveal key={problem.title} delay={i * 0.08} className="plate-1 corner-squircle flex flex-col rounded-[26px] p-3.5">
            {problem.scene}
            <div className="px-1.5 pb-1.5 pt-4">
              <h3 className="text-lg font-bold">{problem.title}</h3>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{problem.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Question />
    </Section>
  );
}

function Question() {
  const words = "How simple can we make it?".split(" ");
  return (
    <div className="mt-28 text-center md:mt-36">
      <Lead className="mx-auto max-w-[560px]">MiniMail is a desktop email client built on a different question:</Lead>
      <h2 className="mx-auto mt-6 max-w-[900px] text-balance text-[48px] font-bold leading-[1] tracking-[-0.03em] md:text-[88px]">
        {words.map((word, i) => (
          <motion.span
            key={word}
            className={cn("inline-block pr-[0.22em]", word === "simple" && "text-sidebar-primary")}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: EASE }}
          >
            {word}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}
