"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Megaphone,
  Users,
} from "lucide-react";

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
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "CREATOR") {
        router.push("/creator");
      } else {
        router.push("/advertiser");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.user) {
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else if (data.user.role === "CREATOR") {
          router.push("/creator");
        } else {
          router.push("/advertiser");
        }
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Demo sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block mb-4">
          <div className="relative h-14 w-56 mx-auto">
            <Image
              src="/images/01-primary-logo-concept.png"
              alt="ContentMonetizer"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-[#20043B] tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1 text-xs text-[#6B5B7E]">
          Sign in to your advertiser or creator dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#20043B]/10 card-shadow">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#20043B]">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B5B7E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-[#20043B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C] focus:border-transparent bg-[#EFEEE3]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#20043B]">
                Password
              </label>
              <div className="mt-1.5 relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B5B7E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs text-[#20043B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C] focus:border-transparent bg-[#EFEEE3]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#FF6C4C] text-white text-xs font-extrabold hover:bg-[#e85a3a] transition-all shadow-md shadow-[#FF6C4C]/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher inside Login */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-[11px] font-bold text-center text-[#6B5B7E] uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6C4C]" /> Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo("ADVERTISER")}
                className="p-2 rounded-xl bg-[#FFF0ED] text-[#FF6C4C] font-bold hover:bg-[#ffdacf] transition-colors text-center flex flex-col items-center gap-1"
              >
                <Megaphone className="w-4 h-4" />
                <span>Advertiser</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("CREATOR")}
                className="p-2 rounded-xl bg-[#FAF3FF] text-[#20043B] font-bold hover:bg-[#F0D8FF] transition-colors text-center flex flex-col items-center gap-1"
              >
                <Users className="w-4 h-4" />
                <span>Creator</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("ADMIN")}
                className="p-2 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition-colors text-center flex flex-col items-center gap-1"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#6B5B7E]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#FF6C4C] hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
