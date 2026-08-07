import { SERVICES_META, SECTION_TITLES } from "@/data/landing";
import Section from "@/components/shared/Section";
import SectionHeading from "@/components/shared/SectionHeading";
import ServiceCard from "./ServiceCard";

export default function Services() {
  return (
    <Section id="services">
      <SectionHeading vi={SECTION_TITLES.services.vi} en={SECTION_TITLES.services.en} mark="blue" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {SERVICES_META.map((m) => (
          <ServiceCard key={m.slug} meta={m} />
        ))}
      </div>
    </Section>
  );
}
