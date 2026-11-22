"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, Clock, FileText, Fingerprint, PenLine, Phone, ShieldCheck, Upload, X } from "lucide-react";
import { usePortal } from "@/lib/store";
import { institutionById, personaById } from "@/lib/seed";
import { AUTHORITIES } from "@/lib/routing";
import { overdueMinutes } from "@/lib/cases";
import { hashFile } from "@/lib/hash";
import { cedi, duration, hhmm } from "@/lib/format";
import type { AuthorityCode, Exhibit, Task } from "@/lib/types";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const M = 60_000;

const PLAIN: Partial<Record<AuthorityCode, string>> = {
  CSA: "Cyber Security Authority",
  CID: "Police CID",
  FIC: "Financial Intelligence Centre",
  BOG_PSD: "Bank of Ghana, payments",
  BOG_VAD: "Bank of Ghana, virtual assets",
  SEC: "SEC Ghana",
  AGD: "Attorney-General's Department",
  EOCO: "Economic and Organised Crime Office",
  NCA: "National Communications Authority",
  FICSOC: "Financial sector response team",
  DPC: "Data Protection Commission",
};
const name = (a: AuthorityCode) => PLAIN[a] ?? AUTHORITIES[a].name;

function status(t: Task, now: number) {
  if (t.state === "pending") return overdueMinutes(t, now) > 0 ? { text: "Waiting, late", tone: "late" } : { text: "Waiting", tone: "wait" };
  if (t.state === "acted") return { text: "Acting", tone: "ok" };
  if (t.state === "declined") return { text: "Declined", tone: "wait" };
  return { text: "Acknowledged", tone: "ok" };
}

