"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell, Receipt, Search } from "lucide-react";
import { usePortal } from "@/lib/store";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const unread = usePortal((s) => s.alerts.filter((a) => a.kind === "urgent" && !s.readAlerts.includes(a.id)).length);
  const tabs = [
    { href: "/check", label: "Check", icon: Search },
    { href: "/alerts", label: "Alerts", icon: Bell, badge: unread },
    { href: "/receipts", label: "Receipts", icon: Receipt },
  ];
  return (
    <div className="flex min-h-screen justify-center bg-paper sm:items-center sm:py-8">
      <div className="relative flex min-h-screen w-full max-w-[420px] flex-col gap-2.5 bg-paper p-2.5 pb-28 sm:min-h-[860px] sm:rounded-[44px] sm:border sm:border-[#DAD9D5] sm:shadow-xl">
        {children}
        <nav className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full bg-ink p-1.5 text-white shadow-lg sm:absolute">
          {tabs.map((t) => {
            const active = path.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={clsx("inline-flex h-11 items-center gap-2 rounded-full px-4 text-[13px]", active ? "bg-white font-semibold text-ink" : "hover:bg-white/10")}
              >
                <t.icon size={16} strokeWidth={1.8} />
                {t.label}
                {!!t.badge && <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">{t.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
