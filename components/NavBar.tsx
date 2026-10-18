"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name || "");

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-2xl shadow-black/80">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 select-none",
                isActive
                  ? "text-amber-400 font-bold"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} className={isActive ? "text-amber-400" : "text-neutral-400"} />
              <span className="hidden sm:inline">{item.name}</span>

              {isActive && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 w-full bg-amber-500/10 rounded-full -z-10 border border-amber-500/30"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  {/* Top Tubelight Glow Effect */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-t-full shadow-[0_-2px_8px_#D4AF37]">
                    <div className="absolute w-10 h-4 bg-amber-500/20 rounded-full blur-md -top-2 -left-1" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
