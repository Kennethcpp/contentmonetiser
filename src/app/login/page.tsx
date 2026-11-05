"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(data.user.role === "ADMIN" ? "/admin" : data.user.role === "CREATOR" ? "/creator" : "/advertiser");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-4">
          <div className="relative h-14 w-56 mx-auto">
            <Image src="/images/01-primary-logo-concept.png" alt="ContentMonetizer" fill className="object-contain" priority />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-[#20043B]">Welcome Back</h2>
        <p className="mt-1 text-xs text-[#6B5B7E]">Sign in to your advertiser or creator dashboard</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#20043B]/10 card-shadow">
          {error && <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
          <form className="space-y-4" onSubmit={handleLogin}>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#20043B]">
              Email Address
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6B5B7E]" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@business.com" className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-normal text-[#20043B] bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]" />
              </div>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#20043B]">
              Password
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#6B5B7E]" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-normal text-[#20043B] bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]" />
              </div>
            </label>
            <div className="text-right"><Link href="/forgot-password" className="text-xs font-bold text-[#FF6C4C] hover:underline">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl bg-[#FF6C4C] text-white text-xs font-extrabold hover:bg-[#e85a3a] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Signing In..." : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-[#6B5B7E]">Don&apos;t have an account? <Link href="/register" className="font-bold text-[#FF6C4C] hover:underline">Register here</Link></div>
        </div>
      </div>
    </div>
  );
}
