"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  type ConsentRecord,
  acceptAll,
  decodeConsent,
  encodeConsent,
  rejectNonEssential,
  customConsent,
} from "@/lib/consent/cookie";

interface ConsentContextValue {
  /** null until hydration; null again if the user has never chosen. */
  consent: ConsentRecord | null;
  /** True when the banner should be visible (first visit or "Manage cookies" click). */
  bannerOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustom: (analytics: boolean) => void;
  openBanner: () => void;
  closeBanner: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure}`;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = decodeConsent(readCookie(CONSENT_COOKIE));
    setConsent(stored);
    // Banner shows when no decision has been recorded yet. Once hydrated,
    // the banner stays closed unless reopened from the footer.
    if (!stored) setBannerOpen(true);
    setHydrated(true);
  }, []);

  const persist = useCallback((record: ConsentRecord) => {
    writeCookie(CONSENT_COOKIE, encodeConsent(record), CONSENT_MAX_AGE_SECONDS);
    setConsent(record);
    setBannerOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent: hydrated ? consent : null,
      bannerOpen: hydrated && bannerOpen,
      acceptAll: () => persist(acceptAll()),
      rejectNonEssential: () => persist(rejectNonEssential()),
      saveCustom: (analytics) => persist(customConsent({ analytics })),
      openBanner: () => setBannerOpen(true),
      closeBanner: () => setBannerOpen(false),
    }),
    [consent, bannerOpen, hydrated, persist]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used inside <ConsentProvider />");
  }
  return ctx;
}
