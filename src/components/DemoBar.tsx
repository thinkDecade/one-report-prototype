"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Clock, FastForward, RotateCcw, Play, ChevronDown, X } from "lucide-react";
import { usePortal } from "@/lib/store";
import { PERSONAS, personaById } from "@/lib/seed";
import { dayTime } from "@/lib/format";
import { useHydrated } from "./ui";

const GROUPS: { label: string; kind: string }[] = [
  { label: "Reporting businesses", kind: "provider" },
  { label: "OTC vendor", kind: "otc" },
  { label: "Authorities", kind: "agency" },
  { label: "Oversight", kind: "steering" },
];

const HOME: Record<string, string> = { provider: "/report", otc: "/check", agency: "/board", steering: "/steering" };

export default function DemoBar() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { now, personaId, setPersona, advance, reset } = usePortal();
  if (!hydrated) return null;
  const p = personaById(personaId);

  return (
    <div className="fixed bottom-24 right-3 z-50 font-ui sm:bottom-4 sm:right-4 text-[13px] text-zinc-950">
      {open ? (
        <div className="w-[340px] rounded-xl border border-zinc-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div className="flex flex-col">
              <span className="font-semibold">Prototype controls</span>
              <span className="text-xs text-zinc-500">Sample data only. Nothing leaves your browser.</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100">
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-2 px-4 py-3">
            <span className="text-xs font-medium text-zinc-500">Drill clock</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 flex-1 items-center gap-2 rounded-md border border-zinc-200 px-3 font-mono text-[13px]">
                <Clock size={14} className="text-zinc-500" />
                {dayTime(now)}
              </span>
              <button onClick={() => advance(15)} className="h-9 rounded-md border border-zinc-200 px-3 font-medium shadow-xs hover:bg-zinc-50">+15m</button>
              <button onClick={() => advance(60)} className="inline-flex h-9 items-center gap-1 rounded-md border border-zinc-200 px-3 font-medium shadow-xs hover:bg-zinc-50">
                <FastForward size={13} />1h
              </button>
            </div>
          </div>

          <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto border-t border-zinc-100 px-4 py-3">
            <span className="text-xs font-medium text-zinc-500">View as</span>
            {GROUPS.map((g) => (
              <div key={g.kind} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-zinc-400">{g.label}</span>
                {PERSONAS.filter((x) => x.kind === g.kind).map((x) => (
                  <button
                    key={x.userId}
                    onClick={() => {
                      setPersona(x.userId);
                      router.push(HOME[x.kind]);
                    }}
                    className={clsx(
                      "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left hover:bg-zinc-100",
                      x.userId === personaId && "bg-zinc-100"
                    )}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{x.name}</span>
                      <span className="text-xs text-zinc-500">{x.title}</span>
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">{x.userId}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 p-3">
            <button
              onClick={() => {
                reset("fresh");
                router.push("/report?drill=1");
                setOpen(false);
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-zinc-900 font-medium text-zinc-50 hover:bg-zinc-800"
            >
              <Play size={13} />
              Run drill from 04:31
            </button>
            <button
              onClick={() => {
                reset("live");
                router.push("/board");
                setOpen(false);
              }}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-zinc-200 font-medium hover:bg-zinc-50"
            >
              <RotateCcw size={13} />
              Reset to 07:05
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 bg-white pl-3 pr-2 shadow-lg hover:bg-zinc-50"
        >
          <span className="h-2 w-2 rounded-full bg-gold" />
          <span className="hidden font-medium sm:inline">Prototype</span>
          <span className="font-mono text-zinc-500">{dayTime(now).split(", ")[1]}</span>
          <span className="hidden text-zinc-500 sm:inline">· {p?.name}</span>
          <ChevronDown size={14} className="text-zinc-500" />
        </button>
      )}
    </div>
  );
}
