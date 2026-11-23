"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Check, FileText, Lock, Receipt, Search, Smartphone, X, ShieldCheck } from "lucide-react";
import { usePortal } from "@/lib/store";
import { personaById } from "@/lib/seed";
import type { CheckRecord } from "@/lib/types";
import { hhmm } from "@/lib/format";
import MobileShell from "@/components/MobileShell";
import { Loading, Seal, useHydrated } from "@/components/ui";

const DAILY = 50;

const ANSWERS = {
  none: {
    chip: "bg-[#ECEBE7]",
    dot: "border-2 border-ink",
    title: "No reports found",
    line: "Nothing on the register. This is not a guarantee: use your normal checks.",
    steps: [
      [Check, "Carry on with your usual checks."],
      [Receipt, "Keep this receipt with the trade record."],
    ],
  },
  unconfirmed: {
    chip: "bg-gold-soft",
    dot: "bg-gold",
    title: "Reported, unconfirmed",
    line: "Do not trade until cleared.",
    steps: [
      [X, "Decline politely. Say only that you can't trade today."],
      [Lock, "Never tell the buyer about this check."],
      [FileText, "Already received money from this number? Report it."],
    ],
  },
  reported: {
    chip: "bg-ink text-white",
    dot: "bg-white",
    title: "Reported. Do not transact.",
    line: "An authority has confirmed this is linked to a crime.",
    steps: [
      [X, "Do not trade. Decline politely."],
      [Lock, "Never tell the buyer about this check."],
      [FileText, "Already received money from this number? Report it now."],
    ],
  },
} as const;

