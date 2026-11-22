"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Check, Inbox, TriangleExclamationPoint, UserRoundPlus } from "lucide-react";
import { usePortal } from "@/lib/store";
import { PERSONAS, personaById } from "@/lib/seed";
import { AUTHORITIES } from "@/lib/routing";
import { ESCALATION_LABEL, TASK_TITLES, escalationLevel } from "@/lib/cases";
import { duration, hhmm } from "@/lib/format";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const M = 60_000;

export default function Escalations() {
  const hydrated = useHydrated();
  const s = usePortal();
  if (!hydrated) return <Loading />;

  const persona = personaById(s.personaId);
  const a = persona?.authority;
  const items = s.tasks
    .filter((t) => t.state === "pending" && (!a || t.authority === a) && escalationLevel(t, s.now) >= (a ? 2 : 3))
    .sort((x, y) => x.createdAt - y.createdAt);
  const officers = PERSONAS.filter((p) => p.authority === a && !p.roles.includes("head"));

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-9 rounded-[32px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-6 px-2 sm:px-3">
          <div className="flex flex-col gap-3">
            <span className="text-[15px] text-white/75">
              Escalated to you · {persona?.name}, {persona?.title}
              {a ? `, ${AUTHORITIES[a].name}` : ""}
            </span>
            <h1 className="font-display text-[clamp(48px,6vw,84px)] font-extrabold leading-[0.9] tracking-[-0.06em]">
              {items.length ? `${items.length} task${items.length === 1 ? "" : "s"} need${items.length === 1 ? "s" : ""} you.` : "Nothing needs you."}
            </h1>
          </div>
          <span className="glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px]">
            <Inbox size={16} /> Reminder at target · supervisor at +30 min · you at twice the target
          </span>
        </div>
      </section>

      {items.length === 0 && (
        <div className="rounded-[26px] bg-white px-7 py-8 text-muted">
          Every task in your department is within its escalation clock. Move the drill clock forward to see one escalate.
        </div>
      )}

      {items.map((t) => {
        const c = s.cases.find((x) => x.id === t.caseId);
        const lvl = escalationLevel(t, s.now);
        const waited = (s.now - t.createdAt) / M;
        const ladder = [
          { k: "Routed to your department", at: t.createdAt },
          { k: "Reminder to the duty officer", at: t.createdAt + t.ackTarget * M },
          { k: "Supervisor told", at: t.createdAt + (t.ackTarget + 30) * M },
          { k: "You and the steering group told", at: t.createdAt + 2 * t.ackTarget * M },
        ];
        const assignee = t.events.filter((e) => e.button === "assign").pop();
        return (
          <section key={t.id} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex flex-col gap-5 rounded-[26px] bg-white px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className={clsx("inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", lvl >= 3 ? "bg-[#B3261E] text-white" : "bg-gold-soft")}>
                  <TriangleExclamationPoint size={13} /> {ESCALATION_LABEL[lvl]}
                </span>
                <span className="font-mono text-xs text-muted">{t.caseId}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[28px] font-bold leading-tight tracking-tight">{TASK_TITLES[t.authority]}</span>
                <span className="text-[15px] text-[#4A4E57]">
                  {c?.title} · Level {c?.severity}. Your department has not acknowledged it after <b>{duration(waited)}</b>. Target was {duration(t.ackTarget)}.
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                {ladder.map((l, i) => {
                  const done = s.now >= l.at;
                  return (
                    <div key={l.k} className={clsx("flex flex-col gap-1 rounded-2xl px-3.5 py-3", done ? (i === 3 ? "bg-[#F3D3CC]" : "bg-paper") : "border border-dashed border-[#D6D5D1]")}>
                      <span className="font-mono text-sm font-medium">{hhmm(l.at)}</span>
                      <span className="text-xs leading-snug text-[#4A4E57]">{l.k}</span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[13px] text-muted">The task asks for: {t.receives}.</span>
            </div>

            <div className="flex flex-col gap-3 rounded-[26px] bg-ink px-6 py-6 text-white">
              <span className="text-lg font-semibold">What you can do</span>
              {assignee ? (
                <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-sm">
                  <Check size={18} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    Assigned to <b>{personaById(assignee.note ?? "")?.name ?? assignee.note}</b> at {hhmm(assignee.at)}. The clock keeps running until they acknowledge, and the steering group sees it.
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-sm text-white/70">Assign an officer. They get an SMS and the task moves to the top of their list.</span>
                  {officers.map((o) => (
                    <button
                      key={o.userId}
                      onClick={() => s.taskAction(t.id, "assign", { note: o.userId })}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left text-ink hover:bg-white/90"
                    >
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">{o.name}</span>
                        <span className="text-xs text-muted">{o.title}</span>
                      </span>
                      <UserRoundPlus size={17} />
                    </button>
                  ))}
                </>
              )}
              <Link href="/steering" className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm text-white/70 hover:text-white">
                See every authority&apos;s clocks <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
}
