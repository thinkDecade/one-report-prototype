"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuditRecord, AuthorityCode, CaseRecord, CheckRecord, Exhibit, FraudAlert, InboundRequest, RegisterEntry, Task, TaskEvent } from "./types";
import { seedState, institutionById, personaById } from "./seed";
import { createCase, newTask, type ReportDraft } from "./cases";
import { lookupKey, normaliseIdentifier, sha256 } from "./hash";
import { formatIdentifier } from "./format";

const M = 60_000;
const D = 24 * 60 * M;

export interface PortalState {
  now: number;
  personaId: string;
  cases: CaseRecord[];
  tasks: Task[];
  entries: RegisterEntry[];
  alerts: FraudAlert[];
  checks: CheckRecord[];
  audit: AuditRecord[];
  seq: number;
  readAlerts: string[];
  journey: { id: string; step: number } | null;
  signedReports: string[];
  inbound: InboundRequest[];
  caseLog: { at: number; caseId: string; userId: string; text: string }[];

  setJourney: (j: { id: string; step: number } | null) => void;
  setClock: (t: number) => void;
  signPoliceReport: (caseId: string) => void;
  addExhibits: (caseId: string, ex: Exhibit[]) => void;
  setPersona: (id: string) => void;
  advance: (minutes: number) => void;
  reset: (mode: "live" | "fresh") => void;
  submitReport: (draft: ReportDraft) => string;
  taskAction: (taskId: string, button: TaskEvent["button"], opts?: { code?: string; note?: string; to?: AuthorityCode }) => void;
  confirmEntry: (entryId: string) => void;
  dropEntry: (entryId: string, note?: string) => void;
  runCheck: (raw: string) => CheckRecord | { error: string };
  issueAlert: (caseId: string) => string | null;
  markAlertRead: (id: string) => void;
  renewEntry: (entryId: string) => void;
  addEntry: (caseId: string, raw: string, evidence: string) => string | null;
  removeEntry: (entryId: string, note: string) => void;
  addInbound: (r: Omit<InboundRequest, "id" | "at" | "enteredBy" | "attachedTo">) => InboundRequest;
  logCase: (caseId: string, text: string) => void;
}

function addAudit(audit: AuditRecord[], at: number, userId: string, action: string, object: string): AuditRecord[] {
  const prev = audit[audit.length - 1];
  const prevHash = prev ? prev.hash : "0".repeat(64);
  const seq = (prev?.seq ?? 0) + 1;
  const hash = sha256([seq, at, userId, action, object, prevHash].join("|"));
  return [...audit, { seq, at, userId, action, object, prevHash, hash }];
}

function receiptNo(at: number, n: number) {
  return "OC-" + String(2229183 + n + Math.floor((at / 1000) % 97)).padStart(7, "0");
}

