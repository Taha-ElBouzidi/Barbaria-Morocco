"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useInquiry } from "@/lib/inquiry-context";

interface WhatsAppFloatProps {
  /** Full WhatsApp URL from site_settings (e.g., `https://wa.me/212659658863`). */
  href: string;
}

/**
 * Floating WhatsApp call-to-action shown on every public page.
 * Receives the URL from the locale layout so it tracks the admin's
 * site-settings change (no redeploy needed when the WhatsApp number
 * is edited via /admin/settings).
 */
export default function WhatsAppFloat({ href }: WhatsAppFloatProps) {
  const { totalBoxes } = useInquiry();
  const lifted = totalBoxes > 0;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className={`fixed right-5 sm:right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ${
        lifted ? "bottom-[4.5rem] md:bottom-6" : "bottom-6"
      }`}
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
