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
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [role, setRole] = useState("");
  const [who, setWho] = useState("");
  const [files, setFiles] = useState(0);
  const [sent, setSent] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen gap-4 bg-paper p-3 sm:p-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <aside className="weave flex flex-col gap-10 rounded-[24px] p-7 text-white">
        <Link href="/" aria-label="One Report home">
          <Seal />
        </Link>
        <div className="flex flex-col gap-2.5">
          <span className="text-[15px] text-white/75">Insider report · for staff and agents</span>
          <span className="font-display text-[47px] font-extrabold leading-[0.88] tracking-[-0.055em]">
            Say it
            <br />
            safely.
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {[
            [ShieldCheck, "Goes to the CID and the Cyber Security Authority only."],
            [EyeOff, "Never to your company, and never to its regulators' copy of a case."],
            [Lock, "Your name and contact details are optional. If you leave them, only the CID can see them."],
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
        <div className="glass mt-auto rounded-[22px] px-4 py-4 text-[13px] leading-relaxed text-white/85">
          Under the Whistleblower Act, 2006 (Act 720), a disclosure to a police officer is protected, including against victimisation and against civil and criminal action. Victimisation can be reported to the Commission on Human Rights and Administrative Justice (CHRAJ).
        </div>
      </aside>

      <main className="flex flex-col gap-8 rounded-[24px] bg-white px-6 pb-9 pt-10 sm:px-12">
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
            <h1 className="font-display text-[clamp(28px,2.6vw,38px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Report received</h1>
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
              <h1 className="font-display text-[clamp(28px,2.6vw,38px)] font-extrabold leading-[1.05] tracking-[-0.035em]">Report suspected insider involvement</h1>
              <span className="max-w-[620px] text-[17px] text-muted">
                If you think someone inside a VASP, issuer, payment provider or agent network is helping thieves, tell us here.
              </span>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Which business?
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="h-14 rounded-2xl border border-[#D6D5D1] px-5 text-base outline-none focus:border-ink" placeholder="Company or agent name" />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Your name", name, setName, "Optional"],
                  ["Your Ghana Card number", card, setCard, "Optional · GHA-XXXXXXXXX-X"],
                  ["Your role", role, setRole, "Employee, contractor, agent…"],
                ] as const
              ).map(([l, v, set, ph]) => (
                <label key={l} className="flex flex-col gap-2 text-sm font-medium">
                  {l}
                  <input value={v} onChange={(e) => set(e.target.value)} className="h-14 rounded-2xl border border-[#D6D5D1] px-5 text-base outline-none focus:border-ink" placeholder={ph} />
                </label>
              ))}
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium">
              What do you know, and how do you know it?
              <textarea value={what} onChange={(e) => setWhat(e.target.value)} className="min-h-[160px] rounded-2xl border border-[#D6D5D1] p-5 text-base outline-none focus:border-ink" placeholder="Who, what, when. Facts you saw, and what you suspect." />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Who do you believe is involved, and what is their role?
              <input value={who} onChange={(e) => setWho(e.target.value)} className="h-14 rounded-2xl border border-[#D6D5D1] px-5 text-base outline-none focus:border-ink" placeholder="Name or position, if you know it" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Supporting files <span className="font-normal text-muted">Optional. They stay in your browser in this prototype.</span>
              <span className="inline-flex h-12 cursor-pointer items-center gap-2 self-start rounded-full border border-ink px-5 text-sm">
                {files ? `${files} file${files === 1 ? "" : "s"} attached` : "Choose files"}
                <input type="file" multiple className="hidden" onChange={(e) => setFiles(e.target.files?.length ?? 0)} />
              </span>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              A safe way to contact you <span className="font-normal text-muted">Optional</span>
              <input value={contact} onChange={(e) => setContact(e.target.value)} className="h-14 rounded-2xl border border-[#D6D5D1] px-5 text-base outline-none focus:border-ink" placeholder="A phone number or email that your employer cannot see" />
            </label>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#ECEBE7] pt-5">
              <span className="flex items-center gap-2.5 text-sm text-[#4A4E57]">
                <Lock size={17} /> Sent to CID and CSA only.
              </span>
              <button
                disabled={what.trim().length < 10}
                onClick={() => setSent("W-2026-" + String(Math.floor(10000 + Math.random() * 89999)))}
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
