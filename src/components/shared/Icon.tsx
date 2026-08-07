import {
  Target,
  Cloudy,
  ShieldCheck,
  Award,
  RefreshCw,
  Clock9,
  HeartPulse,
  GitBranch,
  Search,
  Check,
  X,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ExternalLink,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const REGISTRY: Record<string, ComponentType<LucideProps>> = {
  target: Target,
  cloudy: Cloudy,
  "shield-check": ShieldCheck,
  award: Award,
  "refresh-cw": RefreshCw,
  "clock-9": Clock9,
  "heart-pulse": HeartPulse,
  "git-branch": GitBranch,
  search: Search,
  check: Check,
  x: X,
  "arrow-right": ArrowRight,
  plus: Plus,
  pencil: Pencil,
  "trash-2": Trash2,
  grip: GripVertical,
  "external-link": ExternalLink,
};

/** Renders a Lucide icon by its kebab-case name (mirrors the design's icon set). */
export default function Icon({
  name,
  size = 18,
  color,
  strokeWidth = 1.9,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const Cmp = REGISTRY[name] ?? Target;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} aria-hidden />;
}
