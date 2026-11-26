import { Groove, MoldedFilter, Nav } from "~/parts/site";
import { AgentSection } from "~/scenes/agent";
import { BloatSection } from "~/scenes/bloat";
import { CategoriesSection } from "~/scenes/categories";
import { AccountsSection, ClosingSection, MissingSection } from "~/scenes/closing";
import { HeroSection } from "~/scenes/hero-section";
import { MinimumSection, RulesSection } from "~/scenes/minimum";
import { ProblemsSection } from "~/scenes/problems";

export function App() {
  return (
    <>
      <MoldedFilter />
      <Nav />
      <main id="top">
        <HeroSection />
        <Groove />
        <ProblemsSection />
        <BloatSection />
        <MinimumSection />
        <CategoriesSection />
        <RulesSection />
        <Groove />
        <AgentSection />
        <Groove />
        <AccountsSection />
        <MissingSection />
        <ClosingSection />
      </main>
    </>
  );
}
