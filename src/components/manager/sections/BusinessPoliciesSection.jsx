import BusinessPoliciesAccordion from "../../policies/BusinessPoliciesAccordion";
import { SectionCard } from "../SectionCard";

export default function BusinessPoliciesSection({ enabled }) {
  if (!enabled) {
    return null;
  }

  return (
    <SectionCard
      title="Chính sách"
    >
      <BusinessPoliciesAccordion />
    </SectionCard>
  );
}
