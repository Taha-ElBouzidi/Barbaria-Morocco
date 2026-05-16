import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background photo from the brand assets ships in /public so it
          renders even when Supabase Storage is unavailable. */}
      <Image
        src="/brand_photos/brand-lifestyle-5.jpg"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C1A0E]/70 via-[#2C1A0E]/55 to-[#2C1A0E]/80" />

      <div className="relative z-10 text-center text-[#F7F2EA] px-6 max-w-lg mx-auto">
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 mb-10" aria-hidden="true">
          <div className="w-12 h-px bg-[#C9963A]/60" />
          <div className="w-2 h-2 rounded-full bg-[#C9963A]" />
          <div className="w-12 h-px bg-[#C9963A]/60" />
        </div>

        <p className="text-xs tracking-[0.5em] uppercase text-[#C9963A] mb-4">
          {t("eyebrow")}
        </p>
        <h1 className="font-playfair text-8xl md:text-9xl font-bold mb-4 drop-shadow-lg">
          {t("code")}
        </h1>
        <p className="font-playfair text-xl italic text-[#E8C97A] mb-3">
          {t("title")}
        </p>
        <p className="text-[#F7F2EA]/70 mb-10 leading-relaxed">
          {t("lede")}
        </p>

        <Link
          href="/"
          className="btn-glass-gold inline-block px-10 py-4 min-h-[44px] text-sm tracking-[0.2em] uppercase font-medium rounded-full"
        >
          {t("cta")}
        </Link>

        <div className="flex items-center justify-center gap-4 mt-10" aria-hidden="true">
          <div className="w-12 h-px bg-[#C9963A]/60" />
          <div className="w-2 h-2 rounded-full bg-[#C9963A]" />
          <div className="w-12 h-px bg-[#C9963A]/60" />
        </div>
      </div>
    </div>
  );
}
