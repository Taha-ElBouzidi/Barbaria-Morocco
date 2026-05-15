"use client";

import { useCallback, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MenuDrawer from "./MenuDrawer";
import InquiryDrawer from "./InquiryDrawer";
import type { SiteSettings } from "@/lib/data/site-settings";

export default function ShellChrome({
  locale,
  mainId,
  socials,
  children,
}: {
  locale: string;
  mainId?: string;
  socials: SiteSettings;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openInquiry = useCallback(() => setInquiryOpen(true), []);
  const closeInquiry = useCallback(() => setInquiryOpen(false), []);

  return (
    <>
      <Header
        locale={locale}
        onOpenMenu={openMenu}
        onOpenInquiry={openInquiry}
      />
      <MenuDrawer open={menuOpen} onClose={closeMenu} socials={socials} />
      <InquiryDrawer open={inquiryOpen} onClose={closeInquiry} />
      {/*
       * Top padding (offset for fixed Header) is intentionally NOT applied here.
       * Pages that don't use a full-bleed hero MUST add their own top padding (e.g., pt-32 / pt-24).
       * This lets hero pages (/, /products/[category], /story) render edge-to-edge with the header
       * floating transparently over the top.
       */}
      <main id={mainId}>
        {children}
      </main>
      <Footer socials={socials} />
    </>
  );
}
