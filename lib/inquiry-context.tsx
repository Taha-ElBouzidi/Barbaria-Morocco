"use client";

import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export type InquiryState = Map<string, number>;

type InquiryAction =
  | { type: "toggle"; key: string }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "hydrate"; state: InquiryState };

function inquiryReducer(state: InquiryState, action: InquiryAction): InquiryState {
  const next = new Map(state);
  switch (action.type) {
    case "toggle":
      if (next.has(action.key)) {
        next.delete(action.key);
      } else {
        next.set(action.key, 1);
      }
      return next;
    case "setQty":
      if (action.qty >= 1) next.set(action.key, action.qty);
      return next;
    case "remove":
      next.delete(action.key);
      return next;
    case "clear":
      return new Map();
    case "hydrate":
      return new Map(action.state);
  }
}

const STORAGE_KEY = "bb.inquiry";

function serializeCart(cart: InquiryState): string {
  return JSON.stringify([...cart]);
}

function deserializeCart(raw: string): InquiryState {
  try {
    const entries = JSON.parse(raw) as [string, number][];
    return new Map(entries);
  } catch {
    return new Map();
  }
}

interface InquiryContextValue {
  // TODO(task-12): rename `cart` property to `items` when retired routes are gone
  cart: InquiryState;
  toggle: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  totalItems: number;
}

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(inquiryReducer, new Map<string, number>());

  // Hydrate from localStorage on mount, with one-shot migration from the legacy key
  useEffect(() => {
    try {
      const legacy = localStorage.getItem("barbaria-cart");
      if (legacy && !localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem("barbaria-cart");
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", state: deserializeCart(raw) });
    } catch {
      // localStorage unavailable (private mode etc.) — proceed with empty state
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serializeCart(cart));
  }, [cart]);

  const toggle = useCallback((key: string) => dispatch({ type: "toggle", key }), []);
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "setQty", key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const totalItems = [...cart.values()].reduce((sum, qty) => sum + qty, 0);

  return (
    <InquiryContext.Provider value={{ cart, toggle, setQty, remove, clear, totalItems }}>
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiry(): InquiryContextValue {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used inside InquiryProvider");
  return ctx;
}

// Temporary alias — removed in Task 12 after retired routes are deleted.
export const useCart = useInquiry;
