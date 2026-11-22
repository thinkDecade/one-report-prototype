// Domain model for the One Report, Every Agency portal prototype.
// Mirrors the entities in CDABI-GH/VRP/003/2026 section 5 (simplified).

export type AuthorityCode =
  | "CSA"
  | "CID"
  | "FIC"
  | "BOG_VAD"
  | "BOG_PSD"
  | "SEC"
  | "AGD"
  | "FICSOC"
  | "DPC"
  | "EOCO"
  | "NCA"
  | "OSP"
  | "NSCS";

export type InstitutionKind = "VASP" | "EMI" | "PSP" | "AGENT" | "BANK" | "OTC" | "AUTHORITY";

export type Severity = 1 | 2 | 3;
export type ReportType = "A" | "B" | "C" | "D" | "E";

export type RoleKey =
  | "provider"
  | "otc"
  | "agency"
  | "steering";

export interface Persona {
  userId: string;
  name: string;
  title: string;
  institution: string;
  kind: RoleKey;
  authority?: AuthorityCode;
  roles: string[];
}

export interface Institution {
  id: string;
  kind: InstitutionKind;
  name: string;
  regNo: string;
  licence: string;
  status: "active" | "pending" | "suspended";
  incidentOfficers: string[];
  contact24h: string;
}

export type IdentifierType = "momo" | "bank" | "wallet";

export interface Identifier {
  value: string;
  type: IdentifierType;
  network?: string;
}

export interface Transaction {
  id: string;
  rail: "payment" | "virtual_asset";
  from: string;
  to: string;
  amount: number;
  currency: string;
  time: number;
  ref: string;
  note?: string;
}

export interface Exhibit {
  no: string; // E-01, T-01, R-01
  name: string;
  size: number;
  sha256: string;
  receivedAt: number;
  kind: "evidence" | "snapshot";
  tool?: string;
}

export type TaskRole = "action" | "copy" | "conditional";
export type TaskState = "pending" | "acknowledged" | "acted" | "handed_on" | "declined" | "done";

export interface TaskEvent {
  at: number;
  userId: string;
  button: "acknowledge" | "record" | "hand_on" | "decline" | "assign" | "system";
  code?: string;
  note?: string;
}

export interface Task {
  id: string;
  caseId: string;
  authority: AuthorityCode;
  role: TaskRole;
  receives: string;
  state: TaskState;
  createdAt: number;
  ackTarget: number; // minutes after creation
  acknowledgedAt?: number;
  assignedTo?: string;
  escalation: 0 | 1 | 2 | 3; // 0 none, 1 reminder, 2 supervisor, 3 head + steering
  events: TaskEvent[];
}

export type CaseStatus = "submitted" | "triage" | "active" | "final" | "closed";

export interface CaseRecord {
  id: string;
  type: ReportType;
  severity: Severity;
  crossRail: boolean;
  status: CaseStatus;
  title: string;
  providerId: string;
  filer: string;
  detectedAt: number;
  filedAt: number;
  detectedHow: string;
  lossCedi: number;
  customersAffected: number;
  transactions: Transaction[];
  identifiers: Identifier[];
  technical: string[];
  containment: string[];
  solvency: string;
  narrative: { how: string; timeline: string; response: string; unknowns: string };
  exhibits: Exhibit[];
  personalData: boolean;
  fundsAbroad: boolean;
  triggers: { stateBacked: boolean; telecom: boolean; corruption: boolean };
  leadAgency?: AuthorityCode;
  linkedCases: string[];
  policeRef?: string;
}

export type EntryStatus = "provisional" | "held" | "confirmed" | "dropped" | "lapsed" | "removed";

export interface EntryEvent {
  at: number;
  userId: string;
  action: string;
  note?: string;
}

export interface RegisterEntry {
  id: string;
  identifier: Identifier;
  lookupKey: string;
  caseId: string;
  source: "provider report" | "investigator tracing" | "FIC analysis" | "inbound request";
  status: EntryStatus;
  enteredBy: string;
  enteredAt: number;
  confirmedBy?: string;
  confirmedAt?: number;
  expiresAt: number;
  history: EntryEvent[];
}

export type CheckAnswer = "none" | "unconfirmed" | "reported";

export interface CheckRecord {
  receipt: string;
  userId: string;
  institution: string;
  lookupKey: string;
  display: string;
  answer: CheckAnswer;
  at: number;
  channel: "web" | "mobile" | "ussd" | "api";
  lookbackSent?: boolean;
}

export interface FraudAlert {
  id: string;
  kind: "urgent" | "pattern";
  title: string;
  caseId?: string;
  entryIds: string[];
  issuedBy: string;
  issuedAt: number;
  cancelledEntryIds: string[];
  text: string;
}

export interface Notice {
  id: string;
  at: number;
  to: string; // userId or institution id or authority code
  channel: "email" | "sms" | "in-app";
  text: string;
}

export interface AuditRecord {
  seq: number;
  at: number;
  userId: string;
  action: string;
  object: string;
  prevHash: string;
  hash: string;
}
