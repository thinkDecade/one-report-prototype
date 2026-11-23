"use client";

// Case tabs for the authority board: matches, evidence and custody, action packs,
// communications, supervisor view, notifications, closure and users.
// Everything is simulated in the browser; nothing is sent.

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronDown, Lock, Mail, MessageSquare, RotateCcw, ShieldCheck } from "lucide-react";
import { usePortal } from "@/lib/store";
import { PERSONAS, institutionById, personaById } from "@/lib/seed";
import { AUTHORITIES } from "@/lib/routing";
import { ESCALATION_LABEL, escalationLevel } from "@/lib/cases";
import type { AuthorityCode, CaseRecord } from "@/lib/types";
import { cedi, dayTime, hhmm, shortId } from "@/lib/format";

const M = 60_000;
const H = 60 * M;

export type CaseTab = "board" | "matches" | "evidence" | "actions" | "comms" | "supervisor" | "notices" | "closure" | "users";

export const CASE_TABS: { k: CaseTab; label: string }[] = [
  { k: "board", label: "Task board" },
  { k: "matches", label: "Matches" },
  { k: "evidence", label: "Evidence" },
  { k: "actions", label: "Actions" },
  { k: "comms", label: "Comms" },
  { k: "supervisor", label: "Supervisor" },
  { k: "notices", label: "Notifications" },
  { k: "closure", label: "Closure" },
  { k: "users", label: "Users" },
];

const card = "flex flex-col gap-3 rounded-lg border border-zinc-200 p-4";
const intro = "text-sm leading-relaxed text-zinc-500";
const btn = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-zinc-200 px-3 text-xs font-medium shadow-xs hover:bg-zinc-50 disabled:opacity-40";
const btnDark = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-40";

function Badge({ children, dark, warn }: { children: React.ReactNode; dark?: boolean; warn?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] shrink-0 items-center rounded-md border px-2 text-xs font-medium",
        dark ? "border-zinc-900 bg-zinc-900 text-zinc-50" : warn ? "border-yellow-200 bg-yellow-50 text-yellow-800" : "border-zinc-200"
      )}
    >
      {children}
    </span>
  );
}

export default function CaseTabBody({ tab, c }: { tab: CaseTab; c: CaseRecord }) {
  if (tab === "matches") return <Matches c={c} />;
  if (tab === "evidence") return <Evidence c={c} />;
  if (tab === "actions") return <Actions c={c} />;
  if (tab === "comms") return <Comms c={c} />;
  if (tab === "supervisor") return <Supervisor c={c} />;
  if (tab === "notices") return <Notices c={c} />;
  if (tab === "closure") return <Closure c={c} />;
  if (tab === "users") return <Users />;
  return null;
}

/* ---------------- Matches ---------------- */

function Matches({ c }: { c: CaseRecord }) {
  const { entries, checks } = usePortal();
  const keys = entries.filter((e) => e.caseId === c.id).map((e) => e.lookupKey);
  const hits = checks.filter((x) => keys.includes(x.lookupKey) && x.answer !== "none");
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>
        Registered businesses that checked this case&apos;s identifiers and got a match are shown here. The register orders nothing: each business decides to decline or hold under its own terms. Businesses are shown by code to the authorities, never to each other.
      </span>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-medium">Business</th>
              <th className="px-3 py-2 font-medium">Checked</th>
              <th className="px-3 py-2 font-medium">Identifier</th>
              <th className="px-3 py-2 font-medium">Answer</th>
              <th className="px-3 py-2 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {hits.map((h) => (
              <tr key={h.receipt} className="border-t border-zinc-100">
                <td className="px-3 py-2.5 font-mono text-xs">{h.institution}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{hhmm(h.at)}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{shortId(h.display.replace(/\s/g, ""))}</td>
                <td className="px-3 py-2.5">
                  <Badge dark={h.answer === "reported"} warn={h.answer === "unconfirmed"}>
                    {h.answer === "reported" ? "Reported" : "Unconfirmed"}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs">
                  {h.receipt}
                  {h.lookbackSent && <span className="ml-2 text-zinc-500">look-back sent</span>}
                </td>
              </tr>
            ))}
            {hits.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-xs text-zinc-400">
                  No business has matched an identifier on this case yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
        <Lock size={14} className="mt-0.5 shrink-0" />
        <span>
          <b className="text-zinc-900">No tipping off.</b> Tipping off is an offence under section 48(1)(f) of Act 1044. A business that gets a match must not tell any customer that a check, report or investigation exists. Held deposits are described to customers only as &quot;pending review&quot;.
        </span>
      </div>
    </div>
  );
}

