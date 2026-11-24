/**
 * The four privacy pictures of "Your mail stays yours". Each is a small scene drawn at a fixed size (W × H) and
 * shrunk to fit its card, so positions below are in scene pixels.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Image, ImageOff, KeyRound, Laptop, Lock, LockOpen, Mail, Server, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { B } from "~/lib/demo";
import { EASE, useLoop } from "~/lib/motion";
import { AccountMark, Avatar } from "~/parts/mail";
import { Stage } from "~/parts/stage";

const W = 500;
const H = 220;

/** The sunken well a scene sits in. */
export function Well({ children }: { children: ReactNode }) {
  return (
    <div className="corner-squircle overflow-hidden rounded-[18px]" style={{ boxShadow: "var(--pressed)" }}>
      <Stage width={W} height={H}>
        {children}
      </Stage>
    </div>
  );
}

/** A raised tile centered on (x, y). */
function Tile({ x, y, size = 64, pulse, className, children }: { x: number; y: number; size?: number; pulse?: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={cn("plate-2 corner-squircle absolute flex items-center justify-center", className)}
      style={{ left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: Math.round(size * 0.28) }}
      animate={{ scale: pulse ? [1, 1.12, 1] : 1 }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

/** A caption centered under a point. */
function Caption({ x, y, className, children }: { x: number; y: number; className?: string; children: ReactNode }) {
  return (
    <div className={cn("absolute w-[180px] text-center text-[12px] text-muted-foreground", className)} style={{ left: x - 90, top: y }}>
      {children}
    </div>
  );
}

/* ---------- No server in between: mail goes from the provider straight to the Mac. ---------- */

const PROVIDERS = [
  { id: "gmail", label: "Gmail" },
  { id: "outlook", label: "Outlook" },
  { id: "zoho", label: "Zoho Mail" },
] as const;

export function DirectLine() {
  const ref = useRef<HTMLDivElement>(null);
  // a pause, three messages, then a hold; each loop uses the next provider
  const { step, cycle } = useLoop(ref, [600, 1100, 1100, 1100, 2000], 4);
  const provider = PROVIDERS[cycle % PROVIDERS.length];
  const delivered = Math.max(0, step - 1);
  return (
    <div ref={ref} className="absolute inset-0">
      {/* The way through a server, which MiniMail doesn't have. */}
      <svg className="absolute inset-0" width={W} height={H} fill="none">
        <path d="M 408 116 Q 372 52 286 50" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
        <path d="M 214 50 Q 128 52 92 116" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
      </svg>
      <div className="absolute flex size-14 items-center justify-center rounded-[16px] border-2 border-dashed border-foreground/20 text-muted-foreground/50" style={{ left: 222, top: 22 }}>
        <Server className="size-6" strokeWidth={1.6} />
        <span className="absolute h-[2.5px] w-[76px] -rotate-[38deg] rounded-full bg-destructive/70" />
      </div>
      <Caption x={250} y={84} className="text-[11.5px] text-muted-foreground/70">
        No MiniMail server
      </Caption>

      {/* The direct line. */}
      <div className="absolute h-[3px] rounded-full bg-sidebar-primary/25" style={{ left: 116, width: 268, top: 149 }} />

      <Tile x={76} y={150}>
        <Laptop className="size-7" strokeWidth={1.6} />
        <AnimatePresence>
          {delivered > 0 && (
            <motion.span
              key={delivered}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-[11px] font-semibold text-sidebar-primary-foreground"
            >
              {delivered}
            </motion.span>
          )}
        </AnimatePresence>
      </Tile>
      <Caption x={76} y={190}>
        Your Mac
      </Caption>

      <Tile x={424} y={150}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={provider.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.25 }}>
            <AccountMark account={provider.id} size={32} />
          </motion.span>
        </AnimatePresence>
      </Tile>
      <Caption x={424} y={190}>
        {provider.label}
      </Caption>

      {/* One message at a time, straight across. */}
      {[0, 1, 2].map(
        (i) =>
          step === i + 1 && (
            <motion.div
              key={`${cycle}-${i}`}
              className="plate-3 corner-squircle absolute flex h-[24px] w-[32px] items-center justify-center rounded-[7px]"
              style={{ top: 139, left: 0 }}
              initial={{ x: 352, opacity: 0 }}
              animate={{ x: 118, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.95, ease: "easeInOut", opacity: { duration: 0.95, times: [0, 0.15, 0.85, 1] } }}
            >
              <Mail className="size-4 text-sidebar-primary" />
            </motion.div>
          ),
      )}
    </div>
  );
}

/* ---------- Locked in your keychain: each secret is scrambled and goes into the keychain. ---------- */

const GLYPHS = "abcdef0123456789#%&*+=?";

/** `plain` turns into `cipher` from left to right over `ms`, flickering on the way. */
function useScramble(plain: string, cipher: string, active: boolean, ms = 600) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) {
      setT(0);
      return;
    }
    if (reduced) {
      setT(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const v = Math.min(1, (now - start) / ms);
      setT(v);
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ms, reduced]);
  const length = Math.max(plain.length, cipher.length);
  let out = "";
  for (let i = 0; i < length; i++) {
    const at = (i / length) * 0.8;
    if (t >= at + 0.2) out += cipher[i] ?? "";
    else if (t >= at) out += GLYPHS[(i * 7 + Math.floor(t * 60)) % GLYPHS.length];
    else out += plain[i] ?? "";
  }
  return out;
}

