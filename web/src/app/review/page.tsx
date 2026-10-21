import type { Metadata } from "next";
import { GatedStep } from "@/components/pages/GatedStep";

export const metadata: Metadata = { title: "Check names" };

export default function ReviewPage() {
  return <GatedStep titleKey="step.review" />;
}
