"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Seal } from "@/components/ui";

const KINDS = ["Public authority or regulator", "Mobile money issuer or payment provider", "Virtual asset service provider", "Bank", "Other"];

export default function Demo() {
  const [f, setF] = useState({ name: "", org: "", kind: "", email: "", note: "" });
  const [sent, setSent] = useState(false);
  const ok = f.name.trim() && f.org.trim() && f.kind && /.+@.+\..+/.test(f.email);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const input = "h-12 rounded-2xl border border-[#D6D5D1] px-4 text-[15px] outline-none focus:border-ink";

  return (
    <div className="grid min-h-screen gap-3 bg-paper p-3 sm:p-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="kente flex flex-col gap-8 rounded-[24px] p-7 text-white">
        <Link href="/" aria-label="One Report home">
          <Seal />
        </Link>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Request a demonstration</span>
          <span className="font-display text-[40px] font-extrabold leading-[0.95] tracking-[-0.05em]">See One Report with your team.</span>
          <span className="text-[15px] leading-relaxed text-white/75">
            A walkthrough of the drill from each side: the reporting business, the lead authority, partner agencies, the check register and oversight. About 45 minutes.
          </span>
        </div>
      </aside>

      <main className="flex flex-col gap-6 rounded-[24px] bg-white px-6 pb-8 pt-8 sm:px-10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Concept prototype by CDABI, Ghana Chapter</span>
          <Link href="/" aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6D5D1] hover:bg-paper">
            <X size={17} />
          </Link>
        </div>
        {sent ? (
          <div className="flex flex-col gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
              <Check size={22} />
            </span>
            <h1 className="font-display text-[44px] font-extrabold leading-none tracking-[-0.05em]">Request received.</h1>
            <p className="max-w-[520px] text-[15px] text-muted">
              Thank you, {f.name.split(" ")[0]}. In this prototype nothing is sent anywhere. In the live version the CDABI team would contact you at {f.email} to arrange a time.
            </p>
            <Link href="/journeys" className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-ink px-6 text-[15px] font-medium text-white">
              Explore the platform now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[clamp(32px,3.5vw,44px)] font-extrabold leading-none tracking-[-0.045em]">Who should we show it to?</h1>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Your name
                <input value={f.name} onChange={set("name")} className={input} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Organisation
                <input value={f.org} onChange={set("org")} className={input} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Type of organisation
                <select value={f.kind} onChange={set("kind")} className={input}>
                  <option value="">Choose one</option>
                  {KINDS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Work email
                <input type="email" value={f.email} onChange={set("email")} className={input} />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              What would you like to see? <span className="font-normal text-muted">Optional</span>
              <textarea value={f.note} onChange={set("note")} className="min-h-[110px] rounded-2xl border border-[#D6D5D1] p-4 text-[15px] outline-none focus:border-ink" />
            </label>
            <button disabled={!ok} onClick={() => setSent(true)} className="inline-flex h-12 items-center gap-2 self-start rounded-full bg-ink px-6 text-[15px] font-medium text-white disabled:opacity-40">
              Request a demonstration <ArrowRight size={16} />
            </button>
          </>
        )}
      </main>
    </div>
  );
}
