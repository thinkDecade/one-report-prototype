"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Receipt, ShieldCheck, Smartphone, TriangleExclamationPoint, Wallet, Landmark } from "lucide-react";
import { usePortal } from "@/lib/store";
import { personaById } from "@/lib/seed";
import { AUTHORITIES } from "@/lib/routing";
import { hhmm, shortId } from "@/lib/format";
import MobileShell from "@/components/MobileShell";
import { Loading, useHydrated } from "@/components/ui";

export default function AlertDetail() {
  const hydrated = useHydrated();
  const { id } = useParams<{ id: string }>();
  const { alerts, entries, checks, personaId, markAlertRead } = usePortal();
  const a = alerts.find((x) => x.id === id);
  useEffect(() => {
    if (a) markAlertRead(a.id);
  }, [a, markAlertRead]);
  if (!hydrated) return <Loading />;
  if (!a)
    return (
      <MobileShell>
        <div className="rounded-[24px] bg-white p-6 text-sm">
          Alert not found. <Link href="/alerts" className="underline">Back to alerts</Link>
        </div>
      </MobileShell>
    );
  const list = entries.filter((e) => a.entryIds.includes(e.id) && !a.cancelledEntryIds.includes(e.id));
  const keys = list.map((e) => e.lookupKey);
  const hit = checks.find((c) => c.userId === personaId && keys.includes(c.lookupKey));
  const issuer = personaById(a.issuedBy);
  const issuerOrg = issuer?.authority ? AUTHORITIES[issuer.authority].name.split(" (")[0] : "Cyber Security Authority";

  return (
    <MobileShell>
      <section className="ripple flex flex-col gap-6 rounded-[28px] px-[18px] pb-6 pt-4 text-white">
        <div className="flex items-center justify-between">
          <Link href="/alerts" aria-label="Back to alerts" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45">
            <ArrowLeft size={18} />
          </Link>
          <span className="glass inline-flex h-8 items-center rounded-full px-3.5 font-mono text-xs">{a.id}</span>
        </div>
        <div className="flex flex-col gap-3.5">
          <span className="inline-flex h-[30px] items-center gap-1.5 self-start rounded-full bg-gold px-3 text-xs font-bold tracking-wide text-ink">
            <TriangleExclamationPoint size={14} strokeWidth={2.2} />
            {a.kind === "urgent" ? "URGENT" : "PATTERN"}
          </span>
          <strong className="text-[38px] font-extrabold leading-[0.95] tracking-[-0.05em]">{a.title}</strong>
          <span className="flex items-center gap-2 text-[13px] text-white/75">
            <ShieldCheck size={15} />
            {issuerOrg} · {hhmm(a.issuedAt)} GMT
          </span>
        </div>
      </section>

      <span className="px-2 pt-1.5 text-[15px] font-medium">{a.text}</span>

      {list.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {list.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-[20px] bg-white py-2.5 pl-2.5 pr-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper">
                {e.identifier.type === "wallet" ? <Wallet size={17} /> : e.identifier.type === "bank" ? <Landmark size={17} /> : <Smartphone size={17} />}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[15px] font-medium">{shortId(e.identifier.value)}</span>
              <span className="text-xs text-muted">{e.identifier.type === "wallet" ? e.identifier.network : "MoMo"}</span>
            </div>
          ))}
        </div>
      )}

      {hit && (
        <section className="flex items-start gap-3 rounded-[22px] bg-ink p-4 text-white">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gold text-ink">
            <Receipt size={17} />
          </span>
          <div className="flex flex-col gap-1">
            <strong className="text-[15px] font-semibold">You checked one of these earlier</strong>
            <span className="text-[13px] leading-snug text-white/70">
              <span className="font-mono">{hit.display}</span> at {hhmm(hit.at)}, receipt <span className="font-mono">{hit.receipt}</span>. If you traded, report it now.
            </span>
          </div>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-2.5 pt-4">
        <Link href="/report" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink text-base font-medium text-white">
          Report a match <ArrowRight size={18} />
        </Link>
        <span className="flex items-start gap-2 px-2 text-xs leading-snug text-muted">
          <Lock size={14} className="mt-px shrink-0" />
          Shown in the app only and your view is logged. Real alerts never ask for a code or a payment.
        </span>
      </div>
    </MobileShell>
  );
}
