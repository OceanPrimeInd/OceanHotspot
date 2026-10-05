import Link from "next/link";
import { Layout } from "@/components/layout/Layout";

export function DepartmentLanding({
  kicker,
  title,
  intro,
  points,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  kicker: string;
  title: string;
  intro: string;
  points: { title: string; text: string; id?: string }[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Layout>
      <div className="bg-[#eaeded] py-6 md:py-8">
        <div className="page-container">
          <article className="bg-white p-6 shadow-sm md:p-10">
            <p className="text-sm font-semibold text-primary">{kicker}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold text-[#0f1111] md:text-4xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#333]">{intro}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {points.map((point) => (
                <div key={point.title} id={point.id} className="border border-[#e3e6e6] bg-[#f7f8f8] p-4">
                  <h2 className="text-lg font-bold text-[#0f1111]">{point.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[#333]">{point.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center bg-[#f26d2a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c9521a]"
              >
                {primaryLabel}
              </Link>
              {secondaryHref && secondaryLabel && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center border border-[#0c2340] px-5 py-2.5 text-sm font-bold text-[#0c2340] hover:bg-[#f2f6fa]"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
}
