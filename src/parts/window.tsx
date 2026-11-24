/** The app's window and its fixed parts: the rail on the left and the list header (see rail.tsx, list-header.tsx). */
import type { ReactNode } from "react";
import {
  Archive,
  ChartColumn,
  CheckCheck,
  ChevronDown,
  Inbox,
  Mail,
  MailOpen,
  NotebookPen,
  RefreshCw,
  ScrollText,
  Search,
  Send,
  Settings,
  ShieldAlert,
  SquarePen,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { FLAT_KEY } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { AccountMark } from "~/parts/mail";

/** A macOS window of plastic: one panel with the traffic lights in its corner. */
export function AppWindow({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("plastic corner-squircle relative overflow-hidden rounded-[22px] text-foreground", className)}
      style={{
        boxShadow:
          "var(--raise-1), 0 30px 60px -12px rgb(var(--shade-rgb) / 0.28), 0 18px 36px -18px rgb(var(--shade-rgb) / 0.3)",
        ...style,
      }}
    >
      <TrafficLights />
      {children}
    </div>
  );
}

export function TrafficLights({ className }: { className?: string }) {
  return (
    <div className={cn("absolute left-[18px] top-[17px] z-10 flex gap-2", className)}>
      {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
        <span key={color} className="size-3 rounded-full" style={{ background: color, boxShadow: "inset 0 0 0 0.5px rgb(0 0 0 / 0.12)" }} />
      ))}
    </div>
  );
}

function RailKey({ icon: Icon, active }: { icon: LucideIcon; active?: boolean }) {
  return (
    <span
      className={cn(
        "relative flex size-9 items-center justify-center rounded-full",
        FLAT_KEY,
        active && "grain bg-sidebar-primary text-sidebar-primary-foreground shadow-raise-1 hover:bg-sidebar-primary",
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

/** The column of folder keys down the left of the window. */
export function Rail({ active = "inbox", logBadge }: { active?: "inbox" | "drafts" | "sent"; logBadge?: ReactNode }) {
  return (
    <div className="flex shrink-0 pb-3 pl-3 pr-3 pt-12">
      <nav className="flex w-[48px] flex-col items-center py-3">
        <div className="flex flex-col items-center gap-1.5">
          <RailKey icon={ChartColumn} />
          <span aria-hidden className="groove-h my-1.5 w-6" />
          <RailKey icon={Mail} active={active === "inbox"} />
          <RailKey icon={NotebookPen} active={active === "drafts"} />
          <RailKey icon={Send} active={active === "sent"} />
        </div>
        <div className="mt-auto flex flex-col items-center gap-3">
          <span className="relative">
            <RailKey icon={ScrollText} />
            {logBadge}
          </span>
          <RailKey icon={Settings} />
        </div>
      </nav>
    </div>
  );
}

export const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
  { id: "spam", label: "Spam", icon: ShieldAlert },
] as const;

export type FolderId = (typeof FOLDERS)[number]["id"];

/** The folder keys are raised while their folder is shown, lightly tinted in its color (raisedActive in folder-style.ts). */
export const FOLDER_ACTIVE: Record<FolderId, string> = {
  inbox:
    "grain shadow-raise-2 bg-[hsl(218.8_61.5%_52.2%/0.15)] text-[hsl(218.8_61.5%_52.2%)] dark:bg-[hsl(219_82.2%_71.4%/0.15)] dark:text-[hsl(219_82.2%_71.4%)]",
  archive: "grain shadow-raise-2 bg-foreground/10 text-foreground",
  trash: "grain shadow-raise-2 bg-destructive/15 text-destructive",
  spam: "grain shadow-raise-2 bg-amber/15 text-amber",
};

export function FolderKeys({ on = ["inbox"] }: { on?: FolderId[] }) {
  return (
    <div data-note="folders" className="corner-squircle flex items-center gap-1 rounded-[14px] p-1 shadow-raise-1">
      {FOLDERS.map(({ id, icon: Icon }) => (
        <span
          key={id}
          className={cn("flex size-8 items-center justify-center rounded-[10px] transition-all duration-300", on.includes(id) ? FOLDER_ACTIVE[id] : "text-foreground")}
        >
          <Icon className="size-[18px]" />
        </span>
      ))}
    </div>
  );
}

function ViewTabs({ active = "Smart" }: { active?: string }) {
  return (
    <div data-note="views" className="corner-squircle inline-flex h-10 items-center justify-center gap-1 rounded-[15px] p-[5px] text-muted-foreground shadow-raise-1">
      {["Smart", "Sender", "List"].map((tab) => (
        <span
          key={tab}
          className={cn(
            "corner-squircle inline-flex items-center justify-center whitespace-nowrap rounded-[10px] px-3 py-1.5 text-sm font-medium",
            tab === active && "plate-2 text-foreground",
          )}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

function IconKey({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className={cn("flex size-9 items-center justify-center rounded-[12px]", FLAT_KEY)}>
      <Icon className="size-[18px]" />
    </span>
  );
}

export function ComposeKey() {
  return (
    <span className="grain ml-1 flex size-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-raise-1">
      <SquarePen className="size-[18px]" />
    </span>
  );
}

/** The bar above the list: title, accounts, views, folder keys, search and compose. */
export function ListHeader({ title = "All Mail", folders, compact = false }: { title?: string; folders?: FolderId[]; compact?: boolean }) {
  return (
    <div className="flex h-[60px] shrink-0 items-center gap-3 pr-5 pt-3">
      <h2 className="pl-1 text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
      {!compact && (
        <>
          <span data-note="accounts" className="corner-squircle ml-2 flex h-9 items-center gap-2 rounded-full pl-1.5 pr-3 shadow-raise-1">
            <span className="flex -space-x-1.5">
              {(["gmail", "uni", "outlook"] as const).map((account) => (
                <span key={account} className="plate-3 flex size-6 items-center justify-center rounded-full">
                  <AccountMark account={account} size={14} />
                </span>
              ))}
            </span>
            <span className="text-sm font-medium">All accounts</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </span>
          <IconKey icon={RefreshCw} />
          <ViewTabs />
        </>
      )}
      <span className="flex-1" />
      {!compact && <IconKey icon={CheckCheck} />}
      {!compact && <IconKey icon={MailOpen} />}
      <FolderKeys on={folders} />
      <IconKey icon={Search} />
      <ComposeKey />
    </div>
  );
}
