import type { Metadata } from "next";
import { HomeView } from "@/components/pages/HomeView";

export const metadata: Metadata = { title: "JanRx" };

export default function HomePage() {
  return <HomeView />;
}
