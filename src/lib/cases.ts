import type { AuthorityCode, CaseRecord, Identifier, InstitutionKind, RegisterEntry, Task } from "./types";
import { ackTargetMinutes, routeCase } from "./routing";
import { lookupKey } from "./hash";

const M = 60_000;
const H = 60 * M;

export type ReportDraft = Omit<CaseRecord, "id" | "status" | "filedAt" | "linkedCases" | "leadAgency" | "policeRef">;

export function caseIdFor(kind: InstitutionKind, seq: number) {
  return `GH-${kind === "VASP" ? "VAI" : "PAY"}-2026-${String(seq).padStart(6, "0")}`;
}

export function newTask(caseId: string, n: number, authority: AuthorityCode, role: Task["role"], receives: string, severity: number, at: number): Task {
  return {
    id: `${caseId}-T${n}`,
    caseId,
    authority,
    role,
    receives,
    state: "pending",
    createdAt: at,
    ackTarget: ackTargetMinutes(authority, severity),
    escalation: 0,
    events: [{ at, userId: "system", button: "system", note: "Routed" }],
  };
}

export function createCase(draft: ReportDraft, seq: number, filedAt: number, providerKind: InstitutionKind) {
  const id = caseIdFor(providerKind, seq);
  const c: CaseRecord = { ...draft, id, status: "submitted", filedAt, linkedCases: [] };
  const tasks = routeCase(c, providerKind).map((r, i) => newTask(id, i + 1, r.authority, r.role, r.receives, c.severity, filedAt));
  const entries: RegisterEntry[] = c.identifiers.map((idf: Identifier, i) => ({
    id: `RE-${2000 + seq * 10 + i}`,
    identifier: idf,
    lookupKey: lookupKey(idf.value),
    caseId: id,
    source: "provider report",
    status: "provisional",
    enteredBy: c.filer,
    enteredAt: filedAt,
    expiresAt: filedAt + 24 * H,
    history: [{ at: filedAt, userId: c.filer, action: "Provisional entry from the provider report" }],
  }));
  return { case: c, tasks, entries };
}

// Plain-language headline for each authority's task on a case.
export const TASK_TITLES: Record<AuthorityCode, string> = {
  CSA: "Triage and coordinate the response",
  CID: "Review and sign the police complaint",
  FIC: "Trace the funds and consider a freeze",
  BOG_VAD: "Supervise the exchange and OTC exposure",
  BOG_PSD: "Supervise the float and receiving wallets",
  SEC: "Ask the OTC desk to hold the trade",
  AGD: "Prepare a request abroad",
  FICSOC: "Share indicators with sector response teams",
  DPC: "Assess the personal data breach",
  EOCO: "Apply for a freezing order",
  NCA: "Pull SIM change records from the operator",
  OSP: "Assess the corruption element",
  NSCS: "Assess the national security element",
};

export type Column = "received" | "acknowledged" | "acted" | "overdue";

export function overdueMinutes(t: Task, now: number) {
  if (t.state !== "pending") return 0;
  return Math.floor((now - (t.createdAt + t.ackTarget * M)) / M);
}

export function escalationLevel(t: Task, now: number): 0 | 1 | 2 | 3 {
  const over = overdueMinutes(t, now);
  if (over <= 0) return 0;
  if (over >= t.ackTarget) return 3;
  if (over >= 30) return 2;
  return 1;
}

export const ESCALATION_LABEL = ["", "Reminder sent", "Escalated to supervisor", "Escalated to head and steering group"];

export function columnOf(t: Task, now: number): Column {
  if (t.state === "pending") return overdueMinutes(t, now) > 0 ? "overdue" : "received";
  if (t.state === "acknowledged") return "acknowledged";
  return "acted";
}
