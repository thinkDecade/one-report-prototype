import { DRILL_START } from "./seed";

const M = 60_000;

export type JourneyIcon = "file" | "shield" | "eyeoff" | "check" | "search" | "chart";

export interface JourneyStep {
  label: string;
  href: string;
  hint: string;
  persona?: string;
  reset?: "fresh" | "live";
  clock?: number;
}

export interface MapCard {
  t: string;
  h: string;
  r: string;
  k?: "trig" | "new" | "end";
}

export interface Journey {
  id: string;
  role: string;
  pitch: string;
  icon: JourneyIcon;
  persona: string;
  who: string;
  trigger: { channel: "sms" | "email" | "alarm" | "chat" | "in-app"; time: string; from: string; text: string };
  steps: JourneyStep[];
  showed: { title: string; text: string }[];
  map: MapCard[];
}

export const JOURNEYS: Journey[] = [
  {
    id: "reporter",
    role: "Reporting institution",
    pitch: "Report once, then follow your case",
    icon: "file",
    persona: "EMI-0004-01",
    who: "Esi Mensah · Head of Fraud, KentePay Mobile Money",
    trigger: {
      channel: "alarm",
      time: "03:58",
      from: "KentePay fraud monitoring",
      text: "Float reconciliation alert: ₵1.84m moved out of 9 agent floats in 21 minutes. SIM changes seen on the same lines.",
    },
    steps: [
      {
        label: "File one report",
        href: "/report?drill=1",
        reset: "fresh",
        hint: "The form is filled in with the drill. Click through the five steps and submit. Evidence is fingerprinted in your browser.",
      },
      {
        label: "Follow your case",
        href: "/my-case",
        reset: "live",
        hint: "It's now 07:05, two and a half hours later. This is what happened to your one report.",
      },
      {
        label: "Sign the police report",
        href: "/my-case#todo",
        hint: "CID drafted a complaint report from what you filed. Review it and sign it here. You can also add evidence.",
      },
    ],
    showed: [
      { title: "One report, not ten", text: "The business files once. Routing rules send each authority its part at the same moment." },
      { title: "Sealed evidence", text: "Every file is fingerprinted on upload, so a court can trust it hasn't changed." },
      { title: "The reporter isn't left in the dark", text: "They can see who acknowledged, what happens next and what is still needed from them." },
    ],
    map: [
      { t: "03:58", h: "Float drained by SIM swap", r: "Reconciliation alert", k: "trig" },
      { t: "04:31", h: "Files one report", r: "Five steps · evidence sealed on upload" },
      { t: "07:05", h: "Follows “My case”", r: "Who acknowledged, what happens next", k: "new" },
      { t: "07:10", h: "Signs the police report", r: "CID drafted it from her report", k: "new" },
      { t: "08:31", h: "Freeze outcome", r: "Told what was held, and by whom", k: "end" },
    ],
  },
  {
    id: "lead",
    role: "CSA duty officer",
    pitch: "Lead the response",
    icon: "shield",
    persona: "CSA-0142",
    who: "Kwame Asante · Duty officer, Cyber Security Authority",
    trigger: {
      channel: "sms",
      time: "04:31",
      from: "One Report",
      text: "Level 1 case GH-PAY-2026-000229 routed to CSA for action. SIM swap on agent float, ₵1.84m. Acknowledge by 05:31.",
    },
    steps: [
      {
        label: "Lead the case",
        href: "/board?case=GH-PAY-2026-000229",
        reset: "live",
        hint: "As the lead you see every authority's task. Open one, hand it on or decline it, and watch the clocks.",
      },
      {
        label: "Approve register entries",
        href: "/register",
        hint: "The reporter's numbers went on the register as provisional. Confirm or drop them.",
      },
      {
        label: "The alert you issued",
        href: "/alerts/GH-FA-0031",
        hint: "At 05:22 you warned agents and OTC desks. This is what they received.",
      },
    ],
    showed: [
      { title: "One lead, many partners", text: "CSA acts. Everyone else works in parallel on their own task." },
      { title: "Four buttons, one clock each", text: "Acknowledge, record action, hand on, decline. Late tasks escalate on their own." },
      { title: "Warnings in minutes", text: "Confirmed numbers and wallets reach the people about to transact." },
    ],
    map: [
      { t: "04:31", h: "SMS: Level 1 case", r: "Acknowledge within 1 hour", k: "trig" },
      { t: "04:52", h: "Acknowledges, takes the lead", r: "Whole case, for action" },
      { t: "05:20", h: "Confirms the wallet", r: "On the check register" },
      { t: "05:22", h: "Issues urgent alert", r: "GH-FA-0031 to agents and OTC desks" },
      { t: "06:55", h: "Hands on to EOCO", r: "For a freezing order", k: "end" },
    ],
  },
  {
    id: "partner",
    role: "Partner officer",
    pitch: "Get only your part",
    icon: "eyeoff",
    persona: "EOC-0005",
    who: "Kwesi Badu · Duty officer, EOCO (the same view serves CID, FIC, BoG, SEC, AG, NCA)",
    trigger: {
      channel: "email",
      time: "06:55",
      from: "One Report",
      text: "The Cyber Security Authority has handed EOCO part of case GH-PAY-2026-000229 for a freezing order. Acknowledge by 08:55.",
    },
    steps: [
      {
        label: "Open your task",
        href: "/task",
        reset: "live",
        hint: "You land on EOCO's one task, not the whole case. See what you receive and what isn't shared. Then acknowledge.",
      },
      {
        label: "Record what you did",
        href: "/task",
        hint: "Record an action, for example that you applied for a freezing order. Every authority's status updates at once.",
      },
    ],
    showed: [
      { title: "Each gets only its part", text: "Routing rule 7.4 decides which fields an authority receives. Nothing else is sent." },
      { title: "No new powers", text: "The portal carries requests. Freezes stay with the FIC, EOCO and the courts." },
      { title: "Everything is logged", text: "Every view and action goes into the case's tamper-evident audit log." },
    ],
    map: [
      { t: "06:55", h: "Email: handed a part", r: "For a freezing order", k: "trig" },
      { t: "07:05", h: "Opens his one task", r: "Not the whole board", k: "new" },
      { t: "07:06", h: "Acknowledges", r: "Clock stops for EOCO" },
      { t: "07:40", h: "Records an action", r: "Freezing order applied for" },
      { t: "08:31", h: "Done for EOCO", r: "Case stays open for others", k: "end" },
    ],
  },
  {
    id: "approver",
    role: "Register approver",
    pitch: "Confirm or drop entries",
    icon: "check",
    persona: "CSA-0210",
    who: "Adwoa Boateng · Register desk, Cyber Security Authority",
    trigger: {
      channel: "in-app",
      time: "04:31",
      from: "One Report register",
      text: "4 provisional entries from case GH-PAY-2026-000229 need review. Entries nobody confirms lapse after 24 hours.",
    },
    steps: [
      {
        label: "Review entries",
        href: "/register",
        reset: "live",
        hint: "Confirm the numbers you can link to the theft, and drop any that turn out to be innocent. Confirmed entries stay 30 days.",
      },
      {
        label: "See what a checker sees",
        href: "/check",
        persona: "OTC-0442",
        hint: "You're now an OTC vendor. Check +233 24 555 0187 to see what your decision changed.",
      },
    ],
    showed: [
      { title: "Provisional first, then a person decides", text: "Reported numbers warn people at once, but stay only if an approver confirms them." },
      { title: "Nothing stays by default", text: "Unconfirmed entries lapse after 24 hours. Confirmed ones after 30 days." },
      { title: "Never “clean”", text: "A check answers none found, unconfirmed, or reported. It never says a number is safe." },
    ],
    map: [
      { t: "04:31", h: "4 provisional entries", r: "Lapse in 24 hours if not confirmed", k: "trig" },
      { t: "05:20", h: "Confirms the wallet", r: "Live for 30 days", k: "new" },
      { t: "07:10", h: "Reviews three numbers", r: "Confirms or drops each one", k: "new" },
      { t: "Next day", h: "Unconfirmed lapse", r: "Nothing stays by default", k: "end" },
    ],
  },
  {
    id: "otc",
    role: "OTC vendor or agent",
    pitch: "Check before you transact",
    icon: "search",
    persona: "OTC-0442",
    who: "Kojo Darko · OTC vendor, Kaneshie",
    trigger: {
      channel: "chat",
      time: "04:47",
      from: "New buyer",
      text: "Hi boss, I need ₵60,000 of USDT now. I'll send the cedis from 024 555 0187.",
    },
    steps: [
      {
        label: "Check the number",
        href: "/check",
        reset: "live",
        hint: "Type the buyer's number, +233 24 555 0187, and check it before you sell.",
      },
      {
        label: "Keep your receipt",
        href: "/receipts",
        hint: "Every check gives you a receipt. It proves you checked, and when.",
      },
      {
        label: "The alert arrives",
        href: "/alerts/GH-FA-0031",
        hint: "The urgent alert names a number you checked earlier. The look-back warning tells you so.",
      },
    ],
    showed: [
      { title: "Check before you transact", text: "One number at a time, never a list. The answer comes back in seconds." },
      { title: "Receipts protect honest traders", text: "A receipt shows you checked in good faith." },
      { title: "Look-back", text: "If something you checked is reported later, you're told." },
    ],
    map: [
      { t: "04:47", h: "Buyer wants USDT", r: "Pays from a mobile money number", k: "trig" },
      { t: "04:47", h: "Checks the number", r: "Answer: reported, unconfirmed" },
      { t: "04:48", h: "Declines, keeps receipt", r: "OC-2229183 shows he checked" },
      { t: "05:22", h: "Urgent alert arrives", r: "Look-back: you checked this at 04:47", k: "end" },
    ],
  },
  {
    id: "head",
    role: "Head or steering",
    pitch: "Act on escalations, review",
    icon: "chart",
    persona: "AGD-HEAD",
    who: "Ewurabena Quaye · Director, Attorney-General's Department",
    trigger: {
      channel: "email",
      time: "08:31",
      from: "One Report escalations",
      text: "Escalated to you: the Attorney-General's Department has not acknowledged a Level 1 task after 4 hours (case GH-PAY-2026-000229).",
    },
    steps: [
      {
        label: "Act on the escalation",
        href: "/escalations",
        reset: "live",
        clock: DRILL_START + 241 * M,
        hint: "Your department's task is twice past its target. Assign an officer to it.",
      },
      {
        label: "Review the clocks",
        href: "/steering",
        persona: "STEER-01",
        hint: "The steering group reviews these clocks across all authorities, and the register's accuracy.",
      },
    ],
    showed: [
      { title: "Escalation is automatic", text: "Reminder at the target, supervisor at 30 minutes past, heads and steering at twice the target." },
      { title: "Heads act, not just watch", text: "An escalated task lands in the head's inbox with one clear action." },
      { title: "Oversight with numbers only", text: "The steering view shows counts and times. No personal data." },
    ],
    map: [
      { t: "07:01", h: "Supervisor told", r: "AGD task 30 min past target", k: "trig" },
      { t: "08:31", h: "Email: escalated to you", r: "Twice the target, still waiting", k: "new" },
      { t: "08:35", h: "Assigns an officer", r: "From an “Escalated to you” inbox", k: "new" },
      { t: "Monthly", h: "Steering review", r: "Clocks by authority, register accuracy", k: "end" },
    ],
  },
];

export function journeyById(id: string | undefined | null) {
  return JOURNEYS.find((j) => j.id === id);
}
