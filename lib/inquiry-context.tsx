"use client";

import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

/**
 * Sprint 2.6 — Inquiry is BOX-level, not product-level.
 *
 * Each line represents either:
 *   - a curated gift box (just a giftBoxSlug + qty), OR
 *   - a custom box composed via the wizard (categorySlug + ordered productSlugs + qty)
 *
 * Lines are identified by an opaque `id` so a buyer can have multiple
 * distinct custom-box compositions in the same inquiry. Persisted to
 * localStorage under `bb.inquiry.v2` (the v1 product-keyed Map is dropped
 * — products are no longer sold individually).
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
      // One-shot clear of the legacy product-keyed cart — v1 was product-level,
      // v2 is box-level. We don't migrate because the semantics differ.
      if (localStorage.getItem(LEGACY_KEY)) {
        localStorage.removeItem(LEGACY_KEY);
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InquiryState;
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", state: parsed });
      }
    } catch {
      // localStorage unavailable; proceed empty
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
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
