import type { Metadata } from "next";
import { DayView } from "@/components/day/DayView";

export const metadata: Metadata = { title: "Today · Life Harness" };

/** The harness's one page: the plan the morning-check-in skill last saved, and what is still open. Local only, no sign-in. */
export default function DayPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-5 py-10 sm:py-14">
      <DayView />
    </main>
  );
}
