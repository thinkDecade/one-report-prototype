import clsx from "clsx";
import { Check, Clock, Fingerprint, Landmark, Search, Smartphone, Wallet } from "lucide-react";

const CAPS = [
  {
    n: "01",
    name: "Unified Incident Reporting",
    head: "One report. Multiple relevant authorities.",
    text: "A structured reporting channel for virtual asset service providers, electronic money issuers, payment service providers and mobile money agents.",
    points: [
      "Submit incident details through one reporting interface.",
      "Attach transaction records, supporting documents and technical evidence.",
      "Generate structured notifications for relevant authorities.",
      "Submit follow-up reports and case updates.",
    ],
    visual: "report",
  },
  {
    n: "02",
    name: "National Check Register",
    head: "Check before you transact.",
    text: "A shared register that allows registered businesses to check whether a mobile money number, bank account or virtual asset wallet address has been reported in connection with suspected theft.",
    points: [
      "Check individual identifiers before transactions.",
      "Receive status responses for reported identifiers.",
      "Link related reports across participating institutions.",
      "Support challenge and expiry processes for reported entries.",
    ],
    note: "The register provides risk information. It does not independently block transactions or authorise the freezing of funds.",
    visual: "check",
  },
  {
    n: "03",
    name: "Evidence Management and Preservation",
    head: "Evidence that retains its integrity.",
    text: "A structured environment for submitting, preserving and tracking digital evidence throughout an incident response.",
    points: [
      "Securely submit original system records and supporting files.",
      "Apply SHA-256 fingerprints and trusted timestamps.",
      "Maintain an auditable chain of custody.",
      "Generate exhibit indexes and record certificates.",
    ],
    visual: "evidence",
  },
  {
    n: "04",
    name: "Cross-Rail Intelligence",
    head: "Follow the funds across financial systems.",
    text: "Connect related incidents when stolen funds move between mobile money, bank accounts and virtual asset platforms.",
    points: [
      "Identify reported movement between financial rails.",
      "Link incidents sharing wallet addresses, account numbers or mobile money identifiers.",
      "Give relevant supervisors visibility across affected rails.",
      "Help investigators follow transaction trails across institutions.",
    ],
    visual: "rails",
  },
  {
    n: "05",
    name: "Coordinated Institutional Response",
    head: "A coordinated response, with clear accountability.",
    text: "A shared case coordination environment that helps relevant institutions track actions and progress throughout an incident.",
    points: [
      "Route notifications according to institutional mandates.",
      "Track acknowledgements, assigned actions and deadlines.",
      "Escalate outstanding actions through defined workflows.",
      "Coordinate requests relating to preservation, tracing and recovery of funds.",
    ],
    visual: "response",
  },
] as const;

const card = "rounded-2xl bg-white p-4 text-ink shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]";

