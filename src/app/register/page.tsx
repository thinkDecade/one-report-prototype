"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Clock, ShieldCheck, Smartphone, Wallet, X } from "lucide-react";
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
            <h1 className="font-display text-[clamp(30px,3.7vw,52px)] font-extrabold leading-[0.9] tracking-[-0.06em]">
              {groups.review.length ? `${groups.review.length} to review.` : "Nothing to review."}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
