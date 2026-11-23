import type { AuditRecord, CaseRecord, CheckRecord, FraudAlert, Institution, Persona, RegisterEntry, Task, TaskEvent } from "./types";
import { createCase, newTask, type ReportDraft } from "./cases";
import { lookupKey, sha256 } from "./hash";
import { ackTargetMinutes, routeCase } from "./routing";

// All names, numbers and addresses below are invented for demonstration.

export const DRILL_START = Date.UTC(2026, 10, 22, 4, 31, 0); // Sun 22 Nov 2026, 04:31 GMT
const H = 3600_000;
const M = 60_000;
const D = 24 * H;

export const PERSONAS: Persona[] = [
  { userId: "EMI-0004-01", name: "Esi Mensah", title: "Head of Fraud & Incident Response", institution: "EMI-0004", kind: "provider", roles: ["incident officer", "checker"] },
  { userId: "VASP-0215-02", name: "Daniel Tetteh", title: "Chief Information Security Officer", institution: "VASP-0215", kind: "provider", roles: ["incident officer", "checker"] },
  { userId: "OTC-0442", name: "Kojo Darko", title: "OTC vendor, Kaneshie", institution: "OTC-0442", kind: "otc", roles: ["checker"] },
  { userId: "CSA-0142", name: "Kwame Asante", title: "Duty officer, CERT-GH 24-hour desk", institution: "CSA", kind: "agency", authority: "CSA", roles: ["point person", "approver", "alert issuer"] },
  { userId: "CSA-0210", name: "Adwoa Boateng", title: "Register desk, CERT-GH", institution: "CSA", kind: "agency", authority: "CSA", roles: ["approver"] },
  { userId: "CID-0031", name: "Insp. Abena Owusu", title: "Point person, Cybercrime Unit", institution: "CID", kind: "agency", authority: "CID", roles: ["point person", "investigator", "approver"] },
  { userId: "FIC-0007", name: "Yaw Boateng", title: "Point person, Analysis & Monitoring", institution: "FIC", kind: "agency", authority: "FIC", roles: ["point person", "approver"] },
  { userId: "BOG-0019", name: "Efua Addo", title: "Point person, Payment Systems", institution: "BOG_PSD", kind: "agency", authority: "BOG_PSD", roles: ["point person", "supervisor"] },
  { userId: "BOG-0027", name: "Nana Ofori", title: "Point person, Virtual Assets Dept", institution: "BOG_VAD", kind: "agency", authority: "BOG_VAD", roles: ["point person"] },
  { userId: "SEC-0011", name: "Ama Serwaa", title: "Point person, Fintech & Innovation", institution: "SEC", kind: "agency", authority: "SEC", roles: ["point person"] },
  { userId: "AGD-0004", name: "Kofi Annan-Mensah", title: "Duty officer, International Cooperation", institution: "AGD", kind: "agency", authority: "AGD", roles: ["point person", "approver"] },
  { userId: "AGD-HEAD", name: "Ewurabena Quaye", title: "Director, International Cooperation", institution: "AGD", kind: "agency", authority: "AGD", roles: ["head"] },
  { userId: "FCS-0003", name: "Selorm Agbeko", title: "Analyst, FICSOC", institution: "FICSOC", kind: "agency", authority: "FICSOC", roles: ["point person"] },
  { userId: "EOC-0005", name: "Kwesi Badu", title: "Duty officer, Asset Recovery", institution: "EOCO", kind: "agency", authority: "EOCO", roles: ["point person"] },
  { userId: "NCA-0002", name: "Akosua Frimpong", title: "Point person, Numbering & Licensing", institution: "NCA", kind: "agency", authority: "NCA", roles: ["point person"] },
  { userId: "STEER-01", name: "Steering group", title: "Heads of authorities", institution: "STEERING", kind: "steering", roles: ["viewer"] },
];

export const INSTITUTIONS: Institution[] = [
  { id: "EMI-0004", kind: "EMI", name: "KentePay Mobile Money Ltd", regNo: "CS093341120", licence: "BoG EMI licence EMI/014", status: "active", incidentOfficers: ["EMI-0004-01", "EMI-0004-02"], contact24h: "+233 30 299 1100" },
  { id: "VASP-0215", kind: "VASP", name: "Volta Digital Exchange Ltd", regNo: "CS118823024", licence: "SEC sandbox SBX/2026/07", status: "active", incidentOfficers: ["VASP-0215-01", "VASP-0215-02"], contact24h: "+233 30 255 0400" },
  { id: "OTC-0442", kind: "OTC", name: "Kojo Darko (sole trader)", regNo: "—", licence: "Not licensed (registration is not a licence)", status: "active", incidentOfficers: ["OTC-0442"], contact24h: "+233 20 999 0442" },
];

