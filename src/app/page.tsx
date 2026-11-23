"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  ChartColumn,
  Check,
  EyeOff,
  FileText,
  Fingerprint,
  Landmark,
  Search,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { GhanaRule, Logo } from "@/components/ui";
import Capabilities from "@/components/Capabilities";
import HowItWorks from "@/components/HowItWorks";

const WHAT = [
  { icon: FileText, title: "One reporting channel", text: "A single structured report, rather than separate submissions through multiple disconnected channels." },
  { icon: ArrowRightLeft, title: "Connected financial intelligence", text: "A clearer view of incidents and suspicious fund movements across payment and virtual asset rails." },
  { icon: ShieldCheck, title: "Coordinated response", text: "Shared case visibility, preserved evidence and accountable actions across the relevant institutions." },
];

const AUDIENCES = [
  {
    icon: FileText,
    who: "Reporting institutions",
    detail: "Virtual asset service providers, electronic money issuers, payment service providers and agents",
    gets: [
      "Submit one structured report instead of separate notices to each authority",
      "Evidence is fingerprinted and time-stamped on submission",
      "Track acknowledgements, actions taken and outstanding requests on the case record",
      "Receive a draft police complaint report for review and signature",
    ],
    cta: "Report an incident",
    href: "/report",
    journey: "reporter",
  },
  {
    icon: Search,
    who: "Agents, OTC desks and banks",
    detail: "Businesses about to pay out, exchange virtual assets or open an account",
    gets: [
      "Check a mobile money number, bank account or wallet address before transacting",
      "Receive one of three status responses: no report, unconfirmed or reported",
      "Keep a receipt as a record of the check",
      "Receive urgent alerts, including when a checked identifier is reported later",
    ],
    cta: "Check the register",
    href: "/check",
    journey: "otc",
  },
  {
    icon: Shield,
    who: "Authority officers",
    detail: "CSA, Police CID, FIC, Bank of Ghana, SEC, Attorney-General's Department, EOCO, NCA and others",
    gets: [
      "Receive only the information your mandate allows",
      "Acknowledge, record action, hand on or decline each task",
      "The Cyber Security Authority leads and sees the full case",
      "Every action is written to a tamper-evident audit record",
    ],
    cta: "Open the officer view",
    href: "/task",
    journey: "partner",
  },
  {
    icon: ChartColumn,
    who: "Heads of authorities and oversight",
    detail: "Heads of participating authorities and the steering group",
    gets: [
      "Escalations arrive at twice the target time, with a single required action",
      "Acknowledgement times for every authority on one view",
      "Register accuracy: entries confirmed, dropped or lapsed",
      "Aggregate counts and times only, with no personal data",
    ],
    cta: "Open the oversight view",
    href: "/steering",
    journey: "head",
  },
] as const;


const SAFEGUARDS = [
  { icon: Fingerprint, title: "Evidence integrity", text: "Files are fingerprinted with SHA-256 and time-stamped on submission, with a chain-of-custody record." },
  { icon: EyeOff, title: "Need-to-know access", text: "Each authority sees only the fields its mandate allows. Businesses see a check status only." },
  { icon: ShieldCheck, title: "No clearance statements", text: "The register never certifies an identifier as safe. A check with no report is not a guarantee." },
  { icon: Landmark, title: "Existing legal powers", text: "The platform carries requests. Freezing and seizure remain with the FIC, EOCO and the courts." },
];

export default function Landing() {
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
              Overview
            </a>
            <a href="#platform" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              Platform
            </a>
            <a href="#who" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              Participants
            </a>
            <a href="#how" className="hidden h-10 items-center rounded-full px-4 text-sm hover:bg-white/10 lg:inline-flex">
              How it works
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/journeys" className="hidden h-10 items-center rounded-full border border-white/30 px-4 text-sm hover:bg-white/10 md:inline-flex">
              Walkthroughs
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
          <div className="flex max-w-[700px] flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy">Participants</span>
            <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">What each participant receives.</h2>
            <p className="text-[15px] leading-relaxed text-[#4A4E57]">
              Any provider affected by an incident on the payment or virtual asset rails can report, whether licensed or not.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {AUDIENCES.map((a) => {
              const I = a.icon;
              return (
                <div key={a.who} className="flex flex-col gap-4 rounded-[22px] bg-white p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                      <I size={18} />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold tracking-tight">{a.who}</span>
                      <span className="text-[13px] text-muted">{a.detail}</span>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {a.gets.map((g) => (
                      <li key={g} className="flex gap-2.5 text-sm leading-snug text-[#30343C]">
                        <Check size={16} className="mt-0.5 shrink-0 text-navy" />
                        {g}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    <Link href={a.href} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white">
                      {a.cta} <ArrowRight size={15} />
                    </Link>
                    <Link href={`/journeys/${a.journey}`} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm text-[#4A4E57] hover:text-ink">
                      <UserRound size={15} /> View walkthrough
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW */}
        <HowItWorks />

        {/* SAFEGUARDS */}
        <section id="trust" className="flex flex-col gap-6 pt-16">
          <div className="flex max-w-[700px] flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy">Governance and safeguards</span>
            <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">Designed for accountability.</h2>
            <p className="text-[15px] leading-relaxed text-[#4A4E57]">
              Proposed for state hosting under Acts 1154, 1038, 987 and 1044. CDABI would hold no incident data.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SAFEGUARDS.map((g) => {
              const I = g.icon;
              return (
                <div key={g.title} className="flex flex-col gap-2 rounded-[20px] bg-white p-5">
                  <I size={20} className="text-navy" />
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
        <h2 className="max-w-[760px] font-display text-[clamp(28px,3.2vw,44px)] font-extrabold leading-tight tracking-[-0.04em]">See how One Report would work for your institution.</h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-white/80">
          Walk through the platform from the position of each participant, or request a demonstration for your team.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/journeys" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-ink">
            Explore the Platform <ArrowRight size={16} />
          </Link>
          <Link href="/demo" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-[15px] hover:bg-white/10">
            Request a Demonstration
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
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink">
            <Link href="/report" className="hover:underline">Report an incident</Link>
            <Link href="/check" className="hover:underline">Check the register</Link>
            <Link href="/alerts" className="hover:underline">Fraud alerts</Link>
            <Link href="/insider" className="hover:underline">Confidential insider report</Link>
            <GhanaRule />
          </span>
        </div>
      </section>
    </div>
  );
}
