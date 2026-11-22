"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  Bell,
  Check,
  CircleQuestionMark,
  Clock,
  FileText,
  Hash,
  Landmark,
  ListFilter,
  Plus,
  Search,
  Send,
  Smartphone,
  TriangleExclamationPoint,
  Wallet,
  X,
} from "lucide-react";
import { usePortal } from "@/lib/store";
import { PERSONAS, personaById, institutionById } from "@/lib/seed";
import { AUTHORITIES, ACTION_CODES } from "@/lib/routing";
import { TASK_TITLES, columnOf, escalationLevel, ESCALATION_LABEL, overdueMinutes, type Column } from "@/lib/cases";
import type { AuthorityCode, CaseRecord, Task } from "@/lib/types";
import { cedi, duration, hhmm, initials, shortId } from "@/lib/format";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const M = 60_000;

const COLS: { k: Column; label: string; dot: string }[] = [
  { k: "received", label: "Received", dot: "bg-received" },
  { k: "acknowledged", label: "Acknowledged", dot: "bg-acked" },
  { k: "acted", label: "Acted", dot: "bg-acted" },
  { k: "overdue", label: "Overdue", dot: "bg-overdue" },
];

export default function BoardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Board />
    </Suspense>
  );
}

function officerFor(a: AuthorityCode) {
  return PERSONAS.find((p) => p.authority === a);
}

