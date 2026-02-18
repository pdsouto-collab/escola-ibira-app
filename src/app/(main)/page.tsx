"use client";

import { DashboardHero } from "@/components/dashboard/hero";
import { DailyHighlights } from "@/components/dashboard/daily-highlights";
import { WeeklyView } from "@/components/dashboard/weekly-view";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <DashboardHero />
      <DailyHighlights />
      <WeeklyView />
    </div>
  );
}
