"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell, Receipt, Search } from "lucide-react";
import { usePortal } from "@/lib/store";
import AppNav from "./AppNav";

// Agent and OTC desk tools. On phones this is a single column with a bottom tab bar.
// On desktop it becomes a normal app page: top nav, a side menu and a wider content column.
export default function MobileShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const unread = usePortal((s) => s.alerts.filter((a) => a.kind === "urgent" && !s.readAlerts.includes(a.id)).length);
  const tabs = [
    { href: "/check", label: "Check", long: "Check a number or wallet", icon: Search },
    { href: "/alerts", label: "Alerts", long: "Alerts", icon: Bell, badge: unread },
    { href: "/receipts", label: "Receipts", long: "My receipts", icon: Receipt },
  ];
  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-2.5 pb-28 lg:p-6 lg:pb-24">
      <section className="kente hidden rounded-[24px] px-6 py-5 text-white lg:block">
        <AppNav />
      </section>
      <div className="mx-auto flex w-full max-w-[420px] gap-6 lg:max-w-[1180px]">
        <aside className="sticky top-6 hidden h-fit w-[260px] shrink-0 flex-col gap-1 rounded-[24px] bg-white p-3 lg:flex">
          <span className="px-3 pb-2 pt-1 text-xs font-medium text-muted">For agents and OTC desks</span>
          {tabs.map((t) => {
            const active = path.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={clsx("flex h-11 items-center gap-3 rounded-xl px-3 text-sm", active ? "bg-ink font-semibold text-white" : "hover:bg-paper")}
              >
                <t.icon size={17} strokeWidth={1.8} />
                <span className="flex-1">{t.long}</span>
                {!!t.badge && <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">{t.badge}</span>}
              </Link>
            );
          })}
          <span className="px-3 pt-3 text-xs leading-relaxed text-muted">On a phone these open as a simple app with tabs at the bottom.</span>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-2.5 lg:max-w-[820px] lg:gap-3">{children}</main>
      </div>
      <nav className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full bg-ink p-1.5 text-white shadow-lg lg:hidden">
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
  );
}
