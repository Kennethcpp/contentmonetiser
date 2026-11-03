"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Megaphone,
  BarChart3,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  Eye,
  TrendingUp,
  Pause,
  Play,
  Square,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  CreditCard,
  Building,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  HelpCircle as OtherIcon,
  ShieldCheck,
} from "lucide-react";
import { detectCategory, AD_CATEGORIES } from "@/lib/categories";

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  expectedViews: number;
  cost: number;
  placements: string;
  ctaType: string;
  ctaValue: string;
  flyerUrl?: string;
  status: string;
  viewsDelivered: number;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  balance: number;
}

export default function AdvertiserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "ads" | "deposit" | "settings" | "support">("overview");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Ad Form State
  const [expectedViews, setExpectedViews] = useState<number>(50000);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placements, setPlacements] = useState<string[]>(["MIDDLE"]);
  const [ctaType, setCtaType] = useState<string>("WEBSITE");
  const [ctaValue, setCtaValue] = useState<string>("");
  const [flyerUrl, setFlyerUrl] = useState<string>("/images/07-marketing-promo-banner.png");
  const [autoCategory, setAutoCategory] = useState<string>("General Lifestyle");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [creatingAd, setCreatingAd] = useState(false);
  const [adSuccessMessage, setAdSuccessMessage] = useState<string | null>(null);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);

  // Settings State
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  // Support Form State
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  // Rate: ₦5 per 1,000 views
  const calculatedCost = (expectedViews / 1000) * 5;

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData.user || meData.user.role !== "ADVERTISER") {
        router.push("/login");
        return;
      }
      setUser(meData.user);
      setSettingsName(meData.user.name || "");
      setSettingsPhone(meData.user.phone || "");

      const adsRes = await fetch("/api/ads?scope=mine");
      const adsData = await adsRes.json();
      setAds(adsData.ads || []);

      const wRes = await fetch("/api/wallet");
      const wData = await wRes.json();
      setTransactions(wData.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto detect category when title/description changes
  useEffect(() => {
    if (title || description) {
      const detected = detectCategory(`${title} ${description}`);
      setAutoCategory(detected);
    }
  }, [title, description]);

  const handleTogglePlacement = (item: string) => {
    if (placements.includes(item)) {
      if (placements.length > 1) {
        setPlacements(placements.filter((p) => p !== item));
      }
    } else {
      setPlacements([...placements, item]);
    }
  };

  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const handleConfirmAdPayment = async () => {
    setCreatingAd(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          expectedViews,
          placements,
          ctaType,
          ctaValue,
          flyerUrl,
          categoryOverride: autoCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place ad");
      }

      setShowPaymentModal(false);
      setAdSuccessMessage(data.message);
      setTitle("");
      setDescription("");
      setCtaValue("");
      await loadData();
      setActiveTab("ads");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error placing ad");
    } finally {
      setCreatingAd(false);
    }
  };

  const handleAdAction = async (id: string, action: string) => {
    try {
      if (action === "DELETE") {
        if (!confirm("Are you sure you want to delete this ad?")) return;
        await fetch(`/api/ads/${id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/ads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
      }
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositing(true);
    setDepositSuccess(null);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DEPOSIT", amount: depositAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setDepositSuccess(data.message);
        await loadData();
      } else {
        alert(data.error || "Deposit failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDepositing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);
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
        setSettingsMessage(data.message || "Profile updated successfully!");
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
        <div className="w-10 h-10 border-4 border-[#FF6C4C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalViewsDelivered = ads.reduce((acc, a) => acc + (a.viewsDelivered || 0), 0);
  const totalViewsOrdered = ads.reduce((acc, a) => acc + (a.expectedViews || 0), 0);
  const totalSpend = ads.reduce((acc, a) => acc + (a.cost || 0), 0);
  const activeAdsCount = ads.filter((a) => a.status === "APPROVED" || a.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex">
      {/* Sidebar Navigation Matching 05-dashboard-mockup.png */}
      <aside className="w-64 bg-white border-r border-[#20043B]/10 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo */}
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

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 font-semibold text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "overview"
                  ? "bg-[#FFF0ED] text-[#FF6C4C] font-extrabold shadow-sm"
                  : "text-[#20043B] hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "create"
                  ? "bg-[#FFF0ED] text-[#FF6C4C] font-extrabold shadow-sm"
                  : "text-[#20043B] hover:bg-gray-50"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ad</span>
            </button>

            <button
              onClick={() => setActiveTab("ads")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "ads"
                  ? "bg-[#FFF0ED] text-[#FF6C4C] font-extrabold shadow-sm"
                  : "text-[#20043B] hover:bg-gray-50"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>My Ads ({ads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("deposit")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "deposit"
                  ? "bg-[#FFF0ED] text-[#FF6C4C] font-extrabold shadow-sm"
                  : "text-[#20043B] hover:bg-gray-50"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "settings"
                  ? "bg-[#FFF0ED] text-[#FF6C4C] font-extrabold shadow-sm"
                  : "text-[#20043B] hover:bg-gray-50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings & Password</span>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "support"
                  ? "bg-[#FFF0ED] text-[#FF6C4C] font-extrabold shadow-sm"
                  : "text-[#20043B] hover:bg-gray-50"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contact Support</span>
            </button>
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-[#FF6C4C] text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#20043B] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#6B5B7E] truncate">{user?.email}</p>
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
              onClick={() => setActiveTab("create")}
              className="px-3 py-1.5 bg-[#FF6C4C] text-white text-xs font-bold rounded-lg"
            >
              + Create Ad
            </button>
            <button onClick={handleLogout} className="p-2 text-[#20043B]">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Pills */}
        <div className="md:hidden flex overflow-x-auto p-2 bg-[#EFEEE3] gap-1 text-xs font-bold border-b border-gray-200">
          {(["overview", "create", "ads", "deposit", "settings", "support"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap capitalize ${
                activeTab === tab ? "bg-[#FF6C4C] text-white" : "bg-white text-[#20043B]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-8">
          {adSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {adSuccessMessage}
              </span>
              <button onClick={() => setAdSuccessMessage(null)} className="font-bold">
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW (Matching 05-dashboard-mockup.png) */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-[#20043B]">Welcome Back, {user?.name?.split(" ")[0]}!</h1>
                  <p className="text-xs text-[#6B5B7E] mt-1">
                    Track your advert delivery progress, deductions, and reach real viewers across Nigeria.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-5 py-2.5 rounded-full bg-[#FF6C4C] text-white text-xs font-extrabold hover:bg-[#e85a3a] transition-all flex items-center gap-2 shadow-md shadow-[#FF6C4C]/20 shrink-0 self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Place Advert (₦5/1k views)</span>
                </button>
              </div>

              {/* Metric Cards Matching Mockup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Available Balance */}
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
                      ₦{user?.balance?.toLocaleString("en-NG", { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                    <button
                      onClick={() => setActiveTab("deposit")}
                      className="mt-2 text-xs font-bold text-[#FF6C4C] hover:underline flex items-center gap-1"
                    >
                      <span>Deposit funds</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Views Delivered */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Total Views Delivered
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF3FF] text-[#20043B] flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-[#20043B]">
                      {totalViewsDelivered.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-[#6B5B7E]">
                      Out of {totalViewsOrdered.toLocaleString()} ordered
                    </p>
                  </div>
                </div>

                {/* Active Ad Campaigns */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Active Ad Campaigns
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Megaphone className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-[#20043B]">{activeAdsCount}</p>
                    <button
                      onClick={() => setActiveTab("ads")}
                      className="mt-2 text-xs font-bold text-[#20043B] hover:underline flex items-center gap-1"
                    >
                      <span>View campaigns</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Total Ad Spend */}
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                      Total Ad Spend
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#20043B] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-black text-[#20043B]">
                      ₦{totalSpend.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="mt-2 text-xs text-emerald-700 font-semibold">
                      ₦5 per 1k views rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Chart Component (Matching Mockup 05) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#20043B]">Your Ad Performance & Deductions</h3>
                    <p className="text-xs text-[#6B5B7E]">Real-time viewer impressions across creator network</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3FF] text-[#20043B] border border-[#F0D8FF]">
                    Cumulative View Curve
                  </span>
                </div>

                {/* SVG Mockup Chart */}
                <div className="h-64 w-full relative pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6C4C" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#FF6C4C" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#EFEEE3" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="#EFEEE3" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#EFEEE3" strokeWidth="1" strokeDasharray="4" />

                    {/* Gradient Area */}
                    <path
                      d="M 0,160 Q 100,120 200,140 T 400,80 T 550,40 L 600,45 L 600,200 L 0,200 Z"
                      fill="url(#chartGrad)"
                    />
                    {/* Line */}
                    <path
                      d="M 0,160 Q 100,120 200,140 T 400,80 T 550,40 L 600,45"
                      fill="none"
                      stroke="#FF6C4C"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    <circle cx="100" cy="130" r="5" fill="#FF6C4C" stroke="#fff" strokeWidth="2" />
                    <circle cx="200" cy="140" r="5" fill="#FF6C4C" stroke="#fff" strokeWidth="2" />
                    <circle cx="300" cy="110" r="5" fill="#FF6C4C" stroke="#fff" strokeWidth="2" />
                    <circle cx="400" cy="80" r="5" fill="#FF6C4C" stroke="#fff" strokeWidth="2" />
                    <circle cx="550" cy="40" r="6" fill="#20043B" stroke="#fff" strokeWidth="2" />
                  </svg>
                  <div className="absolute top-8 right-16 bg-[#20043B] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
                    {totalViewsDelivered.toLocaleString()} Views
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-[#6B5B7E] font-medium pt-2 border-t border-gray-100">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Current Week</span>
                </div>
              </div>

              {/* Recent Active Ads Quick Table */}
              <div className="bg-white rounded-3xl p-6 border border-[#20043B]/10 card-shadow space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-[#20043B]">Recent Campaigns</h3>
                  <button
                    onClick={() => setActiveTab("ads")}
                    className="text-xs font-bold text-[#FF6C4C] hover:underline"
                  >
                    View All Ads ({ads.length}) &rarr;
                  </button>
                </div>

                {ads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#6B5B7E]">You haven&apos;t placed any adverts yet.</p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#FF6C4C] text-white text-xs font-bold"
                    >
                      Place Your First Ad
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[#6B5B7E] uppercase text-[10px] font-bold">
                          <th className="pb-3">Campaign</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Target Views</th>
                          <th className="pb-3">Delivered</th>
                          <th className="pb-3">Cost</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ads.slice(0, 4).map((ad) => (
                          <tr key={ad.id} className="hover:bg-[#EFEEE3]/30">
                            <td className="py-3 font-bold text-[#20043B] max-w-xs truncate">
                              {ad.title}
                            </td>
                            <td className="py-3 text-[#6B5B7E]">{ad.category}</td>
                            <td className="py-3 font-semibold">{ad.expectedViews.toLocaleString()}</td>
                            <td className="py-3 font-bold text-[#FF6C4C]">
                              {ad.viewsDelivered.toLocaleString()}
                            </td>
                            <td className="py-3 font-semibold">₦{ad.cost.toLocaleString()}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ad.status === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : ad.status === "PENDING_APPROVAL"
                                    ? "bg-amber-100 text-amber-800"
                                    : ad.status === "PAUSED"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {ad.status}
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

          {/* TAB 2: CREATE NEW AD WIZARD */}
          {activeTab === "create" && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#20043B]/10 card-shadow space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6C4C]">
                  Guaranteed Rate: ₦5 per 1,000 Views
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#20043B] mt-1">
                  Place a New Advertisement
                </h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Configure your expected views, select creator placement timings, and enter your call-to-action.
                </p>
              </div>

              <form onSubmit={handleCreateAdSubmit} className="space-y-6">
                {/* 1. Number of Views & Cost Calculator */}
                <div className="p-6 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#20043B]">
                      1. Number of Expected Views:
                    </label>
                    <span className="text-xs font-extrabold text-[#FF6C4C] bg-[#FFF0ED] px-2.5 py-1 rounded-full border border-[#FF6C4C]/20">
                      ₦5 per 1k Views Rate
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={expectedViews}
                      onChange={(e) => setExpectedViews(Math.max(1000, Number(e.target.value) || 1000))}
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-bold text-[#20043B] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  {/* Calculated Cost Notification */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#F0D8FF]">
                    <div>
                      <p className="text-xs font-bold text-[#20043B]">Total Advertising Amount:</p>
                      <p className="text-xs text-[#6B5B7E]">Calculated automatically based on {expectedViews.toLocaleString()} views</p>
                    </div>
                    <p className="text-2xl font-black text-[#FF6C4C]">
                      ₦{calculatedCost.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* 2. Ad Brief & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Ad Title / Campaign Name
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Wireless Earbuds Pro — Black Friday 40% Off"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Detailed Brief of the Advert Expectation
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what the creator must say or demonstrate in their video. (e.g. Show product unboxing, mention promo link in comments, state nationwide delivery)."
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>
                </div>

                {/* 3. Automatic Category Detection */}
                <div className="p-4 rounded-2xl bg-[#EFEEE3]/50 border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B5B7E]">
                      Automatically Detected Category:
                    </span>
                    <p className="text-xs font-black text-[#20043B] flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6C4C]" />
                      {autoCategory}
                    </p>
                  </div>
                  <select
                    value={autoCategory}
                    onChange={(e) => setAutoCategory(e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-gray-300 text-xs bg-white text-[#20043B]"
                  >
                    {AD_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Placement Option (Multiple Selection Supported) */}
                <div>
                  <label className="block text-xs font-bold text-[#20043B] mb-1.5">
                    How you want the ad to be placed by creators (Select all that apply):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: "STARTING", label: "1. Starting of content", desc: "First 15-30s intro mention" },
                      { key: "MIDDLE", label: "2. Middle of content", desc: "Mid-roll feature section" },
                      { key: "ENDING", label: "3. Ending of content", desc: "Final call-to-action & outro" },
                    ].map((item) => {
                      const selected = placements.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleTogglePlacement(item.key)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            selected
                              ? "border-[#FF6C4C] bg-[#FFF0ED] text-[#20043B] shadow-sm"
                              : "border-gray-200 bg-white text-[#6B5B7E] hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{item.label}</span>
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${selected ? "border-[#FF6C4C] bg-[#FF6C4C] text-white" : "border-gray-300"}`}>
                              {selected && "✓"}
                            </span>
                          </div>
                          <p className="text-[11px] mt-1 text-[#6B5B7E]">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Promotion Call To Actions */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#20043B]">
                    Promotion Call to Action (CTA):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {[
                      { type: "PHONE", label: "Phone Number", icon: Phone },
                      { type: "WEBSITE", label: "Website Link", icon: Globe },
                      { type: "ADDRESS", label: "Business Address", icon: MapPin },
                      { type: "OTHER", label: "Other CTA", icon: OtherIcon },
                    ].map((c) => {
                      const Icon = c.icon;
                      return (
                        <button
                          key={c.type}
                          type="button"
                          onClick={() => setCtaType(c.type)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            ctaType === c.type
                              ? "bg-[#20043B] text-white border-[#20043B]"
                              : "bg-white text-[#20043B] border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    required
                    value={ctaValue}
                    onChange={(e) => setCtaValue(e.target.value)}
                    placeholder={
                      ctaType === "PHONE"
                        ? "+234 801 234 5678 (WhatsApp / Call line)"
                        : ctaType === "WEBSITE"
                        ? "https://yourwebsite.com/promo"
                        : ctaType === "ADDRESS"
                        ? "12 Allen Avenue, Ikeja, Lagos"
                        : "Describe custom CTA expectation"
                    }
                    className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                  />
                </div>

                {/* 6. Optional Flyer / Photo Upload Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#20043B]">
                    Upload Flyer or Promotional Photo (Optional)
                  </label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-gray-300 bg-[#EFEEE3]/30">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      <Image
                        src={flyerUrl || "/images/07-marketing-promo-banner.png"}
                        alt="Flyer preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-xs text-[#6B5B7E] space-y-1">
                      <p className="font-semibold text-[#20043B]">Feature graphic attached</p>
                      <p className="text-[11px]">Supports PNG, JPG, or promotional banner mockups.</p>
                      <button
                        type="button"
                        onClick={() => {
                          const samples = [
                            "/images/07-marketing-promo-banner.png",
                            "/images/04-advertiser-creator-promo-panel.png",
                            "/images/03-main-website-banner.png",
                          ];
                          const next = samples[(samples.indexOf(flyerUrl) + 1) % samples.length];
                          setFlyerUrl(next);
                        }}
                        className="text-[11px] font-bold text-[#FF6C4C] hover:underline"
                      >
                        Cycle sample creative flyer
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#FF6C4C] text-white text-sm font-black hover:bg-[#e85a3a] transition-all shadow-lg shadow-[#FF6C4C]/25 flex items-center justify-center gap-2"
                >
                  <span>Submit & Review Payment (₦{calculatedCost.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* PAYMENT MODAL (Spec: System saves ad and load payment modal for payment) */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 bg-[#20043B]/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#20043B]/10 space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#FFF0ED] text-[#FF6C4C] flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#20043B]">Payment Checkout</h3>
                  <p className="text-xs text-[#6B5B7E] mt-1">
                    Pay <strong>₦{calculatedCost.toLocaleString()}</strong> to submit your ad for approval
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B5B7E]">
                    <span>Expected Views:</span>
                    <span className="font-bold text-[#20043B]">{expectedViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#6B5B7E]">
                    <span>Rate:</span>
                    <span className="font-bold text-[#20043B]">₦5 per 1,000 views</span>
                  </div>
                  <div className="flex justify-between text-[#6B5B7E]">
                    <span>Your Current Balance:</span>
                    <span className="font-bold text-[#20043B]">₦{user?.balance?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[#F0D8FF] flex justify-between font-bold text-sm text-[#FF6C4C]">
                    <span>Amount Due:</span>
                    <span>₦{calculatedCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleConfirmAdPayment}
                    disabled={creatingAd}
                    className="w-full py-3.5 rounded-2xl bg-[#FF6C4C] text-white text-xs font-black hover:bg-[#e85a3a] transition-all shadow-md shadow-[#FF6C4C]/25 disabled:opacity-50"
                  >
                    {creatingAd ? "Processing Payment..." : `Pay ₦${calculatedCost.toLocaleString()} & Submit Ad`}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#6B5B7E] hover:text-[#20043B]"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-[10px] text-center text-[#6B5B7E]">
                  Upon successful payment, your ad moves to Admin Approval and gets published for creators once approved.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MY ADS (Manage: Pause, Stop, Delete, Deduction Count) */}
          {activeTab === "ads" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#20043B]">Manage Advertisements</h2>
                  <p className="text-xs text-[#6B5B7E] mt-1">
                    Pause, resume, stop, or delete active and pending campaigns.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-4 py-2 bg-[#FF6C4C] text-white text-xs font-bold rounded-xl self-start sm:self-auto"
                >
                  + New Ad
                </button>
              </div>

              {ads.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-[#6B5B7E]">No ads placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-5 rounded-2xl border border-gray-200 hover:border-[#FF6C4C]/40 transition-all bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
                          <Image
                            src={ad.flyerUrl || "/images/07-marketing-promo-banner.png"}
                            alt={ad.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                ad.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ad.status === "PENDING_APPROVAL"
                                  ? "bg-amber-100 text-amber-800"
                                  : ad.status === "PAUSED"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ad.status === "APPROVED" ? "LIVE / APPROVED" : ad.status}
                            </span>
                            <span className="text-[11px] font-semibold text-[#6B5B7E]">
                              {ad.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#20043B] mt-1">{ad.title}</h4>
                          <p className="text-xs text-[#6B5B7E] line-clamp-1 max-w-lg mt-0.5">
                            {ad.description}
                          </p>

                          {/* Progress & Deductions */}
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="font-semibold text-[#20043B]">
                              Views: <strong className="text-[#FF6C4C]">{ad.viewsDelivered.toLocaleString()}</strong> / {ad.expectedViews.toLocaleString()}
                            </span>
                            <span className="text-[#6B5B7E]">
                              Budget: ₦{ad.cost.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons: Pause, Stop, Delete */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {ad.status === "APPROVED" && (
                          <button
                            onClick={() => handleAdAction(ad.id, "PAUSE")}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#20043B] hover:bg-gray-50 flex items-center gap-1"
                            title="Pause ad delivery"
                          >
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </button>
                        )}

                        {ad.status === "PAUSED" && (
                          <button
                            onClick={() => handleAdAction(ad.id, "RESUME")}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1"
                            title="Resume ad delivery"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Resume</span>
                          </button>
                        )}

                        {ad.status !== "STOPPED" && (
                          <button
                            onClick={() => handleAdAction(ad.id, "STOP")}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-1"
                            title="Stop campaign permanently"
                          >
                            <Square className="w-3.5 h-3.5" />
                            <span>Stop</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleAdAction(ad.id, "DELETE")}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete ad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ONLY DEPOSIT OPTION (Spec: ADVERTISERS DASHBOARD MUST HAVE: Only deposit option) */}
          {activeTab === "deposit" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6C4C]">
                  Advertiser Deposit Only
                </span>
                <h2 className="text-2xl font-black text-[#20043B] mt-1">Wallet Top-up</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Top up your advertising balance to launch instant campaigns. Funds are deducted automatically as views are ordered.
                </p>
              </div>

              {depositSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{depositSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">
                      Enter Deposit Amount (₦ Naira)
                    </label>
                    <input
                      type="number"
                      required
                      min={500}
                      step={500}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 font-black text-lg text-[#20043B] bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[2000, 5000, 10000, 25000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-1.5 rounded-lg text-xs font-bold ${
                          depositAmount === amt ? "bg-[#FF6C4C] text-white" : "bg-gray-100 text-[#20043B]"
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={depositing}
                    className="w-full py-3.5 rounded-xl bg-[#FF6C4C] text-white text-xs font-black hover:bg-[#e85a3a] transition-all shadow-md shadow-[#FF6C4C]/25 disabled:opacity-50"
                  >
                    {depositing ? "Processing Deposit..." : `Deposit ₦${depositAmount.toLocaleString()}`}
                  </button>
                </form>

                <div className="p-5 rounded-2xl bg-[#FAF3FF] border border-[#F0D8FF] space-y-3">
                  <h4 className="text-xs font-bold text-[#20043B] uppercase tracking-wider">
                    Bank Transfer Details (Direct Deposit)
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#6B5B7E]">
                    <p><span className="font-semibold text-[#20043B]">Bank Name:</span> Wema Bank / Providus</p>
                    <p><span className="font-semibold text-[#20043B]">Account Number:</span> 0192837465</p>
                    <p><span className="font-semibold text-[#20043B]">Account Name:</span> ContentMonetizer Escrow NG</p>
                  </div>
                  <p className="text-[11px] text-[#6B5B7E]">
                    Deposits reflect instantly in your advertiser wallet upon automated transaction confirmation.
                  </p>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-black text-[#20043B] mb-3">Transaction History</h4>
                {transactions.length === 0 ? (
                  <p className="text-xs text-[#6B5B7E]">No transactions recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[#6B5B7E] text-[10px] uppercase font-bold">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2">Amount</th>
                          <th className="pb-2">Reference</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transactions.map((t) => (
                          <tr key={t.id}>
                            <td className="py-2.5 text-[#6B5B7E]">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 font-bold text-[#20043B]">{t.type}</td>
                            <td className={`py-2.5 font-black ${t.type === "DEPOSIT" ? "text-emerald-700" : "text-[#FF6C4C]"}`}>
                              {t.type === "DEPOSIT" ? "+" : "-"}₦{Number(t.amount).toLocaleString()}
                            </td>
                            <td className="py-2.5 text-[11px] text-[#6B5B7E]">{t.reference}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {t.status}
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

          {/* TAB 5: PROFILE & SETTINGS & PASSWORD CHANGE */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Profile & Password Settings</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Update your contact details or change your account security password.
                </p>
              </div>

              {settingsMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{settingsMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#20043B] mb-3">
                      Change Password
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-[#6B5B7E] mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B5B7E] mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#20043B] text-white text-xs font-bold hover:bg-[#32085c] transition-all"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: CONTACT SUPPORT */}
          {activeTab === "support" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Contact Support</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Have a question about ad delivery, deductions, or custom campaign requirements?
                </p>
              </div>

              {supportSent ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">Support Request Dispatched</p>
                  <p>Our account management team will review your inquiry and get back to you shortly.</p>
                  <button
                    onClick={() => setSupportSent(false)}
                    className="mt-2 text-xs font-bold text-emerald-700 underline"
                  >
                    Submit another inquiry
                  </button>
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
                      placeholder="e.g. Campaign deduction inquiry"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20043B] mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Detail your inquiry or request..."
                      className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-xs bg-[#EFEEE3]/30 focus:outline-none focus:ring-2 focus:ring-[#FF6C4C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl bg-[#FF6C4C] text-white text-xs font-bold hover:bg-[#e85a3a] transition-all"
                  >
                    Submit Ticket
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
