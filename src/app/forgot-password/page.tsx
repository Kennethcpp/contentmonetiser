"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Unable to request a reset link.");
    else setMessage(data.message);
  }

  return (
    <main className="min-h-screen bg-[#EFEEE3] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-black text-[#20043B]">Forgot password?</h1>
        <p className="mt-2 text-sm text-[#6B5B7E]">Enter your email and we&apos;ll send a secure reset link.</p>
        {message && <p className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm">{message}</p>}
        {error && <p className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm" />
          <button type="submit" className="w-full py-3 rounded-2xl bg-[#FF6C4C] text-white text-sm font-bold">Send reset link</button>
        </form>
        <Link href="/login" className="block mt-5 text-center text-sm font-bold text-[#FF6C4C]">Back to sign in</Link>
      </div>
    </main>
  );
}
