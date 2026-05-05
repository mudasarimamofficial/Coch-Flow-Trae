"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/browserClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const rawNext = sp.get("next") || "/admin";
  const next = rawNext.startsWith("/admin") && !rawNext.startsWith("//") ? rawNext : "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface-950 text-surface-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <CardDescription>Sign in with your Supabase admin account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-surface-300">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-surface-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error ? <div className="text-sm text-red-400">{error}</div> : null}
            <Button variant="primary" className="w-full" disabled={loading} onClick={signIn}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
