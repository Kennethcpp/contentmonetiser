"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Unable to reset password.");
    else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1200);
    }
  }

  return (
    <main className="min-h-screen bg-[#EFEEE3] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-black text-[#20043B]">Set a new password</h1>
        {success ? <p className="mt-4 text-emerald-800 text-sm">Password reset successfully. Redirecting to sign in...</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</p>}
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm" />
            <input type="password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Confirm new password" className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm" />
            <button type="submit" className="w-full py-3 rounded-2xl bg-[#FF6C4C] text-white text-sm font-bold">Reset password</button>
          </form>
        )}
        <Link href="/login" className="block mt-5 text-center text-sm font-bold text-[#FF6C4C]">Back to sign in</Link>
      </div>
    </main>
  );
}