export default function CheckPage() {
  const hydrated = useHydrated();
  const { personaId, runCheck, checks, now } = usePortal();
  const [raw, setRaw] = useState("024 555 0187");
  const [result, setResult] = useState<CheckRecord | null>(null);
  const [err, setErr] = useState("");
  const [value, setValue] = useState("");
  const [checkedValue, setCheckedValue] = useState("");
  if (!hydrated) return <Loading />;

  const persona = personaById(personaId);
  const today = checks.filter((c) => c.userId === personaId && now - c.at < 24 * 3600_000).length;

  const go = () => {
    const r = runCheck(raw);
    if ("error" in r) {
      setErr(r.error);
      setResult(null);
    } else {
      setErr("");
      setResult(r);
      setCheckedValue(value);
    }
  };

  const a = result ? ANSWERS[result.answer] : null;

  return (
    <MobileShell>
      <section className="kente kente-sm flex flex-col gap-5 rounded-[28px] px-4 pb-4 pt-4 text-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden"><Seal size={40} /></Link>
          <span className="glass inline-flex h-8 items-center rounded-full px-3.5 text-xs">
            {Math.max(0, DAILY - today)} of {DAILY} checks left today
          </span>
        </div>
        <span className="pl-1 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.035em]">Check the register</span>
        <span className="-mt-2 pl-1 text-[13px] text-white/75">
          For agents, OTC vendors, issuers, VASPs and banks · signed in as {persona?.name}
        </span>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
          className="flex h-14 items-center gap-2.5 rounded-full bg-white pl-4 pr-1.5 text-ink"
        >
          <Smartphone size={18} className="shrink-0 text-muted" />
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-label="Number, account or wallet"
            placeholder="Number, account or wallet"
            className="min-w-0 flex-1 bg-transparent font-mono text-base font-medium outline-none"
          />
          <button type="submit" aria-label="Check" className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-ink text-white">
            <Search size={18} />
          </button>
        </form>
        <label className="flex h-11 items-center gap-2.5 rounded-full bg-white/10 px-4 text-sm">
          <span className="shrink-0 text-white/75">Trade value (optional)</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="decimal"
            placeholder="₵ or USDT"
            className="min-w-0 flex-1 bg-transparent font-mono text-white outline-none placeholder:text-white/45"
          />
        </label>
        {err && <span className="px-2 text-[13px] text-[#FFB4AE]">{err}</span>}
      </section>

      {result && a ? (
        <>
          <section className="flex flex-col gap-3.5 rounded-[26px] bg-white p-[18px]">
            <span className={clsx("inline-flex h-7 items-center gap-2 self-start rounded-full px-3 text-xs font-semibold", a.chip)}>
              <span className={clsx("h-2 w-2 rounded-full", a.dot)} />
              Answer
            </span>
            <div className="flex flex-col gap-1">
              <strong className="text-[26px] font-extrabold leading-[0.95] tracking-[-0.045em]">{a.title}</strong>
              <span className="text-[15px] font-medium">{a.line}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-paper px-3.5 py-3 text-[13px]">
              <span className="flex items-center gap-2">
                <Receipt size={16} />
                <span className="font-mono font-medium">{result.receipt}</span>
              </span>
              <span className="font-mono">{hhmm(result.at)} GMT</span>
            </div>
            {checkedValue && <span className="-mt-1.5 px-1 text-xs text-muted">Trade value recorded on the receipt: <span className="font-mono text-ink">{checkedValue}</span></span>}
            <div className="flex flex-col gap-2.5 pt-1">
              {a.steps.map(([Icon, text]) => {
                const I = Icon as typeof X;
                return (
                  <div key={text as string} className="flex items-center gap-3 text-sm leading-snug">
                    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-paper">
                      <I size={16} />
                    </span>
                    <span>{text as string}</span>
                  </div>
                );
              })}
            </div>
          </section>
          {result.answer !== "none" && (
            <section className="flex items-start gap-3 rounded-[22px] bg-gold-soft p-4 text-[13px] leading-relaxed">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                <Lock size={15} />
              </span>
              <span>
                <b>No tipping off.</b> Tipping off is an offence under section 48(1)(f) of the Anti-Money Laundering Act, 2020 (Act 1044). Do not tell any customer that a check, report or investigation exists. Describe a held deposit only as &quot;pending review&quot;.
              </span>
            </section>
          )}
          <div className="flex gap-2">
            {result.answer !== "none" ? (
              <Link href="/report?type=C" className="inline-flex h-[54px] flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white">
                Report a match <ArrowRight size={17} />
              </Link>
            ) : null}
            <button
              onClick={() => {
                setResult(null);
                setRaw("");
              }}
              className={clsx("h-[52px] rounded-full border border-ink px-5 text-[15px] font-medium", result.answer === "none" && "flex-1")}
            >
              Check another
            </button>
          </div>
        </>
      ) : (
        <section className="flex flex-col gap-3 rounded-[26px] bg-white p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">
            <ShieldCheck size={18} />
          </span>
          <strong className="text-xl font-semibold leading-tight tracking-tight">How the register responds</strong>
          <span className="text-sm leading-relaxed text-muted">
            The register only says whether a number or wallet has been reported. It never names anyone, and nobody can download a list. Every check gives you a receipt that shows you acted in good faith.
          </span>
          <div className="flex flex-col gap-2 border-t border-[#ECEBE7] pt-3 text-[13px] leading-relaxed text-[#4A4E57]">
            <span>
              <b className="text-ink">A place to check, not an order.</b> The register orders no hold or freeze. What you do is your decision under your customer terms and the law. Keep answers confidential.
            </span>
            <span>One identifier per check, up to {DAILY} checks a day, so nobody can rebuild the register.</span>
            <span>Unconfirmed entries lapse after 24 hours unless an authority confirms them. Confirmed entries lapse after 30 days unless renewed.</span>
            <span>Anyone who believes their number was reported wrongly can challenge it by calling 292 or through their provider.</span>
            <span>Not registered yet? Businesses register with a Ghana Card, company documents if they trade through a company, and the numbers and wallets they trade through.</span>
            <span>
              Already received funds from a reported number?{" "}
              <Link href="/report?type=C" className="font-medium text-ink underline underline-offset-2">Report it as stolen funds received</Link>, with the trade record and your receipts. A prompt report is proposed to count as evidence of good faith.
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1 text-[13px]">
            <span className="text-muted">Try these sample numbers:</span>
            {["024 555 0187", "TQ7nVfK3sGh9Xb2LmPz8RwYc4DjE6uAt5H", "020 123 4567"].map((x) => (
              <button key={x} onClick={() => setRaw(x)} className="truncate rounded-xl bg-paper px-3 py-2 text-left font-mono hover:bg-[#E4E3DF]">
                {x}
              </button>
            ))}
          </div>
        </section>
      )}
    </MobileShell>
  );
}
