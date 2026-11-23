"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Clock, Plus, RefreshCw, ShieldCheck, Smartphone, Trash2, Wallet, X } from "lucide-react";
import { usePortal } from "@/lib/store";
import { personaById } from "@/lib/seed";
import { duration, formatIdentifier, hhmm } from "@/lib/format";
import type { RegisterEntry } from "@/lib/types";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const M = 60_000;
const REASONS = ["The owner showed it was not used in the theft", "Wrong number entered by the reporter", "Not linked to the theft after tracing"];

export default function Register() {
  const hydrated = useHydrated();
  const s = usePortal();
  const [tab, setTab] = useState<"review" | "live" | "off">("review");
  const [dropping, setDropping] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [newId, setNewId] = useState("");
  const [newCase, setNewCase] = useState("");
  const [newEv, setNewEv] = useState("");
  const [addErr, setAddErr] = useState("");
  if (!hydrated) return <Loading />;

  const persona = personaById(s.personaId);
  const live = (e: RegisterEntry) => e.expiresAt > s.now;
  const groups = {
    review: s.entries.filter((e) => (e.status === "provisional" || e.status === "held") && live(e)),
    live: s.entries.filter((e) => e.status === "confirmed" && live(e)),
    off: s.entries.filter((e) => e.status === "dropped" || e.status === "removed" || e.status === "lapsed" || !live(e)),
  };
  const list = groups[tab];

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-6 rounded-[24px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-6 px-2 sm:px-3">
          <div className="flex flex-col gap-3">
            <span className="text-[15px] text-white/75">Check register · approver desk · signed in as {persona?.name}</span>
            <h1 className="font-display text-[clamp(28px,2.6vw,38px)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              {groups.review.length ? `${groups.review.length} entries to review` : "No entries to review"}
            </h1>
          </div>
          <div className="glass flex max-w-[420px] items-start gap-3 rounded-[22px] px-4 py-3.5 text-sm leading-snug">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            Reported numbers warn people straight away as &quot;unconfirmed&quot;. They stay only if you confirm them: 30 days. If nobody does, they lapse after 24 hours.
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-[26px] border border-zinc-200 bg-white p-4 font-ui text-zinc-950 shadow-xs sm:p-5">
        <div className="flex w-fit gap-1 rounded-lg bg-zinc-100 p-1">
          {(
            [
              ["review", "Needs review"],
              ["live", "Live"],
              ["off", "Dropped or lapsed"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={clsx("h-8 rounded-md px-3 text-sm font-medium", tab === k ? "bg-white shadow-xs" : "text-zinc-500")}>
              {l} <span className="ml-1 font-mono text-xs text-zinc-500">{groups[k].length}</span>
            </button>
          ))}
        </div>

        <span className="px-1 text-sm text-zinc-500">
          The single record of every reported identifier. Identifiers only, never names. A place to check, not an order: it issues no holds.
        </span>
        {list.length === 0 && <span className="px-1 py-6 text-sm text-zinc-500">Nothing here.</span>}
        {list.map((e) => {
          const left = (e.expiresAt - s.now) / M;
          const c = s.cases.find((x) => x.id === e.caseId);
          return (
            <div key={e.id} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 md:flex-row md:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                {e.identifier.type === "wallet" ? <Wallet size={18} /> : <Smartphone size={18} />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-mono text-[15px] font-medium">{formatIdentifier(e.identifier.value)}</span>
                <span className="text-xs text-zinc-500">
                  {e.identifier.type === "wallet" ? `Wallet, ${e.identifier.network}` : "Mobile money number"} · {c?.title ?? e.caseId} · from {e.source}, {hhmm(e.enteredAt)}
                </span>
                {e.history.length > 1 && <span className="text-xs text-zinc-500">Last: {e.history[e.history.length - 1].action}{e.history[e.history.length - 1].note ? `, ${e.history[e.history.length - 1].note}` : ""}</span>}
              </div>
              <span className={clsx("inline-flex h-6 w-fit items-center gap-1 rounded-md px-2 text-xs font-medium", tab === "review" && left < 6 * 60 ? "bg-red-50 text-red-700" : "bg-zinc-100")}>
                <Clock size={12} />
                {tab === "off" ? e.status : `${duration(left)} left`}
              </span>
              {tab === "review" &&
                (dropping === e.id ? (
                  <div className="flex flex-col gap-1.5 md:w-[300px]">
                    {REASONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          s.dropEntry(e.id, r);
                          setDropping(null);
                        }}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-left text-xs hover:bg-zinc-50"
                      >
                        {r}
                      </button>
                    ))}
                    <button onClick={() => setDropping(null)} className="text-left text-xs text-zinc-500">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => s.confirmEntry(e.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-sm font-medium text-white">
                      <Check size={15} /> Confirm
                    </button>
                    <button onClick={() => setDropping(e.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium shadow-xs">
                      <X size={15} /> Drop
                    </button>
                  </div>
                ))}
              {tab === "live" &&
                (removing === e.id ? (
                  <div className="flex flex-col gap-1.5 md:w-[300px]">
                    {["Challenge upheld: the owner showed it was not used", "Funds returned and case closed", "Entered in error"].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          s.removeEntry(e.id, r);
                          setRemoving(null);
                        }}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-left text-xs hover:bg-zinc-50"
                      >
                        {r}
                      </button>
                    ))}
                    <span className="text-xs text-zinc-500">Removing sends a cancellation alert to businesses that received it.</span>
                    <button onClick={() => setRemoving(null)} className="text-left text-xs text-zinc-500">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => s.renewEntry(e.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium shadow-xs">
                      <RefreshCw size={14} /> Renew 30 days
                    </button>
                    <button onClick={() => setRemoving(e.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium shadow-xs">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-[26px] border border-zinc-200 bg-white p-4 font-ui text-zinc-950 shadow-xs sm:p-5">
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold">Add a confirmed entry</span>
          <span className="text-sm text-zinc-500">For agency officers, from tracing or analysis. It goes live at once for 30 days.</span>
        </div>
        <div className="grid gap-2 md:grid-cols-[1.3fr_1fr_1.3fr_auto]">
          <input value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Number, account or wallet" className="h-10 rounded-lg border border-zinc-200 px-3 font-mono text-sm outline-none focus:border-zinc-400" />
          <select value={newCase || s.cases[0]?.id} onChange={(e) => setNewCase(e.target.value)} className="h-10 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm">
            {s.cases.filter((c) => c.status !== "closed").map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
          <input value={newEv} onChange={(e) => setNewEv(e.target.value)} placeholder="Evidence linking it to the case, e.g. exhibit E-02" className="h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-400" />
          <button
            disabled={!newId.trim() || !newEv.trim()}
            onClick={() => {
              const err = s.addEntry(newCase || s.cases[0]?.id, newId, newEv.trim());
              setAddErr(err ?? "");
              if (!err) {
                setNewId("");
                setNewEv("");
                setTab("live");
              }
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-40"
          >
            <Plus size={15} /> Add
          </button>
        </div>
        {addErr && <span className="text-sm text-red-700">{addErr}</span>}
      </div>
    </div>
  );
}
