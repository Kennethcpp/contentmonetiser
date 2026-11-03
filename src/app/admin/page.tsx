"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Megaphone,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Eye,
  TrendingUp,
  Clock,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

interface AdminData {
  metrics: {
    users: any[];
    ads: any[];
    withdrawals: any[];
    promotions: any[];
  };
  pendingCreators: any[];
  allCreators: any[];
  pendingAds: any[];
  allAds: any[];
  pendingWithdrawals: any[];
}

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "creators" | "ads" | "withdrawals">("overview");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdminAction = async (action: string, targetId: string) => {
    setActionMsg(null);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId }),
      });
      const result = await res.json();
      if (res.ok) {
        setActionMsg(result.message);
        await loadAdminData();
      } else {
        alert(result.error || "Action failed");
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

  const pendingCreatorsCount = data?.pendingCreators?.length || 0;
  const pendingAdsCount = data?.pendingAds?.length || 0;
  const pendingWithdrawalsCount = data?.pendingWithdrawals?.filter((w) => w.status === "PENDING").length || 0;

  return (
    <div className="min-h-screen bg-[#EFEEE3] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#20043B] text-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="block">
              <div className="relative h-10 w-44 bg-[#EFEEE3] p-1 rounded-xl">
                <Image
                  src="/images/01-primary-logo-concept.png"
                  alt="ContentMonetizer"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-[#F0D8FF] w-fit">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF6C4C]" />
              <span>Admin Management</span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 font-semibold text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "overview"
                  ? "bg-white/15 text-white font-extrabold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#F0D8FF]" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("creators")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                activeTab === "creators"
                  ? "bg-white/15 text-white font-extrabold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#F0D8FF]" />
                <span>Creators</span>
              </div>
              {pendingCreatorsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px]">
                  {pendingCreatorsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("ads")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                activeTab === "ads"
                  ? "bg-white/15 text-white font-extrabold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4 text-[#FF6C4C]" />
                <span>Advertisements</span>
              </div>
              {pendingAdsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FF6C4C] text-white font-black text-[10px]">
                  {pendingAdsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                activeTab === "withdrawals"
                  ? "bg-white/15 text-white font-extrabold"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Withdrawals</span>
              </div>
              {pendingWithdrawalsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-[10px]">
                  {pendingWithdrawalsCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-8">
          {actionMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {actionMsg}
              </span>
              <button onClick={() => setActionMsg(null)} className="font-bold">
                ✕
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-black text-[#20043B]">Admin Console</h1>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Manage marketplace operations, approve creators & advertisements, process payouts.
                </p>
              </div>

              {/* Action Alert Banner */}
              {(pendingCreatorsCount > 0 || pendingAdsCount > 0 || pendingWithdrawalsCount > 0) && (
                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" /> Pending Approvals Requiring Action:
                    </h3>
                    <p className="text-xs text-amber-800">
                      • {pendingCreatorsCount} creator applications waiting review<br />
                      • {pendingAdsCount} advertiser campaigns waiting approval<br />
                      • {pendingWithdrawalsCount} creator withdrawal payouts pending
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {pendingCreatorsCount > 0 && (
                      <button
                        onClick={() => setActiveTab("creators")}
                        className="px-4 py-2 rounded-xl bg-[#20043B] text-white text-xs font-bold"
                      >
                        Review Creators
                      </button>
                    )}
                    {pendingAdsCount > 0 && (
                      <button
                        onClick={() => setActiveTab("ads")}
                        className="px-4 py-2 rounded-xl bg-[#FF6C4C] text-white text-xs font-bold"
                      >
                        Review Ads
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                    Creators Enrolled
                  </span>
                  <p className="text-3xl font-black text-[#20043B] mt-2">
                    {data?.allCreators?.length || 0}
                  </p>
                  <p className="text-[11px] text-[#6B5B7E] mt-1">
                    {data?.allCreators?.filter((c) => c.status === "APPROVED").length} approved & active
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                    Total Advertisements
                  </span>
                  <p className="text-3xl font-black text-[#FF6C4C] mt-2">
                    {data?.allAds?.length || 0}
                  </p>
                  <p className="text-[11px] text-[#6B5B7E] mt-1">
                    {data?.allAds?.filter((a) => a.status === "APPROVED").length} live in marketplace
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                    Pending Ad Reviews
                  </span>
                  <p className="text-3xl font-black text-amber-600 mt-2">
                    {pendingAdsCount}
                  </p>
                  <p className="text-[11px] text-[#6B5B7E] mt-1">Awaiting moderator sign-off</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#20043B]/10 card-shadow">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">
                    Pending Creator Applications
                  </span>
                  <p className="text-3xl font-black text-[#20043B] mt-2">
                    {pendingCreatorsCount}
                  </p>
                  <p className="text-[11px] text-[#6B5B7E] mt-1">Min 5,000 FB follower verified</p>
                </div>
              </div>
            </div>
          )}

          {/* CREATORS TAB (Review applications, check 5k+ followers requirement) */}
          {activeTab === "creators" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Creator Applications & Management</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Inspect applicant Facebook page details and approve or reject access.
                </p>
              </div>

              {/* Pending Creators First */}
              {pendingCreatorsCount > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">
                    Waiting Approval ({pendingCreatorsCount})
                  </h3>
                  <div className="space-y-3">
                    {data?.pendingCreators?.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-[#20043B]">{c.name}</span>
                            <span className="text-xs text-[#6B5B7E]">({c.email})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <FacebookIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                            <a
                              href={c.facebookPageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#20043B] hover:underline flex items-center gap-1"
                            >
                              <span>{c.facebookPageName}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {c.facebookFollowers?.toLocaleString()} Followers
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B5B7E]">
                            Categories: {c.categories ? JSON.parse(c.categories).join(", ") : "N/A"}
                          </p>
                        </div>

                        <div className="flex gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleAdminAction("APPROVE_CREATOR", c.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAdminAction("REJECT_CREATOR", c.id)}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Creators Table */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <h3 className="text-sm font-bold text-[#20043B]">All Enrolled Creators</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#6B5B7E] uppercase text-[10px] font-bold">
                        <th className="pb-3">Creator Name</th>
                        <th className="pb-3">Facebook Page</th>
                        <th className="pb-3">Followers</th>
                        <th className="pb-3">Balance</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data?.allCreators?.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 font-bold text-[#20043B]">{c.name}</td>
                          <td className="py-3 text-[#20043B]">{c.facebookPageName}</td>
                          <td className="py-3 font-semibold">{c.facebookFollowers?.toLocaleString()}</td>
                          <td className="py-3 font-black text-emerald-700">₦{Number(c.balance || 0).toLocaleString()}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADVERTISEMENTS TAB */}
          {activeTab === "ads" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Advertisement Approval & Moderation</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Once approved, advertisements appear on creators&apos; dashboards for pickup.
                </p>
              </div>

              {pendingAdsCount > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#FF6C4C] uppercase tracking-wider">
                    Waiting Approval ({pendingAdsCount})
                  </h3>
                  <div className="space-y-4">
                    {data?.pendingAds?.map((ad) => (
                      <div
                        key={ad.id}
                        className="p-5 rounded-2xl bg-[#FFF0ED]/40 border border-[#FF6C4C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-[#FF6C4C]">
                            {ad.category} • Placed by {ad.advertiserName}
                          </span>
                          <h4 className="font-bold text-sm text-[#20043B]">{ad.title}</h4>
                          <p className="text-xs text-[#6B5B7E] max-w-lg leading-relaxed">{ad.description}</p>
                          <div className="flex items-center gap-3 text-xs pt-1">
                            <span className="font-semibold text-[#20043B]">
                              Views: {ad.expectedViews.toLocaleString()}
                            </span>
                            <span className="font-bold text-emerald-700">
                              Budget: ₦{Number(ad.cost).toLocaleString()}
                            </span>
                            <span className="text-[#6B5B7E]">
                              CTA: {ad.ctaType} ({ad.ctaValue})
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleAdminAction("APPROVE_AD", ad.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Publish</span>
                          </button>
                          <button
                            onClick={() => handleAdminAction("REJECT_AD", ad.id)}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Ads */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <h3 className="text-sm font-bold text-[#20043B]">All Advertisements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-[#6B5B7E] uppercase text-[10px] font-bold">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Advertiser</th>
                        <th className="pb-3">Target Views</th>
                        <th className="pb-3">Delivered</th>
                        <th className="pb-3">Budget</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data?.allAds?.map((ad) => (
                        <tr key={ad.id}>
                          <td className="py-3 font-bold text-[#20043B] max-w-xs truncate">{ad.title}</td>
                          <td className="py-3 text-[#6B5B7E]">{ad.advertiserName}</td>
                          <td className="py-3 font-semibold">{ad.expectedViews.toLocaleString()}</td>
                          <td className="py-3 font-bold text-[#FF6C4C]">{ad.viewsDelivered.toLocaleString()}</td>
                          <td className="py-3 font-semibold">₦{Number(ad.cost).toLocaleString()}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ad.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ad.status === "PENDING_APPROVAL"
                                  ? "bg-amber-100 text-amber-800"
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
              </div>
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === "withdrawals" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#20043B]/10 card-shadow space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#20043B]">Creator Withdrawal Requests</h2>
                <p className="text-xs text-[#6B5B7E] mt-1">
                  Process bank payouts to creators for verified advertising impressions.
                </p>
              </div>

              {data?.pendingWithdrawals?.length === 0 ? (
                <p className="text-xs text-[#6B5B7E]">No withdrawal requests found.</p>
              ) : (
                <div className="space-y-3">
                  {data?.pendingWithdrawals?.map((w) => (
                    <div
                      key={w.id}
                      className="p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#20043B]">
                            ₦{Number(w.amount).toLocaleString()}
                          </span>
                          <span className="text-xs text-[#6B5B7E]">by {w.creatorName} ({w.facebookPageName})</span>
                        </div>
                        <p className="text-xs text-[#20043B]">
                          <strong>Bank:</strong> {w.bankName} • <strong>Acct:</strong> {w.accountNumber} ({w.accountName})
                        </p>
                        <p className="text-[10px] text-[#6B5B7E]">
                          Requested: {new Date(w.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        {w.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleAdminAction("APPROVE_WITHDRAWAL", w.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleAdminAction("REJECT_WITHDRAWAL", w.id)}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                            >
                              Reject & Refund
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              w.status === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {w.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
