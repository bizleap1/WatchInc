import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE_CONFIG } from "@/data/site-config";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-6 py-24 select-none">
      <div className="max-w-lg w-full border border-white/[0.12] p-8 sm:p-12 space-y-8">
        <div className="flex items-center justify-between border-b border-white/[0.12] pb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            RECORD 404
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#E3A93A]">
            {SITE_CONFIG.brandName}
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl text-white uppercase">
          DIAL NOT FOUND.
        </h1>

        <p className="font-sans text-[13px] text-white/50 leading-relaxed">
          The page or edition record you requested does not exist. Explore the six natural stone watches below.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-sans text-[10px] uppercase tracking-[0.16em]">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#0A0A0B] hover:bg-white/90 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN HOME</span>
          </Link>
          <Link
            href="/#selenite"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/[0.2] text-white hover:border-white transition-colors"
          >
            <span>SELENITE</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
