import type { Metadata } from "next";
import { GatedStep } from "@/components/pages/GatedStep";

export const metadata: Metadata = { title: "Prices" };

export default function ResultsPage() {
  return <GatedStep titleKey="step.results" />;
}
