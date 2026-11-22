export function hhmm(t: number) {
  const d = new Date(t);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function dayTime(t: number) {
  const d = new Date(t);
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return `${day}, ${hhmm(t)} GMT`;
}

export function duration(min: number) {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function cedi(n: number) {
  if (n >= 1_000_000) return `₵${(n / 1_000_000).toFixed(2).replace(/0$/, "").replace(/\.$/, "")}m`;
  if (n >= 10_000) return `₵${Math.round(n / 1000)}k`;
  return `₵${n.toLocaleString("en-GB")}`;
}

export function money(n: number, currency: string) {
  if (currency === "GHS") return `₵${n.toLocaleString("en-GB")}`;
  return `${n.toLocaleString("en-GB")} ${currency.split(" ")[0]}`;
}

export function formatIdentifier(v: string) {
  const m = /^\+233(\d{2})(\d{3})(\d{4})$/.exec(v);
  if (m) return `+233 ${m[1]} ${m[2]} ${m[3]}`;
  return v;
}

export function shortId(v: string) {
  if (v.startsWith("+")) return formatIdentifier(v);
  if (v.length > 16) return `${v.slice(0, 6)}…${v.slice(-7)}`;
  return v;
}

export function initials(name: string) {
  return name
    .replace(/^(Insp\.|Dr\.?|Mr\.?|Mrs\.?)\s+/, "")
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
