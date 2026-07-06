"use client";

interface FolderItem {
  id: string;
  name: string;
  icon: string;
  count: number;
  countLabel: string;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface FolderGridProps {
  title: string;
  subtitle?: string;
  items: FolderItem[];
}

export default function FolderGrid({ title, subtitle, items }: FolderGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-12 text-center">
        <p className="text-4xl">📭</p>
        <p className="mt-3 font-semibold text-stone-700">Nothing here yet</p>
        <p className="mt-1 text-sm text-stone-400">Admin can add content from admin panel</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
          >
            <button
              onClick={item.onClick}
              className="flex min-w-0 flex-1 items-center gap-4 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xl">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-stone-800 group-hover:text-orange-800">
                  {item.name}
                </p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {item.count} {item.countLabel}
                </p>
              </div>
              <span className="text-orange-400 transition group-hover:translate-x-0.5 group-hover:text-orange-600">
                →
              </span>
            </button>
            {(item.onEdit || item.onDelete) && (
              <div className="flex shrink-0 flex-col gap-1">
                {item.onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onEdit!();
                    }}
                    className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-100"
                    title="Edit"
                  >
                    ✎
                  </button>
                )}
                {item.onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onDelete!();
                    }}
                    className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
