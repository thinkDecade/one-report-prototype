"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Check, EyeOff, Lock, ShieldCheck, X } from "lucide-react";
import { Seal } from "@/components/ui";

export default function InsiderReport() {
  const [company, setCompany] = useState("");
  const [what, setWhat] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen gap-4 bg-paper p-3 sm:p-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <aside className="weave flex flex-col gap-10 rounded-[32px] p-7 text-white">
        <Link href="/" aria-label="One Report home">
          <Seal />
        </Link>
        <div className="flex flex-col gap-2.5">
          <span className="text-[15px] text-white/75">Insider report · for staff and agents</span>
          <span className="font-display text-[72px] font-extrabold leading-[0.88] tracking-[-0.055em]">
            Say it
            <br />
            safely.
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {[
            [ShieldCheck, "Goes to the CID and the Cyber Security Authority only."],
            [EyeOff, "Never to your company, and never to its regulators' copy of a case."],
            [Lock, "Contact details are optional. If you leave them, only the CID can see them."],
          ].map(([Icon, t]) => {
            const I = Icon as typeof Lock;
            return (
              <div key={t as string} className="glass flex items-center gap-3.5 rounded-[22px] px-4 py-3.5 text-sm leading-snug">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-navy">
                  <I size={16} />
                </span>
                {t as string}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex flex-col gap-8 rounded-[32px] bg-white px-6 pb-9 pt-10 sm:px-12">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-[34px] items-center rounded-full bg-paper px-4 text-[13px] font-medium">Confidential</span>
          <Link href="/" aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D6D5D1] hover:bg-paper">
            <X size={18} />
          </Link>
        </div>

        {sent ? (
          <div className="flex flex-col gap-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
              <Check size={24} />
            </span>
            <h1 className="font-display text-[clamp(52px,6vw,84px)] font-extrabold leading-[0.9] tracking-[-0.06em]">Received.</h1>
            <p className="max-w-[560px] text-[17px] text-muted">
              Your reference is <span className="font-mono text-ink">{sent}</span>. Keep it. If you left no contact, you can use it to add information later. Your company has not been told.
            </p>
            <Link href="/" className="inline-flex h-14 items-center gap-2 self-start rounded-full border border-ink px-7 text-base font-medium">
              Back to the start
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3.5">
              <h1 className="font-display text-[clamp(52px,6vw,84px)] font-extrabold leading-[0.9] tracking-[-0.06em]">What is going on?</h1>
              <span className="max-w-[620px] text-[17px] text-muted">
                If you think someone inside a VASP, issuer, payment provider or agent network is helping thieves, tell us here.
              </span>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Which business?
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="h-14 rounded-2xl border border-[#D6D5D1] px-5 text-base outline-none focus:border-ink" placeholder="Company or agent name" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              What have you seen?
              <textarea value={what} onChange={(e) => setWhat(e.target.value)} className="min-h-[160px] rounded-2xl border border-[#D6D5D1] p-5 text-base outline-none focus:border-ink" placeholder="Who, what, when. Facts you saw, and what you suspect." />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              How can the CID reach you? <span className="font-normal text-muted">Optional</span>
              <input value={contact} onChange={(e) => setContact(e.target.value)} className="h-14 rounded-2xl border border-[#D6D5D1] px-5 text-base outline-none focus:border-ink" placeholder="A phone number or email that your employer cannot see" />
            </label>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#ECEBE7] pt-5">
              <span className="flex items-center gap-2.5 text-sm text-[#4A4E57]">
                <Lock size={17} /> Sent to CID and CSA only.
              </span>
              <button
                disabled={what.trim().length < 10}
                onClick={() => setSent("IN-" + Math.floor(100000 + Math.random() * 899999))}
                className={clsx("inline-flex h-[58px] items-center gap-2 rounded-full bg-ink px-8 text-base font-medium text-white disabled:opacity-40")}
              >
                Send confidentially <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
