import { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";
interface AccountSection {
  title: string;
  content: ReactNode;
}

interface AccountContentPageProps {
  title: string;
  intro: string;
  sections: AccountSection[];
}

export function AccountContentPage({ title, intro, sections }: AccountContentPageProps) {
  return (
    <Layout>
      <div className="px-6 py-12 md:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/20 p-8 md:p-10 shadow-card">
            <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-o42-blue/10 blur-3xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                Your Account
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-headline mt-3">{title}</h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{intro}</p>
            </div>
          </header>

          <div className="grid gap-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 md:p-7 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-1.5 rounded-full bg-o42-blue/70" />
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                    <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-3">
                      {section.content}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
