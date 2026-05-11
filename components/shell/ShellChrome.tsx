"use client";

import { useState } from "react";
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

  return (
    <>
      <Header
        locale={locale}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenInquiry={() => setInquiryOpen(true)}
      />
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <InquiryDrawer open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
      <main id={mainId} className="pt-[72px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
