import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  FileText,
  Globe,
  Hash,
  Landmark,
  Lock,
  Phone,
  Play,
  Receipt,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Clock,
  Wallet,
} from "lucide-react";
import { ArrowCircle, GhanaRule, GlassIcon, Seal } from "@/components/ui";

const SEALS = ["CSA", "CID", "FIC", "BoG", "SEC"];

export default function Landing() {
  return (
    <div className="flex flex-col bg-paper px-3 pb-6 pt-3.5 text-ink sm:px-6">
      <p className="pb-3 text-center text-xs text-muted">
        Concept prototype by the Chamber of Digital Assets and Blockchain Innovations, Ghana. Not a live government service.
      </p>

      {/* HERO */}
      <section className="kente kente-lg relative h-[760px] md:h-[960px] overflow-hidden rounded-[36px] text-white">
        <nav className="absolute inset-x-4 top-5 flex items-center justify-between rounded-full border border-white/30 p-1.5 sm:inset-x-8 sm:top-7">
          <div className="flex items-center gap-1">
            <span className="mr-1">
              <Seal size={46} />
            </span>
            <Link href="/" className="inline-flex h-[46px] items-center rounded-full bg-white px-7 text-sm font-semibold text-ink">
              Home
            </Link>
            <a href="#how" className="hidden h-11 items-center rounded-full border border-white/30 px-7 text-sm hover:bg-white/10 md:inline-flex">
              How it works
            </a>
            <Link href="/board" className="hidden h-11 items-center rounded-full border border-white/30 px-7 text-sm hover:bg-white/10 md:inline-flex">
              For authorities
            </Link>
            <a href="#trust" className="hidden h-11 items-center rounded-full border border-white/30 px-7 text-sm hover:bg-white/10 lg:inline-flex">
              Safeguards
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/check" aria-label="Check a number" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 hover:bg-white/10">
              <Search size={16} />
            </Link>
            <Link href="/check" className="hidden h-11 items-center rounded-full border border-white/30 px-8 text-sm hover:bg-white/10 sm:inline-flex">
              Check
            </Link>
            <Link href="/board" className="inline-flex h-11 items-center rounded-full border border-white/30 px-6 text-sm hover:bg-white/10 sm:px-8">
              Sign in
            </Link>
          </div>
        </nav>

        <div className="absolute left-6 top-[150px] sm:left-24 sm:top-[196px]">
          <div className="ml-2 text-3xl font-semibold tracking-tight sm:ml-6 sm:text-[44px]">Report it</div>
          <div className="mt-2 font-display text-[clamp(140px,25vw,360px)] font-extrabold leading-[0.82] tracking-[-0.065em]">once.</div>
          <p className="ml-2 mt-8 max-w-[540px] text-base leading-relaxed text-white/80 sm:ml-[180px]">
            When a mobile money or virtual asset business is hacked, one report reaches the Cyber Security Authority, the police, FIC and the regulators at the same moment.
          </p>
        </div>

        <div className="absolute bottom-6 left-6 hidden gap-2.5 md:flex">
          <div className="glass flex h-[196px] w-[300px] flex-col justify-between rounded-3xl p-6">
            <span className="text-[46px] font-semibold tracking-tight">1 hour</span>
            <span className="text-sm leading-snug text-white/80">Every report is triaged within the hour, day or night, by the Cyber Security Authority.</span>
          </div>
          <div className="glass flex h-[196px] w-16 flex-col items-center justify-center gap-2 rounded-3xl">
            {["CSA", "FIC", "BoG"].map((s) => (
              <span key={s} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[11px] font-bold text-navy">
                {s}
              </span>
            ))}
          </div>
        </div>

        <a href="#how" aria-label="Scroll to how it works" className="absolute bottom-[140px] right-11 hidden h-16 w-16 items-center justify-center rounded-full border border-white/60 hover:bg-white/10 md:flex">
          <ArrowDown size={22} strokeWidth={1.8} />
        </a>

        <div className="notch-corner absolute bottom-24 right-0 h-8 w-8" />
        <div className="notch-corner absolute bottom-0 right-[360px] hidden h-8 w-8 sm:block" />
        <div className="absolute bottom-0 right-0 flex h-24 w-full items-end justify-end rounded-tl-[32px] bg-paper sm:w-[360px]">
          <Link
            href="/report"
            className="inline-flex h-[72px] w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-ink text-[19px] font-medium text-ink transition-colors hover:bg-ink hover:text-white sm:w-[336px]"
          >
            Report an incident <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* INTRO ROW */}
      <section className="grid items-center gap-10 px-2 pt-14 sm:px-6 lg:grid-cols-[1fr_340px_1.25fr] lg:gap-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-[42px] font-bold leading-[1.02] tracking-[-0.035em]">
            Built for the people
            <br />
            who stop it
          </h2>
          <span className="max-w-[280px] text-[13px] leading-normal text-muted">Payment providers, exchanges, agents and the officers who answer them.</span>
        </div>
        <div className="dots flex h-[132px] items-center justify-center rounded-3xl">
          <div className="flex">
            {SEALS.map((s, i) => (
              <span
                key={s}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] border-navy bg-white text-xs font-bold text-navy"
                style={{ marginLeft: i ? -10 : 0 }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <p className="text-[30px] font-medium leading-tight tracking-[-0.02em]">
          Every file is sealed{" "}
          <span className="weave -mt-1.5 inline-flex h-10 w-[92px] items-center justify-center rounded-full align-middle text-white">
            <Lock size={18} />
          </span>{" "}
          the moment it arrives, so it still holds up in court.
        </p>
      </section>

      {/* TABS + CARDS */}
      <section className="flex flex-wrap items-center justify-between gap-3 px-2 pt-20 sm:px-6">
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex h-[46px] items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white">
            <Smartphone size={16} />
            Payment providers
          </span>
          {[
            [Wallet, "Virtual asset firms"],
            [Landmark, "Banks and OTC desks"],
            [Shield, "Authorities"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Wallet;
            return (
              <span key={label as string} className="inline-flex h-11 items-center gap-2 rounded-full border border-ink px-6 text-sm font-medium">
                <I size={16} />
                {label as string}
              </span>
            );
          })}
        </div>
        <Link href="/board" className="inline-flex h-11 items-center rounded-full border border-ink px-7 text-sm font-medium hover:bg-ink hover:text-white">
          See all
        </Link>
      </section>

      <section className="grid gap-3 pt-7 lg:h-[340px] lg:grid-cols-[1.7fr_1fr_1fr]">
        <Link href="/report" className="kente group flex min-h-[300px] flex-col justify-between rounded-[26px] p-8 text-white">
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-3.5">
              <GlassIcon>
                <FileText size={20} strokeWidth={1.8} />
              </GlassIcon>
              <span className="text-[44px] font-bold leading-none tracking-[-0.035em]">Report an incident</span>
              <span className="max-w-[460px] text-[15px] leading-normal text-white/80">
                Tell us what happened, what moved and where it went. Attach what you have. You can add more later.
              </span>
            </div>
            <span className="transition-transform group-hover:translate-x-1">
              <ArrowCircle dark={false} />
            </span>
          </div>
          <div className="border-t border-white/25 pt-4">
            <span className="glass inline-flex h-[34px] items-center gap-2 rounded-full px-4 text-xs">
              <Clock size={14} />
              Under 15 minutes
            </span>
          </div>
        </Link>
        <Link href="/check" className="ripple flex min-h-[300px] flex-col justify-between rounded-[26px] p-7 text-white">
          <div className="flex flex-col gap-3">
            <GlassIcon>
              <Search size={20} strokeWidth={1.8} />
            </GlassIcon>
            <span className="text-[38px] font-bold leading-none tracking-[-0.035em]">Check a number</span>
            <span className="text-sm leading-normal text-white/80">Before you pay out, cash out or sell USDT, see if a number or wallet has been reported.</span>
          </div>
          <span className="glass inline-flex h-[34px] items-center gap-2 self-start rounded-full px-4 text-xs">
            <Receipt size={14} />
            Keep a receipt
          </span>
        </Link>
        <Link href="/alerts" className="weave flex min-h-[300px] flex-col justify-between rounded-[26px] p-7 text-white">
          <div className="flex flex-col gap-3">
            <GlassIcon>
              <Bell size={20} strokeWidth={1.8} />
            </GlassIcon>
            <span className="text-[38px] font-bold leading-none tracking-[-0.035em]">Get alerts</span>
            <span className="text-sm leading-normal text-white/80">Urgent warnings when stolen funds are moving through businesses like yours.</span>
          </div>
          <span className="glass inline-flex h-[34px] items-center gap-2 self-start rounded-full px-4 text-xs">
            <Lock size={14} />
            In the app only
          </span>
        </Link>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="flex flex-wrap items-end justify-between gap-6 px-2 pt-36 sm:px-6">
        <h2 className="font-display text-[clamp(72px,9vw,132px)] font-extrabold leading-[0.85] tracking-[-0.065em]">How it works</h2>
        <p className="mb-2.5 max-w-[400px] text-[15px] font-medium leading-normal">
          One report from the business. One case for every authority. Each one sees only what its mandate allows, and every action is signed by a named officer.
        </p>
      </section>

      <section className="grid gap-4 pt-11 md:grid-cols-3">
        {[
          { n: "01", t: "Report", d: "The business files once, sealed on arrival", time: "04:31", tex: "kente", href: "/report" },
          { n: "02", t: "Route", d: "CSA, CID, FIC and regulators, all at once", time: "04:31", tex: "ripple", href: "/board" },
          { n: "03", t: "Recover", d: "Freeze requests out within four hours", time: "08:31", tex: "weave", href: "/board" },
        ].map((s) => (
          <Link key={s.n} href={s.href} className="group flex flex-col gap-5 rounded-[26px] bg-white px-3 pb-5 pt-3">
            <div className={`${s.tex} relative h-[300px] rounded-[18px]`}>
              <span className="glass absolute left-3.5 top-3.5 flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white">{s.n}</span>
            </div>
            <div className="flex items-end justify-between gap-4 px-2.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[28px] font-semibold tracking-tight">{s.t}</span>
                <span className="text-[13px] text-muted">{s.d}</span>
                <span className="mt-2 font-mono text-[13px] font-medium">{s.time}</span>
              </div>
              <span className="transition-transform group-hover:translate-x-1">
                <ArrowCircle />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* SAFEGUARDS */}
      <section id="trust" className="flex flex-wrap-reverse items-end justify-between gap-6 px-2 pt-36 sm:px-6">
        <p className="mb-3 max-w-[300px] text-[13px] font-medium leading-normal">
          Hosted by the state. Built on Acts 1154, 1038, 987 and 1044. Read the full safeguards before the pilot starts.
        </p>
        <h2 className="text-right font-display text-[clamp(72px,9vw,132px)] font-extrabold leading-[0.85] tracking-[-0.065em]">Built to be trusted</h2>
      </section>

      <section className="flex flex-col gap-3 pt-11">
        <div className="grid gap-3 md:h-[300px] md:grid-cols-[1.6fr_1fr]">
          <div className="kente relative flex min-h-[260px] items-end rounded-[26px] p-3.5 text-white">
            <div className="glass flex w-full flex-col gap-2 rounded-[18px] px-6 py-5">
              <span className="flex items-center gap-3.5">
                <GlassIcon>
                  <Hash size={20} strokeWidth={1.8} />
                </GlassIcon>
                <span className="text-[46px] font-extrabold leading-none tracking-[-0.045em]">Sealed evidence</span>
              </span>
              <span className="max-w-[520px] text-[13px] leading-normal text-white/80">
                Every file is fingerprinted and time-stamped on arrival, so investigators and courts can trust it has not changed.
              </span>
            </div>
          </div>
          <Tile tex="ripple" icon={<Globe size={20} strokeWidth={1.8} />} title="Stays in Ghana" />
        </div>
        <div className="grid gap-3 md:h-[300px] md:grid-cols-[1fr_1.6fr]">
          <Tile tex="dots" icon={<ShieldCheck size={20} strokeWidth={1.8} />} title="Never “clean”" />
          <Tile tex="weave" icon={<Landmark size={20} strokeWidth={1.8} />} title="Each power where the law puts it" />
        </div>
      </section>

      {/* DRILL */}
      <section className="flex flex-col items-center gap-6 px-2 pt-40 sm:px-6">
        <h2 className="text-center font-display text-[clamp(64px,7.5vw,104px)] font-extrabold leading-[0.9] tracking-[-0.06em]">
          Every agency.
          <br />
          One case.
        </h2>
        <p className="max-w-[560px] text-center text-sm font-medium leading-relaxed">
          A ₵1.84m mobile money theft, turned into USDT through an OTC desk and traced across both rails. Walk through the drill the pilot is built around.
        </p>
        <Link href="/board" className="ripple relative mt-6 flex aspect-[820/440] w-full max-w-[820px] items-center justify-center rounded-[30px]">
          <span className="glass flex h-24 w-24 items-center justify-center rounded-full text-white">
            <Play size={30} fill="currentColor" />
          </span>
          <span className="glass absolute bottom-5 left-5 rounded-full px-4 py-2.5 text-[13px] text-white">
            <span className="font-mono">04:31 → 07:05</span> &nbsp;·&nbsp; open the live case
          </span>
        </Link>
      </section>

      {/* CLOSING */}
      <section className="kente kente-lg mt-40 flex flex-col items-center overflow-hidden rounded-[36px] px-4 pb-4 pt-16 text-white">
        <div className="flex w-full items-center">
          <div className="h-px flex-1 bg-white/30" />
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10">
            <Seal size={40} />
          </span>
          <div className="h-px flex-1 bg-white/30" />
        </div>
        <h2 className="mt-9 text-center font-display text-[clamp(48px,6vw,84px)] font-extrabold leading-[0.95] tracking-[-0.05em]">Ready before the next one.</h2>
        <p className="mt-5 max-w-[460px] text-center text-[15px] leading-relaxed text-white/80">
          Register now, before an incident. It takes about twenty minutes. Registration is not a licence.
        </p>
        <div className="mt-16 flex w-full flex-col items-center gap-6 rounded-[26px] bg-white px-4 pb-6 pt-7 text-ink sm:px-8">
          <div className="flex flex-wrap justify-center gap-1 rounded-[28px] border border-ink p-1 lg:flex-nowrap lg:rounded-full">
            <Link href="/report" className="inline-flex h-[52px] items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-medium text-white">
              <FileText size={16} />
              Report an incident
            </Link>
            {[
              ["/report", Landmark, "Register your business"],
              ["/check", Search, "Check a number"],
              ["/board", Shield, "Officer sign-in"],
              ["tel:292", Phone, "Systems down? Call 292"],
            ].map(([href, Icon, label]) => {
              const I = Icon as typeof Search;
              return (
                <Link key={label as string} href={href as string} className="inline-flex h-[52px] items-center gap-2 rounded-full border border-ink px-7 text-[15px] font-medium hover:bg-paper">
                  <I size={16} />
                  {label as string}
                </Link>
              );
            })}
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#E4E3DF] pt-5 text-xs text-muted">
            <span>Concept design by CDABI for the Cyber Security Authority. Hosting and data would sit with the state.</span>
            <GhanaRule />
          </div>
        </div>
      </section>
    </div>
  );
}

function Tile({ tex, icon, title }: { tex: string; icon: React.ReactNode; title: string }) {
  return (
    <div className={`${tex} relative flex min-h-[240px] items-end rounded-[26px] p-8 text-white`}>
      <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/60">
        <ArrowRight size={16} />
      </span>
      <span className="flex flex-col gap-4">
        <GlassIcon>{icon}</GlassIcon>
        <span className="text-[46px] font-extrabold leading-none tracking-[-0.045em]">{title}</span>
      </span>
    </div>
  );
}
