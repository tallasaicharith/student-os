import type { Metadata } from "next";
import { getOrCreateDevUser } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const userId = await getOrCreateDevUser();
  return <DashboardClient userId={userId} />;
}
