"use client";

import { createContext, useContext } from "react";

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
  const map = new Map(catalogue);
  return <Context.Provider value={map}>{children}</Context.Provider>;
}

export function useProductCatalogue() {
  return useContext(Context);
}
