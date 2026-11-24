/**
 * "Email got overcomplicated": four very short stories, drawn in the app's own design language (plates, rows, pills).
 * Each one shows a single thing going wrong and ends on one plain sentence.
 */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { B, P, type Sender } from "~/lib/demo";
import { EASE, useLoop, useTyping } from "~/lib/motion";
import { Avatar } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";

/** A small screen of the app: one plate set into the card. */
function Screen({ children }: { children: ReactNode }) {
  return <div className="plate-2 corner-squircle relative h-[230px] overflow-hidden rounded-[20px] p-3">{children}</div>;
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
    <Screen>
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

/* ---------- Unreliable: people text each other to ask whether an email arrived. ---------- */

interface Bubble {
  me: boolean;
  text: string;
}

const CHAT: Bubble[] = [
  { me: false, text: "Did you see the client's email?" },
  { me: true, text: "No, what email?" },
  { me: false, text: "He sent it yesterday." },
  { me: true, text: "I didn't receive it." },
  { me: false, text: "Are you sure?" },
  { me: false, text: "Oh, it was trapped in their outbox, so he's sending it now. Did you get it?" },
  { me: true, text: "No, I don't see it." },
  { me: true, text: "Oh wait, it was spammed. Fine, got it." },
];

// An empty chat, then one message at a time; the long one is given longer to read.
const CHAT_STEPS = [700, ...CHAT.map((b) => (b.text.length > 40 ? 2200 : 1200)), 2400];

function Unreliable() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, CHAT_STEPS, CHAT_STEPS.length - 1);
  const shown = CHAT.slice(0, step);
  return (
    <Screen>
      <div ref={ref} className="flex h-full flex-col">
        <div className="flex h-9 shrink-0 items-center justify-center gap-2 border-b border-foreground/10 pb-2">
          <Avatar sender={P.sam} size={22} />
          <span className="text-[13px] font-semibold">Sam</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 overflow-hidden pt-2">
          <AnimatePresence initial={false}>
            {shown.map((bubble, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={cn("flex shrink-0", bubble.me ? "justify-end" : "justify-start")}
                style={{ transformOrigin: bubble.me ? "right bottom" : "left bottom" }}
              >
                <span
                  className={cn(
                    "max-w-[82%] rounded-[16px] px-3 py-1.5 text-[12.5px] leading-snug",
                    bubble.me ? "rounded-br-[5px] bg-sidebar-primary text-sidebar-primary-foreground" : "rounded-bl-[5px] bg-foreground/[0.09]",
                  )}
                >
                  {bubble.text}
                </span>
              </motion.div>
            ))}
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
    <Screen>
      <div ref={ref} className="h-full overflow-hidden">
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
    <Screen>
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
  { title: "Unreliable.", text: "Sync stalls and sends fail. People often use other chat apps to let others know they sent an email, just to make sure.", scene: <Unreliable /> },
  { title: "Overwhelming.", text: "Ads, spam and mail you never asked for bury the mail that matters.", scene: <Overwhelming /> },
  { title: "Hard to search.", text: "By sender, subject or attachment: slow, and often the wrong results.", scene: <HardToSearch /> },
];

export function ProblemsSection() {
  return (
    <Section id="why">
      <div className="max-w-[720px]">
        <Title>Why MiniMail?</Title>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="mt-4 text-balance text-[22px] font-medium leading-snug text-muted-foreground md:text-[28px]"
        >
          Email got overcomplicated over the years.
        </motion.h3>
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
