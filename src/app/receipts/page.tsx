"use client";

import Link from "next/link";
import clsx from "clsx";
import { Receipt } from "lucide-react";
import { usePortal } from "@/lib/store";
import { dayTime } from "@/lib/format";
import MobileShell from "@/components/MobileShell";
import { Loading, Seal, useHydrated } from "@/components/ui";

const LABEL = { none: "No reports found", unconfirmed: "Reported, unconfirmed", reported: "Reported. Do not transact." };

export default function Receipts() {
  const hydrated = useHydrated();
  const { checks, personaId } = usePortal();
  if (!hydrated) return <Loading />;
  const mine = checks.filter((c) => c.userId === personaId);
  return (
    <MobileShell>
      <section className="weave flex flex-col gap-5 rounded-[28px] px-4 pb-5 pt-4 text-white">
        <Link href="/" className="lg:hidden"><Seal size={40} /></Link>
        <span className="pl-1 font-display text-[42px] font-extrabold leading-[0.85] tracking-[-0.06em]">Receipts</span>
        <span className="pl-1 text-[13px] text-white/75">Proof you checked in good faith. Kept for six years.</span>
      </section>
      {mine.length === 0 && <div className="rounded-[24px] bg-white p-6 text-sm text-muted">No checks yet.</div>}
      {mine.map((c) => (
        <div key={c.receipt} className="flex items-center gap-3 rounded-[22px] bg-white p-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper">
            <Receipt size={17} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-mono text-sm font-medium">{c.display}</span>
            <span className="text-xs text-muted">
              {c.receipt} · {dayTime(c.at)}
            </span>
          </div>
          <span
            className={clsx(
              "h-2.5 w-2.5 shrink-0 rounded-full",
              c.answer === "reported" ? "bg-ink" : c.answer === "unconfirmed" ? "bg-gold" : "border-2 border-ink"
            )}
            title={LABEL[c.answer]}
          />
        </div>
      ))}
    </MobileShell>
  );
}
