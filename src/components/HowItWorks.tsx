import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";

const STAGES = [
  {
    k: "Register",
    h: "Register and access",
    d: "Participating financial service providers register their institutions and designate authorised incident officers. Larger providers can connect through an API, while smaller providers can use the web portal.",
  },
  {
    k: "Report",
    h: "Submit one incident report",
    d: "The provider records what happened, identifies affected accounts or wallets, documents the suspected movement of funds and submits the incident through a structured reporting interface.",
  },
  {
    k: "Preserve",
    h: "Preserve and verify evidence",
    d: "Original transaction records, system logs and supporting files are submitted and fingerprinted using SHA-256. Timestamps, exhibit references and chain-of-custody records help preserve the integrity of the evidence.",
  },
  {
    k: "Route",
    h: "Route to relevant authorities",
    d: "The platform prepares structured notifications for the Cyber Security Authority, law enforcement, financial intelligence and relevant financial regulators. Each institution receives information according to its mandate and the case circumstances.",
  },
  {
    k: "Respond",
    h: "Coordinate action and follow-up",
    d: "Authorities acknowledge cases, record actions, assign responsibilities and coordinate investigative requests. Providers can submit updates and follow the progress of their reports through the case record.",
  },
];

const OUTPUTS = [
  "Police complaint reports for review and signature.",
  "Technical incident reports for cyber response.",
  "Suspicious transaction information for the Financial Intelligence Centre.",
  "Supervisory notifications for relevant regulators.",
  "Evidence packages and tracing information to support recovery proceedings.",
];

const RECIPIENTS = ["Cyber response", "Law enforcement", "Financial intelligence", "Financial regulators"];

export default function HowItWorks() {
  return (
    <section id="how" className="flex flex-col gap-8 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[700px] flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy">The incident response journey</span>
          <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">From incident report to coordinated action.</h2>
          <p className="text-[15px] leading-relaxed text-[#4A4E57]">
            Project One Report turns a fragmented reporting process into a structured incident response journey. Participating providers submit one report, preserve the
            supporting evidence and enable the relevant institutions to coordinate their respective actions.
          </p>
        </div>
        <Link href="/journeys" className="inline-flex h-11 items-center gap-2 rounded-full border border-ink px-5 text-sm font-medium hover:bg-white">
          Follow it by role <ArrowRight size={15} />
        </Link>
      </div>

      {/* five stages: vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-muted">The five-step process</span>
        <ol className="relative grid gap-0 rounded-[24px] bg-white p-5 sm:p-7 lg:grid-cols-5 lg:gap-5">
          {STAGES.map((s, i) => (
            <li key={s.k} className="relative flex gap-4 pb-6 last:pb-0 lg:flex-col lg:gap-3 lg:pb-0">
              {i < STAGES.length - 1 && (
                <>
                  <span aria-hidden className="absolute left-5 top-10 bottom-0 w-px bg-[#E2E0DA] lg:hidden" />
                  <span aria-hidden className="absolute left-10 -right-5 top-5 hidden h-px bg-[#E2E0DA] lg:block" />
                </>
              )}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-mono text-xs font-semibold text-white ring-4 ring-white">
                0{i + 1}
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{s.k}</span>
                <span className="text-[17px] font-semibold leading-snug tracking-tight">{s.h}</span>
                <span className="text-[13px] leading-relaxed text-[#4A4E57]">{s.d}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* outputs */}
      <div className="kente grid gap-8 rounded-[24px] p-6 text-white sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-[clamp(22px,2.2vw,30px)] font-extrabold leading-tight tracking-[-0.03em]">One report. Multiple coordinated outputs.</h3>
          <p className="text-[15px] leading-relaxed text-white/75">A single incident submission can support the preparation of several structured outputs, including:</p>
          <ul className="flex flex-col gap-2.5">
            {OUTPUTS.map((o) => (
              <li key={o} className="flex gap-2.5 text-sm leading-snug text-white/90">
                <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center gap-0">
          <div className="flex w-full max-w-[340px] flex-col items-center rounded-2xl bg-white px-5 py-4 text-center text-ink">
            <span className="font-display text-lg font-extrabold tracking-tight">Project One Report</span>
            <span className="text-xs text-muted">Unified incident and evidence coordination</span>
          </div>
          <span aria-hidden className="h-6 w-px bg-white/40" />
          <span aria-hidden className="h-px w-[75%] bg-white/40" />
          <div className="grid w-full grid-cols-2 gap-2 pt-0 sm:grid-cols-4">
            {RECIPIENTS.map((r) => (
              <div key={r} className="flex flex-col items-center">
                <span aria-hidden className="h-5 w-px bg-white/40" />
                <span className="glass flex min-h-[56px] w-full items-center justify-center rounded-xl px-2 text-center text-xs font-medium leading-tight">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* important distinction */}
      <div className="flex flex-col gap-3 rounded-[24px] border border-[#E2E0DA] p-6 sm:p-7">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Info size={16} /> Important distinction
        </span>
        <div className="grid gap-4 text-sm leading-relaxed text-[#4A4E57] md:grid-cols-2">
          <p>
            Automated delivery of notifications to individual authorities depends on agreed data-sharing arrangements. Until those arrangements are in place, the platform
            prepares the relevant outputs for providers to submit through existing official channels.
          </p>
          <p>
            Project One Report supports coordination and evidence preservation. It does not independently authorise the freezing of funds. Such action remains with the legally
            empowered authorities.
          </p>
        </div>
      </div>

      <p className="font-display text-[clamp(18px,1.8vw,24px)] font-bold leading-snug tracking-[-0.02em]">
        One submission creates a connected record. <span className="text-muted">Every relevant institution can act on the information within its mandate.</span>
      </p>
    </section>
  );
}
