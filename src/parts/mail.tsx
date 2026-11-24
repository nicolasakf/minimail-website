/**
 * The app's mail parts, drawn with the app's own classes (see MiniMail's thread-row.tsx, group-row.tsx,
 * code-chip.tsx and sender-avatar.tsx). They show data only: no app state behind them.
 */
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { Bell, CalendarPlus, KeyRound, Megaphone, Newspaper, Paperclip, Receipt, Zap, type LucideIcon } from "lucide-react";

import gmailLogo from "@/assets/providers/gmail.svg";
import outlookLogo from "@/assets/providers/outlook.svg";
import zohoLogo from "@/assets/providers/zoho.png";
import { FLAT_KEY_IN } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import type { AccountId, Category, CategoryIconName, Chip, Row, Sender } from "~/lib/demo";

const RING_HUES = [275, 355, 130, 215, 32, 330, 175, 55];
export function senderHue(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return RING_HUES[hash % RING_HUES.length];
}

function initials(name: string): string {
  const words = name.split(/[\s._-]+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** A sender's squircle: a company's letter on its color, or a person's initials on the plastic tinted with their hue. */
export function Avatar({ sender, size = 26, className }: { sender: Sender; size?: number; className?: string }) {
  const shape: CSSProperties = { width: size, height: size, borderRadius: Math.round(size * 0.3), boxShadow: "var(--raise-3)" };
  if (sender.brand) {
    return (
      <span
        className={cn("corner-squircle inline-flex shrink-0 items-center justify-center font-bold text-white", className)}
        style={{ ...shape, background: sender.brand, fontSize: Math.max(9, Math.round(size * 0.5)) }}
      >
        {sender.name[0]}
      </span>
    );
  }
  const hue = senderHue(sender.email);
  return (
    <span
      className={cn("corner-squircle inline-flex shrink-0 items-center justify-center font-semibold", className)}
      style={{
        ...shape,
        background: `hsl(${hue} var(--tile-s) var(--tile-l))`,
        color: `hsl(${hue} 45% var(--tile-ink))`,
        fontSize: Math.max(9, Math.round(size * 0.38)),
      }}
    >
      {initials(sender.name)}
    </span>
  );
}

export const CATEGORY_ICONS: Record<CategoryIconName, LucideIcon> = {
  CalendarPlus,
  Bell,
  KeyRound,
  Receipt,
  Newspaper,
  Megaphone,
  Zap,
};

/** The round colored tile with a category's icon. */
export function GroupTile({ category, size = "card" }: { category: Pick<Category, "hue" | "icon">; size?: "card" | "row" | "small" | "editor" }) {
  const Icon = CATEGORY_ICONS[category.icon];
  const box = { card: "size-8", row: "size-9", small: "size-6", editor: "size-10 rounded-[12px]" }[size];
  const icon = { card: "size-4", row: "size-[18px]", small: "size-3.5", editor: "size-5" }[size];
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-full", box)}
      style={{ background: `hsl(${category.hue} 70% 55% / 0.16)`, color: `hsl(${category.hue} 70% 62%)` }}
    >
      <Icon className={icon} />
    </span>
  );
}

/** The key-shaped chip that copies a verification code. */
export function CodeChip({ code, compact = false, className }: { code: string; compact?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "corner-squircle plate-3 flex h-6 shrink-0 items-center gap-1 rounded-full font-mono text-[12px] font-semibold tabular-nums text-foreground [&_svg]:text-amber",
        compact ? "w-6 justify-center" : "px-1.5",
        className,
      )}
    >
      <KeyRound className={compact ? "size-3.5" : "size-3"} />
      {!compact && code}
    </span>
  );
}

const ACCOUNT_LOGOS: Record<AccountId, string | null> = { gmail: gmailLogo, outlook: outlookLogo, uni: null };

/** The small mark of the account a conversation came to. */
export function AccountMark({ account, size = 16 }: { account: AccountId | "zoho"; size?: number }) {
  const logo = account === "zoho" ? zohoLogo : ACCOUNT_LOGOS[account];
  if (logo) return <img src={logo} alt="" className="shrink-0 object-contain" style={{ width: size, height: size }} />;
  return (
    <span
      className="corner-squircle inline-flex shrink-0 items-center justify-center font-bold text-white"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), background: "#2f9e57", fontSize: Math.round(size * 0.62) }}
    >
      U
    </span>
  );
}

