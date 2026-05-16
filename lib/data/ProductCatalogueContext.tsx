"use client";

import { createContext, useContext, useMemo } from "react";

export type ProductCatalogueEntry = { name: string; image: string | null };
export type ProductCatalogue = Map<string, ProductCatalogueEntry>;

const Context = createContext<ProductCatalogue>(new Map());

export function ProductCatalogueProvider({
  catalogue,
  children,
}: {
  catalogue: Array<[string, ProductCatalogueEntry]>;
  children: React.ReactNode;
}) {
  // Map can't cross the server/client boundary directly; serialize as entries array.
  // Memoize so we don't rebuild the Map on every provider re-render.
  const map = useMemo(() => new Map(catalogue), [catalogue]);
  return <Context.Provider value={map}>{children}</Context.Provider>;
}

export function useProductCatalogue() {
  return useContext(Context);
}
