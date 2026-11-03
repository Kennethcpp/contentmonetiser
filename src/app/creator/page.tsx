"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Building,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string; // "APPROVED" | "WAITING_APPROVAL" | "REJECTED"
  balance: number;
  facebookPageName?: string;
  facebookPageUrl?: string;
  facebookFollowers?: number;
}

interface AvailableAd {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  expectedViews: number;
  placements: string;
  ctaType: string;
  ctaValue: string;
  flyerUrl?: string;
  advertiserName: string;
  createdAt: string;
}

interface Promotion {
  id: string;
  creatorId: string;
  advertId: string;
  status: string; // "IN_PROGRESS" | "SUBMITTED" | "COMPLETED"
  postUrl?: string;
  viewsContributed: number;
  earnings: number;
  startedAt: string;
  adTitle?: string;
  adDescription?: string;
  adCategory?: string;
  adFlyerUrl?: string;
  adExpectedViews?: number;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "ads" | "wallet" | "settings" | "support">("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [availableAds, setAvailableAds] = useState<AvailableAd[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit link proof state
  const [postLinkInput, setPostLinkInput] = useState("");
  const [submittingLink, setSubmittingLink] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  // Withdrawal form state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [bankName, setBankName] = useState("Guaranty Trust Bank (GTBank)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  // Settings state
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Support state
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "CREATOR") {
        router.push("/login");
        return;
      }
      setUser(meData.user);
      setSettingsName(meData.user.name || "");
      setSettingsPhone(meData.user.phone || "");

      if (meData.user.status === "APPROVED") {
        const adsRes = await fetch("/api/ads?scope=available");
        const adsData = await adsRes.json();
        setAvailableAds(adsData.ads || []);

        const promoRes = await fetch("/api/promotions");
        const promoData = await promoRes.json();
        setPromotions(promoData.promotions || []);
        setActivePromotion(promoData.activePromotion || null);

        const wRes = await fetch("/api/wallet");
        const wData = await wRes.json();
        setWithdrawals(wData.withdrawals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Pick Ad to Promote
  const handlePickAd = async (adId: string) => {
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertId: adId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to accept ad");
        return;
      }
      alert(data.message);
      await loadData();
      setActiveTab("overview");
    } catch (e) {
      console.error(e);
    }
  };

