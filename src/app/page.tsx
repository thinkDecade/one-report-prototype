"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  Bell,
  ChartColumn,
  Check,
  EyeOff,
  FileText,
  Fingerprint,
  Landmark,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  TriangleExclamationPoint,
  UserRound,
} from "lucide-react";
import { GhanaRule, Logo, useHydrated } from "@/components/ui";
import { usePortal } from "@/lib/store";
import Capabilities from "@/components/Capabilities";

const WHAT = [
  { icon: FileText, title: "One reporting channel", text: "A single structured report, rather than separate submissions through multiple disconnected channels." },
  { icon: ArrowRightLeft, title: "Connected financial intelligence", text: "A clearer view of incidents and suspicious fund movements across payment and virtual asset rails." },
  { icon: ShieldCheck, title: "Coordinated response", text: "Shared case visibility, preserved evidence and accountable actions across the relevant institutions." },
];

const AUDIENCES = [
  {
    icon: FileText,
    who: "Hacked businesses",
    detail: "VASPs, mobile money issuers, payment providers and agents",
    gets: [
      "File once in about 15 minutes, instead of separate notices to each regulator and the police",
      "Evidence is fingerprinted on upload, so it holds up in court",
      "Follow your case: who acknowledged it, what was frozen, what is still needed from you",
      "CID drafts the police complaint report for you to sign",
    ],
    cta: "Report an incident",
    href: "/report",
    journey: "reporter",
    primary: true,
  },
  {
    icon: Search,
    who: "Agents, OTC desks and banks",
    detail: "Anyone about to pay out, sell crypto or open an account",
    gets: [
      "Check one number, account or wallet in seconds before you transact",
      "Three plain answers: none found, unconfirmed or reported",
      "A receipt that proves you checked in good faith",
      "Urgent alerts, and a warning if something you checked is reported later",
    ],
    cta: "Check a number",
    href: "/check",
    journey: "otc",
  },
  {
    icon: Shield,
    who: "Authority officers",
    detail: "CSA, CID, FIC, Bank of Ghana, SEC, AG, EOCO, NCA and others",
    gets: [
      "Your task arrives with only the fields your mandate allows",
      "Four buttons: acknowledge, record action, hand on, decline",
      "The Cyber Security Authority leads and sees the whole case",
      "Every action is logged in a tamper-evident record",
    ],
    cta: "Open your task",
    href: "/task",
    journey: "partner",
  },
  {
    icon: ChartColumn,
    who: "Heads and the steering group",
    detail: "Heads of authorities and the oversight group",
    gets: [
      "Escalations reach you at twice the target, with one clear action",
      "Acknowledgement clocks for every authority, side by side",
      "Register accuracy: what was confirmed, dropped or lapsed",
      "Counts and times only, no personal data",
    ],
    cta: "See the steering view",
    href: "/steering",
    journey: "head",
  },
] as const;

const STEPS = [
  { t: "04:31", h: "Report", d: "KentePay files one report about a ₵1.84m SIM swap theft. Three evidence files are sealed." },
  { t: "04:31", h: "Route", d: "Ten authorities get their part at once. CSA has one hour to acknowledge, the rest two." },
  { t: "05:22", h: "Warn", d: "The thieves' wallet is confirmed on the register and an urgent alert goes to agents and OTC desks." },
  { t: "08:31", h: "Freeze", d: "Freeze requests go out within four hours, through the FIC, EOCO and the courts." },
];

const SAFEGUARDS = [
  { icon: Fingerprint, title: "Sealed evidence", text: "Every file is fingerprinted and time-stamped on arrival." },
  { icon: EyeOff, title: "Need to know", text: "Each authority sees only its part. Other businesses only see a check answer." },
  { icon: ShieldCheck, title: "Never “clean”", text: "A check never says a number is safe. A clear check is not a guarantee." },
  { icon: Landmark, title: "No new powers", text: "The portal carries requests. Freezes stay with the FIC, EOCO and the courts." },
];

