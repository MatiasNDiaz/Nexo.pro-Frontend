import { Badge } from "@/components/ui/feedback";
import { attentionLabel } from "@/features/catalog/labels";
import type { AttentionStatus } from "@/features/catalog/types";
import { cn } from "@/lib/cn";

const tones = { AVAILABLE: "success", WORKING: "amber", RESTING: "neutral" } as const;
const dots = { AVAILABLE: "bg-success-600", WORKING: "bg-amber-500", RESTING: "bg-line-strong" } as const;

/** Estado de atención que el backend calcula para "ahora" (manual u horario automático). */
export function AttentionBadge({ status, className }: { status: AttentionStatus; className?: string }) {
  return (
    <Badge tone={tones[status]} className={className}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", dots[status], status === "AVAILABLE" && "animate-pulse")} />
      {attentionLabel[status]}
    </Badge>
  );
}
