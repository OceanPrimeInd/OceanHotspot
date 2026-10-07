"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Frame({
  href,
  background,
  title,
  children,
}: {
  href: string;
  background: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-full min-h-[220px] snap-start flex-col overflow-hidden rounded-[14px] p-2.5 shadow-sm transition hover:brightness-[0.98] lg:min-h-0"
      style={{ background }}
    >
      <h2 className="px-1 text-center text-base font-bold leading-none tracking-wide text-white sm:text-lg">{title}</h2>
      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.15rem] border border-[#e6eef6] bg-white">{children}</div>
    </Link>
  );
}

function PhotoTile({
  href,
  background,
  title,
  image,
  alt,
}: {
  href: string;
  background: string;
  title: string;
  image: string;
  alt: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-full min-h-[168px] flex-col overflow-hidden rounded-[12px] p-1.5 shadow-sm transition hover:brightness-[0.98] lg:min-h-0"
      style={{ background }}
    >
      <h2 className="text-center text-[11px] font-bold tracking-wide text-headline sm:text-sm">{title}</h2>
      <p className="text-center text-[10px] font-bold text-[#e06a28] sm:text-xs">Coming Soon</p>
      <div className="mt-1 min-h-0 flex-1 overflow-hidden rounded-[0.9rem] bg-white">
        <img src={image} alt={alt} className="h-full w-full object-cover" />
      </div>
    </Link>
  );
}

function TopRail({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (direction: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#111] shadow-md hover:bg-[#f7f7f7] md:flex [&[hidden]]:!hidden";

  return (
    <div className="relative h-full min-h-[240px]">
      <button type="button" aria-label="Previous" className={`${arrowClass} left-1`} hidden={atStart} onClick={() => page(-1)}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div
        ref={track}
        className="grid h-full grid-flow-col gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory [grid-auto-columns:calc((100%-0.75rem)/2)] [scrollbar-width:none] md:[grid-auto-columns:calc((100%-2.25rem)/4)] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button type="button" aria-label="Next" className={`${arrowClass} right-1`} hidden={atEnd} onClick={() => page(1)}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export function HomeBoxes() {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-3 pt-4 md:px-4" aria-label="Ocean Hotspot">
      <div className="grid grid-cols-1 gap-3 lg:h-[640px] lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex min-h-[420px] flex-col rounded-[14px] bg-[#f25a4a] p-4 text-white shadow-sm lg:min-h-0 lg:p-5">
          <h2 className="text-4xl font-bold leading-none">Hotspot Deals</h2>
          <p className="mt-2 text-xl font-medium text-white/95">Save more today</p>
          <div className="mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.4rem] bg-white p-4">
            <img src="/banner/sailproof.png" alt="SailProof SP88S marine tablet" className="h-[88%] w-auto max-w-[92%] object-contain" />
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[minmax(240px,1.45fr)_minmax(150px,0.9fr)] gap-3">
          <TopRail>
            <Frame href="/browse" background="#2f74c4" title="PRODUCTS">
              <div className="flex h-full flex-col items-center justify-center px-3 py-3">
                <img src="/banner/kohler-logo.png" alt="Kohler" className="h-8 w-auto max-w-[80%] object-contain sm:h-10" />
                <img src="/banner/kohler-generator.png" alt="Kohler marine generator" className="mt-2 max-h-[68%] w-full object-contain" />
              </div>
            </Frame>

            <Frame href="/regulations" background="#4d6278" title="REGULATIONS">
              <div className="relative h-full min-h-[140px]">
                <img src="/banner/regulations.png" alt="Patrol vessel and aircraft at sea" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center p-3">
                  <div className="rounded-xl bg-[#ef7a2a] px-4 py-3 text-center text-white shadow-md">
                    <p className="text-2xl font-black leading-none">CHECK</p>
                    <p className="mt-1 text-xl font-black leading-none">TODAY</p>
                  </div>
                </div>
              </div>
            </Frame>

            <Frame href="/services" background="#1c8f9c" title="SERVICES">
              <div className="flex h-full flex-col items-center justify-center px-3 py-3 text-center">
                <p className="text-sm font-bold text-[#e06a28] sm:text-base">Coming Soon</p>
                <p className="mt-3 text-xl font-black leading-tight text-[#111] sm:text-2xl">
                  Naval Architects
                  <br />
                  Marine Engineers
                  <br />
                  Technicians
                  <br />
                  Designers
                  <br />
                  Yacht Managers
                </p>
              </div>
            </Frame>

            <Frame href="/training" background="#3a78c0" title="TRAINING">
              <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                <p className="text-sm font-bold text-[#e06a28] sm:text-base">Coming Soon</p>
                <p className="mt-3 text-2xl font-black leading-tight text-[#111] sm:text-3xl">Get Training</p>
              </div>
            </Frame>

            <Frame href="/fuel" background="#1f8a52" title="FUEL">
              <div className="flex h-full flex-col items-center justify-center bg-[#28a864] px-3 text-center text-white">
                <p className="text-2xl font-black leading-tight sm:text-3xl">Low Prices</p>
                <p className="mt-3 text-2xl font-black leading-tight sm:text-3xl">Low Emissions</p>
              </div>
            </Frame>

            <Frame href="/ports" background="#217eae" title="PORTS">
              <div className="relative h-full min-h-[140px]">
                <img src="/banner/berths.png" alt="Marina berth map" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </Frame>

            <Frame href="/organisations" background="#e07030" title="ORGANISATIONS">
              <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                <p className="text-sm font-bold text-[#e06a28] sm:text-base">Coming Soon</p>
                <p className="mt-3 text-xl font-black leading-tight text-[#111] sm:text-2xl">Find Clubs and Organisations</p>
              </div>
            </Frame>
          </TopRail>

          <div className="grid min-h-0 grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
            <PhotoTile href="/organisations#clubs" background="#f0b27a" title="CLUBS" image="/banner/clubs.png" alt="Marina and yacht club" />
            <PhotoTile href="/organisations#charities" background="#b7dcc8" title="CHARITIES" image="/banner/charities.png" alt="Hands supporting a charity globe" />
            <PhotoTile href="/ports" background="#b7d0ea" title="BERTHS" image="/banner/berths.png" alt="Marina berth map" />
            <PhotoTile href="/organisations#events" background="#c5cce6" title="EVENTS" image="/banner/events.png" alt="People at a yacht event" />
            <PhotoTile href="/organisations#racing" background="#f0b8a8" title="RACING" image="/banner/racing.png" alt="Racing powerboat" />
          </div>
        </div>
      </div>
    </section>
  );
}
