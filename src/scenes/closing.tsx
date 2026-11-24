/** Privacy and security, then the accounts that can be connected, the last call to download, and the footer. */
import { type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight, Cloud, Server } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE } from "~/lib/motion";
import { AccountMark } from "~/parts/mail";
import { DownloadButton, GithubButton, GithubMark, LINKS, Lead, Reveal, Section, Title } from "~/parts/site";
import { BlockedImages, DirectLine, Keychain, Redaction, Well } from "~/scenes/privacy";

const PRIVACY: { title: string; text: string; visual: ReactNode }[] = [
  {
    title: "No server in between.",
    text: "MiniMail talks to your mail provider directly. There is no MiniMail server, so there is no copy of your mail on one.",
    visual: (
      <Well>
        <DirectLine />
      </Well>
    ),
  },
  {
    title: "Locked in your keychain.",
    text: "Passwords, tokens and the saved copy of your mail are encrypted with your computer's keychain, and they stay on your computer.",
    visual: (
      <Well>
        <Keychain />
      </Well>
    ),
  },
  {
    title: "Mail can't run or track.",
    text: "No scripts, no forms, and no remote images unless you allow them, so a sender can't tell when you open a message.",
    visual: (
      <Well>
        <BlockedImages />
      </Well>
    ),
  },
  {
    title: "AI only if you choose it.",
    text: "Sorting with AI uses your own key. Without one, nothing is sent. With one, only the sender, subject and about 500 characters go, with digits and link paths replaced first.",
    visual: (
      <Well>
        <Redaction />
      </Well>
    ),
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

/** If something is missing: build it, and tell us. It leads into the closing card, which is about being open source. */
export function MissingSection() {
  return (
    <Section id="open-source" className="pb-6 md:pb-8">
      <div className="mx-auto max-w-[820px] text-center">
        <Title className="text-[32px] md:text-[48px]">Still feel like a feature you absolutely need is missing?</Title>
        <Lead className="mx-auto mt-5 max-w-[680px]">
          Then the answer is easy: just clone it and build it yourself, and then share your ideas, or the feature itself, with us on{" "}
          <a href={`${LINKS.github}/issues`} className="font-medium text-sidebar-primary underline-offset-4 hover:underline">
            GitHub
          </a>
          .
        </Lead>
        <Reveal className="mt-10 flex justify-center" delay={0.1}>
          <motion.span
            aria-hidden
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="plate-1 flex size-11 items-center justify-center rounded-full"
          >
            <ArrowDown className="size-5 text-sidebar-primary" />
          </motion.span>
        </Reveal>
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
        <Lead className="mt-4 max-w-[520px]">Private, free and open source.</Lead>
        <p className="mx-auto mt-3 max-w-[560px] text-pretty text-[15px] leading-relaxed text-muted-foreground">
          We're committed to the open source community: the code is public, and your ideas and contributions shape what comes next.
        </p>
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