export function personaById(id: string) {
  return PERSONAS.find((p) => p.userId === id);
}
export function institutionById(id: string) {
  return INSTITUTIONS.find((i) => i.id === id);
}

// ---------- Drill scenario (concept paper section 21, spec section 13) ----------

export const DRILL_SCENARIO = {
  title: "Agent float theft by SIM swap, converted to USDT",
  type: "A" as const,
  severity: 1 as const,
  crossRail: true,
  detectedHow: "Float reconciliation alert at 03:58; 9 agent lines showed SIM changes in the previous 6 hours",
  lossCedi: 1_840_000,
  customersAffected: 0,
  transactions: [
    { rail: "payment" as const, from: "Agent float AGT-1187", to: "+233245550187", amount: 412_000, currency: "GHS", ref: "KP-TX-88231907", note: "Float transfer after SIM swap" },
    { rail: "payment" as const, from: "Agent float AGT-1192", to: "+233245550187", amount: 288_500, currency: "GHS", ref: "KP-TX-88231944", note: "Float transfer after SIM swap" },
    { rail: "payment" as const, from: "Agent float AGT-1203", to: "+233209981442", amount: 530_000, currency: "GHS", ref: "KP-TX-88232011", note: "Float transfer after SIM swap" },
    { rail: "payment" as const, from: "Agent float AGT-1219", to: "+233559020316", amount: 609_500, currency: "GHS", ref: "KP-TX-88232090", note: "Float transfer after SIM swap" },
    { rail: "virtual_asset" as const, from: "OTC purchase (unknown vendor)", to: "TQ7nVfK3sGh9Xb2LmPz8RwYc4DjE6uAt5H", amount: 61_200, currency: "USDT (TRC-20)", ref: "e3b1c0f7a9d24c6e8b5f1a0d9c7e3b2a4f6d8c0e1b3a5c7d9e0f2a4b6c8d0e1f", note: "Conversion point" },
  ],
  identifiers: [
    { value: "+233245550187", type: "momo" as const },
    { value: "+233209981442", type: "momo" as const },
    { value: "+233559020316", type: "momo" as const },
    { value: "TQ7nVfK3sGh9Xb2LmPz8RwYc4DjE6uAt5H", type: "wallet" as const, network: "Tron" },
  ],
  technical: ["SIM change on 9 agent lines via 2 retail outlets", "Login from device fingerprint 7c1f…a90 on 9 agent accounts", "IP 102.176.14.83"],
  containment: [
    "04:02 Outbound float transfers paused for affected agent codes",
    "04:09 9 agent accounts locked; PIN reset forced",
    "04:15 Wallet restriction placed on 3 receiving wallets held at KentePay",
  ],
  solvency: "Customer e-money fully backed. Loss falls on agent float and company trust account top-up of ₵1.84m; covered from reserves.",
  narrative: {
    how: "We believe attackers obtained replacement SIMs for nine agent lines, used them to receive one-time codes, signed in to the agent app from one device, and moved float to three personal wallets. Known: the transfers and the SIM changes. Suspected: the SIM changes were made with forged Ghana Card copies.",
    timeline: "22:40–03:30 SIM changes on 9 lines\n03:31–03:52 Four float transfers totalling ₵1.84m\n03:58 Reconciliation alert\n04:02 Transfers paused",
    response: "Fraud team convened at 04:00. Agent accounts locked, receiving wallets restricted, device and login logs exported.",
    unknowns: "Which OTC vendors sold the USDT; whether any agent was complicit; whether other issuers' agents were hit.",
  },
  personalData: false,
  fundsAbroad: true,
  triggers: { stateBacked: false, telecom: true, corruption: false },
};

// ---------- Seed cases ----------

