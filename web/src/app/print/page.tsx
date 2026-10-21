import type { Metadata } from "next";
import { GatedStep } from "@/components/pages/GatedStep";

export const metadata: Metadata = { title: "Print" };

export default function PrintPage() {
  return <GatedStep titleKey="step.print" showPrivacy />;
}
