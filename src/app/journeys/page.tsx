"use client";

import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { JOURNEYS } from "@/lib/journeys";
import { personaById } from "@/lib/seed";
import { initials } from "@/lib/format";
import AppNav from "@/components/AppNav";
import JourneyIcon from "@/components/JourneyIcon";
import { useEnterStep } from "@/components/JourneyBar";

export default function Journeys() {
  const enter = useEnterStep();
  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6 sm:pb-24">
      <section className="kente flex flex-col gap-10 rounded-[32px] px-4 pb-8 pt-5 text-white sm:px-6">
        <AppNav />
        <div className="flex flex-wrap items-end justify-between gap-8 px-2 sm:px-4">
          <div className="flex flex-col gap-3">
            <span className="text-[15px] text-white/75">See it as… · pick a role and follow one person through the drill</span>
            <h1 className="font-display text-[clamp(52px,7vw,92px)] font-extrabold leading-[0.88] tracking-[-0.06em]">
              Six people.
              <br />
              One incident.
            </h1>
          </div>
          <p className="max-w-[440px] text-[17px] leading-relaxed text-white/80">
            Each journey starts where that person&apos;s day starts, from the hack, an SMS or an escalation email, and walks through only their screens.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 px-0 sm:px-2 md:grid-cols-3 xl:grid-cols-6">
          {JOURNEYS.map((j) => (
            <button
              key={j.id}
              onClick={() => enter(j, 0)}
              className="glass group flex min-h-[160px] flex-col gap-2 rounded-[22px] p-4 text-left transition-colors hover:bg-white/15"
            >
              <span className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy">
                  <JourneyIcon k={j.icon} />
                </span>
                <ArrowRight size={18} className="opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="mt-auto text-[17px] font-semibold leading-tight">{j.role}</span>
              <span className="text-[13px] text-white/70">{j.pitch}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col rounded-[32px] bg-white px-5 pb-6 pt-8 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted">The drill · ₵1.84m SIM swap theft of agent float, turned into USDT</span>
            <span className="font-display text-[clamp(30px,3.5vw,42px)] font-extrabold tracking-[-0.045em]">Who does what, and when</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[13px] text-[#4A4E57]">
            <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded bg-ink" />What starts it</span>
            <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded border border-[#E9D9A8] bg-white ring-2 ring-gold" />Screen only this person sees</span>
            <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded border border-[#E9D9A8] bg-gold-soft" />Outcome</span>
          </div>
        </div>
        {JOURNEYS.map((j) => {
          const p = personaById(j.persona);
          return (
            <div key={j.id} className="grid gap-4 border-t border-[#E2E0DA] py-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-0">
              <button onClick={() => enter(j, 0)} className="flex items-start gap-3 text-left lg:flex-col lg:gap-2 lg:pr-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">{initials(p?.name ?? j.role)}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-bold leading-tight tracking-tight">{j.role}</span>
                  <span className="text-xs text-muted">{j.who}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold">
                    Start this journey <ArrowRight size={14} />
                  </span>
                </span>
              </button>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
                {j.map.map((m, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "relative flex flex-col gap-1 rounded-2xl border px-3.5 py-3",
                      m.k === "trig" && "border-ink bg-ink text-white",
                      m.k === "end" && "border-[#E9D9A8] bg-gold-soft",
                      m.k === "new" && "border-[#E9D9A8] bg-white ring-2 ring-gold",
                      !m.k && "border-[#E2E0DA] bg-white",
                      i > 0 && "lg:before:absolute lg:before:-left-5 lg:before:top-1/2 lg:before:h-0.5 lg:before:w-5 lg:before:bg-[#C8C5BD]"
                    )}
                  >
                    <span className={clsx("font-mono text-[11px]", m.k === "trig" ? "text-white/60" : "text-muted")}>{m.t}</span>
                    <span className="text-sm font-semibold leading-tight tracking-tight">{m.h}</span>
                    <span className={clsx("text-[11px] leading-snug", m.k === "trig" ? "text-white/60" : "text-muted")}>{m.r}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap justify-between gap-2 border-t border-[#E2E0DA] pt-4 text-[13px] text-muted">
          <span>Each journey ends with a short summary of what it showed from the concept paper.</span>
          <span>Times from the drill case GH-PAY-2026-000229</span>
        </div>
      </section>
    </div>
  );
}
