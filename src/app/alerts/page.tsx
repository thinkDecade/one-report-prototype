"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Bell, Receipt, TriangleExclamationPoint } from "lucide-react";
import { usePortal } from "@/lib/store";
import { hhmm, dayTime } from "@/lib/format";
import MobileShell from "@/components/MobileShell";
import { Loading, Seal, useHydrated } from "@/components/ui";

export default function AlertsPage() {
  const hydrated = useHydrated();
  const { alerts, readAlerts, checks, entries, personaId } = usePortal();
  if (!hydrated) return <Loading />;
  const mine = checks.filter((c) => c.userId === personaId);
  return (
    <MobileShell>
      <section className="ripple flex flex-col gap-5 rounded-[28px] px-4 pb-5 pt-4 text-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden"><Seal size={40} /></Link>
          <span className="glass inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-xs">
            <Bell size={13} /> In the app only
          </span>
        </div>
        <span className="pl-1 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em]">Fraud alerts</span>
        <span className="pl-1 text-[13px] text-white/75">Real alerts never ask for a code or a payment.</span>
      </section>
      {alerts.map((a) => {
        const keys = entries.filter((e) => a.entryIds.includes(e.id)).map((e) => e.lookupKey);
        const hit = mine.find((c) => keys.includes(c.lookupKey));
        const unread = !readAlerts.includes(a.id);
        return (
          <Link key={a.id} href={`/alerts/${a.id}`} className="flex flex-col gap-3 rounded-[24px] bg-white p-4 transition-colors hover:bg-[#FBFAF8]">
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold tracking-wide",
                  a.kind === "urgent" ? "bg-gold text-ink" : "bg-paper text-ink"
                )}
              >
                {a.kind === "urgent" ? <TriangleExclamationPoint size={13} /> : <Bell size={13} />}
                {a.kind === "urgent" ? "URGENT" : "PATTERN"}
              </span>
              <span className="flex items-center gap-2 font-mono text-xs text-muted">
                {unread && <span className="h-2 w-2 rounded-full bg-gold" />}
                {a.id}
              </span>
            </div>
            <strong className="text-xl font-bold leading-tight tracking-tight">{a.title}</strong>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{dayTime(a.issuedAt)}</span>
              <ArrowRight size={16} className="text-ink" />
            </div>
            {hit && (
              <span className="flex items-center gap-2 rounded-2xl bg-ink px-3 py-2 text-xs text-white">
                <Receipt size={14} className="text-gold" /> You checked one of these at {hhmm(hit.at)}
              </span>
            )}
          </Link>
        );
      })}
      <section className="flex flex-col gap-3 rounded-[24px] bg-white p-5">
        <strong className="text-lg font-semibold tracking-tight">How an alert reaches you</strong>
        <span className="text-[13px] text-muted">An email and an SMS tell you to open the app. The identifiers are only shown in the app. Sample wording:</span>
        <div className="flex flex-col gap-1 rounded-2xl bg-paper p-4 font-mono text-xs leading-relaxed">
          <span className="text-muted">From: alerts@onereport.example (sample)</span>
          <span className="font-semibold">Subject: URGENT FRAUD ALERT {alerts[0]?.id ?? "GH-FA-0031"}: check before you transact</span>
          <span>Confirmed numbers and wallets have been added to the check register. Open the app to see the alert.</span>
          <span>This alert never asks for a password, code or payment.</span>
        </div>
        <div className="rounded-2xl bg-paper p-4 font-mono text-xs leading-relaxed">
          SMS from ONEREPORT: URGENT FRAUD ALERT {alerts[0]?.id ?? "GH-FA-0031"}. Check before you transact. Open the app.
        </div>
        <span className="text-[13px] text-muted">If an entry is removed from the register, you get a cancellation alert in the same way.</span>
      </section>
    </MobileShell>
  );
}
