"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  ArrowRight,
  Check,
  FileText,
  Globe,
  Landmark,
  Lock,
  Plus,
  Smartphone,
  Upload,
  Wallet,
  X,
  Hash,
  Sparkles,
} from "lucide-react";
import { usePortal } from "@/lib/store";
import { drillDraft, institutionById, personaById } from "@/lib/seed";
import type { ReportDraft } from "@/lib/cases";
import { routeCase, AUTHORITIES } from "@/lib/routing";
import { hashFile, normaliseIdentifier } from "@/lib/hash";
import type { Exhibit, Identifier, ReportType, Severity } from "@/lib/types";
import { cedi, duration, hhmm, shortId, formatIdentifier } from "@/lib/format";
import { Loading, Seal, useHydrated } from "@/components/ui";

const STEPS = ["What happened", "What moved", "Where it went", "Evidence", "Review and send"];

const TYPES: { k: ReportType; t: string; d: string }[] = [
  { k: "A", t: "Theft of funds", d: "Money or crypto taken from the business, its agents or its float" },
  { k: "B", t: "Customer accounts taken over", d: "Wallets or accounts used without the customer's consent" },
  { k: "C", t: "Received stolen funds", d: "You think you bought from or paid a thief" },
  { k: "D", t: "Systems attacked, no loss yet", d: "Intrusion, ransomware or outage on payment systems" },
  { k: "E", t: "Insider", d: "Staff or agent involvement suspected" },
];

const LEVELS: { k: Severity; t: string; d: string }[] = [
  { k: 1, t: "Level 1", d: "Over ₵500k, or systemic, or still moving" },
  { k: 2, t: "Level 2", d: "Real loss, contained" },
  { k: 3, t: "Level 3", d: "Attempt or minor loss" },
];

function emptyDraft(providerId: string, filer: string): ReportDraft {
  return {
    type: "A",
    severity: 2,
    crossRail: false,
    title: "",
    providerId,
    filer,
    detectedAt: 0,
    detectedHow: "",
    lossCedi: 0,
    customersAffected: 0,
    transactions: [],
    identifiers: [],
    technical: [],
    containment: [],
    solvency: "",
    narrative: { how: "", timeline: "", response: "", unknowns: "" },
    exhibits: [],
    personalData: false,
    fundsAbroad: false,
    triggers: { stateBacked: false, telecom: false, corruption: false },
  };
}

export default function ReportPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReportWizard />
    </Suspense>
  );
}

