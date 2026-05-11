"use client";

import { FaWhatsapp } from "react-icons/fa";
import { WHATSAPP_NUMBER } from "./Navbar";
import { useInquiry } from "@/lib/inquiry-context";
import { usePathname } from "@/i18n/navigation";

export default function WhatsAppFloat() {
  const { totalItems } = useInquiry();
  const pathname = usePathname();

  const isOrderPage = pathname === "/order";
  const lifted = totalItems > 0 && !isOrderPage;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
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
