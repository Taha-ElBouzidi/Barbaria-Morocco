"use client";

import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

/**
 * Sprint 2.6 , Inquiry is BOX-level, not product-level.
 *
 * Each line represents either:
 *   - a curated gift box (just a giftBoxSlug + qty), OR
 *   - a custom box composed via the wizard (categorySlug + ordered productSlugs + qty)
 *
 * Lines are identified by an opaque `id` so a buyer can have multiple
 * distinct custom-box compositions in the same inquiry.
 *
 * Sprint 2.8 follow-up: persisted to sessionStorage (was localStorage).
 * Tab close + reopen now gives a fresh inquiry instead of resurrecting
 * stale items from days ago. Refresh + tab change still preserve the
 * current selection, as expected mid-session.
 */

export interface CustomBoxComposition {
  categorySlug: "cosmetiques" | "epicerie_fine";
  /** Component product slugs, ordered as the wizard placed them. */
  productSlugs: string[];
}

export interface InquiryLine {
  id: string;              // local-only id (uuid-like) so qty edits/removes work
  giftBoxSlug: string;     // for curated boxes; for custom, the slug of the parent compose-box (e.g. 'compose-cosmetiques')
  qty: number;
  custom?: CustomBoxComposition;
  /** Snapshot of the box name at add time; lets the sidebar render before the catalogue map loads. */
  nameSnapshot?: string;
  /** Admin-defined minimum quantity for this box; UI prevents qty from dropping below. */
  minQty: number;
}

export type InquiryState = InquiryLine[];

type Action =
  | { type: "addLine"; line: InquiryLine }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; state: InquiryState };

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function reducer(state: InquiryState, action: Action): InquiryState {
  switch (action.type) {
    case "addLine":
      return [...state, action.line];
    case "setQty":
      return state.map((l) =>
        l.id === action.id ? { ...l, qty: Math.max(l.minQty, action.qty) } : l
      );
    case "remove":
      return state.filter((l) => l.id !== action.id);
    case "clear":
      return [];
    case "hydrate":
      return action.state;
  }
}

const STORAGE_KEY = "bb.inquiry.v2";
const LEGACY_KEY = "bb.inquiry";
// Sprint 2.8 , explicit per-tab persistence. sessionStorage clears on tab
// close (matches "fresh state when I come back tomorrow") but survives a
// page refresh or a tab switch (so mid-flow buyers don't lose work).

interface InquiryContextValue {
  lines: InquiryState;
  addBox: (input: {
    giftBoxSlug: string;
    minQty: number;
    initialQty?: number;
    nameSnapshot?: string;
    custom?: CustomBoxComposition;
  }) => string;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  totalBoxes: number;
  totalUnits: number;
}

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    try {
      // One-shot cleanup of legacy storage from previous schema versions.
      // The Sprint 2.6 v1 product-keyed cart lived in localStorage; the
      // Sprint 2.6 v2 box-level shape also lived in localStorage until 2.8.
      // Anything still in localStorage is stale and should be dropped.
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem(STORAGE_KEY);

      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InquiryState;
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", state: parsed });
      }
    } catch {
      // storage unavailable; proceed empty
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines]);

  const addBox = useCallback<InquiryContextValue["addBox"]>(({ giftBoxSlug, minQty, initialQty, nameSnapshot, custom }) => {
    const id = genId();
    const qty = Math.max(minQty, initialQty ?? minQty);
    dispatch({
      type: "addLine",
      line: { id, giftBoxSlug, qty, minQty, nameSnapshot, custom },
    });
    return id;
  }, []);

  const setQty = useCallback((id: string, qty: number) => dispatch({ type: "setQty", id, qty }), []);
  const remove = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const totalBoxes = lines.length;
  const totalUnits = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <InquiryContext.Provider
      value={{ lines, addBox, setQty, remove, clear, totalBoxes, totalUnits }}
    >
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside InquiryProvider");
  return ctx;
}
