"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="text-center mb-12">
      <h1 className="font-heading text-4xl md:text-[2.5rem] font-bold text-o42-headline mb-6 tracking-tight">
        For people who know.
      </h1>
      <br/><br/>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="o42Primary" size="lg" asChild className="gap-2">
          <Link href="/discover">
            <Sparkles className="h-5 w-5" />
            AI Discovery Assistant
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="gap-2">
          <Link href="/browse">
            <Store className="h-5 w-5" />
            Browse Showrooms
          </Link>
        </Button>
      </div>
    </section>
  );
}
