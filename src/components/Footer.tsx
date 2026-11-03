import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Megaphone, Users, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#20043B] text-white pt-16 pb-12 border-t border-[#3F1467]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-12 w-52 bg-[#EFEEE3] p-1.5 rounded-xl">
              <Image
                src="/images/01-primary-logo-concept.png"
                alt="ContentMonetizer"
                fill
                className="object-contain p-1"
              />
            </div>
            <p className="text-[#EFEEE3]/80 text-sm max-w-md leading-relaxed">
              Nigeria&apos;s two-sided content monetization marketplace. We empower businesses to reach massive targeted audiences starting at just ₦5 per 1,000 views, while giving verified Facebook content creators instant secondary income.
            </p>
            <div className="inline-block px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-[#F0D8FF]">
              Tagline: <span className="text-[#FF6C4C] font-bold">Advertise • Promote • Earn</span>
            </div>
          </div>

          {/* Quick Links Advertisers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FF6C4C] flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> For Advertisers
            </h4>
            <ul className="space-y-2 text-sm text-[#EFEEE3]/70">
              <li>
                <Link href="/register?role=ADVERTISER" className="hover:text-white transition-colors">
                  Place an Advert
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-white transition-colors">
                  Cost Calculator (₦5 / 1k views)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Advertiser Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Ad Placements & Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Creators */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F0D8FF] flex items-center gap-2">
              <Users className="w-4 h-4" /> For Content Creators
            </h4>
            <ul className="space-y-2 text-sm text-[#EFEEE3]/70">
              <li>
                <Link href="/register?role=CREATOR" className="hover:text-white transition-colors">
                  Apply for Creator Programme
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Page Verification (Min 5,000 followers)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Earnings & Withdrawals
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How Single-Ad Promotion Works
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#EFEEE3]/60 gap-4">
          <p>© 2026 ContentMonetizer.io. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-[#EFEEE3]/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Facebook Verified Network
            </span>
            <span>Built for Creators & Brands</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
