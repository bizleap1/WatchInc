"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, RefreshCw, Sparkles, CheckCircle, Percent, Users, Layers } from "lucide-react";

interface AnalyticsData {
  totalRegistrations: number;
  plateInterest: {
    yes: number;
    no: number;
    maybe: number;
    unanswered: number;
    answeredTotal: number;
    yesPercent: number;
    sharePercent: number;
    formulaNote: string;
  };
  stoneBreakdown: {
    overflow: number;
    cherish: number;
    hush: number;
    ascent: number;
    wildfire: number;
    cadence: number;
    undecided: number;
  };
}

const STONE_METADATA: Record<string, { name: string; stone: string; color: string }> = {
  overflow: { name: "Overflow", stone: "Citrine", color: "#E8A33D" },
  cherish: { name: "Cherish", stone: "Rose Quartz", color: "#E9B4B8" },
  hush: { name: "Hush", stone: "Amethyst", color: "#A98BD9" },
  ascent: { name: "Ascent", stone: "Tiger's Eye", color: "#C68A3E" },
  wildfire: { name: "Wildfire", stone: "Sunstone", color: "#F0773A" },
  cadence: { name: "Cadence", stone: "Sodalite", color: "#7E9CC4" },
  undecided: { name: "General Allocation", stone: "All Stones", color: "#8E8E93" },
};

