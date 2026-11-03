"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Eye, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export default function PricingCalculator() {
  const [views, setViews] = useState<number>(100000);

  // Rate: ₦5 per 1,000 views
  const cost = (views / 1000) * 5;
  const creatorPayout = (views / 1000) * 4.5; // ₦4.50 to creators (90%)
  const estimatedCreators = Math.max(1, Math.round(views / 25000));

  const presets = [
    { label: "20,000 Views", value: 20000 },
    { label: "50,000 Views", value: 50000 },
    { label: "100,000 Views", value: 100000 },
    { label: "250,000 Views", value: 250000 },
    { label: "500,000 Views", value: 500000 },
    { label: "1,000,000 Views", value: 1000000 },
  ];

  return (
    <div id="calculator" className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#20043B]/10 card-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0ED] text-[#FF6C4C] mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Guaranteed Flat Transparent Rate</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#20043B]">
            Interactive Ad Cost & Reach Calculator
          </h3>
          <p className="text-sm text-[#6B5B7E] mt-1">
            Grow your brand across Nigeria without breaking the bank. Flat rate of <strong>₦5 per 1,000 views</strong>.
          </p>
        </div>

        <div className="bg-[#FAF3FF] px-4 py-3 rounded-2xl border border-[#F0D8FF] text-right">
          <p className="text-xs uppercase font-bold text-[#6B5B7E] tracking-wider">Official Rate</p>
          <p className="text-xl font-extrabold text-[#20043B]">₦5.00 <span className="text-xs font-normal text-[#6B5B7E]">/ 1k views</span></p>
        </div>
      </div>

      {/* Preset selector */}
      <div className="my-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5B7E] mb-3">
          Quick Preset View Targets:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setViews(p.value)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                views === p.value
                  ? "bg-[#FF6C4C] text-white shadow-md shadow-[#FF6C4C]/30 scale-105"
                  : "bg-[#EFEEE3] text-[#20043B] hover:bg-[#F0D8FF]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider & Custom Input */}
      <div className="space-y-4 my-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#20043B] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#FF6C4C]" />
            Slide or Type Expected Views:
          </span>
          <div className="flex items-center gap-1 bg-[#EFEEE3] px-3 py-1.5 rounded-xl border border-gray-200">
            <input
              type="number"
              min={1000}
              step={1000}
              value={views}
              onChange={(e) => setViews(Math.max(1000, Number(e.target.value) || 1000))}
              className="w-28 text-right font-extrabold text-base bg-transparent focus:outline-none text-[#20043B]"
            />
            <span className="text-xs font-bold text-[#6B5B7E]">views</span>
          </div>
        </div>

        <input
          type="range"
          min={5000}
          max={1000000}
          step={5000}
          value={views}
          onChange={(e) => setViews(Number(e.target.value))}
          className="w-full h-3 bg-[#F0D8FF] rounded-lg appearance-none cursor-pointer accent-[#FF6C4C]"
        />
        <div className="flex justify-between text-[11px] text-[#6B5B7E] font-medium">
          <span>5,000 views (₦25)</span>
          <span>250,000 views (₦1,250)</span>
          <span>500,000 views (₦2,500)</span>
          <span>1,000,000 views (₦5,000)</span>
        </div>
      </div>

      {/* Result Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="bg-[#FAF3FF] p-5 rounded-2xl border border-[#F0D8FF] relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B5B7E]">Total Advertising Cost</p>
          <p className="text-3xl font-black text-[#20043B] mt-1">
            ₦{cost.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#6B5B7E] mt-1">
            Zero hidden fees. Flat ₦5/1,000 views.
          </p>
          <Sparkles className="w-12 h-12 text-[#20043B]/5 absolute -right-2 -bottom-2" />
        </div>

        <div className="bg-[#FFF0ED] p-5 rounded-2xl border border-[#FF6C4C]/20 relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FF6C4C]">Direct Creator Reach</p>
          <p className="text-3xl font-black text-[#FF6C4C] mt-1">
            ~{estimatedCreators} {estimatedCreators === 1 ? "Creator" : "Creators"}
          </p>
          <p className="text-[11px] text-[#6B5B7E] mt-1">
            Verified Facebook pages with 5,000+ followers.
          </p>
          <TrendingUp className="w-12 h-12 text-[#FF6C4C]/10 absolute -right-2 -bottom-2" />
        </div>

        <div className="bg-[#EFEEE3] p-5 rounded-2xl border border-gray-200 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#20043B]">Creator Payout Pool</p>
            <p className="text-2xl font-black text-[#20043B] mt-1">
              ₦{creatorPayout.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 90% direct creator revenue share
            </p>
          </div>
          <Link
            href={`/register?role=ADVERTISER&views=${views}`}
            className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#FF6C4C] text-white text-xs font-bold text-center hover:bg-[#e85a3a] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#FF6C4C]/20"
          >
            <span>Launch This Ad</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