function ReportWizard() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const router = useRouter();
  const { personaId, now, submitReport, setPersona } = usePortal();
  const persona = personaById(personaId);
  const filer = persona?.kind === "provider" ? persona : personaById("EMI-0004-01")!;
  const inst = institutionById(filer.institution)!;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(() => emptyDraft(filer.institution, filer.userId));
  const [sentId, setSentId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (params.get("drill") === "1") loadDrill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDraft((d) => ({ ...d, providerId: filer.institution, filer: filer.userId }));
  }, [filer.institution, filer.userId]);

  function loadDrill() {
    const d = drillDraft();
    setDraft({ ...d, providerId: "EMI-0004", filer: "EMI-0004-01" });
    if (personaById(personaId)?.kind !== "provider") setPersona("EMI-0004-01");
  }

  const patch = (p: Partial<ReportDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setSavedAt(now);
  };

  const routes = useMemo(() => routeCase(draft, inst.kind), [draft, inst.kind]);

  if (!hydrated) return <Loading />;

  if (sentId) return <Sent id={sentId} routes={routes} severity={draft.severity} onBoard={() => { setPersona("CSA-0142"); router.push("/board?case=" + sentId); }} />;

  const canNext =
    step === 0 ? draft.title.trim().length > 3 :
    step === 1 ? true :
    step === 2 ? draft.identifiers.length > 0 || draft.type === "D" :
    true;

  return (
    <div className="grid min-h-screen gap-4 bg-paper p-3 sm:p-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <aside className="kente flex flex-col gap-6 rounded-[24px] p-7 text-white">
        <div className="flex items-center gap-3">
          <Link href="/"><Seal /></Link>
          <span className="text-[15px] text-white/80">
            {inst.name.replace(" Ltd", "")} · {inst.id}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="text-[15px] text-white/75">New incident report · for VASPs, mobile money issuers, payment providers and agents</span>
          <span className="font-display text-[47px] font-extrabold leading-[0.88] tracking-[-0.055em]">
            Tell it
            <br />
            once.
          </span>
        </div>
        <ol className="flex flex-col gap-1.5">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s}>
                <button
                  disabled={i > step}
                  onClick={() => setStep(i)}
                  className={clsx(
                    "flex h-[60px] w-full items-center gap-3.5 rounded-full px-2.5 text-left text-base transition-colors",
                    active && "glass font-semibold",
                    done && "text-white/80 hover:bg-white/5",
                    !active && !done && "text-white/55"
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      done ? "bg-white text-navy" : active ? "border border-white" : "border border-white/35"
                    )}
                  >
                    {done ? <Check size={18} strokeWidth={2} /> : i + 1}
                  </span>
                  {s}
                </button>
              </li>
            );
          })}
        </ol>
        <button onClick={loadDrill} className="glass inline-flex h-11 items-center gap-2 self-start rounded-full px-5 text-sm hover:bg-white/15">
          <Sparkles size={15} />
          Fill with the drill scenario
        </button>
        <div className="glass mt-auto flex items-center gap-3.5 rounded-[22px] px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-navy">
            <Lock size={18} />
          </span>
          <span className="text-[13px] leading-snug text-white/85">
            {savedAt ? (
              <>
                Draft saved at <span className="font-mono">{hhmm(savedAt)}</span>.{" "}
              </>
            ) : null}
            Only you and the Cyber Security Authority can see it until you send.
          </span>
        </div>
      </aside>

      <main className="flex flex-col gap-8 rounded-[24px] bg-white px-6 pb-9 pt-10 sm:px-12">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-[34px] items-center rounded-full bg-paper px-4 text-[13px] font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
          <Link href="/" aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D6D5D1] hover:bg-paper">
            <X size={18} />
          </Link>
        </div>

        {step === 0 && <StepHappened draft={draft} patch={patch} />}
        {step === 1 && <StepMoved draft={draft} patch={patch} />}
        {step === 2 && <StepWhere draft={draft} patch={patch} />}
        {step === 3 && <StepEvidence draft={draft} patch={patch} now={now} />}
        {step === 4 && <StepReview draft={draft} routes={routes} instName={inst.name} />}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-6 border-t border-[#ECEBE7] pt-5">
          <span className="flex max-w-[520px] items-center gap-2.5 text-sm text-[#4A4E57]">
            <Globe size={18} className="shrink-0" />
            {step === 4
              ? `${routes.length} authorities will receive this at the same moment.`
              : "If funds left Ghana, the Attorney-General's Department is added automatically."}
          </span>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="h-14 rounded-full border border-ink px-7 text-base font-medium hover:bg-paper">
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                disabled={!canNext}
                onClick={() => setStep(step + 1)}
                className="inline-flex h-[58px] items-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-white disabled:opacity-40"
              >
                Save and continue <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => setSentId(submitReport(draft))}
                className="inline-flex h-[58px] items-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-white"
              >
                Send to all {routes.length} authorities <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type StepProps = { draft: ReportDraft; patch: (p: Partial<ReportDraft>) => void };

function H({ title, sub }: { title: React.ReactNode; sub: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h1 className="font-display text-[clamp(32px,3.7vw,52px)] font-extrabold leading-[0.9] tracking-[-0.06em]">{title}</h1>
      <span className="max-w-[620px] text-[17px] text-muted">{sub}</span>
    </div>
  );
}

const field = "h-14 w-full rounded-2xl border border-[#D6D5D1] bg-white px-5 text-base outline-none focus:border-ink";
const label = "flex flex-col gap-2 text-sm font-medium";

