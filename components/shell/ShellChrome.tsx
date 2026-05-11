"use client";

import { useState } from "react";
import Header from "./Header";

export default function ShellChrome({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // MenuDrawer + InquiryDrawer mount in Task 5. For now, the open setters are no-ops in terms
  // of UI — they just toggle state. The drawers themselves come in the next task.
  void menuOpen;
  void inquiryOpen;

  return (
    <>
      <Header
        locale={locale}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenInquiry={() => setInquiryOpen(true)}
      />
      <main className="pt-[72px]">{children}</main>
    </>
  );
}