/* ---------------- Evidence and custody ---------------- */

function Evidence({ c }: { c: CaseRecord }) {
  const { audit, entries, caseLog } = usePortal();
  const entryIds = entries.filter((e) => e.caseId === c.id).map((e) => e.id);
  const log = audit.filter((a) => a.object === c.id || a.object.startsWith(c.id + "-T") || entryIds.includes(a.object));
  const extra = (caseLog ?? []).filter((x) => x.caseId === c.id);
  return (
    <div className="flex flex-col gap-5">
      <span className={intro}>Each file is fingerprinted with SHA-256 on arrival. Anyone can later prove an exhibit has not changed by hashing it again.</span>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-medium">Exhibit</th>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">SHA-256</th>
              <th className="px-3 py-2 font-medium">Sealed</th>
            </tr>
          </thead>
          <tbody>
            {c.exhibits.map((e) => (
              <tr key={e.no} className="border-t border-zinc-100 align-top">
                <td className="px-3 py-2.5 font-mono text-xs">{e.no}</td>
                <td className="px-3 py-2.5">
                  {e.name}
                  {e.tool && <span className="block text-xs text-zinc-500">{e.tool}</span>}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-zinc-600">{e.sha256.slice(0, 24)}…</td>
                <td className="px-3 py-2.5 font-mono text-xs">{hhmm(e.receivedAt)}</td>
              </tr>
            ))}
            {(c.forensicHashes ?? []).filter((x) => x.trim()).map((h, i) => (
              <tr key={h} className="border-t border-zinc-100">
                <td className="px-3 py-2.5 font-mono text-xs">F-{String(i + 1).padStart(2, "0")}</td>
                <td className="px-3 py-2.5">Forensic image, held by the provider&apos;s forensic firm</td>
                <td className="px-3 py-2.5 font-mono text-xs text-zinc-600">{h.slice(0, 24)}…</td>
                <td className="px-3 py-2.5 text-xs text-zinc-500">Hash only</td>
              </tr>
            ))}
            {c.exhibits.length === 0 && !(c.forensicHashes ?? []).some((x) => x.trim()) && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-zinc-400">
                  No evidence files yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Custody log</span>
        <span className={intro}>Every action on the case is chained: each record carries the hash of the one before it, so a removed or edited record shows.</span>
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Hash</th>
              </tr>
            </thead>
            <tbody>
              {[...log].reverse().slice(0, 14).map((a) => (
                <tr key={a.seq} className="border-t border-zinc-100">
                  <td className="px-3 py-2 font-mono text-xs text-zinc-500">{a.seq}</td>
                  <td className="px-3 py-2 font-mono text-xs">{hhmm(a.at)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.userId}</td>
                  <td className="px-3 py-2 text-xs">{a.action}</td>
                  <td className="px-3 py-2 font-mono text-xs text-zinc-500">{a.hash.slice(0, 12)}</td>
                </tr>
              ))}
              {log.length === 0 && extra.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-xs text-zinc-400">
                    No recorded actions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Action packs ---------------- */

interface Pack {
  k: string;
  name: string;
  to: string;
  approver: AuthorityCode;
  text: string;
}

function packsFor(c: CaseRecord): Pack[] {
  const wallets = c.identifiers.filter((i) => i.type === "wallet").map((i) => shortId(i.value));
  const accounts = c.identifiers.filter((i) => i.type !== "wallet").map((i) => shortId(i.value));
  const ex = c.exhibits.map((e) => e.no).join(", ") || "to follow";
  const p: Pack[] = [];
  if (accounts.length || wallets.length)
    p.push({
      k: "fic",
      name: "Freeze request under section 56, Act 1044",
      to: "Financial Intelligence Centre",
      approver: "FIC",
      text: `REQUEST FOR FREEZE UNDER SECTION 56, ANTI-MONEY LAUNDERING ACT, 2020 (ACT 1044)\nCase ${c.id}\nAccounts and wallets: ${[...accounts, ...wallets].join(", ")}\nLink to theft: exhibits ${ex}\nThe customer has not been informed.`,
    });
  if (wallets.length)
    p.push({
      k: "issuer",
      name: "Stablecoin issuer freeze request",
      to: "Issuer, law enforcement channel",
      approver: "CID",
      text: `FREEZE REQUEST, case ${c.id}\nRequesting officer: CID Cybercrime Unit\nAddresses: ${wallets.join(", ")}\nLink to theft: exhibits ${ex} (hashes attached)\nPolice reference: ${c.policeRef ?? "to be issued"}`,
    });
  if (c.fundsAbroad) {
    p.push({
      k: "egmont",
      name: "FIU-to-FIU request (Egmont)",
      to: "Foreign financial intelligence unit where the exchange operates",
      approver: "FIC",
      text: `EGMONT SECURE WEB REQUEST, case ${c.id}\nRequest that the receiving FIU consider using its powers to postpone or freeze transactions involving deposit addresses credited from ${wallets.join(", ") || "the reported accounts"}.\nA formal mutual legal assistance request will follow through the Attorney-General's Department.`,
    });
    p.push({
      k: "budapest",
      name: "Expedited preservation request (Budapest 24/7)",
      to: "24/7 point of contact where the exchange operates",
      approver: "CSA",
      text: `REQUEST FOR EXPEDITED PRESERVATION OF STORED COMPUTER DATA, case ${c.id}\nPreserve account, KYC, login and transaction records linked to ${wallets.join(", ") || "the reported identifiers"}, pending a mutual legal assistance request.`,
    });
    p.push({
      k: "mla",
      name: "Mutual legal assistance request (draft)",
      to: "Central authority of the receiving country",
      approver: "AGD",
      text: `MUTUAL LEGAL ASSISTANCE REQUEST, case ${c.id}\nOffences: theft and money laundering\nAssistance sought: production of records and restraint of assets linked to ${wallets.join(", ") || "the reported identifiers"}\nSupporting exhibits: ${ex}`,
    });
  }
  p.push({
    k: "court",
    name: "Court bundle for a freezing order",
    to: "High Court, through EOCO",
    approver: "EOCO",
    text: `COURT BUNDLE, case ${c.id}\n1. Police complaint report (signed)\n2. Exhibit index with SHA-256 hashes\n3. Funds trail\n4. Check register entries and history\n5. Draft order for the judge's consideration`,
  });
  return p;
}

function Actions({ c }: { c: CaseRecord }) {
  const { personaId, now, logCase, caseLog } = usePortal();
  const persona = personaById(personaId);
  const [open, setOpen] = useState<string | null>(null);
  const log = (caseLog ?? []).filter((x) => x.caseId === c.id);
  const approvedAt = (k: string) => log.find((x) => x.text === "Pack approved: " + k);
  const packs = packsFor(c);
  const issuerAsked = c.filedAt + 27 * M;
  const exchangeDue = c.filedAt + 4 * H;
  const issuerApproved = approvedAt("issuer");
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>
        Packs are built from the case. Nothing is sent until an authorised officer of the right authority approves it. Court orders come from a judge.
      </span>
      {packs.map((p) => {
        const ok = approvedAt(p.k);
        const mine = persona?.authority === p.approver;
        return (
          <div key={p.k} className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold">{p.name}</span>
                <span className="text-xs text-zinc-500">
                  To: {p.to} · Approver: {AUTHORITIES[p.approver].short}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge dark={!!ok}>{ok ? `Approved ${hhmm(ok.at)} · ${ok.userId}` : "Draft"}</Badge>
                <button onClick={() => setOpen(open === p.k ? null : p.k)} className={btn}>
                  {open === p.k ? "Hide" : "View"} draft <ChevronDown size={13} className={clsx(open === p.k && "rotate-180")} />
                </button>
              </div>
            </div>
            {open === p.k && (
              <>
                <pre className="whitespace-pre-wrap rounded-md bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700">{p.text}</pre>
                {!ok &&
                  (mine ? (
                    <button onClick={() => logCase(c.id, "Pack approved: " + p.k)} className={clsx(btnDark, "self-start")}>
                      <Check size={13} /> Approve and send
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">Only {AUTHORITIES[p.approver].name} can approve this pack.</span>
                  ))}
              </>
            )}
          </div>
        );
      })}

      {c.identifiers.some((i) => i.type === "wallet") && (
        <div className={card}>
          <span className="text-sm font-semibold">Issuers and exchanges on this case</span>
          {[
            ["Stablecoin issuer", "Acts on a law enforcement request", issuerApproved ? `Freeze requested ${hhmm(issuerApproved.at)}` : `Request drafted ${hhmm(issuerAsked)}, awaiting CID approval`],
            [
              "Exchange A (abroad)",
              "Asks for a court order",
              now > exchangeDue ? `Escalated to the formal route at ${hhmm(exchangeDue)}: court order or MLA (no action within 4 hours)` : `Formal route from ${hhmm(exchangeDue)} if no action`,
            ],
            ["Bridge or other destination", "Not yet identified", "Being traced"],
          ].map(([who, how, st]) => (
            <div key={who} className="grid gap-1 border-t border-zinc-100 pt-2.5 text-sm sm:grid-cols-[180px_200px_1fr]">
              <span className="font-medium">{who}</span>
              <span className="text-zinc-500">{how}</span>
              <span className="text-zinc-700">{st}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/inbound" className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900">
        Enter a request received from abroad
      </Link>
    </div>
  );
}

/* ---------------- Comms ---------------- */

const NEVER: [RegExp, string][] = [
  [/\b(safe|secure)\b/i, "a promise that funds are safe"],
  [/\b(fully covered|guarantee\w*|in full)\b/i, "a guarantee of cover"],
  [/\b(will be recovered|recover(ed)? (all|in full))\b/i, "a promise of recovery"],
  [/\b(T[1-9A-HJ-NP-Za-km-z]{20,}|0x[0-9a-fA-F]{8,}|\+?233\s?\d{2}\s?\d{3}\s?\d{4}|0\d{9})\b|[A-Za-z0-9]{3,}…[A-Za-z0-9]{3,}/, "an identifier from the check register"],
  [/\b(suspect\w*|arrest\w*|insider|employee)\b/i, "a reference to suspects or arrests"],
];

function neverSay(text: string) {
  return NEVER.filter(([re]) => re.test(text)).map(([, why]) => why);
}

interface Draft {
  k: string;
  name: string;
  aud: string;
  by: string;
  clear: AuthorityCode[];
  text: string;
}

function draftsFor(c: CaseRecord): Draft[] {
  const inst = institutionById(c.providerId)?.name ?? "The provider";
  const w = c.identifiers.find((i) => i.type === "wallet");
  return [
    {
      k: "hold",
      name: "Service notice",
      aud: "All clients",
      by: inst,
      clear: ["CSA"],
      text: `We have paused some transfers while we deal with a security issue. The relevant authorities have been informed. We will update you by ${hhmm(c.filedAt + 24 * H)}. We will never ask for your PIN, password or a fee to restore your account; ignore anyone who does.`,
    },
    {
      k: "client",
      name: "Notice to affected clients",
      aud: "Affected clients",
      by: inst,
      clear: ["BOG_PSD", "BOG_VAD", "SEC"],
      text: `Your balance is safe and fully covered. An attacker moved funds to ${w ? shortId(w.value) : "an outside account"}. Services remain paused while we work with the authorities. We will contact you directly before services resume.`,
    },
    {
      k: "public",
      name: "Public advisory on fake recovery offers",
      aud: "The public",
      by: "Cyber Security Authority",
      clear: ["CSA"],
      text: "Following reports of theft involving mobile money and virtual assets, the public is cautioned that no legitimate agency, provider or lawyer will ask for a fee in advance to recover lost funds. Report any such approach by calling or texting 292.",
    },
    {
      k: "members",
      name: "Members briefing",
      aud: "Chamber members only",
      by: "The Chamber",
      clear: ["CSA"],
      text: "An incident affecting a provider in Ghana is being handled by the authorities. Members should check deposits and payments in the check register before they transact, must not tell any customer about a check answer, and should report any match through the portal.",
    },
  ];
}

function Comms({ c }: { c: CaseRecord }) {
  const { personaId, logCase, caseLog } = usePortal();
  const persona = personaById(personaId);
  const drafts = draftsFor(c);
  const [openK, setOpenK] = useState<string | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const log = (caseLog ?? []).filter((x) => x.caseId === c.id);
  const statusOf = (k: string) => {
    const l = [...log].reverse().find((x) => x.text.startsWith("Statement ") && x.text.endsWith(": " + k));
    if (!l) return "Draft";
    if (l.text.startsWith("Statement cleared")) return `Cleared ${hhmm(l.at)}`;
    if (l.text.startsWith("Statement held")) return "Held: not now";
    return "Awaiting clearance";
  };
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>
        The portal drafts; it never publishes. Each draft must pass the never-say check, then be cleared by the named authority before the issuer releases it.
      </span>
      {drafts.map((d) => {
        const text = texts[d.k] ?? d.text;
        const fails = neverSay(text);
        const st = statusOf(d.k);
        const canClear = !!persona?.authority && d.clear.includes(persona.authority);
        return (
          <div key={d.k} className={card}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold">{d.name}</span>
                <span className="text-xs text-zinc-500">
                  To: {d.aud} · Issued by: {d.by} · Clearance: {d.clear.map((a) => AUTHORITIES[a].short).join(" or ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge dark={st.startsWith("Cleared")} warn={st === "Awaiting clearance"}>
                  {st}
                </Badge>
                <button onClick={() => setOpenK(openK === d.k ? null : d.k)} className={btn}>
                  {openK === d.k ? "Close" : "Open"} draft
                </button>
              </div>
            </div>
            {openK === d.k && (
              <>
                <textarea value={text} onChange={(e) => setTexts({ ...texts, [d.k]: e.target.value })} className="min-h-[110px] rounded-md border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-400" />
                <div className={clsx("flex items-start gap-2 rounded-md p-2.5 text-xs", fails.length ? "bg-red-50 text-red-800" : "bg-zinc-50 text-zinc-700")}>
                  {fails.length ? (
                    <span>
                      <b>Fails the never-say check:</b> {fails.join("; ")}. Remove these before clearance.
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Check size={13} /> Passes the never-say check.
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={!!fails.length || st !== "Draft"} onClick={() => logCase(c.id, "Statement submitted for clearance: " + d.k)} className={btnDark}>
                    Submit for clearance
                  </button>
                  {canClear && st === "Awaiting clearance" && (
                    <>
                      <button onClick={() => logCase(c.id, "Statement cleared: " + d.k)} className={btn}>
                        <ShieldCheck size={13} /> Clear for release
                      </button>
                      <button onClick={() => logCase(c.id, "Statement held, not now: " + d.k)} className={btn}>
                        Hold: not now
                      </button>
                    </>
                  )}
                  {!canClear && st === "Awaiting clearance" && <span className="self-center text-xs text-zinc-500">Waiting for {d.clear.map((a) => AUTHORITIES[a].short).join(" or ")} to clear it.</span>}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Supervisor ---------------- */

function Supervisor({ c }: { c: CaseRecord }) {
  const checks = c.containmentChecks ?? [];
  const rows: [string, React.ReactNode][] = [
    [
      "Client impact",
      <>
        {c.customersAffected ? `${c.customersAffected.toLocaleString("en-GB")} customers affected.` : "No customer balances affected."} Loss {cedi(c.lossCedi)}
        {c.companyLossCedi != null && ` (customers ${cedi(c.customerLossCedi ?? 0)}, company or float ${cedi(c.companyLossCedi)})`}.
        {checks.length > 0 && <span className="block text-zinc-500">Containment: {checks.join(", ").toLowerCase()}.</span>}
      </>,
    ],
    [
      "Solvency",
      <>
        {c.solvencyStatus === "shortfall"
          ? `Shortfall${c.shortfallCedi ? " of " + cedi(c.shortfallCedi) : ""}. Plan: ${c.solvencyPlan || "not yet given"}.`
          : c.solvencyStatus === "unknown"
            ? "Not yet known."
            : "Client assets covered in full."}{" "}
        <span className="text-zinc-500">{c.solvency}</span>
      </>,
    ],
    [
      "Reporting schedule",
      <>
        Initial notice {dayTime(c.filedAt)}, {c.filedAt - c.detectedAt <= 24 * H ? "on time" : "late"}. Next update due {dayTime(c.filedAt + 24 * H)}. Final report due {dayTime(c.filedAt + 30 * 24 * H)}.
      </>,
    ],
    ["Supervisory follow-up", "A reopening plan is agreed with the regulator before withdrawals or transfers resume."],
  ];
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>What the supervising regulator needs from the case, in one place.</span>
      <div className="rounded-lg border border-zinc-200">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 border-b border-zinc-100 p-4 text-sm last:border-0 sm:grid-cols-[180px_1fr]">
            <span className="font-medium">{k}</span>
            <span className="leading-relaxed text-zinc-700">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Notifications ---------------- */

function Notices({ c }: { c: CaseRecord }) {
  const { tasks, now } = usePortal();
  const list = tasks.filter((t) => t.caseId === c.id);
  const items = list.flatMap((t) => {
    const a = AUTHORITIES[t.authority];
    const out: { at: number; ch: "email" | "sms"; to: string; text: string }[] = [
      { at: t.createdAt, ch: "email", to: a.short, text: `New case ${c.id}, Level ${c.severity}: ${t.role === "action" ? "for action" : "copy"}. Acknowledge by ${hhmm(t.createdAt + t.ackTarget * M)}.` },
      { at: t.createdAt, ch: "sms", to: `${a.short} duty officer`, text: `One Report: case ${c.id} needs acknowledgement by ${hhmm(t.createdAt + t.ackTarget * M)}. Open the portal.` },
    ];
    const lvl = escalationLevel(t, now);
    for (let i = 1; i <= lvl; i++) out.push({ at: t.createdAt + t.ackTarget * M + (i === 1 ? 0 : i === 2 ? 30 * M : t.ackTarget * M), ch: "email", to: i === 1 ? a.short : i === 2 ? `${a.short} supervisor` : `${a.short} head and steering group`, text: `${ESCALATION_LABEL[i]}: case ${c.id} not yet acknowledged.` });
    return out;
  });
  items.sort((x, y) => y.at - x.at);
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>Simulated inbox. Each authority gets an email, and its duty officer an SMS, when the case is filed. Reminders and escalations follow automatically. Messages never carry evidence or personal data.</span>
      <div className="rounded-lg border border-zinc-200">
        {items.slice(0, 18).map((n, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-zinc-100 px-3 py-2.5 text-sm last:border-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200">{n.ch === "email" ? <Mail size={13} /> : <MessageSquare size={13} />}</span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs text-zinc-500">
                <span className="font-mono">{hhmm(n.at)}</span> · {n.ch === "email" ? "Email" : "SMS"} to {n.to}
              </span>
              <span>{n.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Closure ---------------- */

const STEPS: { k: string; n: string; who: (p: ReturnType<typeof personaById>, c: CaseRecord) => boolean; by: string }[] = [
  { k: "final", n: "Final incident report filed", by: "Reporting provider", who: (p, c) => p?.kind === "provider" && p.institution === c.providerId },
  { k: "accepted", n: "Final report accepted by the supervising regulator", by: "BoG or SEC", who: (p) => ["BOG_PSD", "BOG_VAD", "SEC"].includes(p?.authority ?? "") },
  { k: "investigation", n: "Investigation status recorded by the lead investigator", by: "CID", who: (p) => p?.authority === "CID" },
  { k: "closed", n: "Incident response closed", by: "CSA", who: (p) => p?.authority === "CSA" },
];

function Closure({ c }: { c: CaseRecord }) {
  const { personaId, tasks, logCase, caseLog } = usePortal();
  const persona = personaById(personaId);
  const [reason, setReason] = useState("");
  const log = (caseLog ?? []).filter((x) => x.caseId === c.id);
  const lastReopen = Math.max(-1, ...log.map((x, i) => (x.text.startsWith("Case reopened") ? i : -1)));
  const after = log.slice(lastReopen + 1);
  const done = (k: string) => after.find((x) => x.text === "Closure step: " + k);
  const pending = tasks.filter((t) => t.caseId === c.id && t.state === "pending").length;
  const closed = !!done("closed");
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>Each step is recorded by the right authority&apos;s user. The case closes only when every step is done and no authority has an open task. Any authority can reopen it.</span>
      <div className="rounded-lg border border-zinc-200">
        {STEPS.map((s, i) => {
          const d = done(s.k);
          const prevDone = i === 0 || !!done(STEPS[i - 1].k);
          const blocked = s.k === "closed" && pending > 0;
          const can = !d && prevDone && !blocked && s.who(persona, c);
          return (
            <div key={s.k} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4 text-sm last:border-0">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {i + 1}. {s.n}
                </span>
                <span className="text-xs text-zinc-500">Recorded by: {s.by}</span>
              </div>
              {d ? (
                <Badge dark>
                  {d.userId} · {hhmm(d.at)}
                </Badge>
              ) : blocked && prevDone ? (
                <Badge warn>Blocked: {pending} authorit{pending === 1 ? "y has" : "ies have"} not acknowledged</Badge>
              ) : can ? (
                <button onClick={() => logCase(c.id, "Closure step: " + s.k)} className={btnDark}>
                  Record
                </button>
              ) : (
                <span className="text-xs text-zinc-500">{prevDone ? `Waiting for ${s.by}` : "Waiting for the previous step"}</span>
              )}
            </div>
          );
        })}
      </div>
      {closed && (
        <div className="flex flex-col gap-3 rounded-lg bg-zinc-50 p-4 text-sm">
          <span>
            <b>Incident response closed.</b> The criminal case continues outside this workflow with the record intact.
          </span>
          <div className="flex flex-wrap gap-2">
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, e.g. new evidence" className="h-8 min-w-[220px] flex-1 rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none" />
            <button disabled={!reason.trim()} onClick={() => { logCase(c.id, "Case reopened: " + reason.trim()); setReason(""); }} className={btn}>
              <RotateCcw size={13} /> Reopen with reason
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Users ---------------- */

function Users() {
  return (
    <div className="flex flex-col gap-4">
      <span className={intro}>
        Every person has an individual user ID, issued on written nomination by the head of their institution, verified by Ghana Card, with a second factor. No shared logins. Sample users.
      </span>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-medium">User ID</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Permissions</th>
              <th className="px-3 py-2 font-medium">Issued</th>
            </tr>
          </thead>
          <tbody>
            {PERSONAS.filter((p) => p.kind !== "steering").map((p, i) => (
              <tr key={p.userId} className="border-t border-zinc-100">
                <td className="px-3 py-2.5 font-mono text-xs">{p.userId}</td>
                <td className="px-3 py-2.5">{p.name}</td>
                <td className="px-3 py-2.5 text-xs text-zinc-600">{p.title}</td>
                <td className="px-3 py-2.5 text-xs text-zinc-600">{p.roles.join(", ")}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{String(2 + (i % 6)).padStart(2, "0")} Nov 2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