function mkTasks(c: CaseRecord, kind: "VASP" | "EMI", ackedAll: boolean): Task[] {
  return routeCase(c, kind).map((r, i) => {
    const t: Task = {
      id: `${c.id}-T${i + 1}`,
      caseId: c.id,
      authority: r.authority,
      role: r.role,
      receives: r.receives,
      state: ackedAll ? "acted" : "pending",
      createdAt: c.filedAt,
      ackTarget: ackTargetMinutes(r.authority, c.severity),
      escalation: 0,
      events: [],
    };
    if (ackedAll) {
      t.acknowledgedAt = c.filedAt + (20 + i * 9) * M;
      t.events.push({ at: t.acknowledgedAt, userId: `${r.authority}-duty`, button: "acknowledge" });
      t.events.push({ at: t.acknowledgedAt + 2 * H, userId: `${r.authority}-duty`, button: "record", code: "Recorded" });
    }
    return t;
  });
}

const case219: CaseRecord = {
  id: "GH-VAI-2026-000219",
  type: "A",
  severity: 1,
  crossRail: false,
  status: "active",
  title: "Hot wallet theft, Volta Digital Exchange",
  providerId: "VASP-0215",
  filer: "VASP-0215-02",
  detectedAt: DRILL_START - 3 * D - 2 * H,
  filedAt: DRILL_START - 3 * D - 1 * H,
  detectedHow: "Hot wallet balance alert",
  lossCedi: 3_120_000,
  customersAffected: 1840,
  transactions: [],
  identifiers: [
    { value: "0x9f2c4b7d1e8a3f6c0b5d2e9a7c4f1b8d3e6a0c2f", type: "wallet", network: "EVM" },
    { value: "TXr4mPq8VbN2kWs9DzYh3Lc6Fj7Ge5Ut1A", type: "wallet", network: "Tron" },
  ],
  technical: ["Compromised signing server", "IP 185.220.101.4"],
  containment: ["Withdrawals paused", "Keys rotated", "Remaining funds moved to cold storage"],
  solvency: "Client assets covered 100% from cold storage and company reserves.",
  narrative: { how: "Signing server compromised through a supplier's remote-access tool.", timeline: "", response: "", unknowns: "" },
  exhibits: [],
  personalData: true,
  fundsAbroad: true,
  triggers: { stateBacked: false, telecom: false, corruption: false },
  leadAgency: "CID",
  linkedCases: [],
  policeRef: "CID/CCU/2026/1147",
};

const case228: CaseRecord = {
  id: "GH-PAY-2026-000228",
  type: "B",
  severity: 2,
  crossRail: false,
  status: "active",
  title: "Customer wallets taken over, fake reversal calls",
  providerId: "EMI-0004",
  filer: "EMI-0004-01",
  detectedAt: DRILL_START - 1 * D - 9 * H,
  filedAt: DRILL_START - 1 * D - 6 * H,
  detectedHow: "Customer complaints spike",
  lossCedi: 86_400,
  customersAffected: 37,
  transactions: [],
  identifiers: [{ value: "+233501117734", type: "momo" }],
  technical: [],
  containment: ["Affected wallets restricted"],
  solvency: "No impact on float.",
  narrative: { how: "Social-engineering calls impersonating customer care.", timeline: "", response: "", unknowns: "" },
  exhibits: [],
  personalData: true,
  fundsAbroad: false,
  triggers: { stateBacked: false, telecom: false, corruption: false },
  leadAgency: "CID",
  linkedCases: [],
};

// ---------- The drill, as it stands at 07:05 on 22 Nov ----------

export function drillDraft(): ReportDraft {
  const d = DRILL_SCENARIO;
  return {
    type: d.type,
    severity: d.severity,
    crossRail: d.crossRail,
    title: "SIM swap on agent float",
    providerId: "EMI-0004",
    filer: "EMI-0004-01",
    detectedAt: DRILL_START - 33 * M,
    detectedHow: d.detectedHow,
    lossCedi: d.lossCedi,
    customersAffected: d.customersAffected,
    transactions: d.transactions.map((t, i) => ({ ...t, id: `TX-${i + 1}`, time: DRILL_START - (60 - i * 6) * M })),
    identifiers: d.identifiers.map((x) => ({ ...x })),
    technical: [...d.technical],
    containment: [...d.containment],
    solvency: d.solvency,
    narrative: { ...d.narrative },
    exhibits: [],
    personalData: d.personalData,
    fundsAbroad: d.fundsAbroad,
    triggers: { ...d.triggers },
    customerLossCedi: 0,
    companyLossCedi: d.lossCedi,
    containmentChecks: ["Withdrawals or transfers paused", "Systems or accounts isolated"],
    solvencyStatus: "covered",
    simSwap: "9 agent lines changed between 22:40 and 03:30 at 2 retail outlets; operator notified 04:20",
    forensicHashes: ["9b0e4c1f7a2d6e3b8c5f0a9d4e7b1c6f3a8d2e5b9c0f4a7d1e6b3c8f5a2d9e0b"],
    filerRole: "Head of Fraud & Incident Response",
  };
}

