/** Connecting accounts, the last call to download, and the footer. */
import { motion } from "motion/react";
import { KeyRound, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE } from "~/lib/motion";
import { AccountMark } from "~/parts/mail";
import { DownloadButton, GithubButton, GithubMark, LINKS, Lead, Reveal, Section, Title } from "~/parts/site";

const ACCOUNTS = [
  {
    mark: <AccountMark account="outlook" size={34} />,
    name: "Outlook and Microsoft 365",
    text: "Microsoft sign-in works out of the box.",
  },
  {
    mark: <AccountMark account="gmail" size={34} />,
    name: "Gmail and Google Workspace",
    text: "Add it with an app password, or set up your own OAuth client for the full Google sign-in.",
  },
  {
    mark: <AccountMark account="zoho" size={34} />,
    name: "Zoho and any IMAP account",
    text: "Your server, your address: one list with everything else.",
  },
];

export function AccountsSection() {
  return (
    <Section id="accounts">
      <div className="mx-auto max-w-[720px] text-center">
        <Title>One inbox for all of them.</Title>
        <Lead className="mx-auto mt-5 max-w-[560px]">
          MiniMail talks to your mail servers directly. There is no MiniMail server in between, and your credentials stay in your keychain.
        </Lead>
      </div>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {ACCOUNTS.map((account, i) => (
          <Reveal key={account.name} delay={i * 0.08} className="plate-1 corner-squircle flex flex-col rounded-[26px] p-6">
            <span className="plate-2 corner-squircle flex h-16 w-fit min-w-16 items-center justify-center rounded-[18px] px-4">{account.mark}</span>
            <h3 className="mt-5 text-lg font-bold">{account.name}</h3>
            <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{account.text}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-8 flex max-w-fit flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <KeyRound className="size-4 text-amber" /> Passwords and tokens in the OS keychain
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-success" /> Saved mail encrypted on disk
        </span>
      </Reveal>
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