export default function MyCase() {
  const hydrated = useHydrated();
  const s = usePortal();
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!hydrated) return <Loading />;

  const persona = personaById(s.personaId);
  const inst = persona ? institutionById(persona.institution) : undefined;
  const c = s.cases.filter((x) => x.providerId === persona?.institution && x.status !== "closed").sort((a, b) => b.filedAt - a.filedAt)[0];

  if (!c)
    return (
      <div className="min-h-screen bg-paper p-3 sm:p-6">
        <section className="kente flex flex-col gap-10 rounded-[32px] px-4 pb-10 pt-5 text-white sm:px-6">
          <AppNav />
          <div className="flex flex-col gap-4 px-3">
            <h1 className="font-display text-6xl font-extrabold tracking-[-0.055em]">No open cases.</h1>
            <span className="text-white/75">Signed in as {persona?.name}. Cases your business files will show here.</span>
            <Link href="/report" className="inline-flex h-12 items-center self-start rounded-full bg-white px-6 font-medium text-ink">
              File a report
            </Link>
          </div>
        </section>
      </div>
    );

  const tasks = s.tasks.filter((t) => t.caseId === c.id).sort((a, b) => (a.authority === "CSA" ? -1 : b.authority === "CSA" ? 1 : a.createdAt - b.createdAt));
  const acked = tasks.filter((t) => t.state !== "pending").length;
  const authorities = new Set(tasks.map((t) => t.authority)).size;
  const freezeDue = c.filedAt + (c.severity === 1 ? 4 * 60 : 24 * 60) * M;
  const freezeLeft = (freezeDue - s.now) / M;
  const progress = Math.min(1, Math.max(0, (s.now - c.filedAt) / (freezeDue - c.filedAt)));
  const lead = tasks.find((t) => t.role === "action");
  const leadOfficer = lead?.assignedTo ? personaById(lead.assignedTo) : lead?.events.find((e) => e.button === "acknowledge") ? personaById(lead.events.find((e) => e.button === "acknowledge")!.userId) : undefined;
  const signed = s.signedReports.includes(c.id);

  // Plain-language timeline built from the case's real events
  type Ev = { at: number; h: string; sub: string; next?: boolean };
  const evs: Ev[] = [{ at: c.filedAt, h: "You filed the report", sub: `${c.exhibits.filter((e) => e.receivedAt <= c.filedAt + 10 * M).length} evidence files sealed · fingerprints recorded` }];
  if (lead?.acknowledgedAt) evs.push({ at: lead.acknowledgedAt, h: `${name(lead.authority)} took the lead`, sub: leadOfficer ? `Duty officer ${leadOfficer.name}` : "Acknowledged your report" });
  const others = tasks.filter((t) => t !== lead && t.acknowledgedAt && t.createdAt === c.filedAt);
  if (others.length) {
    const last = Math.max(...others.map((t) => t.acknowledgedAt!));
    evs.push({ at: last, h: `${others.length} more authorities acknowledged`, sub: others.map((t) => AUTHORITIES[t.authority].short).join(", ") });
  }
  for (const e of s.entries.filter((x) => x.caseId === c.id && x.confirmedAt))
    evs.push({ at: e.confirmedAt!, h: `The thieves' ${e.identifier.type === "wallet" ? "wallet" : "number"} went on the check register`, sub: "Agents and OTC desks are warned if they check it" });
  for (const a of s.alerts.filter((x) => x.caseId === c.id)) evs.push({ at: a.issuedAt, h: "Urgent fraud alert issued", sub: `${a.id} to agents, issuers and OTC desks` });
  for (const t of tasks.filter((x) => x.createdAt > c.filedAt)) evs.push({ at: t.createdAt, h: `${name(t.authority)} brought in`, sub: t.receives.replace(/^Handed on: /, "") });
  for (const t of tasks)
    for (const e of t.events.filter((x) => x.button === "record" && x.code && !/triage|marker/i.test(x.code)))
      evs.push({ at: e.at, h: `${AUTHORITIES[t.authority].short}: ${e.code}`, sub: "Recorded on the case" });
  for (const x of c.exhibits.filter((e) => e.receivedAt > c.filedAt + 10 * M)) evs.push({ at: x.receivedAt, h: "You added evidence", sub: `${x.no} ${x.name} · sealed` });
  evs.sort((a, b) => a.at - b.at);
  if (freezeLeft > 0) evs.push({ at: freezeDue, h: "Freeze requests due", sub: "The lead and the FIC are preparing them", next: true });

  async function addFiles(files: FileList | null) {
    if (!files?.length || !c) return;
    setBusy(true);
    const ex: Exhibit[] = [];
    for (const f of Array.from(files)) {
      const h = await hashFile(f);
      ex.push({ no: `E-${String(c.exhibits.length + ex.length + 1).padStart(2, "0")}`, name: f.name, size: f.size, sha256: h, receivedAt: s.now, kind: "evidence" });
    }
    s.addExhibits(c.id, ex);
    setBusy(false);
  }

  const todo = [
    {
      icon: PenLine,
      h: signed ? "Police complaint report signed" : "Sign the police complaint report",
      sub: signed ? "CID has your signed report. You don't need to visit a station." : "CID drafted it from your report. Check it and sign.",
      cta: signed ? null : (
        <button onClick={() => setReviewing(true)} className="h-9 rounded-full bg-white px-4 text-[13px] font-medium text-ink">
          Review and sign
        </button>
      ),
      primary: !signed,
      done: signed,
    },
    {
      icon: Upload,
      h: "Add evidence",
      sub: "Bank statements, more screenshots. Each file is sealed when added.",
      cta: (
        <>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} className="h-9 rounded-full bg-ink px-4 text-[13px] font-medium text-white">
            {busy ? "Sealing…" : "Add files"}
          </button>
        </>
      ),
    },
    {
      icon: Phone,
      h: "Talk to the lead officer",
      sub: `${leadOfficer ? leadOfficer.name + ", " : ""}${lead ? AUTHORITIES[lead.authority].short : "CSA"} duty desk, or call 292.`,
      cta: (
        <a href="tel:292" className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-white">
          Call 292
        </a>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-10 rounded-[32px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-8 px-2 sm:px-4">
          <div className="flex max-w-[760px] flex-col gap-3">
            <span className="text-sm text-white/70">
              My case · {c.id} · {c.title} · {cedi(c.lossCedi)}
            </span>
            <h1 className="font-display text-[clamp(48px,6vw,80px)] font-extrabold leading-[0.9] tracking-[-0.06em]">Your report reached {authorities} authorities.</h1>
            <span className="text-[17px] text-white/80">
              {acked} of {tasks.length} have acknowledged it. You don&apos;t need to contact any of them separately.
            </span>
          </div>
          {freezeLeft > 0 && (
            <div className="glass flex min-w-[260px] flex-col gap-2 rounded-[24px] px-5 py-4">
              <span className="flex items-center gap-1.5 text-[13px] text-white/70">
                <Clock size={14} /> Next: freeze requests due
              </span>
              <span className="text-[52px] font-bold leading-none tracking-[-0.05em]">{hhmm(freezeDue)}</span>
              <div className="h-1.5 rounded-full bg-white/20">
                <div className="h-1.5 rounded-full bg-white" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="text-xs text-white/70">{duration(freezeLeft)} from now</span>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="flex flex-col gap-3">
          <section id="todo" className="flex flex-col gap-3 rounded-[28px] bg-white px-5 py-6 sm:px-8">
            <span className="text-[22px] font-bold tracking-tight">What you need to do</span>
            {todo.map((t) => {
              const I = t.icon;
              return (
                <div key={t.h} className={clsx("flex flex-wrap items-center gap-4 rounded-[20px] p-4", t.primary ? "bg-ink text-white" : "bg-paper")}>
                  <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", t.primary ? "bg-gold text-ink" : t.done ? "bg-navy text-white" : "bg-white")}>
                    {t.done ? <Check size={17} /> : <I size={17} />}
                  </span>
                  <div className="min-w-[200px] flex-1">
                    <div className="font-semibold">{t.h}</div>
                    <div className={clsx("text-[13px]", t.primary ? "text-white/70" : "text-muted")}>{t.sub}</div>
                  </div>
                  {t.cta}
                </div>
              );
            })}
          </section>

          <section className="rounded-[28px] bg-white px-5 py-6 sm:px-8">
            <span className="block pb-5 text-[22px] font-bold tracking-tight">What has happened</span>
            {evs.map((e, i) => (
              <div key={i} className="grid grid-cols-[52px_18px_1fr] gap-3">
                <span className="pt-0.5 font-mono text-[13px] text-muted">{hhmm(e.at)}</span>
                <div className="flex flex-col items-center">
                  <span className={clsx("mt-1 h-3.5 w-3.5 shrink-0 rounded-full", e.next ? "border-[3px] border-gold bg-white" : "bg-navy")} />
                  {i < evs.length - 1 && <span className="min-h-[30px] w-0.5 flex-1 bg-[#E2E0DA]" />}
                </div>
                <div className="pb-4">
                  <div className="font-semibold">{e.h}</div>
                  <div className="text-sm text-muted">{e.sub}</div>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="flex flex-col rounded-[28px] bg-white px-5 py-6 sm:px-7">
          <span className="text-[22px] font-bold tracking-tight">Who has your case</span>
          <span className="pb-3 pt-1 text-[13px] text-muted">Each authority sees only the part it needs.</span>
          {tasks.map((t) => {
            const st = status(t, s.now);
            return (
              <div key={t.id} className="flex items-center justify-between gap-3 border-t border-[#ECEBE7] py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{name(t.authority)}</div>
                  <div className="truncate text-xs text-muted">Gets: {t.receives.replace(/^Handed on: /, "")}</div>
                </div>
                <span className={clsx("shrink-0 text-xs font-semibold", st.tone === "late" ? "text-[#B3261E]" : st.tone === "wait" ? "text-muted" : "text-navy")}>{st.text}</span>
              </div>
            );
          })}
          <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-gold-soft px-4 py-3 text-[13px]">
            <ShieldCheck size={16} className="shrink-0" /> Your evidence is sealed. Anyone who opens it is logged.
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {c.exhibits.map((e) => (
              <div key={e.no} className="flex items-center gap-2 text-xs text-muted">
                <Fingerprint size={13} className="shrink-0" />
                <span className="font-medium text-ink">{e.no}</span>
                <span className="truncate">{e.name}</span>
                <span className="ml-auto font-mono">{e.sha256.slice(0, 10)}…</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewing(false)}>
          <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col gap-4 overflow-y-auto rounded-[28px] bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <FileText size={18} /> Police complaint report · draft by CID
              </span>
              <button onClick={() => setReviewing(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper">
                <X size={17} />
              </button>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-paper p-4 text-sm leading-relaxed">
              <p>
                <b>Complainant:</b> {inst?.name}, represented by {persona?.name}, {persona?.title}.
              </p>
              <p>
                <b>Offence reported:</b> theft of {cedi(c.lossCedi)} of agent float by SIM swap, {hhmm(c.detectedAt)} on 22 November 2026.
              </p>
              <p>
                <b>Statement:</b> {c.narrative.how}
              </p>
              <p>
                <b>Exhibits:</b> {c.exhibits.map((e) => e.no).join(", ")}, sealed with SHA-256 fingerprints.
              </p>
            </div>
            <span className="text-xs text-muted">Drafted by CID from the report you filed. Signing it here replaces a visit to a police station.</span>
            <button
              onClick={() => {
                s.signPoliceReport(c.id);
                setReviewing(false);
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink font-medium text-white"
            >
              <PenLine size={16} /> Sign as {persona?.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
