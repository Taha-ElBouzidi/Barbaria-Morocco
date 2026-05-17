"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useConsent } from "./ConsentContext";

/**
 * Gates Vercel Analytics + Speed Insights on the user's analytics
 * consent. Before consent is granted, nothing is mounted, no beacons
 * fire. Toggling consent at runtime mounts/unmounts these components.
 */
export default function AnalyticsGate() {
  const { consent } = useConsent();
  if (!consent?.categories.analytics) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
