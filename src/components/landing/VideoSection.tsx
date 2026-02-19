import { Play } from "lucide-react";

export function VideoSection() {
  return (
    <section className="mb-12">
      <div className="max-w-[600px] mx-auto">
        <div className="relative aspect-video bg-gradient-to-br from-near-black to-dark-grey rounded-xl overflow-hidden shadow-xl cursor-pointer group">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
            <div className="w-20 h-20 bg-o42-orange rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </div>
            <span className="text-sm text-mid-grey">What we do — 60 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
