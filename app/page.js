import HomeMain from "./home/HomeMain";
import OperationalPathways from "./home/OperationalPathways";
import PhilosophySection from "./home/PhilosophySection";
import FieldArchitecture from "./home/FieldArchitecture";
import SectorProfiles from "./home/SectorProfiles";
import WorkflowMechanics from "./home/WorkflowMechanics";
import FieldNotes from "./home/FieldNotes";
import DeploymentReady from "./home/DeploymentReady";
import SectionReveal from "./home/SectionReveal";

export default function Home() {
  return (
    <main id="main">
      <SectionReveal><HomeMain /></SectionReveal>
      <SectionReveal delay={50}><PhilosophySection /></SectionReveal>
      <SectionReveal delay={100}><OperationalPathways /></SectionReveal>
      <SectionReveal delay={50}><FieldArchitecture /></SectionReveal>
      <SectionReveal delay={100}><SectorProfiles /></SectionReveal>
      <SectionReveal delay={50}><WorkflowMechanics /></SectionReveal>
      <SectionReveal delay={100}><FieldNotes /></SectionReveal>
      <SectionReveal delay={50}><DeploymentReady /></SectionReveal>
    </main>
  );
}
