import Link from "next/link";

export default function HomeButton({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Ir al inicio"
      title="Ir al inicio"
      className="inline-flex items-center justify-center rounded-full border border-gold-500/40 p-2 text-gold-300 transition hover:bg-gold-500/10"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
    </Link>
  );
}
