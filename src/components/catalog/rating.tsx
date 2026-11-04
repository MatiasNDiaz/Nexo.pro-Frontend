import { Star } from "lucide-react";
import { formatRating, plural } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Estrellas de 1 a 5. El lector de pantalla oye "4,5 de 5 (12 reseñas)", no cinco íconos. */
export function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? "size-4" : "size-5";
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className={cn("relative", iconSize)}>
            <Star className={cn("absolute inset-0 text-line", iconSize)} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("text-amber-400", iconSize)} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingSummary({
  average,
  count,
  size = "sm",
  className,
}: {
  average: number | null;
  count: number;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!average || count === 0) {
    return <span className={cn("text-sm text-muted", className)}>Sin reseñas todavía</span>;
  }
  return (
    <span
      role="img"
      aria-label={`${formatRating(average)} de 5 (${plural(count, "reseña")})`}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <Stars value={average} size={size} />
      <span className={cn("font-semibold text-ink", size === "sm" ? "text-sm" : "text-base")}>{formatRating(average)}</span>
      <span className={cn("text-muted", size === "sm" ? "text-sm" : "text-base")}>({count})</span>
    </span>
  );
}
