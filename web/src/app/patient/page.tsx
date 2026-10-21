import type { Metadata } from "next";
import { GatedStep } from "@/components/pages/GatedStep";

export const metadata: Metadata = { title: "Person" };

export default function PatientPage() {
  return <GatedStep titleKey="step.patient" />;
}
