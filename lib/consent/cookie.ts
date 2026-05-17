/**
 * Cookie-consent state. Persisted in a first-party cookie so we can
 * read it both client-side (banner state, analytics gate) and server-
 * side (future SSR-conditional rendering). Granular by category so
 * adding marketing or personalisation later only means a new boolean.
 */
export type ConsentCategories = {
  necessary: true; // always true; included so the type is exhaustive
  analytics: boolean;
};

export type ConsentRecord = {
  categories: ConsentCategories;
  /** Unix ms when the user made the choice. Used to re-prompt yearly. */
  ts: number;
  /** Schema version; bump if categories change so old records re-prompt. */
  v: 1;
};

export const CONSENT_COOKIE = "bb-cookie-consent";
/** 12 months; CNIL/CNDP guidance caps consent freshness at 13. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function encodeConsent(record: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(record));
}

export function decodeConsent(raw: string | undefined | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "v" in parsed &&
      (parsed as { v: number }).v === 1 &&
      "categories" in parsed
    ) {
      return parsed as ConsentRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export function acceptAll(): ConsentRecord {
  return {
    categories: { necessary: true, analytics: true },
    ts: Date.now(),
    v: 1,
  };
}

export function rejectNonEssential(): ConsentRecord {
  return {
    categories: { necessary: true, analytics: false },
    ts: Date.now(),
    v: 1,
  };
}

export function customConsent(categories: Partial<Omit<ConsentCategories, "necessary">>): ConsentRecord {
  return {
    categories: { necessary: true, analytics: categories.analytics ?? false },
    ts: Date.now(),
    v: 1,
  };
}