function ReportVisual() {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-3">
      <div className={card}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">Incident report · step 5 of 5</span>
          <span className="font-mono text-[11px] text-muted">EMI-0004</span>
        </div>
        <span className="mt-2 block text-[15px] font-semibold">Unauthorised transfers from merchant wallets</span>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {["14 transactions", "3 files", "GHS 182,400"].map((t) => (
            <span key={t} className="rounded-lg bg-paper px-2 py-1.5 text-center text-[11px] font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className={card}>
        <span className="text-xs font-medium text-muted">Sent at 06:42, one copy each</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["CSA", "Police CID", "FIC", "Bank of Ghana", "EOCO"].map((a) => (
            <span key={a} className="inline-flex h-7 items-center gap-1 rounded-full bg-navy px-2.5 text-[11px] font-medium text-white">
              <Check size={11} /> {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckVisual() {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-3">
      <div className={clsx(card, "flex items-center gap-2.5")}>
        <Search size={16} className="text-muted" />
        <span className="flex-1 font-mono text-sm">0XX 555 0192</span>
        <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-white">Check</span>
      </div>
      <div className={card}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#B3261E]" />
          <span className="text-[15px] font-semibold">Reported in a suspected theft</span>
        </div>
        <span className="mt-1.5 block text-xs leading-relaxed text-muted">Confirmed by the register desk. Linked to 2 reports. Review date in 27 days.</span>
        <div className="mt-3 flex gap-1.5 text-[11px] font-medium">
          <span className="rounded-lg bg-paper px-2 py-1">Mobile money number</span>
          <span className="rounded-lg bg-paper px-2 py-1">Can be challenged</span>
        </div>
      </div>
    </div>
  );
}

function EvidenceVisual() {
  const rows = [
    ["A1", "core-ledger-export.csv", "9f2c…41ab"],
    ["A2", "api-gateway-logs.zip", "3be0…c7d2"],
    ["A3", "sim-swap-request.pdf", "e81a…0f93"],
  ];
  return (
    <div className={clsx(card, "w-full max-w-[380px]")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">Exhibit index</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#006B3F]">
          <Check size={12} /> Sealed 06:51
        </span>
      </div>
      <div className="mt-2 flex flex-col">
        {rows.map(([id, f, h]) => (
          <div key={id} className="flex items-center gap-2.5 border-t border-[#EEECE8] py-2.5 first:border-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper font-mono text-[11px] font-semibold">{id}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium">{f}</span>
              <span className="font-mono text-[10px] text-muted">SHA-256 {h}</span>
            </span>
            <Fingerprint size={15} className="text-navy" />
          </div>
        ))}
      </div>
      <span className="mt-1 block text-[11px] text-muted">Chain of custody: 4 entries · trusted timestamp attached</span>
    </div>
  );
}

function RailsVisual() {
  const hops = [
    { icon: Smartphone, rail: "Mobile money", id: "0XX 555 0192" },
    { icon: Landmark, rail: "Bank account", id: "•••• 7731" },
    { icon: Wallet, rail: "USDT wallet", id: "TQx8…9KfP" },
  ];
  return (
    <div className="flex w-full max-w-[380px] flex-col gap-2">
      {hops.map((h, i) => {
        const I = h.icon;
        return (
          <div key={h.rail} className="flex flex-col items-center gap-2">
            <div className={clsx(card, "flex w-full items-center gap-3 py-3")}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white">
                <I size={16} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-[13px] font-semibold">{h.rail}</span>
                <span className="font-mono text-[11px] text-muted">{h.id}</span>
              </span>
              <span className="text-[11px] font-medium text-muted">{i === 2 ? "Linked to 3 cases" : `Hop ${i + 1}`}</span>
            </div>
            {i < hops.length - 1 && <span className="h-3 w-px bg-white/40" />}
          </div>
        );
      })}
    </div>
  );
}

function ResponseVisual() {
  const tasks = [
    { a: "CSA", t: "Lead and containment", s: "Acknowledged 6m", ok: true },
    { a: "FIC", t: "Intelligence on the money trail", s: "Acknowledged 18m", ok: true },
    { a: "EOCO", t: "Freezing order application", s: "Due in 22m", ok: false },
  ];
  return (
    <div className={clsx(card, "w-full max-w-[380px]")}>
      <span className="text-xs font-medium text-muted">Case tasks · each authority&apos;s part</span>
      <div className="mt-2 flex flex-col">
        {tasks.map((t) => (
          <div key={t.a} className="flex items-center gap-2.5 border-t border-[#EEECE8] py-2.5 first:border-0">
            <span className="w-11 shrink-0 font-mono text-[11px] font-semibold">{t.a}</span>
            <span className="flex-1 text-[13px]">{t.t}</span>
            <span className={clsx("inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", t.ok ? "bg-paper" : "bg-gold-soft")}>
              {t.ok ? <Check size={10} /> : <Clock size={10} />} {t.s}
            </span>
          </div>
        ))}
      </div>
      <span className="mt-1 block text-[11px] text-muted">Not acknowledged in time? It goes to the supervisor, then the head.</span>
    </div>
  );
}

const VISUALS = { report: ReportVisual, check: CheckVisual, evidence: EvidenceVisual, rails: RailsVisual, response: ResponseVisual };

export default function Capabilities() {
  return (
    <section id="platform" className="flex flex-col gap-8 pt-16">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-navy">The platform</span>
        <h2 className="max-w-[640px] font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-tight tracking-[-0.035em]">
          Everything needed to move an incident forward.
        </h2>
        <p className="max-w-[680px] text-[15px] leading-relaxed text-[#4A4E57]">
          From the first incident notification to evidence preservation, intelligence sharing and coordinated response, Project One Report brings critical functions into one
          connected environment.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {CAPS.map((c, i) => {
          const V = VISUALS[c.visual];
          const flip = i % 2 === 1;
          return (
            <article key={c.n} className="grid overflow-hidden rounded-[24px] bg-white lg:grid-cols-2">
              <div className={clsx("kente flex min-h-[300px] items-center justify-center p-6 sm:p-10", flip && "lg:order-2")}>
                <V />
              </div>
              <div className="flex flex-col gap-4 p-6 sm:p-9">
                <span className="flex items-center gap-2 text-sm font-medium text-muted">
                  <span className="font-mono">{c.n}</span> {c.name}
                </span>
                <h3 className="font-display text-[clamp(22px,2.2vw,30px)] font-extrabold leading-tight tracking-[-0.03em]">{c.head}</h3>
                <p className="text-[15px] leading-relaxed text-[#4A4E57]">{c.text}</p>
                <ul className="flex flex-col gap-2">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm leading-snug text-[#30343C]">
                      <Check size={16} className="mt-0.5 shrink-0 text-navy" />
                      {p}
                    </li>
                  ))}
                </ul>
                {"note" in c && <p className="rounded-xl bg-paper px-4 py-3 text-[13px] leading-snug text-[#4A4E57]">{c.note}</p>}
              </div>
            </article>
          );
        })}
      </div>

      <p className="flex flex-wrap items-center gap-x-2 font-display text-[clamp(18px,1.8vw,24px)] font-bold leading-snug tracking-[-0.02em]">
        One connected platform. Five essential capabilities. <span className="text-muted">A more coordinated response to virtual asset financial crime.</span>
      </p>
    </section>
  );
}