const SECRETS: { icon: LucideIcon; label: string; plain: string; cipher: string }[] = [
  { icon: KeyRound, label: "Password", plain: "sunflower-42", cipher: "9f3a·c1e8·7b" },
  { icon: Lock, label: "Sign-in token", plain: "Outlook access", cipher: "e04d·5a9c·21f0" },
  { icon: Mail, label: "Saved mail", plain: "Dinner on Friday?", cipher: "b7c2·0e91·d4a8·3f" },
];

export function Keychain() {
  const ref = useRef<HTMLDivElement>(null);
  // three secrets, each shown, scrambled and stored; then the keychain locks
  const { step, cycle } = useLoop(ref, [800, 900, 750, 800, 900, 750, 800, 900, 750, 2200], 7);
  const index = Math.min(2, Math.floor(step / 3));
  const phase = step === 9 ? 3 : step % 3;
  const stored = step === 9 ? 3 : Math.floor(step / 3);
  const locked = step === 9;
  const secret = SECRETS[index];
  const text = useScramble(secret.plain, secret.cipher, phase >= 1 && phase < 3);
  const Icon = secret.icon;

  return (
    <div ref={ref} className="absolute inset-0">
      {/* The secret, in the clear and then scrambled. */}
      <AnimatePresence>
        {phase < 3 && (
          <motion.div
            key={`${cycle}-${index}`}
            className="plate-2 corner-squircle absolute flex h-[52px] w-[236px] items-center gap-3 rounded-[14px] px-3"
            style={{ left: 30, top: 74 }}
            initial={{ x: -30, opacity: 0 }}
            animate={phase === 2 ? { x: 236, y: -4, scale: 0.3, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: phase === 2 ? 0.65 : 0.45, ease: phase === 2 ? [0.55, 0, 0.75, 0.2] : EASE }}
          >
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-300", phase >= 1 ? "text-success" : "text-foreground")}>
              {phase >= 1 ? <Lock className="size-[18px]" /> : <Icon className="size-[18px]" />}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{secret.label}</div>
              <div className={cn("mt-0.5 truncate text-[14px]", phase >= 1 ? "font-mono text-[13px] text-muted-foreground" : "font-medium")}>{phase >= 1 ? text : secret.plain}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The arrow toward the keychain. */}
      <svg className="absolute" style={{ left: 280, top: 92 }} width="50" height="16" fill="none">
        <path d="M 2 8 H 42 M 36 2 L 43 8 L 36 14" stroke="currentColor" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* The keychain. */}
      <Tile x={398} y={100} size={88}>
          <motion.span key={stored} initial={{ scale: stored ? 1.25 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 14 }}>
            {locked ? <Lock className="size-9 text-success" strokeWidth={1.7} /> : <LockOpen className="size-9 text-muted-foreground" strokeWidth={1.7} />}
          </motion.span>
      </Tile>
      <div className="absolute flex gap-2" style={{ left: 398 - 26, top: 156 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("h-2 w-3.5 rounded-full transition-colors duration-300", i < stored ? "bg-success" : "bg-foreground/12")} />
        ))}
      </div>
      <Caption x={398} y={174}>
        {locked ? "Locked in your keychain" : "Your Mac's keychain"}
      </Caption>
    </div>
  );
}

