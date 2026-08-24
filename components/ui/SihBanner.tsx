"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Globe, FileText } from "lucide-react";
import Image from "next/image";
import { Lexend_Deca } from "next/font/google";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["700"],
});

export default function SihBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="group relative w-full rounded-2xl border-2 border-pbgreen/30 bg-black overflow-hidden transition-all duration-300 hover:border-pbgreen hover:shadow-[0_0_20px_rgba(55,255,0,0.2)]"
    >
      {/* ─── Content Container ─── */}
      <div className="relative w-full overflow-hidden">

        <div className="relative z-10 flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8">

          {/* ══ Header: Logos ══ */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14">
              <Image
                src="/images/icons/sih-icon.png"
                alt="SIH Logo"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative h-12 w-12 sm:h-14 sm:w-14">
              <Image
                src="/images/icons/DSCElogo.svg"
                alt="DSCE Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* ══ Title Section ══ */}
          <div className="flex flex-col items-start gap-3">
            {/* Subtitle */}
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-pbgreen">
              Internal Hackathon · DSCE
            </span>

            {/* Main Title with Glow */}
            <h3
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white ${lexendDeca.className}`}
            >
              Smart India Hackathon{" "}
              <span className="text-pbgreen">
                2026
              </span>
            </h3>


          </div>

          {/* ══ Data Blocks ══ */}
          <div className="flex flex-col gap-3 w-full min-w-0">
            {/* Top Row: 2 blocks */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
              {/* Event Date */}
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-pbgreen/20 bg-black p-3 sm:p-4 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-pbgreen/10">
                  <Calendar className="h-5 w-5 text-pbgreen" />
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="text-xs uppercase tracking-wider text-gray-500">
                    Event Date
                  </span>
                  <span className="text-sm sm:text-base font-bold text-pbgreen">
                    5th Sept 2026
                  </span>
                </div>
              </div>

              {/* Venue */}
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-pbgreen/20 bg-black p-3 sm:p-4 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-pbgreen/10">
                  <Globe className="h-5 w-5 text-pbgreen" />
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="text-xs uppercase tracking-wider text-gray-500">
                    Venue
                  </span>
                  <span className="text-sm sm:text-base font-bold text-pbgreen">
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: 1 block (full width) */}
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-pbgreen/20 bg-black p-3 sm:p-4 sm:flex-row sm:items-center sm:gap-3 w-full">
              <div className="flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-pbgreen/10">
                <FileText className="h-5 w-5 text-pbgreen" />
              </div>
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="text-xs uppercase tracking-wider text-gray-500">
                  Problem Statements Drop
                </span>
                <span className="text-sm sm:text-base font-bold text-pbgreen">
                  24th Aug – 11:59 PM
                </span>
              </div>
            </div>
          </div>

          {/* ══ CTA Button ══ */}
          <a
            href="https://sih.dsce.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn flex items-center justify-center gap-2 w-full rounded-xl bg-pbgreen px-6 py-4 font-bold text-black text-base sm:text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(55,255,0,0.4)] hover:brightness-110"
          >
            Register Now
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
