"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  FileText,
  Hash,
  Landmark,
  Lock,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Clock,
  UserRound,
  EyeOff,
  TriangleExclamationPoint,
} from "lucide-react";
import { ArrowCircle, GhanaRule, GlassIcon, Logo, Seal, useHydrated } from "@/components/ui";
import { usePortal } from "@/lib/store";

const DOORS = [
  {
    tex: "kente",
    icon: FileText,
    who: "VASP, mobile money issuer, payment provider or agent",
    title: "I've been hacked",
    body: "File what you know in minutes. Add the rest as it comes in. Unlicensed or awaiting a licence? Report anyway.",
    cta: "File a report",
    href: "/report",
    chip: [Clock, "First notice in under 15 minutes"],
  },
  {
    tex: "ripple",
    icon: Search,
    who: "Agent, OTC vendor, issuer, VASP or bank",
    title: "I'm about to transact",
    body: "Check one number, account or wallet before you pay out or sell. Keep the receipt: it shows you checked.",
    cta: "Check a number",
    href: "/check",
    chip: [Lock, "One check at a time, never a list"],
  },
  {
    tex: "weave",
    icon: Shield,
    who: "Officer at CSA, CID, FIC, BoG, SEC or a partner",
    title: "I act on reports",
    body: "See one report become register entries, freeze requests and a court-ready record, with a clock on every step.",
    cta: "Open the authority view",
    href: "/board",
    chip: [Bell, "Live drill case: GH-PAY-2026-000229"],
  },
] as const;