export default function Landing() {
  const hydrated = useHydrated();
  const alert = usePortal((s) => s.alerts.find((a) => a.kind === "urgent"));
  return (
    <div className="flex flex-col bg-paper px-3 pb-6 pt-3 text-ink sm:px-6">
      <p className="pb-3 text-center text-xs text-muted">
        Concept prototype by the Chamber of Digital Assets and Blockchain Innovations, Ghana Chapter. Not an official government service.
      </p>

      {/* HERO */}
      <section className="kente flex flex-col gap-12 rounded-[28px] px-4 pb-10 pt-4 text-white sm:px-6 lg:pb-14">
        <nav className="flex items-center justify-between gap-2 rounded-full border border-white/30 p-1.5">
          <div className="flex items-center gap-1">
            <span className="mr-2">
              <Logo size={40} />
            </span>
            <a href="#what" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              What it is
            </a>
            <a href="#platform" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              Platform
            </a>
            <a href="#who" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              Who it&apos;s for
            </a>
            <a href="#how" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              How it works
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/journeys" className="hidden h-10 items-center rounded-full border border-white/30 px-4 text-sm hover:bg-white/10 md:inline-flex">
              See it as…
            </Link>
            <Link href="/task" className="hidden h-10 items-center rounded-full border border-white/30 px-4 text-sm hover:bg-white/10 sm:inline-flex">
              Officer sign-in
            </Link>
            <Link href="/report" className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink">
              Report an incident
            </Link>
          </div>
        </nav>

        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-7 px-2">
          {hydrated && alert && (
            <Link href={`/alerts/${alert.id}`} className="glass flex w-fit max-w-full items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[13px] hover:bg-white/15">
              <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-gold px-2.5 text-[11px] font-bold text-ink">
                <TriangleExclamationPoint size={12} /> {alert.id}
              </span>
              <span className="truncate">Live drill: urgent alert on stolen funds turned into USDT</span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          )}
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Virtual asset financial crime response platform</span>
            <h1 className="max-w-[820px] font-display text-[clamp(44px,6vw,76px)] font-extrabold leading-[0.95] tracking-[-0.045em]">One Report. Every Agency.</h1>
            <p className="max-w-[680px] text-[20px] font-semibold leading-snug">A unified platform for reporting and coordinating responses to virtual asset financial crime.</p>
            <p className="max-w-[640px] text-[16px] leading-relaxed text-white/80">
              Project One Report connects financial service providers and public authorities through a shared platform for incident reporting, digital evidence management, cross-rail
              intelligence and coordinated response.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/journeys" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-ink">
              Explore the Platform <ArrowRight size={16} />
            </Link>
            <Link href="/demo" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-[15px] hover:bg-white/10">
              Request a Demonstration
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1180px] flex-col">
        {/* WHAT IT IS */}
        <section id="what" className="flex flex-col gap-8 pt-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy">A shared response framework</span>
              <h2 className="max-w-[560px] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">
                Financial crime moves across rails. Incident response should too.
              </h2>
            </div>
            <div className="flex max-w-[600px] flex-col gap-4 text-[15px] leading-relaxed text-[#4A4E57] lg:pt-7">
              <p>
                Virtual asset and payment-related incidents rarely remain within one financial system. Stolen funds can move between mobile money, bank accounts and virtual
                assets, leaving providers and investigators with fragmented information and disconnected reporting channels.
              </p>
              <p className="text-ink">
                Project One Report is designed to bring these parts together through a unified incident reporting and evidence coordination platform.
              </p>
              <p>
                It gives participating providers a common channel to submit incident reports and supporting evidence, while helping relevant authorities access the information
                they need to coordinate an effective response.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted">Three principles that define the platform</span>
            <div className="grid gap-3 md:grid-cols-3">
              {WHAT.map((w, i) => {
                const I = w.icon;
                return (
                  <div key={w.title} className="flex flex-col gap-3 rounded-[20px] bg-white p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white">
                        <I size={18} />
                      </span>
                      <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    </div>
                    <span className="text-lg font-semibold tracking-tight">{w.title}</span>
                    <span className="text-sm leading-relaxed text-[#4A4E57]">{w.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Capabilities />

        {/* WHO */}
        <section id="who" className="flex flex-col gap-6 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted">Who it&apos;s for</span>
              <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">What you get from it</h2>
            </div>
            <p className="max-w-[420px] text-sm text-[#4A4E57]">
              Hacked on either rail, mobile money or crypto, you are a victim and you report here. Licensed or not.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {AUDIENCES.map((a) => {
              const I = a.icon;
              const primary = "primary" in a && a.primary;
              return (
                <div key={a.who} className={`flex flex-col gap-4 rounded-[22px] p-6 ${primary ? "kente text-white" : "bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${primary ? "bg-white text-navy" : "bg-navy text-white"}`}>
                      <I size={18} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold tracking-tight">{a.who}</span>
                      <span className={`text-[13px] ${primary ? "text-white/70" : "text-muted"}`}>{a.detail}</span>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {a.gets.map((g) => (
                      <li key={g} className="flex gap-2.5 text-sm leading-snug">
                        <Check size={16} className={`mt-0.5 shrink-0 ${primary ? "text-gold" : "text-navy"}`} />
                        <span className={primary ? "text-white/90" : "text-[#30343C]"}>{g}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    <Link
                      href={a.href}
                      className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold ${primary ? "bg-white text-ink" : "bg-ink text-white"}`}
                    >
                      {a.cta} <ArrowRight size={15} />
                    </Link>
                    <Link
                      href={`/journeys/${a.journey}`}
                      className={`inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm ${primary ? "text-white/80 hover:text-white" : "text-[#4A4E57] hover:text-ink"}`}
                    >
                      <UserRound size={15} /> Walk through it
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[18px] bg-white px-5 py-4 text-sm">
            <span className="font-semibold">Also here:</span>
            <Link href="/insider" className="inline-flex items-center gap-1.5 hover:underline">
              <EyeOff size={15} /> Report an insider confidentially
            </Link>
            <a href="tel:292" className="inline-flex items-center gap-1.5 hover:underline">
              <Phone size={15} /> Systems down? Call 292 and file from a clean device
            </a>
            <Link href="/alerts" className="inline-flex items-center gap-1.5 hover:underline">
              <Bell size={15} /> Current fraud alerts
            </Link>
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="flex flex-col gap-6 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted">How it works</span>
              <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">Four hours, from hack to freeze request</h2>
            </div>
            <Link href="/journeys" className="inline-flex h-11 items-center gap-2 rounded-full border border-ink px-5 text-sm font-medium hover:bg-white">
              Follow the drill by role <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.h} className="flex flex-col gap-2 rounded-[20px] bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper font-mono text-xs">{i + 1}</span>
                  <span className="font-mono text-xs text-muted">{s.t}</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">{s.h}</span>
                <span className="text-sm leading-relaxed text-[#4A4E57]">{s.d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SAFEGUARDS */}
        <section id="trust" className="flex flex-col gap-6 pt-16">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted">Safeguards</span>
            <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">Built to be trusted</h2>
            <p className="text-sm text-[#4A4E57]">Hosted by the state, built on Acts 1154, 1038, 987 and 1044. CDABI holds no data.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SAFEGUARDS.map((g) => {
              const I = g.icon;
              return (
                <div key={g.title} className="flex flex-col gap-2 rounded-[20px] border border-[#E2E0DA] p-5">
                  <I size={20} />
                  <span className="font-semibold">{g.title}</span>
                  <span className="text-sm leading-relaxed text-[#4A4E57]">{g.text}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* CLOSING */}
      <section className="kente mt-16 flex flex-col items-center gap-5 rounded-[28px] px-5 pb-6 pt-12 text-center text-white">
        <h2 className="font-display text-[clamp(30px,3.6vw,48px)] font-extrabold leading-tight tracking-[-0.04em]">Be ready before the next one.</h2>
        <p className="max-w-[520px] text-[15px] leading-relaxed text-white/80">
          Hacked right now? Report it. About to transact? Check first. Want to see the whole thing? Walk through it as any of the six people involved.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/report" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-ink">
            <FileText size={16} /> Report an incident
          </Link>
          <Link href="/check" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-[15px] hover:bg-white/10">
            <Search size={16} /> Check a number
          </Link>
          <Link href="/journeys" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-[15px] hover:bg-white/10">
            See it as… <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 flex w-full flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white px-5 py-4 text-left text-xs text-muted">
          <span className="flex items-center gap-4">
            <Logo dark size={34} />
            <span className="hidden h-8 w-px bg-[#E4E3DF] sm:block" />
            <span className="max-w-[560px]">
              Concept by the Chamber of Digital Assets and Blockchain Innovations (CDABI), Ghana Chapter, for the consideration of the Bank of Ghana, SEC Ghana, the Cyber Security Authority and
              partner authorities. Not an official government service.
            </span>
          </span>
          <GhanaRule />
        </div>
      </section>
    </div>
  );
}
