import { cn } from "@/lib/cn";

export type FeedbackTone =
  "success" | "error" | "warning" | "info" | "question";

const tones: Record<
  FeedbackTone,
  { ring: string; mark: string; fill: string }
> = {
  success: {
    ring: "text-success-600",
    mark: "text-success-600",
    fill: "bg-success-50",
  },
  error: {
    ring: "text-danger-600",
    mark: "text-danger-600",
    fill: "bg-danger-50",
  },
  warning: {
    ring: "text-amber-500",
    mark: "text-amber-800",
    fill: "bg-amber-50",
  },
  info: { ring: "text-brand-600", mark: "text-brand-700", fill: "bg-brand-50" },
  question: {
    ring: "text-electric-500",
    mark: "text-brand-700",
    fill: "bg-electric-50",
  },
};

/** Trazos de cada marca, en un cuadro de 48 × 48 (el círculo es común). */
function Mark({ tone }: { tone: FeedbackTone }) {
  const draw = "fx-draw fx-draw-late";
  switch (tone) {
    case "success":
      return (
        <path d="M15 25.5l6.5 6.5L34 18.5" pathLength={1} className={draw} />
      );
    case "error":
      return (
        <>
          <path d="M17 17l14 14" pathLength={1} className={draw} />
          <path
            d="M31 17L17 31"
            pathLength={1}
            className={cn(draw, "fx-draw-later")}
          />
        </>
      );
    case "warning":
      return (
        <>
          <path d="M24 14v12" pathLength={1} className={draw} />
          <path
            d="M24 33v.5"
            pathLength={1}
            className={cn(draw, "fx-draw-later")}
          />
        </>
      );
    case "info":
      return (
        <>
          <path d="M24 15v.5" pathLength={1} className={draw} />
          <path
            d="M24 22v12"
            pathLength={1}
            className={cn(draw, "fx-draw-later")}
          />
        </>
      );
    case "question":
      return (
        <>
          <path
            d="M18.5 19a5.5 5.5 0 1 1 7.6 5.1c-1.3.6-2.1 1.6-2.1 3V28"
            pathLength={1}
            className={draw}
          />
          <path
            d="M24 33v.5"
            pathLength={1}
            className={cn(draw, "fx-draw-later")}
          />
        </>
      );
  }
}

/**
 * Ícono animado de los avisos y las confirmaciones (estilo SweetAlert, con los colores del sitio): el
 * círculo se dibuja y después la marca. Con "menos movimiento" se ve directamente terminado
 * (globals.css: .fx-draw). Es decorativo: el texto del aviso dice lo mismo.
 */
export function FeedbackIcon({
  tone,
  size = "md",
  className,
}: {
  tone: FeedbackTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { ring, mark, fill } = tones[tone];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        fill,
        size === "sm" && "size-10",
        size === "md" && "size-14",
        size === "lg" && "size-20",
        tone === "warning" && "fx-pulse",
        className,
      )}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-full"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          pathLength={1}
          strokeWidth={2.5}
          stroke="currentColor"
          className={cn(
            "fx-draw origin-center -rotate-90 [transform-box:fill-box]",
            ring,
          )}
        />
        <g strokeWidth={3.5} stroke="currentColor" className={mark}>
          <Mark tone={tone} />
        </g>
      </svg>
    </span>
  );
}
