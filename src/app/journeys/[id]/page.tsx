"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, BellRing, Mail, MessageCircle, MessageSquare, Siren } from "lucide-react";
import { journeyById } from "@/lib/journeys";
import { usePortal } from "@/lib/store";
import { useEnterStep } from "@/components/JourneyBar";
import { Loading, useHydrated } from "@/components/ui";

const CHANNEL = {
  sms: { icon: MessageSquare, label: "SMS" },
  email: { icon: Mail, label: "Email" },
  alarm: { icon: Siren, label: "Monitoring alert" },
  chat: { icon: MessageCircle, label: "WhatsApp" },
  "in-app": { icon: BellRing, label: "Notification" },
};

export default function Trigger() {
  const hydrated = useHydrated();
  const { id } = useParams<{ id: string }>();
  const j = journeyById(id);
  const journey = usePortal((s) => s.journey);
  const setJourney = usePortal((s) => s.setJourney);
  const enter = useEnterStep();

  useEffect(() => {
    if (j && (!journey || journey.id !== j.id)) setJourney({ id: j.id, step: 0 });
  }, [j, journey, setJourney]);

  if (!hydrated) return <Loading />;
  if (!j) return <div className="p-10">Unknown journey.</div>;
  const C = CHANNEL[j.trigger.channel];
  const Icon = C.icon;

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col bg-paper p-3 sm:p-6">
      <section className="kente flex flex-1 flex-col items-center justify-center gap-10 rounded-[32px] px-5 py-14 text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[15px] text-white/70">{j.who}</span>
          <h1 className="font-display text-[clamp(48px,6vw,80px)] font-extrabold leading-[0.9] tracking-[-0.06em]">
            {j.trigger.time}.{" "}
            <span className="text-white/60">{j.trigger.channel === "chat" ? "A message comes in." : j.trigger.channel === "alarm" ? "An alarm goes off." : "This arrives."}</span>
          </h1>
        </div>

        <div className="w-full max-w-[420px] rounded-[44px] border border-white/25 bg-black/30 p-3 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3 rounded-[34px] bg-[#0B0F17]/80 px-4 pb-6 pt-4">
            <div className="flex justify-between px-2 font-mono text-xs text-white/60">
              <span>{j.trigger.time}</span>
              <span>Sun 22 Nov</span>
            </div>
            <div className={clsx("flex flex-col gap-2 rounded-[22px] p-4", j.trigger.channel === "alarm" ? "bg-[#B3261E]" : "bg-white text-ink")}>
              <div className="flex items-center gap-2 text-xs">
                <span className={clsx("flex h-7 w-7 items-center justify-center rounded-lg", j.trigger.channel === "alarm" ? "bg-white/20" : "bg-navy text-white")}>
                  <Icon size={15} />
                </span>
                <span className="font-semibold">{j.trigger.from}</span>
                <span className="ml-auto opacity-60">{C.label} · now</span>
              </div>
              <p className="text-[15px] leading-snug">{j.trigger.text}</p>
            </div>
          </div>
        </div>

        <button onClick={() => enter(j, 1)} className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-ink">
          {j.steps[0].label} <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
