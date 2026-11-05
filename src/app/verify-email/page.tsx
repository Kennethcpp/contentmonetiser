"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email address...");
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError(true);
      setMessage("This verification link is missing its token.");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMessage(data.message);
      })
      .catch((err) => {
        setError(true);
        setMessage(err instanceof Error ? err.message : "Email verification failed.");
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#EFEEE3] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-[#20043B]">Email verification</h1>
        <p className={`mt-3 text-sm ${error ? "text-red-700" : "text-[#6B5B7E]"}`}>{message}</p>
        {!error && <Link href="/login" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-[#FF6C4C] text-white text-sm font-bold">Continue to sign in</Link>}
      </div>
    </main>
  );
}
