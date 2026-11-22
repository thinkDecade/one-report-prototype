import type { AuthorityCode, CaseRecord, InstitutionKind, TaskRole } from "./types";

export const AUTHORITIES: Record<AuthorityCode, { short: string; name: string; color: string }> = {
  CSA: { short: "CSA", name: "Cyber Security Authority (CERT-GH)", color: "#0f5132" },
  CID: { short: "CID", name: "Ghana Police Service, CID Cybercrime Unit", color: "#1d3a8a" },
  FIC: { short: "FIC", name: "Financial Intelligence Centre", color: "#6b21a8" },
  BOG_VAD: { short: "BoG VAD", name: "Bank of Ghana, Virtual Assets Department", color: "#7c4a03" },
  BOG_PSD: { short: "BoG PSD", name: "Bank of Ghana, Payment Systems Supervision", color: "#7c4a03" },
  SEC: { short: "SEC", name: "Securities and Exchange Commission", color: "#155e75" },
  AGD: { short: "AGD", name: "Attorney-General's Department", color: "#7f1d1d" },
  FICSOC: { short: "FICSOC", name: "BoG Financial Sector Security Operations Centre", color: "#3f3f46" },
  DPC: { short: "DPC", name: "Data Protection Commission", color: "#365314" },
  EOCO: { short: "EOCO", name: "Economic and Organised Crime Office", color: "#9a3412" },
  NCA: { short: "NCA", name: "National Communications Authority and operator", color: "#0e7490" },
  OSP: { short: "OSP", name: "Office of the Special Prosecutor", color: "#831843" },
  NSCS: { short: "NSCS", name: "National Security Council Secretariat", color: "#1e293b" },
};

export interface Route {
  authority: AuthorityCode;
  role: TaskRole;
  receives: string;
  reason: string;
}

// Routing rules from CDABI-GH/VRP/003/2026 section 7.4.
export function routeCase(
  c: Pick<CaseRecord, "severity" | "crossRail" | "personalData" | "fundsAbroad" | "triggers">,
  providerKind: InstitutionKind
): Route[] {
  const r: Route[] = [];
  const isVasp = providerKind === "VASP";
  const isPay = providerKind === "EMI" || providerKind === "PSP" || providerKind === "AGENT";
  r.push({ authority: "CSA", role: "action", receives: "Full case, for action", reason: "Every case" });
  r.push({ authority: "CID", role: "copy", receives: "Full case; police complaint report for review and signature", reason: "Every case" });
  r.push({ authority: "FIC", role: "copy", receives: "Transaction, flow and suspect fields; STR information", reason: "Every case" });
  if (isVasp || c.crossRail) {
    r.push({ authority: "BOG_VAD", role: "copy", receives: "Supervisory notice", reason: c.crossRail && !isVasp ? "Cross-rail marker" : "VASP case" });
    r.push({ authority: "SEC", role: "copy", receives: "Supervisory notice", reason: c.crossRail && !isVasp ? "Cross-rail marker" : "VASP case" });
  }
  if (isPay || c.crossRail) {
    r.push({ authority: "BOG_PSD", role: "copy", receives: "Supervisory notice; float position", reason: c.crossRail && !isPay ? "Cross-rail marker" : "Payment provider case" });
  }
  if (c.severity === 1 || c.fundsAbroad) {
    r.push({ authority: "AGD", role: "copy", receives: "Full case; mutual legal assistance draft", reason: c.severity === 1 ? "Level 1" : "Funds abroad" });
  }
  if (c.severity === 1) {
    r.push({ authority: "FICSOC", role: "copy", receives: "Technical report and indicators only", reason: "Level 1" });
  }
  if (c.personalData) {
    r.push({ authority: "DPC", role: "copy", receives: "Breach fields only", reason: "Personal data exposed" });
  }
  if (c.triggers.stateBacked) {
    r.push({ authority: "NSCS", role: "conditional", receives: "Relevant parts", reason: "State-backed attacker" });
  }
  if (c.triggers.telecom) {
    r.push({ authority: "NCA", role: "conditional", receives: "Subscriber-record requests", reason: "SIM swap or telecom element" });
  }
  if (c.triggers.corruption) {
    r.push({ authority: "OSP", role: "conditional", receives: "Relevant parts", reason: "Corruption or public officer" });
  }
  return r;
}

// Acknowledgement targets (concept paper section 11, spec Annex D), in minutes.
export function ackTargetMinutes(authority: AuthorityCode, severity: number): number {
  if (severity === 1) return authority === "CSA" ? 60 : 120;
  return 8 * 60; // one working day, simplified
}

// Actions each authority may record (concept paper section 14).
export const ACTION_CODES: Record<AuthorityCode, string[]> = {
  CSA: [
    "Triage complete",
    "Severity confirmed",
    "Cross-rail marker confirmed",
    "Lead investigator proposed",
    "Budapest 24/7 preservation request sent",
    "Recipient added",
  ],
  CID: [
    "Police complaint report reviewed and signed",
    "Investigation opened",
    "Request to issuer or exchange sent",
    "Interpol request sent",
    "Court application filed",
  ],
  FIC: ["Suspicious transaction report linked", "Freeze under s.56 Act 1044", "Freeze declined", "Egmont request sent"],
  EOCO: ["Freezing order issued", "Court confirmation obtained"],
  AGD: ["Approval given", "Mutual legal assistance request signed and sent", "Prosecution decision"],
  BOG_VAD: ["Supervisory direction issued", "Solvency plan reviewed", "Reopening approved"],
  BOG_PSD: ["Supervisory direction issued", "Float plan reviewed", "GhIPSS tracing requested", "Reopening approved"],
  SEC: ["Supervisory direction issued", "Solvency plan reviewed"],
  FICSOC: ["Technical indicators shared with financial sector response teams"],
  DPC: ["Breach notice received", "Direction issued"],
  NCA: ["Subscriber records requested from operator", "SIM change logs received"],
  OSP: ["Investigation opened"],
  NSCS: ["National security assessment opened"],
};
