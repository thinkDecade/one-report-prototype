"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function Star({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2.5l2.47 7.6h7.99l-6.46 4.7 2.47 7.6L12 17.7l-6.47 4.7 2.47-7.6-6.46-4.7h7.99z" fill="#C9A54C" />
    </svg>
  );
}

export function Seal({ size = 44 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full border border-white/50"
      style={{ width: size, height: size }}
    >
      <Star size={size * 0.42} />
    </span>
  );
}

export function GhanaRule({ className }: { className?: string }) {
  return (
    <span className={clsx("flex h-[3px] w-18 overflow-hidden rounded-full", className)} aria-hidden="true">
      <span className="flex-1 bg-[#CE1126]" />
      <span className="flex-1 bg-[#FCD116]" />
      <span className="flex-1 bg-[#006B3F]" />
    </span>
  );
}

export function ArrowCircle({ dark = true, size = 52 }: { dark?: boolean; size?: number }) {
  return (
    <span
      className={clsx("flex shrink-0 items-center justify-center rounded-full", dark ? "bg-ink text-white" : "bg-white text-ink")}
      style={{ width: size, height: size }}
    >
      <ArrowRight size={size * 0.38} strokeWidth={1.8} />
    </span>
  );
}

export function GlassIcon({ children, size = 48 }: { children: React.ReactNode; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10" style={{ width: size, height: size }}>
      {children}
    </span>
  );
}

export function PillLink({
  href,
  children,
  variant = "ink",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ink" | "outline" | "white" | "ghost-light";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[15px] font-medium transition-colors",
        variant === "ink" && "h-13 bg-ink text-white hover:bg-black",
        variant === "outline" && "h-12 border border-ink hover:bg-ink hover:text-white",
        variant === "white" && "h-12 bg-white text-ink hover:bg-paper",
        variant === "ghost-light" && "h-11 border border-white/30 text-white hover:bg-white/10",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Loading() {
  return <div className="min-h-screen bg-paper" />;
}
