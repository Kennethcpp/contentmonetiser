"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingCalculator from "@/components/PricingCalculator";
import {
  Megaphone,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  BadgeCheck,
  Coins,
} from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EFEEE3]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-[#F0D8FF]/30 via-[#EFEEE3] to-[#EFEEE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Marketing Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badges row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF3FF] text-[#20043B] border border-[#20043B]/15">
                  <Megaphone className="w-3.5 h-3.5 text-[#FF6C4C]" /> For Advertisers
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF3FF] text-[#20043B] border border-[#20043B]/15">
                  <Users className="w-3.5 h-3.5 text-[#20043B]" /> For Creators
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safe & Secure
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#20043B] tracking-tight leading-[1.12]">
                Turn Your Content <br />
                into <span className="text-[#FF6C4C] underline decoration-[#F0D8FF] decoration-wavy underline-offset-8">Real Income!</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-[#6B5B7E] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Advertise smart. Promote great brands. Earn effortlessly. Nigeria&apos;s most affordable marketing marketplace connecting businesses with verified Facebook creators.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register?role=ADVERTISER"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF6C4C] text-white text-base font-extrabold hover:bg-[#e85a3a] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#FF6C4C]/30 flex items-center justify-center gap-2"
                >
                  <span>Place Advert Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register?role=CREATOR"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#F0D8FF] text-[#20043B] text-base font-bold border border-[#20043B]/20 hover:bg-[#e4c4fc] transition-all flex items-center justify-center gap-2"
                >
                  <FacebookIcon className="w-4 h-4 text-[#20043B]" />
                  <span>Join as Creator (5k+ Followers)</span>
                </Link>
              </div>

              {/* Bullet highlights */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6C4C] shrink-0" />
                  <span>₦5 per 1,000 views rate</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6C4C] shrink-0" />
                  <span>Auto-verified FB pages</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6C4C] shrink-0" />
                  <span>Instant 24hr payouts</span>
                </div>
              </div>
            </div>

            {/* Right Column: High Impact Banner Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/03-main-website-banner.png"
                  alt="ContentMonetizer — Turn your content into real income"
                  width={680}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Floating Stat Badges */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#20043B]/10 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0ED] text-[#FF6C4C] flex items-center justify-center font-bold">
                  ₦5
                </div>
                <div>
                  <p className="text-xs font-bold text-[#20043B]">Fixed Ultra-Low Cost</p>
                  <p className="text-[11px] text-[#6B5B7E]">Per 1,000 Guaranteed Views</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#20043B]/10 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0D8FF] text-[#20043B] flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-[#20043B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#20043B]">5,000+ Followers</p>
                  <p className="text-[11px] text-[#6B5B7E]">Quality Verified Facebook Pages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Sided Marketplace Panel (Matching 04-advertiser-creator-promo-panel.png) */}
      <section id="advertisers" className="py-16 bg-[#EFEEE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6C4C]">
              One Platform • Two Great Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#20043B] mt-2">
              For Advertisers & Creators
            </h2>
            <p className="text-[#6B5B7E] text-base mt-2">
              Whether you are an ambitious business scaling sales or a Facebook creator seeking secondary monetization, ContentMonetizer was built for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Advertiser Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-[#20043B]/10 card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FFF0ED] text-[#FF6C4C] flex items-center justify-center shadow-inner">
                  <Megaphone className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF6C4C]">For Advertisers</span>
                  <h3 className="text-2xl font-black text-[#20043B] mt-1">Advertise</h3>
                  <p className="text-[#6B5B7E] text-sm mt-2 leading-relaxed">
                    Reach millions of real buyers through trusted Nigerian Facebook creators with verified active engagement. Get maximum impressions at the country&apos;s lowest fixed rate.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6C4C]" />
                    <span>Flat ₦5 per 1,000 expected views</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6C4C]" />
                    <span>Choose Starting, Middle, or Ending video placement</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6C4C]" />
                    <span>Automatic ad category detection & flyer showcase</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6C4C]" />
                    <span>Live delivery metrics, pause & stop controls</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/register?role=ADVERTISER"
                  className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#FF6C4C] text-[#FF6C4C] font-extrabold text-sm text-center hover:bg-[#FF6C4C] hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Place Advert</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Creator Card */}
            <div id="creators" className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-[#20043B]/10 card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF3FF] text-[#20043B] flex items-center justify-center shadow-inner">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#20043B]">For Facebook Creators</span>
                  <h3 className="text-2xl font-black text-[#20043B] mt-1">Promote & Earn</h3>
                  <p className="text-[#6B5B7E] text-sm mt-2 leading-relaxed">
                    Monetize your audience immediately while you wait for large Facebook payout thresholds. Choose from approved advertisements that match your niche.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#20043B]" />
                    <span>Open to Facebook pages with 5,000+ followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#20043B]" />
                    <span>Single-ad focus: promote 1 active ad at a time</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#20043B]" />
                    <span>Transparent view tracking and proof verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20043B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#20043B]" />
                    <span>Direct bank account withdrawals in Naira</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/register?role=CREATOR"
                  className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#20043B] text-[#20043B] font-extrabold text-sm text-center hover:bg-[#20043B] hover:text-white transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Join as Creator</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & ROI Calculator Section */}
      <section className="py-16 bg-gradient-to-b from-[#EFEEE3] via-[#FAF3FF] to-[#EFEEE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingCalculator />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-[#EFEEE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6C4C]">
              Simple • Transparent • Fast
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#20043B] mt-2">
              How ContentMonetizer Works
            </h2>
            <p className="text-[#6B5B7E] text-base mt-2">
              Designed with fewer buttons, creative workflows, and clear steps so both brands and creators reach their performance goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Steps For Advertisers */}
            <div className="bg-white rounded-3xl p-8 border border-[#20043B]/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0ED] text-[#FF6C4C] flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#20043B]">3 Steps for Advertisers</h4>
                  <p className="text-xs text-[#6B5B7E]">From brief to published campaign</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#FF6C4C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#20043B]">Enter Target Views & Brief</h5>
                    <p className="text-xs text-[#6B5B7E] mt-1 leading-relaxed">
                      Type your expected views. Rate of ₦5 per 1,000 views calculates automatically. Choose placement (Beginning, Middle, Ending) and your CTA.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#FF6C4C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#20043B]">Pay & Move to Admin Approval</h5>
                    <p className="text-xs text-[#6B5B7E] mt-1 leading-relaxed">
                      Confirm payment with your wallet or bank checkout. Operations verifies the ad content to keep our network high quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#FF6C4C] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#20043B]">Creators Promote & You Track Views</h5>
                    <p className="text-xs text-[#6B5B7E] mt-1 leading-relaxed">
                      Once approved, relevant creators pick your ad. You get a live dashboard tracking real view counts, deductions, pause and stop options.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps For Creators */}
            <div className="bg-white rounded-3xl p-8 border border-[#20043B]/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FAF3FF] text-[#20043B] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-[#20043B]">3 Steps for Creators</h4>
                  <p className="text-xs text-[#6B5B7E]">From page check to cash withdrawal</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#20043B] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#20043B]">Connect Page (Min 5,000 Followers)</h5>
                    <p className="text-xs text-[#6B5B7E] mt-1 leading-relaxed">
                      Enter your Facebook page name or URL. The system automatically reads and verifies that your page has at least 5k active followers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#20043B] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#20043B]">Pick 1 Ad at a Time to Promote</h5>
                    <p className="text-xs text-[#6B5B7E] mt-1 leading-relaxed">
                      Browse approved marketplace ads. To protect quality, creators promote one active ad at a time. Post on your page and submit your link proof.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[#20043B] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#20043B]">Earn & Withdraw Directly to Bank</h5>
                    <p className="text-xs text-[#6B5B7E] mt-1 leading-relaxed">
                      Watch your earnings build up as views accumulate. Request instant withdrawals to your Nigerian commercial bank account anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Mockups Showcase (Matching 05-dashboard-mockup.png) */}
      <section className="py-16 bg-[#20043B] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6C4C]">
              Built for Modern Marketers & Creators
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2">
              Intuitive, High-Performance Dashboards
            </h2>
            <p className="text-[#EFEEE3]/70 text-sm mt-2">
              Clean visual metrics, real-time deduction logs, follower insights, and seamless payout processing.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
            <Image
              src="/images/05-dashboard-mockup.png"
              alt="ContentMonetizer Dashboard Interface"
              width={1024}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Bottom Conversion Curve Banner (Matching 04-advertiser-creator-promo-panel footer) */}
      <section className="bg-gradient-to-r from-[#FF6C4C] to-[#ff552e] py-14 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-serif italic text-2xl sm:text-3xl text-white/95 mb-4">
            Create. Promote. Earn.
          </p>
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to monetize or expand your reach?
          </h3>
          <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto mt-2 mb-8">
            Join hundreds of forward-thinking Nigerian businesses and Facebook creators growing their income today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=ADVERTISER"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#20043B] font-extrabold text-sm hover:bg-[#F0D8FF] transition-all shadow-lg"
            >
              Place Advert (₦5/1k views)
            </Link>
            <Link
              href="/register?role=CREATOR"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#20043B] text-white font-extrabold text-sm hover:bg-[#120224] transition-all shadow-lg"
            >
              Apply as Content Creator
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
