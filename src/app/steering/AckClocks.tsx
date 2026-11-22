"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Clock, TriangleExclamationPoint } from "lucide-react";
import { usePortal } from "@/lib/store";
import { AUTHORITIES } from "@/lib/routing";
import { escalationLevel } from "@/lib/cases";
import type { AuthorityCode, Task } from "@/lib/types";
import { duration, hhmm } from "@/lib/format";

const M = 60_000;
const MAX = 2.5; // scale runs to 2.5× each authority's own target

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
const label = (a: AuthorityCode) => LABELS[a] ?? AUTHORITIES[a].short;

function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

type Row = { a: AuthorityCode; mins: number; target: number; waiting?: Task; late: boolean; ratio: number };

const pct = (r: number) => `${Math.min(100, (r / MAX) * 100)}%`;
const ZONES = ["bg-[#F4F3F0]", "bg-[#F7EDD5]", "bg-[#EFD9A2]", "bg-[#F3D3CC]"];

export default function AckClocks() {
  const tasks = usePortal((s) => s.tasks);
  const now = usePortal((s) => s.now);

  const byAuth = new Map<AuthorityCode, Task[]>();
  for (const t of tasks) byAuth.set(t.authority, [...(byAuth.get(t.authority) ?? []), t]);

  const rows: Row[] = [];
  for (const [a, ts] of byAuth) {
    const pending = ts.filter((t) => t.state === "pending").sort((x, y) => x.createdAt - y.createdAt);
    if (pending.length) {
      const t = pending[0];
      const mins = (now - t.createdAt) / M;
      rows.push({ a, mins, target: t.ackTarget, waiting: t, late: mins > t.ackTarget, ratio: mins / t.ackTarget });
    } else {
      const acked = ts.filter((t) => t.acknowledgedAt);
      const mins = median(acked.map((t) => (t.acknowledgedAt! - t.createdAt) / M));
      if (mins === null) continue;
      const target = acked[0].ackTarget;
      rows.push({ a, mins, target, late: mins > target, ratio: mins / target });
    }
  }
  rows.sort((x, y) => y.ratio - x.ratio);
  if (!rows.length) return null;

  const onTime = rows.filter((r) => !r.late).length;
  const ackedAll = tasks.filter((t) => t.acknowledgedAt);
  const medAll = median(ackedAll.map((t) => (t.acknowledgedAt! - t.createdAt) / M));
  const medRatio = median(ackedAll.map((t) => (t.acknowledgedAt! - t.createdAt) / M / t.ackTarget));
  const done = rows.filter((r) => !r.waiting);
  const fastest = done.length ? done.reduce((m, r) => (r.mins < m.mins ? r : m)) : null;
  const waiting = rows.filter((r) => r.waiting);
  const worst = rows.find((r) => r.waiting && r.late);

  return (
    <section className="flex flex-col gap-7 rounded-[24px] bg-white px-5 py-7 sm:px-10 sm:py-9">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="flex max-w-[640px] flex-col gap-2.5">
          <span className="text-sm text-muted">Time to acknowledge · live at {hhmm(now)}</span>
          <span className="font-display text-[clamp(30px,3.1vw,40px)] font-extrabold leading-[0.92] tracking-[-0.055em]">
            {onTime} of {rows.length} on time.
          </span>
          <span className="text-[17px] text-[#4A4E57]">
            Each authority is measured against its own clock: one hour for the Cyber Security Authority, two hours for everyone else.
          </span>
        </div>
        <div className="grid w-full grid-cols-3 gap-2.5 sm:w-auto sm:grid-cols-[repeat(3,170px)]">
          <Mini label="Median, all" value={medAll === null ? "—" : duration(medAll)} sub={medRatio === null ? "" : `${Math.round(medRatio * 100)}% of target`} />
          <Mini label="Fastest" value={fastest ? duration(fastest.mins) : "—"} sub={fastest ? (fastest.a === "CSA" ? "CSA, the lead" : AUTHORITIES[fastest.a].short) : ""} />
          <Mini dark label="Still waiting" value={String(waiting.length)} sub={waiting.map((r) => AUTHORITIES[r.a].short).join(" and ") || "Nobody"} />
        </div>
      </div>

      {worst?.waiting && <Banner row={worst} task={worst.waiting} now={now} />}

      <div className="flex flex-col">
        <div className="hidden grid-cols-[230px_minmax(0,1fr)_250px] gap-7 pb-2.5 text-xs text-muted lg:grid">
          <span>Authority, slowest first</span>
          <div className="relative h-[18px]">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2 font-semibold text-ink" style={{ left: pct(1) }}>Target</span>
            <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: pct(2) }}>2× target · heads told</span>
          </div>
          <span>Time taken</span>
        </div>
        {rows.map((r) => (
          <AckRow key={r.a} r={r} now={now} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#4A4E57]">
          {["On time", "Reminder sent", "Supervisor told", "Heads and steering told"].map((k, i) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={clsx("inline-block h-3 w-[22px] rounded", ZONES[i])} /> {k}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-navy" /> Acknowledged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-[3px] border-[#B3261E]" /> Still waiting, clock running
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={14} /> Counts and times only. No personal data.
        </span>
      </div>
    </section>
  );
}

function AckRow({ r, now }: { r: Row; now: number }) {
  const b2 = (r.target + 30) / r.target;
  const x = pct(r.ratio);
  const lead = r.a === "CSA";
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-[#ECEBE7] py-3.5 last:border-b lg:grid-cols-[230px_minmax(0,1fr)_250px] lg:items-center lg:gap-7">
      <div>
        <div className="text-[17px] font-semibold tracking-tight">{label(r.a)}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[13px] text-muted">
          Target {r.target === 60 ? "1 hour" : duration(r.target).replace("h", " hours")}
          {r.waiting && r.late ? (
            <span className="rounded-full bg-[#B3261E] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">Late</span>
          ) : lead ? (
            <span className="rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">Lead</span>
          ) : null}
        </div>
      </div>
      <div className="relative">
        <div className="flex h-[34px] overflow-hidden rounded-[10px]">
          <div className={ZONES[0]} style={{ width: pct(1) }} />
          <div className={ZONES[1]} style={{ width: `calc(${pct(b2)} - ${pct(1)})` }} />
          <div className={ZONES[2]} style={{ width: `calc(${pct(2)} - ${pct(b2)})` }} />
          <div className={clsx(ZONES[3], "flex-1")} />
        </div>
        <div className="absolute inset-0">
          <div className="absolute -bottom-1 -top-1 w-0.5 bg-ink" style={{ left: pct(1) }} />
          {r.waiting ? (
            <>
              <div
                className="absolute top-[13px] h-2 rounded"
                style={{
                  width: x,
                  background: `repeating-linear-gradient(90deg, ${r.late ? "#B3261E" : "#0A2240"} 0 8px, transparent 8px 13px)`,
                }}
              />
              <div
                className={clsx("absolute top-[7px] -ml-2.5 h-5 w-5 rounded-full border-[3px] bg-white", r.late ? "border-[#B3261E]" : "border-navy")}
                style={{ left: x }}
              >
                <span className={clsx("absolute -inset-2.5 animate-ping rounded-full border-2", r.late ? "border-[#B3261E]/40" : "border-navy/25")} />
              </div>
            </>
          ) : (
            <>
              <div className="absolute top-[13px] h-2 rounded bg-navy" style={{ width: x }} />
              <div className="absolute top-[9px] -ml-2 h-4 w-4 rounded-full border-[3px] border-white bg-navy shadow-[0_0_0_1px_#0A2240]" style={{ left: x }} />
            </>
          )}
        </div>
      </div>
      <div>
        <div className="font-mono text-[22px] font-medium tracking-tight">{duration(r.mins)}</div>
        <div
          className={clsx("mt-0.5 text-[13px]", r.waiting ? (r.late ? "font-semibold text-[#B3261E]" : "text-[#4A4E57]") : r.late ? "font-semibold text-[#B3261E]" : "text-[#1F6B45]")}
        >
          {r.waiting
            ? r.late
              ? `Still waiting · ${duration(r.mins - r.target)} over · ${["", "reminder sent", "with supervisor", "with heads"][escalationLevel(r.waiting, now)]}`
              : `Waiting · since ${hhmm(r.waiting.createdAt)} · ${duration(r.target - r.mins)} left`
            : r.late
              ? `Acknowledged · ${duration(r.mins - r.target)} late`
              : `Acknowledged · ${duration(r.target - r.mins)} to spare`}
        </div>
      </div>
    </div>
  );
}

function Banner({ row, task, now }: { row: Row; task: Task; now: number }) {
  const lvl = escalationLevel(task, now);
  const reminderAt = task.createdAt + task.ackTarget * M;
  const supAt = task.createdAt + (task.ackTarget + 30) * M;
  const headsAt = task.createdAt + 2 * task.ackTarget * M;
  const name = AUTHORITIES[row.a].name.split(",")[0].replace(/ \(.*\)/, "");
  const next =
    lvl === 1
      ? `A reminder went at ${hhmm(reminderAt)}. A supervisor is told at ${hhmm(supAt)}, in ${duration((supAt - now) / M)}.`
      : lvl === 2
        ? `A supervisor was told at ${hhmm(supAt)}. Heads and the steering group are told at ${hhmm(headsAt)}, in ${duration((headsAt - now) / M)}.`
        : `Heads and the steering group were told at ${hhmm(headsAt)}.`;
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[20px] border-l-4 border-[#B3261E] bg-[#FBEDEA] px-5 py-4">
      <TriangleExclamationPoint size={20} className="shrink-0 text-[#B3261E]" />
      <span className="min-w-[240px] flex-1 text-[15px]">
        <b>
          {name} has not acknowledged after {duration(row.mins)}.
        </b>{" "}
        {next}
      </span>
      <Link href={`/board?case=${task.caseId}`} className="inline-flex h-[42px] items-center gap-2 rounded-full bg-ink px-[18px] text-sm font-medium text-white">
        Open the case <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function Mini({ label, value, sub, dark }: { label: string; value: string; sub: string; dark?: boolean }) {
  return (
    <div className={clsx("flex flex-col gap-1.5 rounded-[22px] px-3.5 py-3.5 sm:px-5 sm:py-4", dark ? "bg-ink text-white" : "bg-paper")}>
      <span className={clsx("text-[13px]", dark ? "text-white/65" : "text-muted")}>{label}</span>
      <b className="whitespace-nowrap font-mono text-[20px] font-medium tracking-tight sm:text-[28px]">{value}</b>
      <span className={clsx("truncate text-xs", dark ? "text-white/65" : "text-muted")}>{sub}</span>
    </div>
  );
}
