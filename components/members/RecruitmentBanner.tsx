"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RecruitmentBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative w-full max-w-2xl mx-auto mb-8 rounded-2xl border border-pbborder bg-pbgray py-8 sm:py-10 px-6 sm:px-9 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left transition-all duration-300 hover:border-pbgreen/50 hover:shadow-[0_0_20px_rgba(55,255,0,0.1)]"
    >
      {/* Content */}
      <div className="flex flex-col items-center sm:items-start gap-2 max-w-md">
        <h3 className="text-lg sm:text-xl font-lexend font-bold text-white leading-snug">
          Registrations are open for <span className="text-pbgreen">recruitment!</span>
        </h3>
        <p className="text-xs sm:text-sm text-pbtext leading-relaxed">
          Join Point Blank developer community &amp; start building with us.
        </p>
      </div>

      {/* Action Button */}
      <Link
        href="/recruitment"
        className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-pbgreen text-black font-semibold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] shrink-0 w-full sm:w-auto"
      >
        <span>Apply Now</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
      </Link>
    </motion.div>
  );
}
