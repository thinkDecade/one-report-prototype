"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, UserRound, X } from "lucide-react";
import { usePortal } from "@/lib/store";
import { journeyById, type Journey } from "@/lib/journeys";
import { useHydrated } from "./ui";

/** Step 0 is the trigger screen, 1..n are the journey's steps, n + 1 is "What this showed". */
export function useEnterStep() {
  const router = useRouter();
  const setJourney = usePortal((s) => s.setJourney);
  const setPersona = usePortal((s) => s.setPersona);
  const reset = usePortal((s) => s.reset);
  const setClock = usePortal((s) => s.setClock);

  return (j: Journey, step: number) => {
    const n = j.steps.length;
    if (step <= 0) {
      setPersona(j.persona);
      setJourney({ id: j.id, step: 0 });
      router.push(`/journeys/${j.id}`);
      return;
    }
    if (step > n) {
      setJourney({ id: j.id, step: n + 1 });
      router.push(`/journeys/${j.id}/done`);
      return;
    }
    const s = j.steps[step - 1];
    if (s.reset) reset(s.reset);
    setPersona(s.persona ?? j.persona);
    if (s.clock) setClock(s.clock);
    setJourney({ id: j.id, step });
    router.push(s.href);
  };
}

export default function JourneyBar() {
  const hydrated = useHydrated();
  const journey = usePortal((s) => s.journey);
  const setJourney = usePortal((s) => s.setJourney);
  const enter = useEnterStep();
  const router = useRouter();
  if (!hydrated || !journey) return null;
  const j = journeyById(journey.id);
  if (!j) return null;
  const n = j.steps.length;
  const step = journey.step;
  const labels = ["What starts it", ...j.steps.map((s) => s.label), "What this showed"];
  const hint = step === 0 ? "This is what starts " + j.who.split(" · ")[0] + "'s part." : step > n ? "" : j.steps[step - 1].hint;

  return (
    <div className="sticky top-0 z-40 px-3 pt-3 font-ui text-zinc-950 sm:px-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:gap-4 lg:rounded-full lg:py-2 lg:pl-4">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <span className="flex items-center gap-2 text-[13px]">
            <UserRound size={15} className="text-zinc-500" />
            <span className="text-zinc-500">Seeing it as</span>
            <b className="font-semibold">{j.role}</b>
          </span>
          <button
            onClick={() => {
              setJourney(null);
              router.push("/journeys");
            }}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-zinc-500 hover:bg-zinc-100 lg:hidden"
          >
            <X size={13} /> Exit
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {labels.map((l, i) => (
            <span key={l} className="flex shrink-0 items-center">
              {i > 0 && <span className="mx-1 h-px w-3 bg-zinc-300" />}
              <button
                onClick={() => enter(j, i)}
                className={clsx(
                  "flex h-7 items-center gap-1.5 rounded-full px-2.5 whitespace-nowrap",
                  i === step ? "bg-zinc-900 text-white" : i < step ? "text-zinc-900 hover:bg-zinc-100" : "text-zinc-500 hover:bg-zinc-100"
                )}
              >
                {i < step ? <Check size={12} /> : <span className="font-mono">{i + 1}</span>}
                <span className={clsx(i !== step && "hidden xl:inline")}>{l}</span>
              </button>
            </span>
          ))}
        </div>

        {hint && <span className="min-w-0 flex-1 text-[13px] leading-snug text-zinc-600">{hint}</span>}
        {!hint && <span className="flex-1" />}

        <div className="flex items-center gap-1.5">
          <button
            disabled={step === 0}
            onClick={() => enter(j, step - 1)}
            className="flex h-8 items-center gap-1 rounded-full border border-zinc-200 px-3 text-[13px] font-medium disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Back
          </button>
          {step <= n ? (
            <button onClick={() => enter(j, step + 1)} className="flex h-8 items-center gap-1 rounded-full bg-zinc-900 px-3.5 text-[13px] font-medium text-white">
              {step === n ? "What this showed" : "Next step"} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => {
                setJourney(null);
                router.push("/journeys");
              }}
              className="flex h-8 items-center gap-1 rounded-full bg-zinc-900 px-3.5 text-[13px] font-medium text-white"
            >
              Try another role <ArrowRight size={14} />
            </button>
          )}
          <button
            onClick={() => {
              setJourney(null);
              router.push("/journeys");
            }}
            aria-label="Exit journey"
            className="hidden h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 lg:flex"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