export const LIVE_CLOCK = DRILL_START + 154 * M; // 07:05 GMT

function at(hh: number, mm: number) {
  return Date.UTC(2026, 10, 22, hh, mm, 0);
}

function drillInProgress() {
  const { case: c, tasks, entries } = createCase(drillDraft(), 229, DRILL_START, "EMI");
  c.status = "active";
  c.leadAgency = "CID";
  c.exhibits = [
    { no: "E-01", name: "float-reconciliation-0358.csv", size: 48210, sha256: sha256("E-01 float reconciliation"), receivedAt: DRILL_START + 2 * M, kind: "evidence" },
    { no: "E-02", name: "agent-login-device-logs.json", size: 912_044, sha256: sha256("E-02 device logs"), receivedAt: DRILL_START + 3 * M, kind: "evidence" },
    { no: "E-03", name: "sim-change-notices.pdf", size: 210_337, sha256: sha256("E-03 SIM changes"), receivedAt: DRILL_START + 4 * M, kind: "evidence" },
  ];
  const ev = (t: Task, list: TaskEvent[]) => {
    t.events.push(...list);
    const ack = list.find((e) => e.button === "acknowledge");
    if (ack) {
      t.acknowledgedAt = ack.at;
      t.state = "acknowledged";
    }
    if (list.some((e) => e.button === "record")) t.state = "acted";
  };
  const by = (a: string) => tasks.find((t) => t.authority === a)!;
  ev(by("CSA"), [
    { at: at(4, 52), userId: "CSA-0142", button: "acknowledge" },
    { at: at(4, 55), userId: "CSA-0142", button: "record", code: "Triage complete" },
    { at: at(4, 56), userId: "CSA-0142", button: "record", code: "Cross-rail marker confirmed" },
  ]);
  ev(by("CID"), [{ at: at(4, 58), userId: "CID-0031", button: "acknowledge" }]);
  ev(by("FIC"), [{ at: at(5, 6), userId: "FIC-0007", button: "acknowledge" }]);
  ev(by("BOG_PSD"), [{ at: at(5, 2), userId: "BOG-0019", button: "acknowledge" }]);
  ev(by("BOG_VAD"), [{ at: at(5, 20), userId: "BOG-0027", button: "acknowledge" }]);
  ev(by("SEC"), [{ at: at(5, 14), userId: "SEC-0011", button: "acknowledge" }]);
  ev(by("NCA"), [
    { at: at(5, 10), userId: "NCA-0002", button: "acknowledge" },
    { at: at(6, 12), userId: "NCA-0002", button: "record", code: "SIM change logs received" },
  ]);
  ev(by("FICSOC"), [
    { at: at(5, 31), userId: "FCS-0003", button: "acknowledge" },
    { at: at(5, 40), userId: "FCS-0003", button: "record", code: "Technical indicators shared with financial sector response teams" },
  ]);
  // CSA hands the case on to EOCO for a freezing order at 06:55
  const eoco = newTask(c.id, tasks.length + 1, "EOCO", "copy", "Money trail, numbers and containment; freezing order application", c.severity, at(6, 55));
  by("CSA").events.push({ at: at(6, 55), userId: "CSA-0142", button: "hand_on", note: "Added EOCO for a freezing order" });
  tasks.push(eoco);

  // Register: the wallet is confirmed by tracing, the three numbers wait for review
  const wallet = entries.find((e) => e.identifier.type === "wallet")!;
  wallet.status = "confirmed";
  wallet.confirmedBy = "CSA-0142";
  wallet.confirmedAt = at(5, 20);
  wallet.expiresAt = at(5, 20) + 30 * D;
  wallet.history.push({ at: at(5, 20), userId: "CSA-0142", action: "Confirmed", note: "Linked by on-chain tracing" });

  const alert: FraudAlert = {
    id: "GH-FA-0031",
    kind: "urgent",
    title: "Stolen mobile money is being turned into USDT",
    caseId: c.id,
    entryIds: entries.map((e) => e.id),
    issuedBy: "CSA-0142",
    issuedAt: at(5, 22),
    cancelledEntryIds: [],
    text: "Do not trade with these. Check every buyer before you sell today.",
  };
  const check: CheckRecord = {
    receipt: "OC-2229183",
    userId: "OTC-0442",
    institution: "OTC-0442",
    lookupKey: entries[0].lookupKey,
    display: "+233 24 555 0187",
    answer: "unconfirmed",
    at: at(4, 47),
    channel: "mobile",
  };
  return { c, tasks, entries, alert, check };
}

