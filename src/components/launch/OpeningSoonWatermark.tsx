import { OPENING_SOON_LABEL } from "@/config/launch";

/** Small badge for listing cards — not used on product detail (full image there). */
export function OpeningSoonWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute left-2 top-2 z-10 ${className}`}
      aria-hidden
    >
      <span className="rounded-md bg-black/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
        {OPENING_SOON_LABEL}
      </span>
    </div>
  );
}
