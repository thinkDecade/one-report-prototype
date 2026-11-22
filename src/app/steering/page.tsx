"use client";

import clsx from "clsx";
import { ArrowLeftRight, Bell, Clock, FileText, Search, Shield, Snowflake, TriangleExclamationPoint } from "lucide-react";
import { usePortal } from "@/lib/store";
import { AUTHORITIES } from "@/lib/routing";
import { escalationLevel } from "@/lib/cases";
import type { AuthorityCode } from "@/lib/types";
import { duration } from "@/lib/format";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const M = 60_000;
const ORDER: AuthorityCode[] = ["CSA", "CID", "FIC", "BOG_PSD", "BOG_VAD", "SEC", "AGD", "EOCO", "NCA", "FICSOC"];

const LABELS: Partial<Record<AuthorityCode, string>> = {
  CSA: "Cyber Security Authority",
  CID: "Police CID",
  FIC: "FIC",
  BOG_PSD: "BoG Payments",
  BOG_VAD: "BoG Virtual Assets",
  SEC: "SEC Ghana",
  AGD: "Attorney-General",
  EOCO: "EOCO",
  NCA: "NCA",
  FICSOC: "FICSOC",
};

function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default function Steering() {
  const hydrated = useHydrated();
  const { cases, tasks, entries, checks, alerts, now } = usePortal();
  if (!hydrated) return <Loading />;

  const open = cases.filter((c) => c.status !== "closed");
  const crit = open.filter((c) => c.severity === 1).length;
  const crossRail = open.filter((c) => c.crossRail).length;
  const freezeActs = tasks.flatMap((t) => t.events).filter((e) => e.button === "record" && /freez|hold|restrict/i.test(e.code ?? "")).length;
  const escalated = tasks.filter((t) => escalationLevel(t, now) >= 2);

  const rows = ORDER.map((a) => {
    const ts = tasks.filter((t) => t.authority === a);
    const ack = ts.filter((t) => t.acknowledgedAt).map((t) => (t.acknowledgedAt! - t.createdAt) / M);
    const pendingLate = ts.filter((t) => t.state === "pending").map((t) => (now - t.createdAt) / M);
    const target = a === "CSA" ? 60 : 120;
    const med = median([...ack, ...pendingLate.filter((x) => x > target)]);
    return { a, med, target, n: ts.length };
  }).filter((r) => r.n > 0);
  const max = Math.max(240, ...rows.map((r) => r.med ?? 0));
  const over = rows.filter((r) => (r.med ?? 0) > r.target).length;

  const reg = {
    confirmed: entries.filter((e) => e.status === "confirmed").length,
    provisional: entries.filter((e) => e.status === "provisional" && e.expiresAt > now).length,
    dropped: entries.filter((e) => e.status === "dropped").length,
  };

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-9 rounded-[32px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-6 px-2">
          <h1 className="font-display text-[clamp(56px,7vw,88px)] font-extrabold leading-[0.88] tracking-[-0.06em]">
            Is it moving
            <br />
            fast enough?
          </h1>
          <span className="glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px]">
            <Shield size={16} /> Counts and times only. No personal data.
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<FileText size={18} />} label="Open cases" value={String(open.length)} sub={`${crit} critical · ${open.length - crit} other`} />
        <Stat icon={<Clock size={18} />} label="Escalated now" value={String(escalated.length)} sub={escalated.length ? escalated.map((t) => AUTHORITIES[t.authority].short).join(", ") + " past target" : "Every clock is on time"} />
        <Stat dark icon={<Snowflake size={18} />} label="Freezes and holds recorded" value={String(freezeActs)} sub="Across all open cases" />
        <Stat icon={<ArrowLeftRight size={18} />} label="Cross-rail cases" value={String(crossRail)} sub="Mobile money and crypto in one case" />
      </div>

      <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="flex flex-col gap-4 rounded-[26px] bg-white px-7 py-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xl font-semibold tracking-tight">Median time to acknowledge</span>
            <span className="flex items-center gap-2 text-xs text-muted">
              <span className="h-3.5 w-0.5 bg-ink" /> Target
            </span>
          </div>
          {rows.map((r) => {
            const late = (r.med ?? 0) > r.target;
            return (
              <div key={r.a} className={clsx("grid grid-cols-[180px_minmax(0,1fr)_70px] items-center gap-4 text-sm", late && "font-semibold")}>
                <span className="truncate">{LABELS[r.a] ?? AUTHORITIES[r.a].short}</span>
                <div className="relative h-3.5 rounded-full bg-paper">
                  <div className={clsx("h-3.5 rounded-full", late ? "bg-gold" : "bg-navy")} style={{ width: `${Math.min(100, ((r.med ?? 0) / max) * 100)}%` }} />
                  <div className="absolute -top-[5px] h-6 w-0.5 bg-ink" style={{ left: `${(r.target / max) * 100}%` }} />
                </div>
                <span className="text-right font-mono">{r.med === null ? "—" : duration(r.med)}</span>
              </div>
            );
          })}
          <div className="mt-auto flex items-center gap-3 rounded-[18px] bg-gold-soft px-4 py-3.5 text-sm">
            <TriangleExclamationPoint size={18} className="shrink-0" />
            {over ? `${over} authorit${over === 1 ? "y is" : "ies are"} over target.` : "Every authority is within target."} {escalated.length} task{escalated.length === 1 ? "" : "s"} escalated to a supervisor or higher.
          </div>
        </section>

        <section className="flex flex-col rounded-[26px] bg-white px-7 py-6">
          <div className="flex items-center justify-between pb-3.5">
            <span className="text-xl font-semibold">Check register</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper">
              <Search size={18} />
            </span>
          </div>
          {[
            ["Live entries, confirmed", reg.confirmed],
            ["Provisional, awaiting review", reg.provisional],
            ["Dropped by approvers", reg.dropped],
            ["Checks made", checks.length],
            ["Checks that matched", checks.filter((c) => c.answer !== "none").length],
            ["Urgent alerts issued", alerts.filter((a) => a.kind === "urgent").length],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-center justify-between border-t border-[#ECEBE7] py-3 text-sm last:border-b">
              <span>{k}</span>
              <span className="font-mono">{(v as number).toLocaleString("en-GB")}</span>
            </div>
          ))}
          <span className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Bell size={13} /> Live from the prototype&apos;s sample data.
          </span>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, dark }: { icon: React.ReactNode; label: string; value: string; sub: string; dark?: boolean }) {
  return (
    <div className={clsx("flex flex-col gap-3.5 rounded-[26px] px-6 py-5", dark ? "bg-ink text-white" : "bg-white")}>
      <div className="flex items-center justify-between">
        <span className={clsx("text-sm", dark ? "text-white/65" : "text-muted")}>{label}</span>
        <span className={clsx("flex h-11 w-11 items-center justify-center rounded-full", dark ? "bg-gold text-ink" : "bg-paper")}>{icon}</span>
      </div>
      <span className="text-[60px] font-bold leading-[0.9] tracking-[-0.05em]">{value}</span>
      <span className={clsx("text-[13px]", dark ? "text-white/65" : "text-muted")}>{sub}</span>
    </div>
  );
}