  // Submit proof URL
  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePromotion) return;
    setSubmittingLink(true);
    setLinkSuccess(null);
    try {
      const res = await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoId: activePromotion.id,
          postUrl: postLinkInput,
          action: "SUBMIT_LINK",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinkSuccess(data.message);
        setPostLinkInput("");
        await loadData();
      } else {
        alert(data.error || "Failed to submit link");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingLink(false);
    }
  };

  // Simulate Completing Promotion & Collecting Earnings
  const handleCompletePromotion = async () => {
    if (!activePromotion) return;
    if (!confirm("Confirm you have published this advert and want to finalize view count and earnings?")) return;
    try {
      const res = await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoId: activePromotion.id,
          action: "COMPLETE",
          deliveredViews: 20000,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        await loadData();
      } else {
        alert(data.error || "Failed to complete promotion");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Withdrawal Request
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "WITHDRAW",
          amount: withdrawAmount,
          bankName,
          accountNumber,
          accountName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg(data.message);
        setShowWithdrawModal(false);
        await loadData();
      } else {
        alert(data.error || "Withdrawal failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsName,
          phone: settingsPhone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg(data.message);
        setCurrentPassword("");
        setNewPassword("");
        await loadData();
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: supportSubject, message: supportMessage }),
      });
      if (res.ok) {
        setSupportSent(true);
        setSupportSubject("");
        setSupportMessage("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFEEE3] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#20043B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // WAITING APPROVAL SCREEN
  if (user?.status === "WAITING_APPROVAL") {
    return (
      <div className="min-h-screen bg-[#EFEEE3] flex flex-col justify-center items-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#20043B]/10 card-shadow text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Account Status: Waiting Approval
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#20043B] mt-3">
              Application Under Review
            </h1>
            <p className="text-xs text-[#6B5B7E] mt-2 leading-relaxed">
              Welcome, <strong>{user.name}</strong>! Your connected Facebook page{" "}
              <strong>{user.facebookPageName}</strong> ({user.facebookFollowers?.toLocaleString()} followers) is currently being reviewed by our moderation team.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] text-xs text-[#20043B] text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Facebook Follower Threshold Met (5k+ verified)
            </p>
            <p className="text-[#6B5B7E]">
              Approval typically takes a few minutes to 24 hours. You will receive an email once your account is activated with full access to approved adverts.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="py-3 px-6 rounded-2xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c] transition-all text-center"
            >
              Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="py-2 text-xs font-semibold text-[#FF6C4C] hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalEarnings = promotions.reduce((acc, p) => acc + (p.earnings || 0), 0);
  const totalViewsEarned = promotions.reduce((acc, p) => acc + (p.viewsContributed || 0), 0);
  const completedPromotionsCount = promotions.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#20043B]/10 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="block">
              <div className="relative h-10 w-44">
                <Image
                  src="/images/01-primary-logo-concept.png"
                  alt="ContentMonetizer"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1.5 font-semibold text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "overview"
                  ? "bg-[#FAF3FF] text-[#20043B] font-extrabold shadow-sm"
                  : "text-[#6B5B7E] hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("ads")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "ads"
                  ? "bg-[#FAF3FF] text-[#20043B] font-extrabold shadow-sm"
                  : "text-[#6B5B7E] hover:bg-gray-50"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Available Ads ({availableAds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "wallet"
                  ? "bg-[#FAF3FF] text-[#20043B] font-extrabold shadow-sm"
                  : "text-[#6B5B7E] hover:bg-gray-50"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Withdrawals & Wallet</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "settings"
                  ? "bg-[#FAF3FF] text-[#20043B] font-extrabold shadow-sm"
                  : "text-[#6B5B7E] hover:bg-gray-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Profile & Page</span>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "support"
                  ? "bg-[#FAF3FF] text-[#20043B] font-extrabold shadow-sm"
                  : "text-[#6B5B7E] hover:bg-gray-50"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </nav>
        </div>

        {/* Creator Info & Sign Out */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-[#FAF3FF] rounded-2xl border border-[#F0D8FF]">
            <div className="w-9 h-9 rounded-full bg-[#20043B] text-white flex items-center justify-center font-bold text-xs">
              FB
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#20043B] truncate">{user?.facebookPageName || user?.name}</p>
              <p className="text-[10px] text-[#6B5B7E] truncate">{user?.facebookFollowers?.toLocaleString()} followers</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b border-[#20043B]/10 flex items-center justify-between">
          <div className="relative h-8 w-36">
            <Image
              src="/images/01-primary-logo-concept.png"
              alt="ContentMonetizer"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-3 py-1.5 bg-[#20043B] text-white text-xs font-bold rounded-lg"
            >
              Withdraw
            </button>
            <button onClick={handleLogout} className="p-2 text-[#20043B]">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto p-2 bg-[#EFEEE3] gap-1 text-xs font-bold border-b border-gray-200">
          {(["overview", "ads", "wallet", "settings", "support"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap capitalize ${
                activeTab === tab ? "bg-[#20043B] text-white" : "bg-white text-[#20043B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-8">
          {withdrawMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {withdrawMsg}
              </span>
              <button onClick={() => setWithdrawMsg(null)} className="font-bold">
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: CREATOR DASHBOARD OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Approved Creator
                    </span>
                    <span className="text-xs text-[#6B5B7E]">
                      {user?.facebookPageName} ({user?.facebookFollowers?.toLocaleString()} followers)
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-[#20043B]">
                    Welcome, {user?.name?.split(" ")[0]}!
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="px-5 py-2.5 rounded-full bg-[#20043B] text-white text-xs font-extrabold hover:bg-[#32085c] transition-all flex items-center gap-2 shadow-md"
                  >
                    <Wallet className="w-4 h-4 text-[#F0D8FF]" />
                    <span>Withdraw Earnings</span>
                  </button>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Available for Withdrawal */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Available Balance
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF0ED] text-[#FF6C4C] flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-[#20043B]">
                      ₦{user?.balance?.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="mt-2 text-xs font-bold text-[#FF6C4C] hover:underline flex items-center gap-1"
                    >
                      <span>Withdraw to Bank</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Lifetime Earnings */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Total Earnings
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF3FF] text-[#20043B] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-[#20043B]">
                      ₦{totalEarnings.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="mt-2 text-xs text-[#6B5B7E]">
                      From {completedPromotionsCount} completed promotions
                    </p>
                  </div>
                </div>

                {/* Views Generated */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Views Generated
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-[#20043B]">
                      {totalViewsEarned.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-emerald-700 font-semibold">
                      ₦4.50 per 1k views creator rate
                    </p>
                  </div>
                </div>

                {/* Connected Facebook Page Status */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Connected Page
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
                      <FacebookIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base font-black text-[#20043B] truncate">
                      {user?.facebookPageName}
                    </p>
                    <p className="mt-1 text-xs text-[#6B5B7E]">
                      {user?.facebookFollowers?.toLocaleString()} verified followers
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIVE PROMOTION SECTION (Spec: "Creators can only promote one ad per time, existing promotion must end before starting a new one") */}
              {activePromotion ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#FF6C4C] card-shadow space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFF0ED] text-[#FF6C4C] flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" /> ACTIVE PROMOTION IN PROGRESS
                      </span>
                      <span className="text-xs text-[#6B5B7E]">
                        (You can only promote 1 ad at a time)
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#20043B] bg-[#EFEEE3] px-3 py-1 rounded-lg self-start sm:self-auto">
                      Started {new Date(activePromotion.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-8 space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6C4C]">
                        {activePromotion.adCategory}
                      </span>
                      <h3 className="text-xl font-black text-[#20043B]">
                        {activePromotion.adTitle}
                      </h3>
                      <p className="text-xs text-[#6B5B7E] leading-relaxed">
                        {activePromotion.adDescription}
                      </p>

                      {/* Submit Proof Link Form */}
                      <div className="pt-2">
                        {linkSuccess && (
                          <p className="text-xs text-emerald-700 font-bold mb-2">
                            ✓ {linkSuccess}
                          </p>
                        )}
                        <form onSubmit={handleSubmitLink} className="flex gap-2 max-w-lg">
                          <input
                            type="url"
                            required
                            value={postLinkInput}
                            onChange={(e) => setPostLinkInput(e.target.value)}
                            placeholder="Paste your Facebook post link proof here..."
                            className="flex-1 py-2 px-3 text-xs rounded-xl border border-gray-200 bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                          />
                          <button
                            type="submit"
                            disabled={submittingLink}
                            className="px-4 py-2 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#350861] shrink-0 disabled:opacity-50"
                          >
                            {submittingLink ? "Saving..." : "Submit Proof"}
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="md:col-span-4 bg-[#FAF3FF] p-5 rounded-2xl border border-[#F0D8FF] flex flex-col justify-between space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5B7E]">Current Status</p>
                        <p className="text-sm font-extrabold text-[#20043B] capitalize mt-0.5">
                          {activePromotion.status === "SUBMITTED" ? "Proof Submitted & Tracking" : "Awaiting Facebook Post Proof"}
                        </p>
                        <p className="text-[11px] text-[#6B5B7E] mt-1">
                          Target Views: {activePromotion.adExpectedViews?.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={handleCompletePromotion}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#FF6C4C] text-white text-xs font-black hover:bg-[#e85a3a] transition-all shadow-md shadow-[#FF6C4C]/20"
                      >
                        Finish & Claim Earnings
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-white border border-[#20043B]/10 card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#20043B]">No Promotion Currently Active</h4>
                      <p className="text-xs text-[#6B5B7E] mt-0.5">
                        You are free to select an approved advertisement from the marketplace and start monetizing.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("ads")}
                    className="px-5 py-2.5 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c] shrink-0"
                  >
                    Browse Available Ads ({availableAds.length}) &rarr;
                  </button>
                </div>
              )}

              {/* Content Performance Tracking Analysis */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#20043B]">Content Performance Tracking</h3>
                    <p className="text-xs text-[#6B5B7E]">Historical analysis of your Facebook audience engagements and payouts</p>
                  </div>
                  <span className="text-xs font-bold text-[#FF6C4C]">
                    Lifetime: ₦{totalEarnings.toLocaleString()}
                  </span>
                </div>

                {promotions.length === 0 ? (
                  <p className="text-xs text-[#6B5B7E] py-4">No completed promotions yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[#6B5B7E] uppercase text-[10px] font-bold">
                          <th className="pb-3">Advert Title</th>
                          <th className="pb-3">Started</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Views Delivered</th>
                          <th className="pb-3">Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {promotions.map((p) => (
                          <tr key={p.id} className="hover:bg-[#EFEEE3]/30">
                            <td className="py-3 font-bold text-[#20043B] max-w-xs truncate">
                              {p.adTitle}
                            </td>
                            <td className="py-3 text-[#6B5B7E]">
                              {new Date(p.startedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-[#20043B]">
                              {p.viewsContributed?.toLocaleString()}
                            </td>
                            <td className="py-3 font-black text-emerald-700">
                              +₦{p.earnings?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AVAILABLE ADS TO PROMOTE */}
          {activeTab === "ads" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6C4C]">
                  Creator Marketplace
                </span>
                <h2 className="text-2xl font-black text-[#20043B] mt-1">Available Ads to Promote</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Browse approved advertiser campaigns. <strong>Rule:</strong> You can only promote one ad at a time.
                </p>
              </div>

              {activePromotion && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    You currently have an active promotion in progress (<strong>{activePromotion.adTitle}</strong>). Complete or end it before accepting another ad.
                  </span>
                </div>
              )}

              {availableAds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-[#6B5B7E]">No approved adverts currently open for pickup.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableAds.map((ad) => {
                    const potentialEarnings = (ad.expectedViews / 1000) * 4.5;
                    const isAlreadyActive = activePromotion?.advertId === ad.id;

                    return (
                      <div
                        key={ad.id}
                        className="p-6 rounded-3xl border border-gray-200 hover:border-[#20043B]/30 transition-all bg-white flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FAF3FF] text-[#20043B] px-2.5 py-1 rounded-full border border-[#F0D8FF]">
                              {ad.category}
                            </span>
                            <span className="text-xs font-black text-emerald-700">
                              Earn up to ₦{potentialEarnings.toLocaleString()}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-[#20043B] leading-snug">
                            {ad.title}
                          </h4>

                          <p className="text-xs text-[#6B5B7E] line-clamp-3 leading-relaxed">
                            {ad.description}
                          </p>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#6B5B7E]">
                            <span>Views Needed: <strong>{ad.expectedViews.toLocaleString()}</strong></span>
                            <span>Placement: <strong>{JSON.parse(ad.placements || "[]").join(", ")}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePickAd(ad.id)}
                          disabled={!!activePromotion}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                            isAlreadyActive
                              ? "bg-emerald-600 text-white cursor-default"
                              : activePromotion
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#20043B] text-white hover:bg-[#32085c] shadow-md shadow-[#20043B]/20"
                          }`}
                        >
                          {isAlreadyActive
                            ? "Currently Promoting ✓"
                            : activePromotion
                            ? "Complete Active Promotion First"
                            : "Promote This Ad &rarr;"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EARNING WITHDRAWAL & WALLET */}
          {activeTab === "wallet" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#20043B]">Creator Earnings & Withdrawals</h2>
                  <p className="text-xs text-[#6B5B7E] mt-1">
                    Withdraw directly to your Nigerian commercial or digital bank account in Naira.
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-5 py-2.5 rounded-full bg-[#20043B] text-white text-xs font-extrabold hover:bg-[#32085c] transition-all flex items-center gap-2 self-start sm:self-auto"
                >
                  <Wallet className="w-4 h-4 text-[#F0D8FF]" />
                  <span>Request Withdrawal</span>
                </button>
              </div>

              {/* Balance Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#20043B] to-[#3a0d63] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-[#F0D8FF] tracking-wider">
                    Available for Payout
                  </span>
                  <p className="text-3xl sm:text-4xl font-black mt-1">
                    ₦{user?.balance?.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[#EFEEE3]/70 mt-1">
                    Minimum withdrawal threshold: ₦1,000
                  </p>
                </div>

                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-6 py-3 rounded-xl bg-[#FF6C4C] text-white text-xs font-black hover:bg-[#e85a3a] transition-all shadow-lg"
                >
                  Withdraw Now
                </button>
              </div>

              {/* Withdrawal History */}
              <div className="space-y-4 pt-4">
                <h3 className="text-base font-black text-[#20043B]">Withdrawal History</h3>
                {withdrawals.length === 0 ? (
                  <p className="text-xs text-[#6B5B7E]">No withdrawals requested yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[#6B5B7E] uppercase text-[10px] font-bold">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Bank Destination</th>
                          <th className="pb-3">Account</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {withdrawals.map((w) => (
                          <tr key={w.id}>
                            <td className="py-3 text-[#6B5B7E]">
                              {new Date(w.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-black text-[#20043B]">
                              ₦{Number(w.amount).toLocaleString()}
                            </td>
                            <td className="py-3 font-semibold text-[#20043B]">{w.bankName}</td>
                            <td className="py-3 text-[#6B5B7E]">{w.accountNumber} ({w.accountName})</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  w.status === "PAID"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : w.status === "PENDING"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {w.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WITHDRAWAL MODAL */}
          {showWithdrawModal && (
            <div className="fixed inset-0 z-50 bg-[#20043B]/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#20043B]/10 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[#20043B]">Withdraw Earnings</h3>
                  <p className="text-xs text-[#6B5B7E] mt-1">
                    Available balance: <strong>₦{user?.balance?.toLocaleString()}</strong>
                  </p>
                </div>

                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Withdrawal Amount (₦)
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      max={user?.balance || 1000}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-[#20043B] bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Select Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs text-[#20043B] bg-white focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    >
                      <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                      <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                      <option value="Kuda Bank">Kuda Bank</option>
                      <option value="OPay">OPay</option>
                      <option value="Palmpay">Palmpay</option>
                      <option value="Stanbic IBTC">Stanbic IBTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Account Number (10 digits)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0123456789"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs text-[#20043B] bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Chinedu Okafor"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs text-[#20043B] bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={withdrawing}
                      className="flex-1 py-3 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c] transition-all disabled:opacity-50"
                    >
                      {withdrawing ? "Submitting..." : "Confirm Withdrawal"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWithdrawModal(false)}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-[#6B5B7E]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Creator Profile & Settings</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Manage your personal details and connected Facebook page information.
                </p>
              </div>

              {settingsMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{settingsMsg}</span>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] space-y-2 text-xs">
                <span className="font-bold text-[#20043B] uppercase tracking-wider block">Connected Facebook Page:</span>
                <p className="text-sm font-black text-[#20043B]">{user?.facebookPageName}</p>
                <p className="text-[#6B5B7E]">{user?.facebookFollowers?.toLocaleString()} verified followers</p>
                <p className="text-[#6B5B7E] truncate">{user?.facebookPageUrl}</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-[#20043B] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#20043B] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#20043B]">Change Password</h4>
                  <div>
                    <label className="block text-xs text-[#6B5B7E] mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B5B7E] mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c]"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SUPPORT */}
          {activeTab === "support" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Contact Creator Support</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Need assistance with proof verification, Facebook page questions, or payouts?
                </p>
              </div>

              {supportSent ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">Message Sent Successfully</p>
                  <p>Our creator operations team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="e.g. Facebook post proof status"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Write your question or request..."
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#20043B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c]"
                  >
                    Send Support Request
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