export default function Landing() {
  const hydrated = useHydrated();
  const alert = usePortal((s) => s.alerts.find((a) => a.kind === "urgent"));
  return (
    <div className="flex flex-col bg-paper px-3 pb-6 pt-3.5 text-ink sm:px-6">
      <p className="pb-3 text-center text-xs text-muted">
        Concept prototype by the Chamber of Digital Assets and Blockchain Innovations, Ghana Chapter. Not an official government service.
      </p>

      {/* HERO */}
      <section className="kente kente-lg relative h-[760px] overflow-hidden rounded-[36px] text-white md:h-[900px]">
        <nav className="absolute inset-x-4 top-5 flex items-center justify-between rounded-full border border-white/30 p-1.5 sm:inset-x-8 sm:top-7">
          <div className="flex items-center gap-1">
            <span className="mr-3">
              <Logo size={46} />
            </span>
            <a href="#who" className="hidden h-11 items-center rounded-full border border-white/30 px-6 text-sm hover:bg-white/10 lg:inline-flex">
              Who it&apos;s for
            </a>
            <a href="#how" className="hidden h-11 items-center rounded-full border border-white/30 px-6 text-sm hover:bg-white/10 lg:inline-flex">
              How it works
            </a>
            <a href="#trust" className="hidden h-11 items-center rounded-full border border-white/30 px-6 text-sm hover:bg-white/10 lg:inline-flex">
              Safeguards
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/check" className="hidden h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-sm hover:bg-white/10 xl:inline-flex">
              <Search size={15} /> Check a number
            </Link>
            <Link href="/board" className="hidden h-11 items-center rounded-full border border-white/30 px-6 text-sm hover:bg-white/10 sm:inline-flex">
              Officer sign-in
            </Link>
            <Link href="/journeys" className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-ink">
              See it as…
            </Link>
          </div>
        </nav>

        {hydrated && alert && (
          <Link
            href={`/alerts/${alert.id}`}
            className="glass absolute left-6 right-6 top-[104px] flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm hover:bg-white/15 sm:left-24 sm:right-auto sm:top-[124px]"
          >
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gold px-3 text-xs font-bold text-ink">
              <TriangleExclamationPoint size={13} /> {alert.id}
            </span>
            <span className="truncate">Urgent fraud alert: confirmed numbers and wallets from a Level 1 theft</span>
            <ArrowRight size={15} className="shrink-0" />
          </Link>
        )}

        <div className="absolute left-6 top-[180px] sm:left-24 sm:top-[220px]">
          <div className="ml-2 text-3xl font-semibold tracking-tight sm:ml-6 sm:text-[44px]">Hacked? Report it</div>
          <div className="mt-2 font-display text-[clamp(140px,25vw,360px)] font-extrabold leading-[0.82] tracking-[-0.065em]">once.</div>
          <p className="ml-2 mt-8 max-w-[560px] text-base leading-relaxed text-white/85 sm:ml-[180px] sm:text-lg">
            One report reaches the Cyber Security Authority for action, and the police, FIC, Bank of Ghana and SEC at the same moment. Each gets only its part.
          </p>
        </div>

        <a href="#who" aria-label="Scroll down" className="absolute bottom-[140px] right-11 hidden h-16 w-16 items-center justify-center rounded-full border border-white/60 hover:bg-white/10 md:flex">
          <ArrowDown size={22} strokeWidth={1.8} />
        </a>

        <div className="notch-corner absolute bottom-24 right-0 h-8 w-8" />
        <div className="notch-corner absolute bottom-0 right-[360px] hidden h-8 w-8 sm:block" />
        <div className="absolute bottom-0 right-0 flex h-24 w-full items-end justify-end rounded-tl-[32px] bg-paper sm:w-[360px]">
          <Link
            href="/report"
            className="inline-flex h-[72px] w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-ink text-[19px] font-medium text-ink transition-colors hover:bg-ink hover:text-white sm:w-[336px]"
          >
            File a report <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* WHO */}
      <section id="who" className="flex flex-wrap items-end justify-between gap-6 px-2 pt-28 sm:px-6">
        <h2 className="font-display text-[clamp(64px,8vw,120px)] font-extrabold leading-[0.85] tracking-[-0.065em]">Start here</h2>
        <p className="mb-2.5 max-w-[400px] text-[15px] font-medium leading-normal">
          Hacked on either rail, mobile money or crypto, you are a victim and you report here. Everyone else uses the portal to check, or to act.{" "}
          <Link href="/journeys" className="underline underline-offset-4">
            Or follow one person through the drill.
          </Link>
        </p>
      </section>

      <section className="grid gap-3 pt-10 lg:grid-cols-3">
        {DOORS.map((d) => {
          const Chip = d.chip[0];
          return (
            <Link key={d.href} href={d.href} className={`${d.tex} group flex min-h-[420px] flex-col justify-between rounded-[26px] p-7 text-white`}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <GlassIcon>
                    <d.icon size={20} strokeWidth={1.8} />
                  </GlassIcon>
                  <span className="transition-transform group-hover:translate-x-1">
                    <ArrowCircle dark={false} />
                  </span>
                </div>
                <span className="pt-6 text-[13px] text-white/70">{d.who}</span>
                <span className="text-[44px] font-bold leading-none tracking-[-0.04em]">{d.title}</span>
                <span className="max-w-[400px] text-[15px] leading-normal text-white/80">{d.body}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/25 pt-4">
                <span className="text-[15px] font-semibold">{d.cta}</span>
                <span className="glass inline-flex h-[34px] items-center gap-2 rounded-full px-4 text-xs">
                  <Chip size={14} />
                  {d.chip[1]}
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* HOW */}
      <section id="how" className="flex flex-wrap items-end justify-between gap-6 px-2 pt-36 sm:px-6">
        <h2 className="font-display text-[clamp(64px,8vw,120px)] font-extrabold leading-[0.85] tracking-[-0.065em]">How it works</h2>
        <p className="mb-2.5 max-w-[400px] text-[15px] font-medium leading-normal">
          The drill: ₵1.84m stolen from agent float by SIM swap at 03:31, sent to three wallets, and turned into USDT through an OTC desk.
        </p>
      </section>

      <section className="grid gap-4 pt-11 md:grid-cols-3">
        {[
          { n: "01", t: "Report", d: "KentePay files once. Evidence is sealed on arrival.", time: "04:31", tex: "kente" },
          { n: "02", t: "Route", d: "CSA acts. CID, FIC, BoG, SEC, AG and NCA get their part.", time: "04:31", tex: "ripple" },
          { n: "03", t: "Recover", d: "Numbers go on the register. Freeze requests go out within four hours.", time: "08:31", tex: "weave" },
        ].map((s) => (
          <div key={s.n} className="flex flex-col gap-5 rounded-[26px] bg-white px-3 pb-6 pt-3">
            <div className={`${s.tex} relative h-[240px] rounded-[18px]`}>
              <span className="glass absolute left-3.5 top-3.5 flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white">{s.n}</span>
              <span className="glass absolute bottom-3.5 left-3.5 rounded-full px-3.5 py-1.5 font-mono text-[13px] text-white">{s.time}</span>
            </div>
            <div className="flex flex-col gap-1.5 px-2.5">
              <span className="text-[28px] font-semibold tracking-tight">{s.t}</span>
              <span className="text-sm leading-snug text-muted">{s.d}</span>
            </div>
          </div>
        ))}
      </section>

      {/* SAFEGUARDS */}
      <section id="trust" className="flex flex-wrap-reverse items-end justify-between gap-6 px-2 pt-36 sm:px-6">
        <p className="mb-3 max-w-[300px] text-[13px] font-medium leading-normal">
          Hosted by the state, built on Acts 1154, 1038, 987 and 1044. CDABI holds no data.
        </p>
        <h2 className="text-right font-display text-[clamp(64px,8vw,120px)] font-extrabold leading-[0.85] tracking-[-0.065em]">Built to be trusted</h2>
      </section>

      <section className="grid gap-3 pt-11 md:grid-cols-2 xl:grid-cols-4">
        {[
          { tex: "kente", icon: Hash, t: "Sealed evidence", d: "Every file is fingerprinted and time-stamped on arrival, so a court can trust it has not changed." },
          { tex: "ripple", icon: EyeOff, t: "Confidential", d: "Other businesses only see an answer to the one number they check. Never who reported, the case or your customers." },
          { tex: "dots", icon: ShieldCheck, t: "Never “clean”", d: "Three answers only: no reports found, reported unconfirmed, or reported. A clear check is not a guarantee." },
          { tex: "weave", icon: Landmark, t: "No new powers", d: "The register orders no holds. Freezes stay with the FIC, EOCO and the courts." },
        ].map((x) => (
          <div key={x.t} className={`${x.tex} flex min-h-[300px] flex-col justify-between rounded-[26px] p-7 text-white`}>
            <GlassIcon>
              <x.icon size={20} strokeWidth={1.8} />
            </GlassIcon>
            <div className="flex flex-col gap-2.5">
              <span className="text-[34px] font-extrabold leading-none tracking-[-0.04em]">{x.t}</span>
              <span className="text-sm leading-snug text-white/80">{x.d}</span>
            </div>
          </div>
        ))}
      </section>

      {/* BEFORE YOU NEED IT */}
      <section className="mt-3 grid gap-3 md:grid-cols-3">
        {[
          { icon: UserRound, t: "Suspect someone inside?", d: "Staff can report an insider confidentially. It goes to CID and the Cyber Security Authority, not the company.", cta: "Report an insider", href: "/insider" },
          { icon: Landmark, t: "Not licensed yet?", d: "Register with your company number and certificate of incorporation. It takes about twenty minutes. Registration is not a licence.", cta: "Register your business", href: "/report" },
          { icon: Phone, t: "Systems down?", d: "If your systems are compromised or the portal is unreachable, call or text 292 and file from a clean device.", cta: "Call 292", href: "tel:292" },
        ].map((x) => (
          <div key={x.t} className="flex flex-col gap-4 rounded-[26px] bg-white p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper">
              <x.icon size={20} strokeWidth={1.8} />
            </span>
            <span className="text-2xl font-bold tracking-tight">{x.t}</span>
            <span className="text-sm leading-relaxed text-muted">{x.d}</span>
            <Link href={x.href} className="mt-auto inline-flex items-center gap-2 pt-2 text-[15px] font-semibold">
              {x.cta} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </section>

      {/* CLOSING */}
      <section className="kente kente-lg mt-36 flex flex-col items-center overflow-hidden rounded-[36px] px-4 pb-4 pt-16 text-white">
        <div className="flex w-full items-center">
          <div className="h-px flex-1 bg-white/30" />
          <Seal size={72} />
          <div className="h-px flex-1 bg-white/30" />
        </div>
        <h2 className="mt-9 text-center font-display text-[clamp(48px,6vw,84px)] font-extrabold leading-[0.95] tracking-[-0.05em]">Ready before the next one.</h2>
        <p className="mt-5 max-w-[460px] text-center text-[15px] leading-relaxed text-white/80">Register your business now, so the first report on the worst night takes minutes, not hours.</p>
        <div className="mt-16 flex w-full flex-col items-center gap-6 rounded-[26px] bg-white px-4 pb-6 pt-7 text-ink sm:px-8">
          <div className="flex flex-wrap justify-center gap-1 rounded-[28px] border border-ink p-1 md:flex-nowrap md:rounded-full">
            <Link href="/report" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-medium text-white">
              <FileText size={16} /> File a report
            </Link>
            <Link href="/check" className="inline-flex h-[52px] items-center gap-2 rounded-full border border-ink px-7 text-[15px] font-medium hover:bg-paper">
              <Search size={16} /> Check a number
            </Link>
            <Link href="/board" className="inline-flex h-[52px] items-center gap-2 rounded-full border border-ink px-7 text-[15px] font-medium hover:bg-paper">
              <Shield size={16} /> Officer sign-in
            </Link>
            <Link href="/journeys" className="inline-flex h-[52px] items-center gap-2 rounded-full border border-ink px-7 text-[15px] font-medium hover:bg-paper">
              See it as… <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#E4E3DF] pt-5 text-xs text-muted">
            <span className="flex items-center gap-4">
              <Logo dark size={36} />
              <span className="hidden h-8 w-px bg-[#E4E3DF] sm:block" />
              <span className="max-w-[560px]">
                Concept by the Chamber of Digital Assets and Blockchain Innovations (CDABI), Ghana Chapter, for the consideration of the Bank of Ghana, SEC Ghana, the Cyber Security Authority and partner authorities. Not an official government service.
              </span>
            </span>
            <GhanaRule />
          </div>
        </div>
      </section>
    </div>
  );
}