export default function AdminWaitlistPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [records, setRecords] = useState<any[]>([]);

  const fetchRegistryData = async (pwd: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }
      setAnalytics(data.analytics);
      setRecords(data.records || []);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("atelier_admin_token", pwd);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid security password.");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("atelier_admin_token");
      if (saved) {
        setPassword(saved);
        fetchRegistryData(saved);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    fetchRegistryData(password);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("atelier_admin_token");
    }
    setIsAuthenticated(false);
    setAnalytics(null);
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#EDE8DF] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#121215] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E8A33D]">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl text-[#EDE8DF] font-light">
              Curator Registry
            </h1>
            <p className="font-mono text-xs text-[#EDE8DF]/50 uppercase tracking-widest">
              Watch Inc · RESTRICTED ACCESS
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-[#EDE8DF]/60">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#18181C] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#EDE8DF] placeholder-[#EDE8DF]/30 focus:outline-none focus:border-[#E8A33D] transition-colors font-mono"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg bg-[#E8A33D] text-[#0B0B0C] font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#f3b55c] transition-all disabled:opacity-50"
            >
              {isLoading ? "AUTHENTICATING..." : "UNLOCK REGISTRY"}
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="font-mono text-xs text-[#EDE8DF]/40 hover:text-[#EDE8DF] transition-colors"
            >
              ← Return to public store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const plateInterest = analytics?.plateInterest;
  const stoneBreakdown = analytics?.stoneBreakdown;
  const total = analytics?.totalRegistrations || 0;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#EDE8DF] p-6 sm:p-12 space-y-12">
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg border border-white/10 hover:border-white/20 text-[#EDE8DF]/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-serif text-3xl font-light text-[#EDE8DF]">
              Waitlist Registry & Conversion Intelligence
            </h1>
          </div>
          <p className="font-mono text-xs text-[#EDE8DF]/50 tracking-wider">
            ATELIER CURATOR DASHBOARD · REAL-TIME ALLOCATION METRICS
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => fetchRegistryData(password)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 text-[#EDE8DF]/80 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>SYNC</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            LOCK
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-10">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Metric 1: Selenite Plate Conversion % (THE METRIC YOU ARE TRACKING) */}
          <div className="p-6 rounded-2xl border border-[#E8A33D]/40 bg-gradient-to-br from-[#1C1712] to-[#121215] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E8A33D]">
                CORE TARGET METRIC
              </span>
              <Percent className="w-4 h-4 text-[#E8A33D]" />
            </div>

            <div className="space-y-1">
              <div className="font-serif text-5xl font-light text-[#EDE8DF]">
                {plateInterest?.yesPercent ?? 0}%
              </div>
              <p className="font-serif italic text-sm text-[#E8A33D]">
                Selenite Resting Plate &ldquo;YES&rdquo; Share
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 font-mono text-[11px] text-[#EDE8DF]/60 space-y-1">
              <div className="flex justify-between">
                <span>Yes Responses:</span>
                <span className="text-[#EDE8DF] font-semibold">{plateInterest?.yes ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered Denominator:</span>
                <span>{plateInterest?.answeredTotal ?? 0}</span>
              </div>
              <p className="text-[10px] text-[#EDE8DF]/40 italic pt-1">
                Formula: Yes / (Yes + No + Maybe). Excludes unanswered.
              </p>
            </div>
          </div>

          {/* Metric 2: Total Priority Signups */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121215] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#EDE8DF]/50">
                TOTAL INTENTIONS
              </span>
              <Users className="w-4 h-4 text-[#EDE8DF]/60" />
            </div>

            <div className="space-y-1">
              <div className="font-serif text-5xl font-light text-[#EDE8DF]">
                {total}
              </div>
              <p className="font-serif italic text-sm text-[#EDE8DF]/60">
                Verified Subscribers on Registry
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 font-mono text-[11px] text-[#EDE8DF]/60 space-y-1">
              <div className="flex justify-between">
                <span>Maximum Total Quarry:</span>
                <span>1,800 pieces (6 × 300)</span>
              </div>
              <div className="flex justify-between">
                <span>Global Registry Fill:</span>
                <span>{((total / 1800) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Selenite Attitude Breakdown */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#121215] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#EDE8DF]/50">
                PLATE ATTITUDES
              </span>
              <Layers className="w-4 h-4 text-[#EDE8DF]/60" />
            </div>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#EDE8DF]/80">YES (+$180):</span>
                <span className="text-[#E8A33D] font-bold">{plateInterest?.yes ?? 0}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#E8A33D] h-full transition-all duration-500"
                  style={{
                    width: `${plateInterest?.answeredTotal ? ((plateInterest.yes / plateInterest.answeredTotal) * 100) : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[#EDE8DF]/80">MAYBE:</span>
                <span>{plateInterest?.maybe ?? 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#EDE8DF]/80">NO:</span>
                <span>{plateInterest?.no ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signups Per Stone Breakdown */}
        <section className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121215] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-light text-[#EDE8DF]">
                Signups Per Stone Intention
              </h2>
              <p className="font-serif italic text-xs text-[#EDE8DF]/50">
                Intentions distributed across the six natural stone chapters (each limited to 300).
              </p>
            </div>
            <span className="font-mono text-xs text-[#EDE8DF]/40">
              ALLOCATION CEILING: 300 / STONE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(STONE_METADATA).map(([key, meta]) => {
              if (key === "undecided" && !stoneBreakdown?.[key as keyof typeof stoneBreakdown]) return null;
              const count = stoneBreakdown ? (stoneBreakdown[key as keyof typeof stoneBreakdown] || 0) : 0;
              const percentOfMax = ((count / 300) * 100).toFixed(1);

              return (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="font-serif text-sm font-medium text-[#EDE8DF]">
                        {meta.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#EDE8DF]">
                      {count} <span className="text-[#EDE8DF]/40 font-normal">/ 300</span>
                    </span>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: meta.color,
                        width: `${Math.min(100, Number(percentOfMax))}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between font-mono text-[10px] text-[#EDE8DF]/50">
                    <span className="uppercase">{meta.stone}</span>
                    <span>{percentOfMax}% of edition</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Privacy-Preserving Registry Log */}
        <section className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121215] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl font-light text-[#EDE8DF]">
              Recent Registry Records
            </h2>
            <span className="font-mono text-xs text-[#EDE8DF]/40">
              MASKED FOR SECURITY
            </span>
          </div>

          {records.length === 0 ? (
            <p className="font-serif italic text-sm text-[#EDE8DF]/50 py-6 text-center">
              No registry submissions recorded yet. Submissions from the waitlist form will populate here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#EDE8DF]/40">
                    <th className="py-3 px-2">TIMESTAMP</th>
                    <th className="py-3 px-2">SUBSCRIBER</th>
                    <th className="py-3 px-2">STONE INTENTIONS</th>
                    <th className="py-3 px-2">SELENITE INTEREST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-2 text-[#EDE8DF]/50">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-[#EDE8DF]">
                        {rec.name} ({rec.emailMasked})
                      </td>
                      <td className="py-3 px-2 text-[#E8A33D]">
                        {Array.isArray(rec.stones) ? rec.stones.join(", ").toUpperCase() : "GENERAL"}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            rec.restingPlateInterest === "yes"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                              : rec.restingPlateInterest === "maybe"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                              : "bg-white/5 text-[#EDE8DF]/60"
                          }`}
                        >
                          {rec.restingPlateInterest}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
