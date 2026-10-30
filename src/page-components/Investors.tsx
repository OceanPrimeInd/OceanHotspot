"use client";

import { FormEvent, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

const THANK_YOU = "Thank you we will be in touch with you soon";

export default function Investors() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("notify-ocean-hotspot", {
        body: {
          type: "investor_interest",
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          linkedin: linkedin.trim(),
          company: company.trim(),
        },
      });
      if (fnError || data?.error || data?.ok === false) {
        setError("We could not send this yet. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("We could not send this yet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
        <article className="border border-[#e3e6e6] bg-white p-6 shadow-sm md:p-10">
          {submitted ? (
            <p className="text-xl font-semibold text-[#0f1111]">{THANK_YOU}</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold leading-snug text-[#0f1111] md:text-3xl">
                Hello.  If you are interested in investing in Ocean Hotspot please complete the information below and we will reach out to you soon.
              </h1>
              <form onSubmit={onSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="investor-name">Name</Label>
                  <Input id="investor-name" name="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-email">Email</Label>
                  <Input id="investor-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-mobile">Mobile</Label>
                  <Input id="investor-mobile" name="mobile" type="tel" autoComplete="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-linkedin">LinkedIn</Label>
                  <Input
                    id="investor-linkedin"
                    name="linkedin"
                    type="url"
                    inputMode="url"
                    placeholder="https://www.linkedin.com/in/…"
                    required
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investor-company">Company name and address / country</Label>
                  <Textarea id="investor-company" name="company" required value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                {error && <p className="text-sm text-[#8a2318]">{error}</p>}
                <Button type="submit" variant="o42Primary" disabled={submitting} className="h-11 px-6">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </Button>
              </form>
            </>
          )}
        </article>
      </div>
    </Layout>
  );
}