function StepHappened({ draft, patch }: StepProps) {
  return (
    <>
      <H title={<>What happened?</>} sub="Hacked on either rail, you are a victim and you report here. Give it a short name and say what you know and what you suspect. You can add more later." />
      <label className={label}>
        Short name for this incident
        <input className={field} value={draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="For example: SIM swap on agent float" />
      </label>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {TYPES.map((t) => (
          <button
            key={t.k}
            onClick={() => patch({ type: t.k })}
            className={clsx("flex flex-col gap-1 rounded-[22px] p-4 text-left transition-colors", draft.type === t.k ? "bg-ink text-white" : "bg-[#F4F3F0] hover:bg-[#ECEBE7]")}
          >
            <span className="text-base font-semibold">{t.t}</span>
            <span className={clsx("text-[13px] leading-snug", draft.type === t.k ? "text-white/70" : "text-muted")}>{t.d}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">How serious is it?</span>
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l.k}
              onClick={() => patch({ severity: l.k })}
              className={clsx("inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm", draft.severity === l.k ? "bg-ink text-white" : "border border-ink")}
            >
              <span className="font-semibold">{l.t}</span>
              <span className={draft.severity === l.k ? "text-white/70" : "text-muted"}>{l.d}</span>
            </button>
          ))}
        </div>
      </div>
      <label className={label}>
        How you found out
        <input className={field} value={draft.detectedHow} onChange={(e) => patch({ detectedHow: e.target.value })} placeholder="Alert, complaint, reconciliation…" />
      </label>
      <div className="flex flex-wrap gap-2">
        <Toggle on={draft.triggers.telecom} onClick={() => patch({ triggers: { ...draft.triggers, telecom: !draft.triggers.telecom } })} text="SIM swap or telecom element" />
        <Toggle on={draft.personalData} onClick={() => patch({ personalData: !draft.personalData })} text="Customer personal data exposed" />
        <Toggle on={draft.triggers.stateBacked} onClick={() => patch({ triggers: { ...draft.triggers, stateBacked: !draft.triggers.stateBacked } })} text="Possible state-backed attacker" />
        <Toggle on={draft.triggers.corruption} onClick={() => patch({ triggers: { ...draft.triggers, corruption: !draft.triggers.corruption } })} text="A public officer may be involved" />
      </div>
    </>
  );
}

function Toggle({ on, onClick, text }: { on: boolean; onClick: () => void; text: string }) {
  return (
    <button onClick={onClick} className={clsx("inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm", on ? "bg-ink text-white" : "border border-[#D6D5D1] hover:border-ink")}>
      <span className={clsx("flex h-5 w-5 items-center justify-center rounded-full", on ? "bg-gold text-ink" : "border border-[#B9B8B3]")}>{on && <Check size={12} strokeWidth={3} />}</span>
      {text}
    </button>
  );
}

