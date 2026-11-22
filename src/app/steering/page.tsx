"use client";

import clsx from "clsx";
import { ArrowLeftRight, Bell, Clock, FileText, Search, Shield, Snowflake } from "lucide-react";
import { usePortal } from "@/lib/store";
import { AUTHORITIES } from "@/lib/routing";
import AckClocks from "./AckClocks";
import { escalationLevel } from "@/lib/cases";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";


export default function Steering() {
  const hydrated = useHydrated();
  const { cases, tasks, entries, checks, alerts, now } = usePortal();
  if (!hydrated) return <Loading />;

  const open = cases.filter((c) => c.status !== "closed");
  const crit = open.filter((c) => c.severity === 1).length;
  const crossRail = open.filter((c) => c.crossRail).length;
  const freezeActs = tasks.flatMap((t) => t.events).filter((e) => e.button === "record" && /freez|hold|restrict/i.test(e.code ?? "")).length;
  const escalated = tasks.filter((t) => escalationLevel(t, now) >= 2);

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
            <Shield size={16} /> For heads of authorities. Counts and times only, no personal data.
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<FileText size={18} />} label="Open cases" value={String(open.length)} sub={`${crit} critical · ${open.length - crit} other`} />
        <Stat icon={<Clock size={18} />} label="Escalated now" value={String(escalated.length)} sub={escalated.length ? escalated.map((t) => AUTHORITIES[t.authority].short).join(", ") + " past target" : "Every clock is on time"} />
        <Stat dark icon={<Snowflake size={18} />} label="Freezes and holds recorded" value={String(freezeActs)} sub="Across all open cases" />
        <Stat icon={<ArrowLeftRight size={18} />} label="Cross-rail cases" value={String(crossRail)} sub="Mobile money and crypto in one case" />
      </div>

      <AckClocks />

      <div className="grid flex-1 gap-3">
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
