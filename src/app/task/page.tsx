"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowRightLeft, Check, Clock, EyeOff, Hash, Lock, Mail, PenLine, X } from "lucide-react";
import { usePortal } from "@/lib/store";
import { institutionById, personaById } from "@/lib/seed";
import { ACTION_CODES, AUTHORITIES } from "@/lib/routing";
import { TASK_TITLES, overdueMinutes } from "@/lib/cases";
import { cedi, duration, formatIdentifier, hhmm, money } from "@/lib/format";
import type { AuthorityCode, CaseRecord, Task } from "@/lib/types";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const M = 60_000;

type Section = "transactions" | "identifiers" | "technical" | "containment" | "solvency" | "narrative" | "exhibits" | "reporter" | "police";

const LABEL: Record<Section, string> = {
  transactions: "Transactions and money trail",
  identifiers: "Receiving numbers and wallets",
  technical: "Technical indicators",
  containment: "Containment so far",
  solvency: "Solvency statement",
  narrative: "The reporter's account and unknowns",
  exhibits: "Evidence files (sealed)",
  reporter: "Reporter's staff names and contact details",
  police: "Police complaint report",
};
const ALL: Section[] = ["transactions", "identifiers", "technical", "containment", "solvency", "narrative", "exhibits", "reporter", "police"];

// Who receives what (routing rules, concept paper section 7.4, simplified).
const ALLOWED: Partial<Record<AuthorityCode, Section[]>> = {
  CSA: ALL,
  CID: ALL,
  FIC: ["transactions", "identifiers"],
  BOG_PSD: ["containment", "solvency"],
  BOG_VAD: ["containment", "solvency"],
  SEC: ["containment", "solvency"],
  AGD: ["transactions", "identifiers"],
  EOCO: ["transactions", "identifiers", "containment"],
  NCA: ["technical", "identifiers"],
  FICSOC: ["technical"],
};