export const usePortal = create<PortalState>()(
  persist(
    (set, get) => ({
      ...seedState("live"),
      personaId: "CSA-0142",
      readAlerts: [],
      journey: null,
      signedReports: [],
      inbound: [],
      caseLog: [],

      setJourney: (j) => set({ journey: j }),
      setClock: (t) => set({ now: t }),
      signPoliceReport: (caseId) =>
        set((s) => ({
          signedReports: s.signedReports.includes(caseId) ? s.signedReports : [...s.signedReports, caseId],
          audit: addAudit(s.audit, s.now, s.personaId, "Police complaint report signed", caseId),
        })),
      addExhibits: (caseId, ex) =>
        set((s) => ({
          cases: s.cases.map((c) => (c.id === caseId ? { ...c, exhibits: [...c.exhibits, ...ex] } : c)),
          audit: addAudit(s.audit, s.now, s.personaId, `Evidence added (${ex.length})`, caseId),
        })),
      setPersona: (id) => set({ personaId: id }),
      advance: (minutes) => set((s) => ({ now: s.now + minutes * M })),
      reset: (mode) =>
        set({
          ...seedState(mode),
          personaId: mode === "fresh" ? "EMI-0004-01" : "CSA-0142",
          readAlerts: [],
          signedReports: [],
          inbound: [],
          caseLog: [],
        }),

      submitReport: (draft) => {
        const s = get();
        const inst = institutionById(draft.providerId);
        const { case: c, tasks, entries } = createCase(draft, s.seq, s.now, inst?.kind ?? "EMI");
        set({
          cases: [c, ...s.cases],
          tasks: [...tasks, ...s.tasks],
          entries: [...entries, ...s.entries],
          seq: s.seq + 1,
          audit: addAudit(s.audit, s.now, draft.filer, "Case filed and routed", c.id),
        });
        return c.id;
      },

      taskAction: (taskId, button, opts = {}) => {
        const s = get();
        const t = s.tasks.find((x) => x.id === taskId);
        if (!t) return;
        const ev: TaskEvent = { at: s.now, userId: s.personaId, button, code: opts.code, note: opts.note };
        const updated: Task = { ...t, events: [...t.events, ev] };
        if (button === "acknowledge") {
          updated.state = "acknowledged";
          updated.acknowledgedAt = s.now;
          updated.assignedTo = s.personaId;
        }
        if (button === "record") {
          if (!updated.acknowledgedAt) updated.acknowledgedAt = s.now;
          updated.state = "acted";
        }
        if (button === "decline") updated.state = "declined";
        if (button === "assign" && opts.note) updated.assignedTo = opts.note;
        let tasks = s.tasks.map((x) => (x.id === taskId ? updated : x));
        if (button === "hand_on" && opts.to) {
          const c = s.cases.find((x) => x.id === t.caseId)!;
          const n = tasks.filter((x) => x.caseId === c.id).length + 1;
          const nt = newTask(c.id, n, opts.to, "copy", "Handed on: " + (opts.note || "relevant parts of the case"), c.severity, s.now);
          tasks = [nt, ...tasks];
        }
        const cases = s.cases.map((c) => (c.id === t.caseId && c.status === "submitted" ? { ...c, status: "active" as const } : c));
        set({ tasks, cases, audit: addAudit(s.audit, s.now, s.personaId, `Task ${button}${opts.code ? ": " + opts.code : ""}`, taskId) });
      },

      confirmEntry: (entryId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  status: "confirmed" as const,
                  confirmedBy: s.personaId,
                  confirmedAt: s.now,
                  expiresAt: s.now + 30 * D,
                  history: [...e.history, { at: s.now, userId: s.personaId, action: "Confirmed" }],
                }
              : e
          ),
          audit: addAudit(s.audit, s.now, s.personaId, "Register entry confirmed", entryId),
        })),

      dropEntry: (entryId, note) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId ? { ...e, status: "dropped" as const, history: [...e.history, { at: s.now, userId: s.personaId, action: "Dropped by approver", note }] } : e
          ),
          audit: addAudit(s.audit, s.now, s.personaId, "Register entry dropped", entryId),
        })),

      runCheck: (raw) => {
        const s = get();
        const n = normaliseIdentifier(raw);
        if (!n) return { error: "That doesn't look like a Ghana mobile number, bank account or wallet address." };
        const key = lookupKey(n.value);
        const live = s.entries.filter((e) => e.lookupKey === key && e.expiresAt > s.now);
        const answer: CheckRecord["answer"] = live.some((e) => e.status === "confirmed")
          ? "reported"
          : live.some((e) => e.status === "provisional" || e.status === "held")
            ? "unconfirmed"
            : "none";
        const persona = personaById(s.personaId);
        const rec: CheckRecord = {
          receipt: receiptNo(s.now, s.checks.length + 1),
          userId: s.personaId,
          institution: persona?.institution ?? s.personaId,
          lookupKey: key,
          display: formatIdentifier(n.value),
          answer,
          at: s.now,
          channel: "mobile",
        };
        set({ checks: [rec, ...s.checks], audit: addAudit(s.audit, s.now, s.personaId, "Register check: " + answer, rec.receipt) });
        return rec;
      },

      issueAlert: (caseId) => {
        const s = get();
        const c = s.cases.find((x) => x.id === caseId);
        if (!c) return null;
        const ids = s.entries.filter((e) => e.caseId === caseId && (e.status === "confirmed" || e.status === "provisional")).map((e) => e.id);
        const nums = s.alerts.filter((a) => a.kind === "urgent").map((a) => parseInt(a.id.split("-").pop() || "0", 10));
        const n = Math.max(30, ...nums) + 1;
        const id = "GH-FA-" + String(n).padStart(4, "0");
        const alert: FraudAlert = {
          id,
          kind: "urgent",
          title: c.crossRail ? "Stolen funds are being converted across rails" : "Stolen funds are moving: " + c.title,
          caseId,
          entryIds: ids,
          issuedBy: s.personaId,
          issuedAt: s.now,
          cancelledEntryIds: [],
          text: "Do not trade with these. Check every buyer before you sell today.",
        };
        set({ alerts: [alert, ...s.alerts], audit: addAudit(s.audit, s.now, s.personaId, "Fraud alert issued", id) });
        return id;
      },

      renewEntry: (entryId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId ? { ...e, expiresAt: s.now + 30 * D, history: [...e.history, { at: s.now, userId: s.personaId, action: "Renewed for 30 days" }] } : e
          ),
          audit: addAudit(s.audit, s.now, s.personaId, "Register entry renewed", entryId),
        })),

      addEntry: (caseId, raw, evidence) => {
        const s = get();
        const n = normaliseIdentifier(raw);
        if (!n) return "Enter a Ghana mobile number, bank account or wallet address.";
        const key = lookupKey(n.value);
        if (s.entries.some((e) => e.lookupKey === key && e.caseId === caseId && e.status !== "dropped" && e.status !== "removed")) return "Already on the register for this case.";
        const id = `RE-${3000 + s.entries.length}`;
        const e: RegisterEntry = {
          id,
          identifier: n,
          lookupKey: key,
          caseId,
          source: "investigator tracing",
          status: "confirmed",
          enteredBy: s.personaId,
          enteredAt: s.now,
          confirmedBy: s.personaId,
          confirmedAt: s.now,
          expiresAt: s.now + 30 * D,
          history: [{ at: s.now, userId: s.personaId, action: "Entered as confirmed", note: evidence }],
        };
        set({ entries: [e, ...s.entries], audit: addAudit(s.audit, s.now, s.personaId, "Confirmed entry added", id) });
        return null;
      },

      removeEntry: (entryId, note) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId ? { ...e, status: "removed" as const, history: [...e.history, { at: s.now, userId: s.personaId, action: "Removed", note }] } : e
          ),
          alerts: s.alerts.map((a) => (a.entryIds.includes(entryId) && !a.cancelledEntryIds.includes(entryId) ? { ...a, cancelledEntryIds: [...a.cancelledEntryIds, entryId] } : a)),
          audit: addAudit(s.audit, s.now, s.personaId, "Register entry removed; cancellation alert sent", entryId),
        })),

      addInbound: (r) => {
        const s = get();
        const keys = r.identifiers.map((x) => normaliseIdentifier(x)).filter(Boolean).map((n) => lookupKey(n!.value));
        const hit = s.entries.find((e) => keys.includes(e.lookupKey));
        const list = s.inbound ?? [];
        const req: InboundRequest = {
          ...r,
          id: "IN-2026-" + String(41 + list.length).padStart(4, "0"),
          at: s.now,
          enteredBy: s.personaId,
          attachedTo: hit?.caseId,
        };
        set({ inbound: [req, ...list], audit: addAudit(s.audit, s.now, s.personaId, hit ? "Inbound request attached to case" : "Inbound request opened as new case", req.id) });
        return req;
      },

      logCase: (caseId, text) =>
        set((s) => ({
          caseLog: [...(s.caseLog ?? []), { at: s.now, caseId, userId: s.personaId, text }],
          audit: addAudit(s.audit, s.now, s.personaId, text, caseId),
        })),

      markAlertRead: (id) => set((s) => (s.readAlerts.includes(id) ? s : { readAlerts: [...s.readAlerts, id] })),
    }),
    { name: "one-report-prototype-v1" }
  )
);
