/**
 * "Categories that sort themselves": the Categories editor, where Receipts is described in plain words,
 * with an exception of the person's own.
 */
import { useRef } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { FLAT_KEY, FLAT_KEY_IN } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "~/lib/demo";
import { useLoop, useTyping } from "~/lib/motion";
import { GroupTile } from "~/parts/mail";
import { Lead, Reveal, Section, Title } from "~/parts/site";
import { Stage } from "~/parts/stage";

const W = 640;
const H = 690;
const RECEIPTS = CATEGORIES.find((c) => c.id === "receipts")!;

/** What the person writes for Receipts: short, in their own words, with their own exception. */
const RECEIPTS_TEXT =
  "Receipts, invoices, order confirmations and package tracking. AIRLINE TICKETS DON'T BELONG HERE, I want those in my inbox.";

// typing, then saved and held.
const STEPS = [4600, 3400];

export function CategoriesSection() {
  return (
    <Section id="categories">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_640px]">
        <div>
          <Title>Describe categories your way.</Title>
          <Lead className="mt-5">
            Add, rename or remove categories, and write what belongs in each one in plain words, exceptions included. AI files
            your mail by what you wrote.
          </Lead>
        </div>
        <Reveal>
          <Stage width={W} height={H}>
            <EditorScene />
          </Stage>
        </Reveal>
      </div>
    </Section>
  );
}

function EditorScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, STEPS, STEPS.length - 1);
  const typed = useTyping(RECEIPTS_TEXT, step === 0, 38, 400);
  const description = step === 0 ? typed : RECEIPTS_TEXT;
  return (
    <div ref={ref} className="absolute inset-0 flex">
      <Editor description={description} typing={step === 0} saved={step >= 1} />
    </div>
  );
}

function Editor({ description, typing, saved }: { description: string; typing: boolean; saved: boolean }) {
  return (
    <div className="plate-1 corner-squircle flex w-[620px] shrink-0 flex-col rounded-[30px] p-6">
      <h3 className="text-[22px] font-semibold">Categories</h3>
      <div className="mt-5 flex flex-col gap-3">
        {CATEGORIES.slice(0, 3).map((category) => (
          <EditorRow key={category.id} category={category} />
        ))}
        <div className="plate-1 corner-squircle relative rounded-[18px] p-2.5 pb-4">
          <div className="flex items-center gap-2.5">
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />
            <GroupTile category={RECEIPTS} size="editor" />
            <span className="plate-2 corner-squircle flex h-9 flex-1 items-center rounded-[12px] px-3 text-[15px] font-medium">Receipts</span>
            <span className="size-6 shrink-0 rounded-full shadow-raise-3" style={{ background: "hsl(95 70% 55%)" }} />
            <span className="plate-2 corner-squircle flex h-9 items-center rounded-[12px] px-3.5 text-sm font-medium">Done</span>
            <span className={cn("flex size-8 items-center justify-center rounded-[10px]", FLAT_KEY_IN)}>
              <Trash2 className="size-4" />
            </span>
          </div>
          <div className="plate-2 corner-squircle mt-2.5 h-[104px] rounded-[14px] px-3.5 py-3 text-[15px] leading-[1.5]">
            {description}
            {typing && <span className="ml-px inline-block h-[15px] w-[1.5px] translate-y-[3px] animate-pulse bg-foreground" />}
          </div>
        </div>
        {CATEGORIES.slice(4, 6).map((category) => (
          <EditorRow key={category.id} category={category} />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium">
        <span className={cn("flex h-9 items-center gap-1.5 rounded-[11px] px-2.5", FLAT_KEY)}>
          <Plus className="size-4" /> Add category
        </span>
        <span className={cn("flex h-9 items-center rounded-[11px] px-2.5", FLAT_KEY)}>Sort mail again</span>
        <span className="flex-1" />
        <span className="px-2 text-muted-foreground">Revert</span>
        <span
          className={cn(
            "grain corner-squircle flex h-9 items-center rounded-[11px] px-4 transition-all duration-300",
            saved ? "bg-primary text-primary-foreground shadow-pressed" : "bg-primary/80 text-primary-foreground shadow-raise-1",
          )}
        >
          {saved ? "Saved" : "Save"}
        </span>
      </div>
    </div>
  );
}

function EditorRow({ category }: { category: Category }) {
  return (
    <div className="plate-1 corner-squircle flex items-center gap-2.5 rounded-[18px] p-2.5">
      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
      <GroupTile category={category} size="editor" />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium leading-tight">{category.name}</div>
        <div className="mt-0.5 truncate text-[13px] text-muted-foreground">{category.description}</div>
      </div>
      <span className={cn("flex size-8 items-center justify-center rounded-[10px]", FLAT_KEY_IN)}>
        <Pencil className="size-4" />
      </span>
      <span className={cn("flex size-8 items-center justify-center rounded-[10px]", FLAT_KEY_IN)}>
        <Trash2 className="size-4" />
      </span>
    </div>
  );
}
