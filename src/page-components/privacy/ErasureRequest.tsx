"use client";

import { useState } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, Shield } from "lucide-react";
import { CONTACT_EMAIL } from "@/config/contact";
import { ContactEmailLink } from "@/components/ContactEmailLink";

export default function ErasureRequest() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState("erasure");
  const [email, setEmail] = useState(profile?.email || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke("gdpr-request", {
      body: {
        request_type: requestType,
        email: email.trim(),
        full_name: fullName.trim() || null,
        message: message.trim() || null,
      },
    });

    setSubmitting(false);

    if (error || data?.error) {
      toast({
        title: "Request failed",
        description: data?.error || error?.message || `Please try again or email ${CONTACT_EMAIL}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-16">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-headline">Data subject request</h1>
            <p className="text-muted-foreground mt-1">
              Request erasure, access, or portability of your personal data (UK GDPR).
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request received</h2>
            <p className="text-muted-foreground mb-6">
              We will respond within 30 days. For urgent matters email <ContactEmailLink className="text-primary underline" />.
            </p>
            <Button variant="outline" asChild>
              <Link href="/privacy">Back to Privacy Policy</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label>Request type</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erasure">Erasure (right to be forgotten)</SelectItem>
                  <SelectItem value="access">Access (copy of my data)</SelectItem>
                  <SelectItem value="portability">Portability (export my data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional details</Label>
              <Textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us which account or orders this relates to..."
              />
            </div>

            {user && (
              <p className="text-xs text-muted-foreground">
                Signed in as {user.email}. Your request will be linked to your account.
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit request
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