function StepMoved({ draft, patch }: StepProps) {
  return (
    <>
      <H title={<>What moved?</>} sub="Rough numbers are fine. Authorities need the size of the loss and whether money crossed from mobile money into crypto." />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Total loss, in cedis
          <input className={clsx(field, "font-mono")} inputMode="numeric" value={draft.lossCedi ? draft.lossCedi.toLocaleString("en-GB") : ""} onChange={(e) => patch({ lossCedi: Number(e.target.value.replace(/\D/g, "")) || 0 })} placeholder="0" />
        </label>
        <label className={label}>
          Customers affected
          <input className={clsx(field, "font-mono")} inputMode="numeric" value={draft.customersAffected || ""} onChange={(e) => patch({ customersAffected: Number(e.target.value.replace(/\D/g, "")) || 0 })} placeholder="0" />
        </label>
      </div>
      <Toggle on={draft.crossRail} onClick={() => patch({ crossRail: !draft.crossRail })} text="Money moved between mobile money or bank and crypto (cross-rail)" />
      <label className={label}>
        What you have done to contain it, one step per line
        <textarea
          className="min-h-[120px] w-full rounded-2xl border border-[#D6D5D1] p-5 text-base outline-none focus:border-ink"
          value={draft.containment.join("\n")}
          onChange={(e) => patch({ containment: e.target.value.split("\n") })}
          placeholder="04:02 Outbound float transfers paused"
        />
      </label>
      {draft.transactions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Transactions from your records</span>
          {draft.transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-[18px] bg-[#F4F3F0] px-4 py-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">{t.rail === "payment" ? <Smartphone size={16} /> : <Wallet size={16} />}</span>
              <span className="flex-1">{t.from}</span>
              <span className="font-mono text-muted">{shortId(t.to)}</span>
              <span className="w-32 text-right font-mono">{t.currency === "GHS" ? cedi(t.amount) : `${t.amount.toLocaleString("en-GB")} USDT`}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StepWhere({ draft, patch }: StepProps) {
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState("");
  const add = () => {
    const n = normaliseIdentifier(raw);
    if (!n) return setErr("Enter a Ghana mobile number, a bank account number, or a Tron, Ethereum or Bitcoin address.");
    if (draft.identifiers.some((i) => i.value === n.value)) return setErr("Already added.");
    patch({ identifiers: [...draft.identifiers, n as Identifier], crossRail: draft.crossRail || (n.type === "wallet" && draft.identifiers.some((i) => i.type !== "wallet")) || (n.type !== "wallet" && draft.identifiers.some((i) => i.type === "wallet")) });
    setRaw("");
    setErr("");
  };
  const amountFor = (v: string) => draft.transactions.filter((t) => t.to === v).reduce((a, t) => a + t.amount, 0);
  return (
    <>
      <H title={<>Where did the<br />money go?</>} sub="Add every number, account or wallet that received funds. Partial is fine. They go on the check register as provisional, so other businesses can stop paying them." />
      <div className="flex flex-col gap-2">
        <div className="flex h-16 items-center gap-3 rounded-full border border-ink pl-6 pr-2">
          <Plus size={18} className="text-muted" />
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="h-full min-w-0 flex-1 bg-transparent font-mono text-base outline-none"
            placeholder="024 555 0187 or a wallet address"
            aria-label="Number, account or wallet"
          />
          <button onClick={add} className="h-12 rounded-full bg-ink px-6 text-sm font-medium text-white">
            Add
          </button>
        </div>
        {err && <span className="pl-6 text-sm text-overdue">{err}</span>}
      </div>
      <div className="flex flex-col gap-2">
        {draft.identifiers.map((i) => {
          const amt = amountFor(i.value);
          const wallet = i.type === "wallet";
          return (
            <div key={i.value} className={clsx("flex items-center gap-4 rounded-[22px] p-3.5", wallet ? "bg-ink text-white" : "bg-[#F4F3F0]")}>
              <span className={clsx("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", wallet ? "bg-gold text-ink" : "bg-white")}>
                {wallet ? <Wallet size={20} /> : i.type === "bank" ? <Landmark size={20} /> : <Smartphone size={20} />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-mono text-[17px] font-medium">{i.type === "wallet" ? shortId(i.value) : formatIdentifier(i.value)}</span>
                <span className={clsx("text-[13px]", wallet ? "text-white/65" : "text-muted")}>
                  {wallet ? `${i.network} wallet${draft.crossRail ? " · marks this case cross-rail" : ""}` : i.type === "bank" ? "Bank account" : "Mobile money"}
                </span>
              </div>
              {amt > 0 && <span className="font-mono text-[17px]">{wallet ? `${amt.toLocaleString("en-GB")} USDT` : `₵${amt.toLocaleString("en-GB")}`}</span>}
              <button
                onClick={() => patch({ identifiers: draft.identifiers.filter((x) => x.value !== i.value) })}
                aria-label="Remove"
                className={clsx("flex h-10 w-10 items-center justify-center rounded-full border", wallet ? "border-white/30" : "border-[#D6D5D1]")}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
        {draft.identifiers.length === 0 && <div className="rounded-[22px] border-[1.5px] border-dashed border-[#B9B8B3] p-6 text-center text-sm text-muted">Nothing added yet.</div>}
      </div>
      <Toggle on={draft.fundsAbroad} onClick={() => patch({ fundsAbroad: !draft.fundsAbroad })} text="Some funds went to an exchange or account outside Ghana" />
    </>
  );
}

function StepEvidence({ draft, patch, now }: StepProps & { now: number }) {
  const [busy, setBusy] = useState(false);
  async function onFiles(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    const ex: Exhibit[] = [];
    for (const f of Array.from(files)) {
      const h = await hashFile(f);
      ex.push({ no: `E-${String(draft.exhibits.length + ex.length + 1).padStart(2, "0")}`, name: f.name, size: f.size, sha256: h, receivedAt: now, kind: "evidence" });
    }
    patch({ exhibits: [...draft.exhibits, ...ex] });
    setBusy(false);
  }
  return (
    <>
      <H title={<>What can you show?</>} sub="Logs, statements, screenshots. Each file is fingerprinted in your browser before it is sent, so anyone can later prove it has not changed." />
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[26px] border-[1.5px] border-dashed border-[#B9B8B3] p-10 text-center hover:border-ink">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-paper">
          <Upload size={22} />
        </span>
        <span className="text-base font-medium">{busy ? "Sealing…" : "Choose files or drop them here"}</span>
        <span className="text-[13px] text-muted">Try any file. It stays in your browser.</span>
        <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </label>
      <div className="flex flex-col gap-2">
        {draft.exhibits.map((e) => (
          <div key={e.no} className="flex items-center gap-4 rounded-[18px] bg-[#F4F3F0] p-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <FileText size={18} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[15px] font-medium">
                <span className="font-mono text-muted">{e.no}</span> &nbsp;{e.name}
              </span>
              <span className="flex items-center gap-1.5 truncate font-mono text-xs text-muted">
                <Hash size={12} />
                {e.sha256.slice(0, 32)}…
              </span>
            </div>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-medium">
              <Lock size={12} />
              Sealed {hhmm(e.receivedAt)}
            </span>
          </div>
        ))}
      </div>
      <label className={label}>
        In your own words: how did it happen?
        <textarea
          className="min-h-[120px] w-full rounded-2xl border border-[#D6D5D1] p-5 text-base outline-none focus:border-ink"
          value={draft.narrative.how}
          onChange={(e) => patch({ narrative: { ...draft.narrative, how: e.target.value } })}
          placeholder="What you know, and what you suspect."
        />
      </label>
    </>
  );
}

function StepReview({ draft, routes, instName }: { draft: ReportDraft; routes: ReturnType<typeof routeCase>; instName: string }) {
  return (
    <>
      <H title={<>Ready to send.</>} sub="Check who receives what. Each authority only sees the parts its law allows. Nothing is sent until you press send." />
      <div className="grid gap-3 xl:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-1 self-start rounded-[24px] bg-[#F4F3F0] p-5 text-[15px]">
          {[
            ["Incident", draft.title || "Untitled"],
            ["Reported by", instName],
            ["Type and level", `${TYPES.find((t) => t.k === draft.type)?.t} · Level ${draft.severity}`],
            ["Loss", draft.lossCedi ? cedi(draft.lossCedi) : "Not given"],
            ["Destinations", `${draft.identifiers.length} for the check register`],
            ["Evidence", `${draft.exhibits.length} sealed file${draft.exhibits.length === 1 ? "" : "s"}`],
            ["Cross-rail", draft.crossRail ? "Yes" : "No"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-[#E4E3DF] py-2.5 last:border-0">
              <span className="text-muted">{k}</span>
              <span className="text-right font-medium">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {routes.map((r) => (
            <div key={r.authority} className={clsx("flex items-center gap-3.5 rounded-[18px] p-3", r.role === "action" ? "bg-ink text-white" : "border border-[#E4E3DF]")}>
              <span className={clsx("flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-[11px] font-bold", r.role === "action" ? "bg-white text-navy" : "bg-paper text-navy")}>
                {AUTHORITIES[r.authority].short}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{AUTHORITIES[r.authority].name}</span>
                <span className={clsx("truncate text-xs", r.role === "action" ? "text-white/65" : "text-muted")}>
                  {r.receives} · {r.reason}
                </span>
              </div>
              <span className={clsx("whitespace-nowrap font-mono text-xs", r.role === "action" ? "text-white/80" : "text-muted")}>
                ack {duration(r.authority === "CSA" && draft.severity === 1 ? 60 : draft.severity === 1 ? 120 : 480)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Sent({ id, routes, severity, onBoard }: { id: string; routes: ReturnType<typeof routeCase>; severity: number; onBoard: () => void }) {
  const now = usePortal((s) => s.now);
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-paper p-3 sm:p-6">
      <section className="kente kente-lg flex flex-col gap-8 rounded-[24px] px-8 pb-12 pt-8 text-white sm:px-14">
        <Link href="/"><Seal /></Link>
        <span className="glass inline-flex h-9 items-center gap-2 self-start rounded-full px-4 font-mono text-sm">
          <Check size={15} /> {id}
        </span>
        <h1 className="font-display text-[clamp(36px,4.6vw,64px)] font-extrabold leading-[0.85] tracking-[-0.065em]">Sent.</h1>
        <p className="max-w-[640px] text-lg text-white/80">
          {routes.length} authorities received your report at <span className="font-mono">{hhmm(now)}</span>. The Cyber Security Authority will acknowledge within {severity === 1 ? "one hour" : "one working day"}. You will see every step they take.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {routes.map((r) => (
          <div key={r.authority} className="flex items-center gap-3 rounded-[22px] bg-white p-4">
            <span className="flex h-11 min-w-11 items-center justify-center rounded-full bg-paper px-2 text-[11px] font-bold text-navy">{AUTHORITIES[r.authority].short}</span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{AUTHORITIES[r.authority].name}</span>
              <span className="text-xs text-muted">{r.role === "action" ? "For action" : "Copy"} · received {hhmm(now)}</span>
            </div>
          </div>
        ))}
      </section>
      <div className="flex flex-wrap gap-2 pt-4">
        <Link href="/my-case" className="inline-flex h-14 items-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-white">
          Follow your case <ArrowRight size={18} />
        </Link>
        <button onClick={onBoard} className="inline-flex h-14 items-center gap-2 rounded-full border border-ink px-8 text-base font-medium">
          See it on the authorities&apos; board
        </button>
      </div>
    </div>
  );
}
