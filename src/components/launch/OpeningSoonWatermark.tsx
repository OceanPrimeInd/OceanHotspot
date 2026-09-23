import { OPENING_SOON_LABEL } from "@/config/launch";

export function OpeningSoonWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/25 ${className}`}
      aria-hidden
    >
      <span className="rotate-[-12deg] rounded-md border-2 border-white/90 bg-black/50 px-4 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-lg">
        {OPENING_SOON_LABEL}
      </span>
    </div>
  );
}
