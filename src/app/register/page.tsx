"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Megaphone,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Clock,
} from "lucide-react";
import { AD_CATEGORIES } from "@/lib/categories";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

interface FbVerificationData {
  valid: boolean;
  pageName: string;
  pageUrl: string;
  followerCount: number;
  eligible: boolean;
  minFollowersRequired: number;
  category: string;
  avatarUrl?: string;
  errorMessage?: string;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "CREATOR" ? "CREATOR" : "ADVERTISER";

  const [role, setRole] = useState<"ADVERTISER" | "CREATOR">(initialRole);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Creator specific states
  const [facebookPageInput, setFacebookPageInput] = useState("");
  const [verifyingFb, setVerifyingFb] = useState(false);
  const [fbReport, setFbReport] = useState<FbVerificationData | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Submission & Confirmation states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedWaiting, setSubmittedWaiting] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  useEffect(() => {
    const qRole = searchParams.get("role");
    if (qRole === "CREATOR" || qRole === "ADVERTISER") {
      setRole(qRole);
    }
  }, [searchParams]);

  // Facebook verification trigger
  const handleVerifyFacebook = async () => {
    if (!facebookPageInput.trim()) {
      setFbError("Please enter your Facebook page name or link.");
      return;
    }
    setVerifyingFb(true);
    setFbError(null);
    setFbReport(null);

    try {
      const res = await fetch("/api/verify-facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageInput: facebookPageInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.eligible) {
        setFbReport(data);
        setFbError(
          data.errorMessage ||
            `Page does not have the required 5,000 followers minimum (Found ${data.followerCount || 0}).`
        );
      } else {
        setFbReport(data);
        if (data.category && !selectedCategories.includes(data.category)) {
          setSelectedCategories([data.category]);
        }
      }
    } catch {
      setFbError("Could not connect to Facebook verification service. Please try again.");
    } finally {
      setVerifyingFb(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (role === "CREATOR") {
      if (!fbReport || !fbReport.eligible) {
        setErrorMessage("You must verify an eligible Facebook page with at least 5,000 followers first.");
        return;
      }
      if (selectedCategories.length === 0) {
        setErrorMessage("Please select at least one content category.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
          facebookPageInput: fbReport?.pageUrl || facebookPageInput,
          categories: selectedCategories,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setRegistrationMessage(data.message);
      setSubmittedWaiting(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEEE3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <div className="relative h-12 w-52 mx-auto">
              <Image
                src="/images/01-primary-logo-concept.png"
                alt="ContentMonetizer"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-[#20043B] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-[#6B5B7E] mt-1">
            Choose whether you want to advertise your brand or monetize your content
          </p>
        </div>

        {/* Success Modal / Waiting Screen for Creators */}
        {submittedWaiting ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#20043B]/10 card-shadow text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Account Created
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#20043B] mt-3">
                Check Your Email
              </h2>
              <p className="text-sm text-[#6B5B7E] max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <strong>{name}</strong>! {registrationMessage}
              </p>
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] text-xs text-[#20043B] max-w-md mx-auto">
                <p className="font-semibold">
                  Open the verification link in your email. After verification, you can sign in. Creator applications still require operations approval before promotion access is enabled.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 rounded-2xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c] transition-all"
              >
                Go to Sign In
              </button>
              <Link
                href="/"
                className="px-6 py-3 rounded-2xl bg-[#EFEEE3] text-[#20043B] text-xs font-bold hover:bg-gray-200 transition-all text-center"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#20043B]/10 card-shadow">
            {/* Role Switcher Pill */}
            <div className="flex p-1.5 bg-[#EFEEE3] rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole("ADVERTISER")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  role === "ADVERTISER"
                    ? "bg-[#FF6C4C] text-white shadow-md shadow-[#FF6C4C]/25"
                    : "text-[#20043B] hover:text-[#FF6C4C]"
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Advertiser (Place Ads)</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("CREATOR")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  role === "CREATOR"
                    ? "bg-[#20043B] text-white shadow-md shadow-[#20043B]/25"
                    : "text-[#20043B] hover:text-[#FF6C4C]"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Creator&apos;s Programme</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Creator-Specific: Facebook Page Automatic Verification */}
              {role === "CREATOR" && (
                <div className="p-5 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#20043B] flex items-center gap-1.5">
                      <FacebookIcon className="w-4 h-4 text-[#1877F2]" /> Step 1: Facebook Page Verification
                    </span>
                    <span className="text-[11px] font-bold text-[#FF6C4C] bg-[#FFF0ED] px-2 py-0.5 rounded-full border border-[#FF6C4C]/20">
                      Min. 5,000 Followers Required
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B5B7E] mb-1">
                      Enter Facebook Page Name or URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={facebookPageInput}
                        onChange={(e) => setFacebookPageInput(e.target.value)}
                        placeholder="e.g. Lagos Buzz TV or facebook.com/lagosbuzz"
                        className="flex-1 py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs text-[#20043B] bg-white focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyFacebook}
                        disabled={verifyingFb}
                        className="px-4 py-2.5 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#350761] transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {verifyingFb ? "Reading Page..." : "Verify Page"}
                      </button>
                    </div>
                  </div>

                  {fbError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fbError}</span>
                    </div>
                  )}

                  {fbReport && fbReport.eligible && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                          FB
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                            {fbReport.pageName}
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            {fbReport.followerCount.toLocaleString()} active followers • Category: {fbReport.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                        ELIGIBLE
                      </span>
                    </div>
                  )}

                  {/* Category Selection for Creators */}
                  {fbReport && fbReport.eligible && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#20043B] mb-1.5">
                        Select Your Content Categories (Multiple Allowed):
                      </label>
                      <p className="text-[11px] text-[#6B5B7E] mb-2.5">
                        Advertisers match campaigns based on these categories.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {AD_CATEGORIES.map((cat) => {
                          const active = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                                active
                                  ? "bg-[#20043B] text-white shadow-sm"
                                  : "bg-white text-[#20043B] border border-gray-200 hover:border-[#20043B]"
                              }`}
                            >
                              {cat} {active && "✓"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal Details */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#20043B] block">
                  {role === "CREATOR" ? "Step 2: Creator Details" : "Advertiser Information"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Kenneth Williams"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#FF6C4C] text-white text-xs font-extrabold hover:bg-[#e85a3a] transition-all shadow-md shadow-[#FF6C4C]/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Processing Application..."
                ) : role === "CREATOR" ? (
                  <>
                    <span>Submit Creator Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Create Advertiser Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#6B5B7E]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#FF6C4C] hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFEEE3] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#20043B] border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
