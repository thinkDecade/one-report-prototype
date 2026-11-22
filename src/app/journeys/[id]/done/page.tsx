"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { JOURNEYS, journeyById } from "@/lib/journeys";
import { usePortal } from "@/lib/store";
import { useEnterStep } from "@/components/JourneyBar";
import JourneyIcon from "@/components/JourneyIcon";
import { Loading, useHydrated } from "@/components/ui";

export default function Done() {
  const hydrated = useHydrated();
  const { id } = useParams<{ id: string }>();
  const j = journeyById(id);
  const journey = usePortal((s) => s.journey);
  const setJourney = usePortal((s) => s.setJourney);
  const enter = useEnterStep();

  useEffect(() => {
    if (j && (!journey || journey.id !== j.id)) setJourney({ id: j.id, step: j.steps.length + 1 });
  }, [j, journey, setJourney]);

  if (!hydrated) return <Loading />;
  if (!j) return <div className="p-10">Unknown journey.</div>;

  return (
    <div className="flex min-h-screen flex-col gap-3 bg-paper p-3 pb-24 sm:p-6">
      <section className="kente flex flex-col gap-8 rounded-[24px] px-6 py-12 text-white sm:px-12">
        <span className="text-[15px] text-white/70">{j.role} · what this showed</span>
        <h1 className="font-display text-[clamp(30px,3.7vw,52px)] font-extrabold leading-[0.9] tracking-[-0.06em]">That was {j.who.split(" · ")[0]}&apos;s part.</h1>
        <div className="grid gap-3 md:grid-cols-3">
          {j.showed.map((s) => (
            <div key={s.title} className="glass flex flex-col gap-2 rounded-[22px] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy">
                <Check size={16} />
              </span>
              <span className="text-lg font-semibold">{s.title}</span>
              <span className="text-sm leading-relaxed text-white/75">{s.text}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4 rounded-[24px] bg-white px-6 py-8 sm:px-10">
        <span className="font-display text-3xl font-extrabold tracking-[-0.04em]">Now see it as someone else</span>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
          {JOURNEYS.filter((x) => x.id !== j.id).map((x) => (
            <button key={x.id} onClick={() => enter(x, 0)} className="flex flex-col gap-2 rounded-[20px] bg-paper p-4 text-left hover:bg-[#E5E3DE]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white">
                <JourneyIcon k={x.icon} size={16} />
              </span>
              <span className="font-semibold leading-tight">{x.role}</span>
              <span className="flex items-center gap-1 text-xs text-muted">
                {x.pitch} <ArrowRight size={12} />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
