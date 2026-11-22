import { ChartColumn, CircleCheck, EyeOff, FileText, Search, ShieldCheck } from "lucide-react";
import type { JourneyIcon as K } from "@/lib/journeys";

const MAP = { file: FileText, shield: ShieldCheck, eyeoff: EyeOff, check: CircleCheck, search: Search, chart: ChartColumn };

export default function JourneyIcon({ k, size = 18 }: { k: K; size?: number }) {
  const I = MAP[k];
  return <I size={size} />;
}