/** The left slot of a row: a blue dot while unread. */
export function ReadDot({ unread }: { unread?: boolean }) {
  return (
    <span className="-mx-1 flex size-6 shrink-0 items-center justify-center">
      <span className={cn("size-2 rounded-full", unread ? "bg-unread" : "")} />
    </span>
  );
}

/** One conversation in the list (the app's single-line row). */
export const ThreadRow = forwardRef<
  HTMLDivElement,
  { row: Row; selected?: boolean; hovered?: boolean; className?: string; nameWidth?: number; showAccount?: boolean; trailing?: ReactNode }
>(function ThreadRow({ row, selected, hovered, className, nameWidth = 200, showAccount = true, trailing }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "corner-squircle relative mx-2 flex h-10 select-none items-center gap-2.5 rounded-xl px-3 text-[13px] transition-shadow",
        selected ? "grain sel-tint shadow-raise-1 ring-1 ring-inset ring-sidebar-primary/60" : hovered ? "plate-1" : "",
        className,
      )}
    >
      <ReadDot unread={row.unread} />
      <Avatar sender={row.from} size={26} />
      <span className="flex shrink-0 items-center gap-1.5" style={{ width: nameWidth }}>
        <span className={cn("truncate", row.unread ? "font-semibold" : "font-medium")}>{row.label ?? row.from.name}</span>
        {row.priority && <Zap className="size-3.5 shrink-0 fill-amber text-amber" />}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className={cn("shrink truncate", row.unread ? "font-semibold" : "font-medium")}>{row.subject}</span>
        {row.count && row.count > 1 && (
          <span className="plate-3 shrink-0 rounded-[7px] px-1.5 text-[11px] font-medium leading-4 text-muted-foreground">{row.count}</span>
        )}
        {row.attachment && <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="min-w-0 flex-1 truncate text-muted-foreground">{row.snippet}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {showAccount && <AccountMark account={row.account} />}
        <span className="w-10 shrink-0 whitespace-nowrap text-right text-[11px] font-semibold text-muted-foreground">{row.time}</span>
      </div>
    </div>
  );
});

/** One sender line on a category card. */
export const ChipLine = forwardRef<HTMLDivElement, { chip: Chip; style?: CSSProperties; className?: string }>(function ChipLine(
  { chip, style, className },
  ref,
) {
  return (
    <div ref={ref} className={cn("flex items-center gap-1", className)} style={style}>
      <span className={cn("flex h-7 min-w-0 flex-1 items-center gap-2 rounded-[10px] px-1.5 text-left", FLAT_KEY_IN)}>
        <Avatar sender={chip.from} size={18} />
        <span className="min-w-0 flex-1 truncate">{chip.from.name}</span>
        {chip.unread && <span className="size-1.5 shrink-0 rounded-full bg-unread" />}
      </span>
      {chip.code && <CodeChip code={chip.code} />}
    </div>
  );
});

/** A category card's head: icon, name and "count · unread". */
export function CardHead({ category, count, unread, bump }: { category: Category; count?: number; unread?: number; bump?: ReactNode }) {
  const c = count ?? category.count;
  const u = unread ?? category.unread;
  return (
    <div className="flex items-center gap-2.5 py-2.5 pl-3 pr-3">
      <GroupTile category={category} />
      <div className="min-w-0">
        <div className="truncate font-semibold leading-tight">{category.name}</div>
        <div className="mt-px text-[11px] tabular-nums text-muted-foreground">
          {c}
          {u > 0 && (
            <>
              {" · "}
              <span className="text-unread">{u}</span>
            </>
          )}
          {bump}
        </div>
      </div>
    </div>
  );
}

/** The plate a category card sits on. */
export function CardPlate({ children, className, lifted }: { children: ReactNode; className?: string; lifted?: boolean }) {
  return (
    <div
      className={cn(
        "corner-squircle relative flex min-w-0 flex-col rounded-2xl pb-1.5 text-sm transition-[box-shadow,background-color] duration-300",
        lifted ? "grain bg-sidebar-primary/[0.12] shadow-raise-1" : "shadow-raise-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A group heading in the list ("Yesterday ⌄"). */
export function ListGroupHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-8 items-center gap-1 px-6 pt-1 text-[13px] font-medium text-muted-foreground">
      {children}
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
