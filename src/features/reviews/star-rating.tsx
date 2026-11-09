"use client";

import { Star } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

const labels = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

/**
 * Calificación de 1 a 5 como grupo de radios (teclado: flechas; lector de pantalla: "4 de 5,
 * Bueno"). Al pasar el mouse se previsualiza; la elegida rebota apenas.
 */
export function StarRatingInput({
  value,
  onChange,
  invalid = false,
  describedBy,
}: {
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const name = useId();
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Calificación"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="flex items-center gap-1"
        onPointerLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer has-focus-visible:rounded-md has-focus-visible:outline-2 has-focus-visible:outline-electric-500" onPointerEnter={() => setHover(n)}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
            <Star
              key={value === n ? "elegida" : "no"}
              className={cn(
                "size-9 transition-[color,fill,transform] duration-150 ease-out-soft hover:scale-110",
                n <= shown ? "fill-amber-400 text-amber-500" : "fill-transparent text-line-strong",
                value === n && "motion-safe:animate-[heart-pop_380ms_var(--ease-out-soft)]",
              )}
              aria-hidden="true"
            />
            <span className="sr-only">
              {n} de 5, {labels[n]}
            </span>
          </label>
        ))}
      </div>
      <span className="min-w-20 text-sm font-semibold text-brand-800" aria-hidden="true">
        {labels[shown]}
      </span>
    </div>
  );
}

/** Estrellas de solo lectura. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value} de 5`} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-4", n <= value ? "fill-amber-400 text-amber-500" : "fill-transparent text-line-strong")} aria-hidden="true" />
      ))}
    </span>
  );
}
