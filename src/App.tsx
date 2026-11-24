import { Groove, Nav } from "~/parts/site";
import { AgentSection } from "~/scenes/agent";
import { CategoriesSection } from "~/scenes/categories";
import { AccountsSection, ClosingSection } from "~/scenes/closing";
import { HeroSection } from "~/scenes/hero-section";
import { MinimumSection } from "~/scenes/minimum";
import { ProblemsSection } from "~/scenes/problems";
import { QualitiesSection } from "~/scenes/qualities";

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
        <Groove />
        <QualitiesSection />
        <Groove />
        <AgentSection />
        <Groove />
        <AccountsSection />
        <ClosingSection />
      </main>
    </>
  );
}