function Board() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const s = usePortal();
  const [caseId, setCaseId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [mineOnly, setMineOnly] = useState(false);

  const persona = personaById(s.personaId);
  const openCases = s.cases.filter((c) => c.status !== "closed");
  const c: CaseRecord | undefined = s.cases.find((x) => x.id === (caseId ?? params.get("case"))) ?? openCases[0];

  const caseTasks = useMemo(() => s.tasks.filter((t) => t.caseId === c?.id && t.state !== "declined"), [s.tasks, c?.id]);
  const visible = caseTasks.filter(
    (t) =>
      (!mineOnly || t.authority === persona?.authority) &&
      (!filter || (TASK_TITLES[t.authority] + AUTHORITIES[t.authority].short).toLowerCase().includes(filter.toLowerCase()))
  );

  useEffect(() => {
    if (!c) return;
    if (taskId && caseTasks.some((t) => t.id === taskId)) return;
    const mine = caseTasks.find((t) => t.authority === persona?.authority);
    setTaskId((mine ?? caseTasks.find((t) => t.state === "pending") ?? caseTasks[0])?.id ?? null);
  }, [c, caseTasks, taskId, persona?.authority]);

  if (!hydrated) return <Loading />;

  if (!c)
    return (
      <div className="min-h-screen bg-paper p-6">
        <section className="kente rounded-[24px] p-6">
          <AppNav />
          <h1 className="px-3 pb-6 pt-8 font-display text-5xl font-extrabold tracking-[-0.055em] text-white">No open cases.</h1>
        </section>
      </div>
    );

  const task = caseTasks.find((t) => t.id === taskId);
  const freezeDue = c.filedAt + (c.severity === 1 ? 4 * 60 : 24 * 60) * M;
  const freezeLeft = Math.round((freezeDue - s.now) / M);
  const acked = caseTasks.filter((t) => t.state !== "pending").length;
  const span = freezeDue - c.filedAt;
  const progress = Math.min(1, Math.max(0, (s.now - c.filedAt) / span));
  const inst = institutionById(c.providerId);

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      {/* HEADER */}
      <section className="kente flex flex-col gap-6 rounded-[24px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-8 px-2 sm:px-3">
          <div className="flex min-w-0 flex-col gap-4">
            <span className="text-[15px] text-white/75">Authority view · for officers at CSA, CID, FIC, BoG, SEC and partner authorities</span>
            <div className="flex flex-wrap gap-2">
              {openCases.map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    setCaseId(x.id);
                    setTaskId(null);
                  }}
                  className={clsx(
                    "inline-flex h-8 items-center gap-2 rounded-full px-3.5 font-mono text-xs transition-colors",
                    x.id === c.id ? "bg-white text-ink" : "glass hover:bg-white/15"
                  )}
                >
                  {x.severity === 1 && <span className="h-2 w-2 rounded-full bg-overdue" />}
                  {x.id}
                </button>
              ))}
            </div>
            <h1 className="max-w-[820px] font-display text-[clamp(32px,3.7vw,50px)] font-extrabold leading-[0.9] tracking-[-0.055em]">{c.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[15px] text-white/80">
              <span className="glass inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-xs">
                <span className={clsx("h-2 w-2 rounded-full", c.severity === 1 ? "bg-overdue" : "bg-acked")} />
                Level {c.severity}
              </span>
              {c.crossRail && (
                <span className="glass inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-xs">
                  <Smartphone size={13} /> Mobile money → crypto
                </span>
              )}
              <span className="ml-1">
                Filed {hhmm(c.filedAt)} by {inst?.name.replace(" Ltd", "")} · {cedi(c.lossCedi)} lost
              </span>
            </div>
          </div>
          <div className="glass flex w-full max-w-[320px] flex-col gap-3.5 rounded-[26px] px-6 py-5">
            <span className="flex items-center gap-2 text-[13px] text-white/80">
              <Clock size={16} /> Freeze requests due
            </span>
            <span className="text-[42px] font-semibold leading-[0.9] tracking-[-0.04em]">{hhmm(freezeDue)}</span>
            <div className="h-1.5 rounded-full bg-white/20">
              <div className={clsx("h-1.5 rounded-full", freezeLeft < 0 ? "bg-overdue" : "bg-white")} style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="text-[13px] text-white/80">
              {freezeLeft >= 0 ? `${duration(freezeLeft)} left` : `${duration(-freezeLeft)} past target`} · {acked} of {caseTasks.length} authorities acknowledged
            </span>
          </div>
        </div>
      </section>

      {/* BOARD (shadcn style) */}
      <div className="grid flex-1 items-start gap-4 font-ui text-zinc-950 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-0.5 rounded-lg bg-zinc-100 p-1">
              <span className="inline-flex h-[30px] items-center rounded-md bg-white px-3.5 text-sm font-medium shadow-xs">Board</span>
              <span className="inline-flex h-[30px] items-center rounded-md px-3.5 text-sm font-medium text-zinc-500">Evidence · {c.exhibits.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-9 w-60 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm">
                <Search size={15} className="text-zinc-500" />
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter tasks…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-zinc-500" />
              </label>
              <button
                onClick={() => setMineOnly(!mineOnly)}
                className={clsx("inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium shadow-xs", mineOnly ? "border-zinc-900 bg-zinc-900 text-zinc-50" : "border-zinc-200 hover:bg-zinc-50")}
              >
                <ListFilter size={15} />
                {mineOnly ? AUTHORITIES[persona?.authority ?? "CSA"].short + " only" : "All agencies"}
              </button>
            </div>
          </div>

          <div className="grid items-start gap-3 md:grid-cols-2 lg:grid-cols-4">
            {COLS.map((col) => {
              const items = visible.filter((t) => columnOf(t, s.now) === col.k);
              return (
                <div key={col.k} className="flex min-w-0 flex-col gap-2 rounded-[10px] border border-zinc-100 bg-zinc-50 p-2">
                  <div className="flex items-center justify-between px-1 pb-1.5 pt-1 text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <span className={clsx("h-2 w-2 rounded-full", col.dot)} />
                      {col.label}
                      <span className="inline-flex h-5 items-center rounded-md bg-zinc-100 px-1.5 text-xs font-medium">{items.length}</span>
                    </span>
                  </div>
                  {items.map((t) => (
                    <TaskCard key={t.id} t={t} now={s.now} selected={t.id === taskId} onClick={() => setTaskId(t.id)} />
                  ))}
                  {items.length === 0 && <div className="rounded-lg border border-dashed border-zinc-200 py-6 text-center text-xs text-zinc-400">Nothing here</div>}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          {task && <TaskPanel key={task.id} task={task} c={c} />}
          <MoneyTrail c={c} />
          <Register c={c} />
        </aside>
      </div>
    </div>
  );
}

function TaskCard({ t, now, selected, onClick }: { t: Task; now: number; selected: boolean; onClick: () => void }) {
  const officer = officerFor(t.authority);
  const over = overdueMinutes(t, now);
  const esc = escalationLevel(t, now);
  const last = [...t.events].reverse().find((e) => e.button === "record");
  const due = t.createdAt + t.ackTarget * M;
  const stamp = t.acknowledgedAt ?? t.createdAt;
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col gap-2.5 rounded-lg border bg-white p-3 text-left shadow-xs transition-shadow hover:shadow-sm",
        selected ? "border-zinc-900 ring-1 ring-zinc-900" : over > 0 ? "border-red-200" : "border-zinc-200"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-[22px] items-center rounded-md border border-zinc-200 px-2 text-xs font-medium">{AUTHORITIES[t.authority].short}</span>
        <span className={clsx("font-mono text-xs", over > 0 ? "text-red-600" : "text-zinc-500")}>{over > 0 ? `+${duration(over)}` : hhmm(stamp)}</span>
      </div>
      <span className="text-sm font-medium leading-snug">{TASK_TITLES[t.authority]}</span>
      {esc >= 2 && (
        <span className="inline-flex h-[22px] items-center gap-1 self-start rounded-md border border-red-200 bg-red-50 px-2 text-xs font-medium text-red-700">
          <TriangleExclamationPoint size={12} />
          {ESCALATION_LABEL[esc]}
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[9px] font-semibold text-zinc-900">{initials(officer?.name ?? t.authority)}</span>
          {officer?.userId ?? t.authority}
        </span>
        <span className={clsx("flex items-center gap-1 text-xs", t.state === "acted" ? "text-green-700" : "text-zinc-500")}>
          {t.state === "acted" ? (
            <>
              <Check size={13} /> {last?.code ? truncate(last.code, 22) : "Done"}
            </>
          ) : t.state === "acknowledged" ? (
            <>
              <Clock size={13} /> Ack {duration((t.acknowledgedAt! - t.createdAt) / M)}
            </>
          ) : (
            <>
              <Clock size={13} /> {over > 0 ? `Target ${hhmm(due)}` : `Ack by ${hhmm(due)}`}
            </>
          )}
        </span>
      </div>
    </button>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function TaskPanel({ task, c }: { task: Task; c: CaseRecord }) {
  const { personaId, taskAction, setPersona, now } = usePortal();
  const persona = personaById(personaId);
  const officer = officerFor(task.authority);
  const canAct = persona?.authority === task.authority;
  const [mode, setMode] = useState<null | "record" | "hand_on" | "decline">(null);
  const [code, setCode] = useState(ACTION_CODES[task.authority][0]);
  const [to, setTo] = useState<AuthorityCode>("EOCO");
  const [note, setNote] = useState("");
  const allTasks = usePortal((s) => s.tasks);
  const onCase = allTasks.filter((t) => t.caseId === c.id).map((t) => t.authority);
  const handTargets = (Object.keys(AUTHORITIES) as AuthorityCode[]).filter((a) => !onCase.includes(a));

  const submit = () => {
    if (mode === "record") taskAction(task.id, "record", { code, note });
    if (mode === "hand_on") taskAction(task.id, "hand_on", { to, note: note || AUTHORITIES[to].name });
    if (mode === "decline") taskAction(task.id, "decline", { note });
    setMode(null);
    setNote("");
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold tracking-tight">{TASK_TITLES[task.authority]}</span>
        <span className="text-sm text-zinc-500">
          {AUTHORITIES[task.authority].name}
          {task.state === "pending" && ` · acknowledge by ${hhmm(task.createdAt + task.ackTarget * M)}`}
        </span>
      </div>
      <div className="rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600">
        <span className="font-medium text-zinc-900">Receives:</span> {task.receives}
      </div>

      {!canAct ? (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-200 p-3 text-sm">
          <span className="text-zinc-600">
            You are signed in as {persona?.name} ({persona?.authority ? AUTHORITIES[persona.authority].short : persona?.institution}). Only {AUTHORITIES[task.authority].short} can act on this task.
          </span>
          {officer && (
            <button onClick={() => setPersona(officer.userId)} className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 text-sm font-medium shadow-xs hover:bg-zinc-50">
              Switch to {officer.name}
            </button>
          )}
        </div>
      ) : mode ? (
        <div className="flex flex-col gap-2.5">
          {mode === "record" && (
            <select value={code} onChange={(e) => setCode(e.target.value)} className="h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm">
              {ACTION_CODES[task.authority].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
          {mode === "hand_on" && (
            <select value={to} onChange={(e) => setTo(e.target.value as AuthorityCode)} className="h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm">
              {handTargets.map((a) => (
                <option key={a} value={a}>
                  {AUTHORITIES[a].name}
                </option>
              ))}
            </select>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={mode === "decline" ? "Why, or what you need from the reporter" : "Note (optional)"}
            className="min-h-[72px] rounded-lg border border-zinc-200 p-2.5 text-sm outline-none focus:border-zinc-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode(null)} className="h-9 rounded-lg border border-zinc-200 text-sm font-medium hover:bg-zinc-50">
              Cancel
            </button>
            <button onClick={submit} disabled={mode === "decline" && !note} className="h-9 rounded-lg bg-zinc-900 text-sm font-medium text-zinc-50 disabled:opacity-40">
              Sign and save
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => taskAction(task.id, "acknowledge")}
            disabled={task.state !== "pending"}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-40"
          >
            <Check size={16} />
            {task.state === "pending" ? "Acknowledge" : `Acknowledged ${hhmm(task.acknowledgedAt ?? now)}`}
          </button>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["record", FileText, "Record action"],
              ["hand_on", Send, "Hand on"],
              ["decline", CircleQuestionMark, "Decline or ask"],
            ].map(([k, Icon, l]) => {
              const I = Icon as typeof Send;
              return (
                <button
                  key={k as string}
                  onClick={() => setMode(k as "record")}
                  className="flex h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-zinc-200 text-xs font-medium shadow-xs hover:bg-zinc-50"
                >
                  <I size={16} />
                  {l as string}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="flex flex-col gap-0 border-t border-zinc-100 pt-3">
        <span className="pb-1.5 text-xs font-medium text-zinc-500">Signed record</span>
        {[...task.events].reverse().slice(0, 5).map((e, i) => (
          <div key={i} className="flex items-start gap-2.5 py-1.5 text-xs">
            <span className="w-10 shrink-0 font-mono text-zinc-500">{hhmm(e.at)}</span>
            <span className="text-zinc-700">
              {e.button === "system" ? "Routed to " + AUTHORITIES[task.authority].short : e.button === "acknowledge" ? "Acknowledged" : e.button === "record" ? e.code : e.button === "hand_on" ? "Handed on: " + e.note : "Declined: " + e.note}
              {e.userId !== "system" && <span className="text-zinc-400"> · {e.userId}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoneyTrail({ c }: { c: CaseRecord }) {
  const pay = c.transactions.filter((t) => t.rail === "payment");
  const va = c.transactions.filter((t) => t.rail === "virtual_asset");
  const wallets = new Set(pay.map((t) => t.to)).size || c.identifiers.filter((i) => i.type !== "wallet").length;
  const usdt = va.reduce((a, t) => a + t.amount, 0);
  const rows = [
    { icon: Landmark, label: c.type === "A" ? "Taken from the business" : "Taken from customers", value: cedi(c.lossCedi), dark: false },
    { icon: Smartphone, label: `${wallets} receiving account${wallets === 1 ? "" : "s"}`, value: String(wallets), dark: false },
    ...(c.crossRail || usdt ? [{ icon: Wallet, label: "Crypto wallet, via OTC", value: usdt ? `${(usdt / 1000).toFixed(1)}k USDT` : "—", dark: true }] : []),
  ];
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold">Money trail</span>
        {c.crossRail && <span className="inline-flex h-[22px] items-center rounded-md border border-zinc-200 px-2 text-xs font-medium">Cross-rail</span>}
      </div>
      <div className="relative flex flex-col">
        <div className="absolute bottom-5 left-[15px] top-5 w-px bg-zinc-200" />
        {rows.map((r) => (
          <div key={r.label} className="relative flex items-center gap-3 py-1.5">
            <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", r.dark ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white")}>
              <r.icon size={15} />
            </span>
            <span className="flex-1 text-sm">{r.label}</span>
            <span className="font-mono text-[13px]">{r.value}</span>
          </div>
        ))}
      </div>
      {c.exhibits.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          <Hash size={13} />
          {c.exhibits.length} evidence files sealed on arrival
        </div>
      )}
    </div>
  );
}

function Register({ c }: { c: CaseRecord }) {
  const { entries, personaId, confirmEntry, dropEntry, issueAlert, alerts, now } = usePortal();
  const persona = personaById(personaId);
  const approver = persona?.roles.includes("approver");
  const list = entries.filter((e) => e.caseId === c.id);
  const caseAlert = alerts.find((a) => a.caseId === c.id && a.kind === "urgent");
  const canAlert = persona?.roles.includes("alert issuer");
  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white px-5 pb-3 pt-5 shadow-xs">
      <div className="flex flex-col gap-1 pb-3">
        <span className="text-base font-semibold">Check register</span>
        <span className="text-sm text-zinc-500">{approver ? "Confirm or drop provisional entries." : "Entries go live when an approver confirms."}</span>
      </div>
      <div className="flex justify-between py-2 text-xs font-medium text-zinc-500">
        <span>Identifier</span>
        <span>Status</span>
      </div>
      {list.map((e) => {
        const expired = e.expiresAt < now && e.status === "provisional";
        return (
          <div key={e.id} className="flex items-center justify-between gap-2 border-t border-zinc-100 py-2.5 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 truncate font-mono">
              {e.identifier.type === "wallet" ? <Wallet size={13} className="shrink-0 text-zinc-400" /> : <Smartphone size={13} className="shrink-0 text-zinc-400" />}
              {shortId(e.identifier.value)}
            </span>
            <span className="flex items-center gap-1">
              {e.status === "provisional" && approver && !expired && (
                <>
                  <button onClick={() => confirmEntry(e.id)} aria-label="Confirm" title="Confirm" className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 hover:bg-zinc-50">
                    <Check size={13} />
                  </button>
                  <button onClick={() => dropEntry(e.id)} aria-label="Drop" title="Drop" className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 hover:bg-zinc-50">
                    <X size={13} />
                  </button>
                </>
              )}
              <StatusBadge status={expired ? "lapsed" : e.status} />
            </span>
          </div>
        );
      })}
      {list.length === 0 && <span className="border-t border-zinc-100 py-3 text-xs text-zinc-400">No identifiers on this case.</span>}
      <div className="border-t border-zinc-100 pt-3">
        {caseAlert ? (
          <a href={`/alerts/${caseAlert.id}`} className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-900">
            <Bell size={13} /> Alert {caseAlert.id} sent {hhmm(caseAlert.issuedAt)} to checking businesses
          </a>
        ) : canAlert ? (
          <button onClick={() => issueAlert(c.id)} disabled={list.length === 0} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 text-sm font-medium shadow-xs hover:bg-zinc-50 disabled:opacity-40">
            <Bell size={14} /> Issue urgent fraud alert
          </button>
        ) : (
          <span className="flex items-center gap-2 text-xs text-zinc-400">
            <Plus size={13} /> Only the CSA duty officer can issue alerts.
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    provisional: "border-yellow-200 bg-yellow-50 text-yellow-800",
    held: "border-yellow-200 bg-yellow-50 text-yellow-800",
    confirmed: "border-zinc-900 bg-zinc-900 text-zinc-50",
    dropped: "border-zinc-200 bg-zinc-100 text-zinc-500",
    lapsed: "border-zinc-200 bg-zinc-100 text-zinc-500",
    removed: "border-zinc-200 bg-zinc-100 text-zinc-500",
  };
  return <span className={clsx("inline-flex h-[22px] items-center rounded-md border px-2 text-xs font-medium capitalize", map[status])}>{status}</span>;
}
