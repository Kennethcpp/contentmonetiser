"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADVERTISER" | "CREATOR" | "ADMIN";
  status: string;
  balance: number;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleDemoSwitch = async (role: string) => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setDemoMenuOpen(false);
        if (data.user.role === "ADVERTISER") {
          router.push("/advertiser");
        } else if (data.user.role === "CREATOR") {
          router.push("/creator");
        } else if (data.user.role === "ADMIN") {
          router.push("/admin");
        }
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "CREATOR") return "/creator";
    return "/advertiser";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#EFEEE3]/90 backdrop-blur-md border-b border-[#20043B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-44 sm:w-52 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/images/01-primary-logo-concept.png"
              alt="ContentMonetizer"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#20043B]">
          <Link
            href="/#advertisers"
            className="hover:text-[#FF6C4C] transition-colors"
          >
            For Advertisers
          </Link>
          <Link
            href="/#creators"
            className="hover:text-[#FF6C4C] transition-colors"
          >
            For Creators
          </Link>
          <Link
            href="/#calculator"
            className="hover:text-[#FF6C4C] transition-colors"
          >
            Pricing & ROI
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-[#FF6C4C] transition-colors"
          >
            How It Works
          </Link>
        </nav>

        {/* Actions & Role Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Demo Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F0D8FF] text-[#20043B] hover:bg-[#e4c4fc] transition-colors border border-[#20043B]/15"
              title="Switch demo test accounts"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6C4C]" />
              <span>Demo Persona</span>
              <ChevronDown className="w-3 h-3 text-[#20043B]/60" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-[#20043B]/10 p-2 z-50">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B5B7E] px-3 py-1.5">
                  1-Click Test Switch
                </p>
                <button
                  onClick={() => handleDemoSwitch("ADVERTISER")}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#FFF0ED] hover:text-[#FF6C4C] transition-colors flex items-center justify-between"
                >
                  <span>Advertiser (TechBrand)</span>
                  <span className="text-[10px] bg-[#FF6C4C]/10 text-[#FF6C4C] px-1.5 py-0.5 rounded-md font-bold">₦25k</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch("CREATOR")}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#FAF3FF] hover:text-[#20043B] transition-colors flex items-center justify-between"
                >
                  <span>Creator (Lagos Buzz TV)</span>
                  <span className="text-[10px] bg-[#F0D8FF] text-[#20043B] px-1.5 py-0.5 rounded-md font-bold">34.5k</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch("CREATOR_PENDING")}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors flex items-center justify-between"
                >
                  <span>Creator (Pending Review)</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">12k</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch("ADMIN")}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-[#20043B]/5 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-[#20043B]">Admin Console</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#20043B]" />
                </button>
              </div>
            )}
          </div>

          {!loading && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs bg-[#20043B] text-white hover:bg-[#32085c] transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>
                  {user.role === "ADMIN"
                    ? "Admin Portal"
                    : user.role === "CREATOR"
                    ? "Creator Dashboard"
                    : "Advertiser Portal"}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-[#20043B]/70 hover:text-[#FF6C4C] hover:bg-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-[#20043B] hover:text-[#FF6C4C] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register?role=CREATOR"
                className="px-4 py-2 text-xs font-semibold rounded-full bg-[#F0D8FF] text-[#20043B] border border-[#20043B]/20 hover:bg-[#e4c4fc] transition-all"
              >
                Join as Creator
              </Link>
              <Link
                href="/register?role=ADVERTISER"
                className="px-4.5 py-2 text-xs font-bold rounded-full bg-[#FF6C4C] text-white hover:bg-[#e85a3a] transition-all shadow-md shadow-[#FF6C4C]/25"
              >
                Place Advert &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#20043B] hover:bg-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#20043B]/10 px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-3 font-semibold text-sm text-[#20043B]">
            <Link
              href="/#advertisers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1"
            >
              For Advertisers
            </Link>
            <Link
              href="/#creators"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1"
            >
              For Creators
            </Link>
            <Link
              href="/#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1"
            >
              Pricing & ROI Calculator
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1"
            >
              How It Works
            </Link>
          </nav>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl font-bold bg-[#20043B] text-white text-sm"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2 text-sm text-[#FF6C4C] font-semibold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register?role=ADVERTISER"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl font-bold bg-[#FF6C4C] text-white text-sm"
                >
                  Place Advert (From ₦5 / 1k views)
                </Link>
                <Link
                  href="/register?role=CREATOR"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl font-semibold bg-[#F0D8FF] text-[#20043B] text-sm"
                >
                  Apply as Content Creator
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm text-[#20043B] font-semibold"
                >
                  Sign In to Account
                </Link>
              </>
            )}

            <div className="pt-3 border-t border-gray-100">
              <p className="text-[11px] font-bold text-[#6B5B7E] mb-2">Demo Role Switch:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDemoSwitch("ADVERTISER");
                  }}
                  className="py-1.5 px-2 bg-[#FFF0ED] text-[#FF6C4C] font-semibold rounded-lg text-center"
                >
                  Advertiser
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDemoSwitch("CREATOR");
                  }}
                  className="py-1.5 px-2 bg-[#F0D8FF] text-[#20043B] font-semibold rounded-lg text-center"
                >
                  Creator
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDemoSwitch("ADMIN");
                  }}
                  className="py-1.5 px-2 bg-gray-100 text-gray-800 font-semibold rounded-lg text-center"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
