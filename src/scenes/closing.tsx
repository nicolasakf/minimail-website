/** Privacy and security, then the accounts that can be connected, the last call to download, and the footer. */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Cloud, ImageOff, Laptop, Lock, LockOpen, Server } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE, useLoop } from "~/lib/motion";
import { AccountMark } from "~/parts/mail";
import { DownloadButton, GithubButton, GithubMark, LINKS, Lead, Reveal, Section, Title } from "~/parts/site";

/** A small animated picture set into a privacy card. */
function Well({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("corner-squircle relative h-[150px] overflow-hidden rounded-[18px]", className)} style={{ boxShadow: "var(--pressed)" }}>
      {children}
    </div>
  );
}

/** Your computer talks straight to your provider; there is no MiniMail server to go through. */
function DirectLine() {
  return (
    <Well>
      <div className="absolute inset-x-5 top-4 flex items-center justify-center gap-2 text-[12px] text-muted-foreground/70">
        <Server className="size-4" />
        <span className="line-through decoration-2">MiniMail server</span>
      </div>
      <div className="absolute inset-x-6 bottom-5 flex items-center">
        <span className="plate-2 flex size-12 shrink-0 items-center justify-center rounded-[14px]">
          <Laptop className="size-6" strokeWidth={1.7} />
        </span>
        <div className="relative mx-3 h-px flex-1 border-t-2 border-dashed border-foreground/20">
          <motion.span
            className="absolute -top-[6px] size-2.5 rounded-full bg-sidebar-primary"
            animate={{ left: ["0%", "calc(100% - 10px)"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
          />
        </div>
        <span className="plate-2 flex size-12 shrink-0 items-center justify-center rounded-[14px]">
          <AccountMark account="gmail" size={26} />
        </span>
      </div>
    </Well>
  );
}

/** Passwords are typed once and locked in the OS keychain. */
function Keychain() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1200, 1000, 2600], 2);
  const locked = step === 2;
  return (
    <Well>
      <div ref={ref} className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="corner-squircle flex h-9 w-[210px] items-center rounded-[11px] px-3 font-mono text-[15px] tracking-[0.25em] text-foreground shadow-pressed">
          {"•".repeat(step === 0 ? 5 : 9)}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={locked ? "locked" : "open"} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
              {locked ? <Lock className="size-4 text-success" /> : <LockOpen className="size-4 text-muted-foreground" />}
              {locked ? "In your keychain" : "Saving…"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </Well>
  );
}

/** A message that tries to load a picture from a stranger's server is stopped. */
function BlockedImages() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [900, 1800, 800], 1);
  return (
    <Well>
      <div ref={ref} className="absolute inset-0 flex items-center justify-center gap-3 px-5">
        <div className="corner-squircle plate-2 flex size-[84px] shrink-0 items-center justify-center rounded-[16px]">
          <ImageOff className="size-7 text-muted-foreground" strokeWidth={1.6} />
        </div>
        <div className="min-w-0 space-y-1.5 text-[12.5px]">
          <div className="font-semibold">Remote image blocked</div>
          <div className="truncate rounded-md bg-foreground/[0.06] px-2 py-1 font-mono text-[11px] text-muted-foreground">tracker.example/px.gif</div>
          <motion.div animate={{ opacity: step === 1 ? 1 : 0.3 }} className="text-muted-foreground">
            They can't tell you opened it.
          </motion.div>
        </div>
      </div>
    </Well>
  );
}

/** Before anything goes to your AI provider, digits are replaced. */
function Redaction() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1300, 2800], 1);
  const hidden = step === 1;
  return (
    <Well>
      <div ref={ref} className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-[13px]">
        <div className="plate-2 corner-squircle w-full rounded-[12px] px-3.5 py-2.5 leading-snug">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Sent to your provider</div>
          <div className="mt-1">
            Your sign-in code is{" "}
            <span className="relative inline-block font-mono font-semibold">
              <span className={cn("transition-opacity duration-300", hidden ? "opacity-0" : "opacity-100")}>482910</span>
              <span className={cn("absolute inset-0 transition-opacity duration-300", hidden ? "opacity-100" : "opacity-0")}>••••••</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cloud className="size-4" /> Only with your own key
        </div>
      </div>
    </Well>
  );
}

