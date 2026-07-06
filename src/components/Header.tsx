import Link from "next/link";
import { LABELS } from "@/lib/labels";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-orange-900/20">
      <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-orange-700">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/25 transition group-hover:bg-white/25">
              स
            </div>
            <div>
              <span className="block text-lg font-bold tracking-wide text-white">
                SanghSetu
              </span>
              <span className="block text-xs font-medium text-orange-200">
                Kundapura {LABELS.taluku}
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-orange-100 transition hover:bg-white/10 hover:text-white"
            >
              Directory
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400" />
    </header>
  );
}