export default function MyTask() {
  const hydrated = useHydrated();
  const s = usePortal();
  const [pick, setPick] = useState<string | null>(null);
  const [mode, setMode] = useState<null | "record" | "hand_on" | "decline">(null);
  const [code, setCode] = useState("");
  const [to, setTo] = useState<AuthorityCode | "">("");
  const [note, setNote] = useState("");
  if (!hydrated) return <Loading />;

  const persona = personaById(s.personaId);
  const a = persona?.authority;
  const mine = s.tasks
    .filter((t) => t.authority === a && s.cases.some((c) => c.id === t.caseId && c.status !== "closed"))
    .sort((x, y) => (x.state === "pending" ? 0 : 1) - (y.state === "pending" ? 0 : 1) || y.createdAt - x.createdAt);
  const task = mine.find((t) => t.id === pick) ?? mine[0];
  const c = task ? s.cases.find((x) => x.id === task.caseId) : undefined;

  if (!a || !task || !c)
    return (
      <div className="min-h-screen bg-paper p-3 sm:p-6">
        <section className="kente flex flex-col gap-10 rounded-[32px] px-4 pb-10 pt-5 text-white sm:px-6">
          <AppNav />
          <h1 className="px-3 font-display text-6xl font-extrabold tracking-[-0.055em]">No tasks for you.</h1>
          <span className="px-3 text-white/75">Switch to an authority officer in the prototype controls to see their task.</span>
        </section>
      </div>
    );

  const allowed = ALLOWED[a] ?? [];
  const locked = ALL.filter((x) => !allowed.includes(x));
  const others = s.tasks.filter((t) => t.caseId === c.id && t.id !== task.id);
  const due = task.createdAt + task.ackTarget * M;
  const late = overdueMinutes(task, s.now);
  const handedOn = task.createdAt > c.filedAt;
  const inst = institutionById(c.providerId);

  function act(button: Task["events"][number]["button"], opts?: { code?: string; note?: string; to?: AuthorityCode }) {
    s.taskAction(task!.id, button, opts);
    setMode(null);
    setCode("");
    setNote("");
    setTo("");
  }

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-6 rounded-[32px] px-4 pb-6 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 sm:px-3">
          <span className="text-[15px] text-white/75">
            Your task · {persona?.name}, {AUTHORITIES[a].name}
          </span>
          {mine.length > 1 && (
            <div className="flex gap-2">
              {mine.map((t) => (
                <button key={t.id} onClick={() => setPick(t.id)} className={clsx("h-8 rounded-full px-3.5 font-mono text-xs", t.id === task.id ? "bg-white text-ink" : "glass")}>
                  {t.caseId}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-3 font-ui text-zinc-950 lg:grid-cols-[320px_minmax(0,1fr)_330px] lg:items-start">
        {/* LEFT: how you got here + the task */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Mail size={13} /> How you got here · {hhmm(task.createdAt)}
            </span>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[13px] leading-relaxed">
              <b>
                One Report: {handedOn ? "a part of" : "a copy of"} {c.id}
              </b>
              <br />
              <span className="text-zinc-500">
                {handedOn ? "Handed on by the lead. " : ""}
                {AUTHORITIES[a].short} receives: {task.receives.replace(/^Handed on: /, "")}. Acknowledge by {hhmm(due)}.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3.5 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-6 items-center rounded-md border border-zinc-200 px-2 text-xs font-medium">Your task</span>
              {task.state === "pending" ? (
                <span className={clsx("inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium", late > 0 ? "bg-red-50 text-red-700" : "bg-zinc-100")}>
                  <Clock size={12} /> {late > 0 ? `${duration(late)} late` : `${duration((due - s.now) / M)} left`}
                </span>
              ) : (
                <span className="inline-flex h-6 items-center gap-1 rounded-md bg-green-50 px-2 text-xs font-medium text-green-700">
                  <Check size={12} /> {task.state === "acted" ? "Action recorded" : task.state === "declined" ? "Declined" : "Acknowledged"}
                </span>
              )}
            </div>
            <span className="text-xl font-semibold leading-tight tracking-tight">{TASK_TITLES[a]}</span>
            <span className="text-[13px] text-zinc-500">
              {task.state === "pending"
                ? `Acknowledge by ${hhmm(due)}. If you can't act, decline with a reason or hand it on.`
                : "Record each step you take. Everyone on the case sees your status change, not your notes."}
            </span>

            {mode === null && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={task.state !== "pending"}
                  onClick={() => act("acknowledge")}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 text-sm font-medium text-white disabled:opacity-40"
                >
                  <Check size={15} /> Acknowledge
                </button>
                <button onClick={() => setMode("record")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 text-sm font-medium shadow-xs">
                  <PenLine size={15} /> Record action
                </button>
                <button onClick={() => setMode("hand_on")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 text-sm font-medium shadow-xs">
                  <ArrowRightLeft size={15} /> Hand on
                </button>
                <button onClick={() => setMode("decline")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 text-sm font-medium shadow-xs">
                  <X size={15} /> Decline
                </button>
              </div>
            )}
            {mode === "record" && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-zinc-500">What did you do?</span>
                {ACTION_CODES[a].map((x) => (
                  <button key={x} onClick={() => setCode(x)} className={clsx("rounded-lg border px-3 py-2 text-left text-sm", code === x ? "border-zinc-900 bg-zinc-50" : "border-zinc-200")}>
                    {x}
                  </button>
                ))}
                <Row onCancel={() => setMode(null)} disabled={!code} onOk={() => act("record", { code })} ok="Record" />
              </div>
            )}
            {mode === "hand_on" && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-zinc-500">Hand on to</span>
                <select value={to} onChange={(e) => setTo(e.target.value as AuthorityCode)} className="h-9 rounded-lg border border-zinc-200 px-2 text-sm">
                  <option value="">Choose an authority</option>
                  {(Object.keys(AUTHORITIES) as AuthorityCode[])
                    .filter((x) => x !== a)
                    .map((x) => (
                      <option key={x} value={x}>
                        {AUTHORITIES[x].name}
                      </option>
                    ))}
                </select>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Which part, and why" className="h-9 rounded-lg border border-zinc-200 px-3 text-sm" />
                <Row onCancel={() => setMode(null)} disabled={!to} onOk={() => act("hand_on", { to: to as AuthorityCode, note })} ok="Hand on" />
              </div>
            )}
            {mode === "decline" && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-zinc-500">Reason (the lead sees this)</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example, outside our mandate" className="h-9 rounded-lg border border-zinc-200 px-3 text-sm" />
                <Row onCancel={() => setMode(null)} disabled={note.length < 4} onOk={() => act("decline", { note })} ok="Decline" />
              </div>
            )}

            {task.events.filter((e) => e.button !== "system").length > 0 && (
              <div className="flex flex-col border-t border-zinc-100 pt-2">
                {task.events
                  .filter((e) => e.button !== "system")
                  .map((e, i) => (
                    <div key={i} className="flex justify-between gap-2 py-1 text-xs">
                      <span>{e.code ?? ({ acknowledge: "Acknowledged", hand_on: "Handed on", decline: "Declined", assign: "Assigned", record: "Recorded" } as Record<string, string>)[e.button]}{e.note && !e.code ? ` · ${e.note}` : ""}</span>
                      <span className="font-mono text-zinc-500">{hhmm(e.at)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: only what this authority receives */}
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-5 py-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-2 pb-2">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-zinc-500">
                {c.id} · filed {hhmm(c.filedAt)} by {inst?.name}
              </span>
              <span className="text-2xl font-semibold tracking-tight">{c.title}</span>
            </div>
            <span className="inline-flex h-6 items-center rounded-md bg-zinc-100 px-2 text-xs font-medium">{AUTHORITIES[a].short} view</span>
          </div>
          <div className="flex flex-wrap gap-2 pb-3">
            <Badge dot={c.severity === 1 ? "#DC2626" : "#EAB308"}>Level {c.severity}</Badge>
            {c.crossRail && <Badge>Mobile money → crypto</Badge>}
            {c.fundsAbroad && <Badge>Funds may be abroad</Badge>}
            <Badge>Loss {cedi(c.lossCedi)}</Badge>
          </div>
          <span className="py-1 text-sm font-semibold">What {AUTHORITIES[a].short} receives</span>
          {allowed.length === 0 && <span className="py-2 text-sm text-zinc-500">A summary only: the case title, its level, the loss and the reporting business.</span>}
          {allowed.includes("transactions") && <Transactions c={c} />}
          {allowed.includes("identifiers") && (
            <Block title={LABEL.identifiers}>
              {c.identifiers.map((x) => {
                const e = s.entries.find((r) => r.caseId === c.id && r.identifier.value === x.value);
                return (
                  <div key={x.value} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                    <span className="font-mono">{formatIdentifier(x.value)}</span>
                    <span className="text-xs text-zinc-500">
                      {x.type === "wallet" ? `Wallet, ${x.network}` : "Mobile money"} · register: {e?.status ?? "not entered"}
                    </span>
                  </div>
                );
              })}
            </Block>
          )}
          {allowed.includes("technical") && <List title={LABEL.technical} items={c.technical} />}
          {allowed.includes("containment") && <List title={LABEL.containment} items={c.containment} />}
          {allowed.includes("solvency") && (
            <Block title={LABEL.solvency}>
              <p className="py-1.5 text-sm">{c.solvency}</p>
            </Block>
          )}
          {allowed.includes("narrative") && (
            <Block title={LABEL.narrative}>
              <p className="py-1.5 text-sm">{c.narrative.how}</p>
              {c.narrative.unknowns && <p className="py-1 text-sm text-zinc-500">Unknown: {c.narrative.unknowns}</p>}
            </Block>
          )}
          {allowed.includes("exhibits") && (
            <Block title={LABEL.exhibits}>
              {c.exhibits.map((e) => (
                <div key={e.no} className="flex justify-between gap-3 py-1 text-sm">
                  <span>
                    {e.no} {e.name}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">{e.sha256.slice(0, 12)}…</span>
                </div>
              ))}
            </Block>
          )}
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-gold-soft px-3.5 py-3 text-[13px]">
            <EyeOff size={16} className="shrink-0" /> Routing rule 7.4: {AUTHORITIES[a].short} receives {task.receives.replace(/^Handed on: /, "").toLowerCase()}. Nothing else is sent.
          </div>
        </div>

        {/* RIGHT: what isn't shared + others' status */}
        <div className="flex flex-col gap-3">
          {locked.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Lock size={15} /> Not shared with {AUTHORITIES[a].short}
              </span>
              {locked.map((x) => (
                <div key={x} className="flex items-center gap-2.5 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] text-zinc-500">
                  <Lock size={13} className="shrink-0" /> {LABEL[x]}
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
            <span className="text-sm font-semibold">Other authorities on this case</span>
            <span className="block pb-2 pt-0.5 text-xs text-zinc-500">Status only. You can&apos;t open their tasks.</span>
            {others.map((t) => {
              const late = t.state === "pending" && overdueMinutes(t, s.now) > 0;
              return (
                <div key={t.id} className="flex items-center justify-between border-t border-zinc-100 py-2 text-[13px]">
                  <span className="flex items-center gap-2">
                    <span className={clsx("h-2 w-2 rounded-full", t.state === "pending" ? (late ? "bg-red-600" : "bg-blue-600") : "bg-green-600")} />
                    {AUTHORITIES[t.authority].short}
                    {t.role === "action" && <span className="text-zinc-500">· lead</span>}
                  </span>
                  <span className="text-zinc-500">
                    {t.state === "pending" ? (late ? `Waiting · ${duration((s.now - t.createdAt) / M)}` : "Waiting") : t.state === "acted" ? "Acting" : t.state === "declined" ? "Declined" : `Acknowledged ${hhmm(t.acknowledgedAt ?? t.createdAt)}`}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="flex items-center gap-1.5 px-1 text-xs text-zinc-500">
            <Hash size={13} /> Every view and action is written to the case&apos;s audit log.
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ onCancel, onOk, ok, disabled }: { onCancel: () => void; onOk: () => void; ok: string; disabled: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button onClick={onCancel} className="h-9 rounded-lg border border-zinc-200 px-3 text-sm">
        Cancel
      </button>
      <button disabled={disabled} onClick={onOk} className="h-9 rounded-lg bg-zinc-900 px-3.5 text-sm font-medium text-white disabled:opacity-40">
        {ok}
      </button>
    </div>
  );
}

function Badge({ children, dot }: { children: React.ReactNode; dot?: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-zinc-200 px-2 text-xs font-medium">
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-100 py-2.5">
      <span className="text-xs font-medium text-zinc-500">{title}</span>
      {children}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Block title={title}>
      {items.map((x) => (
        <p key={x} className="py-1 text-sm">
          {x}
        </p>
      ))}
    </Block>
  );
}

function Transactions({ c }: { c: CaseRecord }) {
  return (
    <Block title={LABEL.transactions}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <tbody>
            {c.transactions.map((t) => (
              <tr key={t.id} className="border-b border-zinc-50 last:border-0">
                <td className="py-1.5 pr-3 font-mono text-xs text-zinc-500">{hhmm(t.time)}</td>
                <td className="py-1.5 pr-3">
                  {t.from} → <span className="font-mono text-xs">{formatIdentifier(t.to)}</span>
                </td>
                <td className="py-1.5 text-right font-mono">{money(t.amount, t.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Block>
  );
}