const PRIVACY: { title: string; text: string; visual: ReactNode }[] = [
  {
    title: "No server in between.",
    text: "MiniMail talks to your mail provider directly. There is no MiniMail server, so there is no copy of your mail on one.",
    visual: <DirectLine />,
  },
  {
    title: "Locked in your keychain.",
    text: "Passwords, tokens and the saved copy of your mail are encrypted with your computer's keychain, and they stay on your computer.",
    visual: <Keychain />,
  },
  {
    title: "Mail can't run or track.",
    text: "No scripts, no forms, and no remote images unless you allow them, so a sender can't tell when you open a message.",
    visual: <BlockedImages />,
  },
  {
    title: "AI only if you choose it.",
    text: "Sorting with AI uses your own key. Without one, nothing is sent. With one, only the sender, subject and about 500 characters go, with digits and link paths replaced first.",
    visual: <Redaction />,
  },
];

const ACCOUNTS = [
  {
    mark: <AccountMark account="outlook" size={34} />,
    name: "Outlook and Microsoft 365",
    text: "Sign in with Microsoft. It works out of the box.",
  },
  {
    mark: <AccountMark account="gmail" size={34} />,
    name: "Gmail and Google Workspace",
    text: "Add it with an app password today. We're working on making Google sign-in (OAuth) work out of the box.",
    link: { href: "https://support.google.com/accounts/answer/185833", label: "Read more about app passwords" },
  },
  {
    mark: (
      <span className="flex items-center gap-2">
        <AccountMark account="zoho" size={28} />
        <Cloud className="size-7 text-sidebar-primary" strokeWidth={1.7} />
        <Server className="size-6 text-foreground/80" strokeWidth={1.7} />
      </span>
    ),
    name: "Zoho, iCloud and any other IMAP account",
    text: "Well-known providers work with your address and password. Any other IMAP account is easy to set up by hand: just your server, port and login.",
  },
];

export function AccountsSection() {
  return (
    <Section id="accounts">
      <div className="mx-auto max-w-[760px] text-center">
        <Title>Your mail stays yours.</Title>
        <Lead className="mx-auto mt-5 max-w-[600px]">
          Built around privacy and data security: your mail goes from your provider to your computer, and nowhere else.
        </Lead>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {PRIVACY.map((item, i) => (
          <Reveal key={item.title} delay={(i % 2) * 0.08} className="plate-1 corner-squircle flex flex-col gap-5 rounded-[26px] p-5">
            {item.visual}
            <div className="px-1.5 pb-1.5">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto mt-28 max-w-[720px] text-center">
        <h3 className="text-balance text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[36px]">One inbox for all your accounts.</h3>
        <p className="mx-auto mt-3 max-w-[520px] text-pretty text-[17px] leading-relaxed text-muted-foreground">Connect as many as you like, in one list.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {ACCOUNTS.map((account, i) => (
          <Reveal key={account.name} delay={i * 0.08} className="plate-1 corner-squircle flex flex-col rounded-[26px] p-6">
            <span className="plate-2 corner-squircle flex h-16 w-fit min-w-16 items-center justify-center rounded-[18px] px-4">{account.mark}</span>
            <h3 className="mt-5 text-lg font-bold">{account.name}</h3>
            <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{account.text}</p>
            {"link" in account && account.link && (
              <a
                href={account.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-fit items-center gap-1 text-[14px] font-medium text-sidebar-primary underline-offset-4 hover:underline"
              >
                {account.link.label}
                <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function ClosingSection() {
  return (
    <section className="relative px-5 pb-10 pt-16 md:px-8">
      <div className="plate-1 corner-squircle mx-auto flex max-w-[1136px] flex-col items-center overflow-hidden rounded-[40px] px-6 py-20 text-center md:py-28">
        <motion.img
          src="/app-icon.png"
          alt=""
          className="size-24"
          initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
          whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <Title className="mt-6 md:text-[72px]">Email made simple.</Title>
        <Lead className="mt-4 max-w-[520px]">Free and open source, for macOS. Bring your accounts, and your agent if you have one.</Lead>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <DownloadButton />
          <GithubButton />
        </div>
      </div>
      <footer className="mx-auto mt-10 flex max-w-[1136px] flex-wrap items-center gap-x-6 gap-y-3 px-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <img src="/app-icon.png" alt="" className="size-6" /> MiniMail
        </span>
        <span className="flex-1" />
        <FooterLink href={LINKS.guide}>Guide</FooterLink>
        <FooterLink href={`${LINKS.github}/releases`}>Releases</FooterLink>
        <FooterLink href={LINKS.license}>Apache 2.0</FooterLink>
        <FooterLink href={LINKS.github}>
          <GithubMark className="size-4" /> GitHub
        </FooterLink>
      </footer>
    </section>
  );
}

function FooterLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={cn("flex items-center gap-1.5 hover:text-foreground", className)}>
      {children}
    </a>
  );
}
