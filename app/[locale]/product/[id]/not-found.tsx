import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[600px] py-32 text-center">
      <p className="font-serif text-3xl mb-4">Product not found</p>
      <Link href="/" className="text-bb-secondary underline">Return home</Link>
    </div>
  );
}
