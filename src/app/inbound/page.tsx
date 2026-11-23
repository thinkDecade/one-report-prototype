"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Check, Globe, Link2, Plus } from "lucide-react";
import { usePortal } from "@/lib/store";
import { personaById } from "@/lib/seed";
import { dayTime } from "@/lib/format";
import type { InboundRequest } from "@/lib/types";
import AppNav from "@/components/AppNav";
import { Loading, useHydrated } from "@/components/ui";

const CHANNELS = [
  "Cyber Security Authority: foreign response team or Budapest 24/7 contact",
  "FIC: foreign financial intelligence unit (Egmont)",
  "CID: Interpol or foreign police",
  "Attorney-General: mutual legal assistance request",
  "CID or Cyber Security Authority: issuer or exchange abroad",
];

const field = "h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400";

export default function InboundPage() {
  const hydrated = useHydrated();
  const s = usePortal();
  const [channel, setChannel] = useState(CHANNELS[1]);
  const [from, setFrom] = useState("");
  const [ids, setIds] = useState("");
  const [asked, setAsked] = useState("");
  const [result, setResult] = useState<InboundRequest | null>(null);
  if (!hydrated) return <Loading />;

  const persona = personaById(s.personaId);
  const list = s.inbound ?? [];
  const identifiers = ids.split("\n").map((x) => x.trim()).filter(Boolean);
  const ok = from.trim().length > 2 && identifiers.length > 0;

  const sample = () => {
    setChannel(CHANNELS[1]);
    setFrom("Financial intelligence unit, country of Exchange A (sample)");
    setIds("TQ7nVfK3sGh9Xb2LmPz8RwYc4DjE6uAt5H");
    setAsked("Information on the source of 61,200 USDT credited to a customer at Exchange A; whether a Ghanaian case is open.");
  };

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-6 rounded-[24px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-6 px-2 sm:px-3">
          <div className="flex flex-col gap-3">
            <span className="text-[15px] text-white/75">For the CSA, FIC, CID and Attorney-General&apos;s Department · signed in as {persona?.name}</span>
            <h1 className="font-display text-[clamp(28px,2.6vw,38px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Enter a request from abroad</h1>
          </div>
          <div className="glass flex max-w-[440px] items-start gap-3 rounded-[22px] px-4 py-3.5 text-sm leading-snug">
            <Globe size={18} className="mt-0.5 shrink-0" />
            A foreign request never freezes funds in Ghana by itself. The FIC, EOCO or a Ghanaian court must act.
          </div>
        </div>
      </section>

      <div className="grid items-start gap-3 font-ui text-zinc-950 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">New inbound request</span>
            <button onClick={sample} className="text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900">
              Fill with a sample
            </button>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Received through
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={field}>
              {CHANNELS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Requesting body and country
            <input value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Addresses, accounts or indicators reported, one per line
            <textarea value={ids} onChange={(e) => setIds(e.target.value)} className="min-h-[90px] rounded-lg border border-zinc-200 p-3 font-mono text-sm outline-none focus:border-zinc-400" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            What is asked
            <textarea value={asked} onChange={(e) => setAsked(e.target.value)} className="min-h-[90px] rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400" />
          </label>
          <span className="text-xs text-zinc-500">The portal checks each identifier against open cases. A match attaches the request to that case; otherwise it opens a new inbound case for triage.</span>
          <button
            disabled={!ok}
            onClick={() => {
              setResult(s.addInbound({ channel, from: from.trim(), identifiers, asked: asked.trim() }));
              setFrom("");
              setIds("");
              setAsked("");
            }}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 disabled:opacity-40"
          >
            <Plus size={15} /> Enter request
          </button>
          {result && (
            <div className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
                {result.attachedTo ? <Link2 size={14} /> : <Check size={14} />}
              </span>
              {result.attachedTo ? (
                <span>
                  <b>{result.id}</b> attached to case{" "}
                  <Link href={`/board?case=${result.attachedTo}`} className="font-mono underline underline-offset-2">
                    {result.attachedTo}
                  </Link>
                  . Every authority on the case can see it.
                </span>
              ) : (
                <span>
                  <b>{result.id}</b> matched no open case. It is opened as a new inbound case for the CSA to triage.
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white px-5 pb-3 pt-5 shadow-xs">
          <span className="pb-3 text-base font-semibold">Requests entered</span>
          {list.length === 0 && <span className="border-t border-zinc-100 py-4 text-sm text-zinc-500">None yet.</span>}
          {list.map((r) => (
            <div key={r.id} className="flex flex-col gap-1 border-t border-zinc-100 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-medium">{r.id}</span>
                <span className={clsx("inline-flex h-[22px] items-center rounded-md border px-2 text-xs font-medium", r.attachedTo ? "border-zinc-900 bg-zinc-900 text-zinc-50" : "border-zinc-200")}>
                  {r.attachedTo ? "Attached" : "New case"}
                </span>
              </div>
              <span>{r.from}</span>
              <span className="text-xs text-zinc-500">
                {r.channel.split(":")[0]} · {dayTime(r.at)}
              </span>
              {r.attachedTo && (
                <Link href={`/board?case=${r.attachedTo}`} className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900">
                  {r.attachedTo} <ArrowRight size={12} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
