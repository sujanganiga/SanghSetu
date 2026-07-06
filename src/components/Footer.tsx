import { HIERARCHY_PATH, LABELS } from "@/lib/labels";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-orange-200/60 bg-white/50 py-5 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <p className="text-sm text-stone-500">
          <span className="font-semibold text-orange-700">SanghSetu</span>
          {" · "}Kundapura {LABELS.taluku} Member Directory
        </p>
        <p className="text-xs text-stone-400">{HIERARCHY_PATH}</p>
      </div>
    </footer>
  );
}
