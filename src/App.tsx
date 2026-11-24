import { Groove, Nav } from "~/parts/site";
import { AgentSection } from "~/scenes/agent";
import { CategoriesSection } from "~/scenes/categories";
import { AccountsSection, ClosingSection } from "~/scenes/closing";
import { HeroSection } from "~/scenes/hero-section";
import { MinimumSection, RulesSection } from "~/scenes/minimum";
import { ProblemsSection } from "~/scenes/problems";

export function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSection />
        <Groove />
        <ProblemsSection />
        <MinimumSection />
        <CategoriesSection />
        <RulesSection />
        <Groove />
        <AgentSection />
        <Groove />
        <AccountsSection />
        <ClosingSection />
      </main>
    </>
  );
}
