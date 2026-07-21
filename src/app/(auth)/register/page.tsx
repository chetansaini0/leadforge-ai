"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/fetcher";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Create your workspace</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Start finding and converting clients.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Chetan Saini" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