/* ---------- Mail can't run or track: the tracking pixel's request never leaves. ---------- */

export function BlockedImages() {
  const ref = useRef<HTMLDivElement>(null);
  // the message opens, its tracker tries to call home, it is stopped
  const { step, cycle } = useLoop(ref, [1000, 900, 2800], 2);
  const stopped = step === 2;
  return (
    <div ref={ref} className="absolute inset-0">
      {/* The message. */}
      <div className="plate-2 corner-squircle absolute rounded-[16px] p-3" style={{ left: 22, top: 22, width: 214, height: 176 }}>
        <div className="flex items-center gap-2">
          <Avatar sender={B.wingtip} size={22} />
          <span className="text-[12.5px] font-semibold">Wingtip Toys</span>
        </div>
        <div className="mt-1.5 truncate text-[12px] text-muted-foreground">LAST CHANCE: 70% off</div>
        <div className="corner-squircle mt-2.5 flex h-[86px] flex-col items-center justify-center gap-1.5 rounded-[12px] text-muted-foreground shadow-pressed">
          {stopped ? <ImageOff className="size-6" strokeWidth={1.6} /> : <Image className="size-6 opacity-50" strokeWidth={1.6} />}
          <span className="text-[11px]">{stopped ? "Remote image blocked" : "Loading image…"}</span>
        </div>
      </div>

      {/* The way out, cut at the shield. */}
      <div className="absolute h-[2px] border-t-2 border-dashed border-foreground/20" style={{ left: 240, width: 52, top: 109 }} />
      <div className="absolute h-[2px] border-t-2 border-dashed border-foreground/10" style={{ left: 346, width: 46, top: 109 }} />

      <Tile x={319} y={110} size={50} pulse={stopped}>
        <ShieldCheck className={cn("size-6 transition-colors duration-300", stopped ? "text-success" : "text-foreground")} strokeWidth={1.8} />
      </Tile>

      {/* The tracking pixel's request. */}
      {(step === 1 || stopped) && (
        <motion.div
          key={cycle}
          className="plate-3 absolute flex h-6 items-center rounded-full px-2.5 font-mono text-[10.5px] text-muted-foreground"
          style={{ left: 0, top: 98 }}
          initial={{ x: 180, opacity: 0 }}
          animate={stopped ? { x: 244, opacity: 0, scale: 1.5 } : { x: 240, opacity: 1, scale: 1 }}
          transition={{ duration: stopped ? 0.35 : 0.8, ease: EASE }}
        >
          px.gif
        </motion.div>
      )}

      {/* The tracker, which never hears back. */}
      <Tile x={430} y={110}>
        {stopped ? <EyeOff className="size-7 text-muted-foreground" strokeWidth={1.6} /> : <Eye className="size-7" strokeWidth={1.6} />}
      </Tile>
      <Caption x={430} y={150} className="font-mono text-[11px]">
        tracker.example
      </Caption>
      <Caption x={430} y={168} className={cn("font-medium transition-opacity duration-300", stopped ? "opacity-100" : "opacity-0")}>
        No open recorded
      </Caption>
    </div>
  );
}

