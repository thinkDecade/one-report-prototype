"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell } from "lucide-react";
import { Logo, Seal } from "./ui";
import { usePortal } from "@/lib/store";
import { personaById } from "@/lib/seed";
import { initials } from "@/lib/format";

const LINKS = [
  { href: "/board", label: "Case board" },
  { href: "/report", label: "Report" },
  { href: "/check", label: "Check" },
  { href: "/steering", label: "Steering" },
];

export default function AppNav() {
  const path = usePathname();
  const personaId = usePortal((s) => s.personaId);
  const unread = usePortal((s) => s.alerts.filter((a) => !s.readAlerts.includes(a.id)).length);
  const p = personaById(personaId);
  return (
    <nav className="flex items-center justify-between gap-3 rounded-full border border-white/30 p-1.5 text-white">
      <div className="flex items-center gap-1">
        <Link href="/" aria-label="One Report home" className="mr-3">
          <span className="hidden xl:inline-flex">
            <Logo size={44} />
          </span>
          <span className="xl:hidden">
            <Seal />
          </span>
        </Link>
        {LINKS.map((l) => {
          const active = path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "hidden h-11 items-center rounded-full px-5 text-sm transition-colors md:inline-flex",
                active ? "bg-white font-semibold text-ink" : "border border-white/30 hover:bg-white/10"
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        <Link href="/alerts" aria-label="Fraud alerts" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
          <Bell size={17} strokeWidth={1.8} />
          {unread > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold" />}
        </Link>
        <span className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 pl-4 pr-1.5 text-sm">
          <span className="hidden sm:inline">
            {p?.name ?? personaId} · {p?.authority ? p.institution.replace("_", " ") : p?.institution}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-navy">{initials(p?.name ?? "?")}</span>
        </span>
      </div>
    </nav>
  );
}
