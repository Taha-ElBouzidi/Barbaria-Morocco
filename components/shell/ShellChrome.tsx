"use client";

import { useCallback, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MenuDrawer from "./MenuDrawer";
import InquiryDrawer from "./InquiryDrawer";

export default function ShellChrome({
  locale,
  mainId,
  children,
}: {
  locale: string;
  mainId?: string;
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
      <MenuDrawer open={menuOpen} onClose={closeMenu} />
      <InquiryDrawer open={inquiryOpen} onClose={closeInquiry} />
      <main id={mainId} className="pt-[72px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