export function seedState(mode: "live" | "fresh" = "live") {
  const base = seedBase();
  if (mode === "fresh") return { ...base, checks: [] as CheckRecord[], audit: [] as AuditRecord[], now: DRILL_START, seq: 229 };
  const d = drillInProgress();
  return {
    cases: [d.c, ...base.cases],
    tasks: [...d.tasks, ...base.tasks],
    entries: [...d.entries, ...base.entries],
    alerts: [d.alert, ...base.alerts],
    checks: [d.check],
    audit: [] as AuditRecord[],
    now: LIVE_CLOCK,
    seq: 230,
  };
}

function seedBase() {
  const cases = [case219, case228];
  const tasks = [...mkTasks(case219, "VASP", true), ...mkTasks(case228, "EMI", true)];
  const entries: RegisterEntry[] = [
    ...case219.identifiers.map((idf, i) => ({
      id: `RE-${1040 + i}`,
      identifier: idf,
      lookupKey: lookupKey(idf.value),
      caseId: case219.id,
      source: "provider report" as const,
      status: "confirmed" as const,
      enteredBy: "VASP-0215-02",
      enteredAt: case219.filedAt + 5 * M,
      confirmedBy: "CSA-0142",
      confirmedAt: case219.filedAt + 48 * M,
      expiresAt: case219.filedAt + 48 * M + 30 * D,
      history: [
        { at: case219.filedAt + 5 * M, userId: "VASP-0215-02", action: "Provisional entry with evidence E-0" + (i + 3) },
        { at: case219.filedAt + 48 * M, userId: "CSA-0142", action: "Confirmed", note: "Linked by on-chain tracing" },
      ],
    })),
    {
      id: "RE-1052",
      identifier: { value: "+233501117734", type: "momo" },
      lookupKey: lookupKey("+233501117734"),
      caseId: case228.id,
      source: "provider report",
      status: "confirmed",
      enteredBy: "EMI-0004-01",
      enteredAt: case228.filedAt + 10 * M,
      confirmedBy: "CID-0031",
      confirmedAt: case228.filedAt + 5 * H,
      expiresAt: case228.filedAt + 5 * H + 30 * D,
      history: [
        { at: case228.filedAt + 10 * M, userId: "EMI-0004-01", action: "Provisional entry with evidence E-02" },
        { at: case228.filedAt + 5 * H, userId: "CID-0031", action: "Confirmed" },
      ],
    },
  ];
  const alerts: FraudAlert[] = [
    {
      id: "GH-FA-0030",
      kind: "urgent",
      title: "Hot wallet theft: stolen USDT and ETH moving",
      caseId: case219.id,
      entryIds: ["RE-1040", "RE-1041"],
      issuedBy: "CSA-0142",
      issuedAt: case219.filedAt + 70 * M,
      cancelledEntryIds: [],
      text: "Check before you transact. Do not accept deposits from the wallets below. Report any match through the portal.",
    },
    {
      id: "GH-FA-P-0012",
      kind: "pattern",
      title: "Fake 'reversal' calls to mobile money customers",
      entryIds: [],
      issuedBy: "CSA-0142",
      issuedAt: DRILL_START - 20 * H,
      cancelledEntryIds: [],
      text: "Callers claim a wrong transfer was sent and ask customers to approve a 'reversal'. Agents should refuse reversals requested by phone.",
    },
  ];
  return { cases, tasks, entries, alerts };
}