/* ---------- AI only if you choose it: digits and link paths are covered before anything is sent. ---------- */

function Secret({ on, delay, children }: { on: boolean; delay: number; children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="font-mono font-semibold text-foreground">{children}</span>
      <motion.span
        className="absolute -inset-x-0.5 inset-y-0 origin-left rounded-[3px] bg-foreground"
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: on ? 0.35 : 0.2, delay: on ? delay : 0, ease: EASE }}
      />
    </span>
  );
}

export function Redaction() {
  const ref = useRef<HTMLDivElement>(null);
  // the message, covered, a copy sent, received
  const { step, cycle } = useLoop(ref, [1300, 1300, 1000, 2200], 3);
  const covered = step >= 1;
  return (
    <div ref={ref} className="absolute inset-0">
      {/* The message. */}
      <div className="plate-2 corner-squircle absolute overflow-hidden rounded-[16px] p-3.5 text-[12.5px]" style={{ left: 20, top: 22, width: 286, height: 176 }}>
        <div className="flex items-center gap-2">
          <Avatar sender={B.contoso} size={22} />
          <span className="font-semibold">Contoso ID</span>
        </div>
        <div className="mt-1.5 font-medium">Your sign-in code</div>
        <p className="mt-2 leading-[1.7] text-muted-foreground">
          Your code is{" "}
          <Secret on={covered} delay={0.25}>
            482910
          </Secret>
          . Or reset your password at contoso.example
          <Secret on={covered} delay={0.6}>
            /r/8f2k1
          </Secret>
        </p>
        {/* The pass that covers them. */}
        {step === 1 && (
          <motion.span
            key={cycle}
            className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-sidebar-primary/20 to-transparent"
            initial={{ left: -40 }}
            animate={{ left: 300 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* The covered copy, on its way. */}
      {step === 2 && (
        <motion.div
          key={cycle}
          className="plate-3 corner-squircle absolute flex flex-col gap-1.5 rounded-[8px] p-2"
          style={{ left: 0, top: 0, width: 64, height: 44 }}
          initial={{ x: 196, y: 88, opacity: 0, scale: 1 }}
          animate={{ x: 388, y: 70, opacity: [0, 1, 1, 0], scale: 0.6 }}
          transition={{ duration: 0.85, ease: "easeInOut", opacity: { duration: 0.85, times: [0, 0.15, 0.8, 1] } }}
        >
          <span className="h-1.5 w-8 rounded-full bg-foreground/30" />
          <span className="flex gap-1">
            <span className="h-1.5 w-5 rounded-full bg-foreground/20" />
            <span className="h-1.5 w-4 rounded-[2px] bg-foreground" />
          </span>
          <span className="flex gap-1">
            <span className="h-1.5 w-6 rounded-full bg-foreground/20" />
            <span className="h-1.5 w-3 rounded-[2px] bg-foreground" />
          </span>
        </motion.div>
      )}

      {/* The AI provider, reached only with your own key. */}
      <Tile x={414} y={92} size={68} pulse={step === 3}>
        <Sparkles className={cn("size-7 transition-colors duration-300", step === 3 ? "text-sidebar-primary" : "text-foreground")} strokeWidth={1.6} />
      </Tile>
      <span className="plate-3 absolute flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-medium" style={{ left: 432, top: 46 }}>
        <KeyRound className="size-3 text-amber" /> Your key
      </span>
      <Caption x={414} y={136}>
        Your AI provider
      </Caption>
      <Caption x={414} y={154} className={cn("font-medium transition-opacity duration-300", step === 3 ? "opacity-100" : "opacity-0")}>
        Code and link hidden
      </Caption>
    </div>
  );
}
