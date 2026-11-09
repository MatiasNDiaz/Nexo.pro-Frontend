"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ListboxOption {
  value: string;
  label: string;
}

interface ListboxProps {
  options: ListboxOption[];
  /** Controlado. Si no se pasa, el valor vive adentro (arranca en `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Con `name`, el valor viaja en un input oculto (formularios GET o con FormData). */
  name?: string;
  id?: string;
  disabled?: boolean;
  /**
   * - field: con borde, como los demás controles (va dentro de <Field>, que lo etiqueta por `id`).
   * - hero: la celda entera es el botón, con la etiqueta chica arriba (buscador del inicio).
   */
  variant?: "field" | "hero";
  /** Etiqueta visible dentro del botón (variante hero). */
  label?: ReactNode;
  icon?: ReactNode;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

/** Con más opciones que esto, la lista suma un buscador arriba. */
const SEARCH_FROM = 10;

/**
 * Desplegable propio con el patrón "combobox de solo selección" (WAI-ARIA APG): el botón tiene el
 * foco y anuncia la opción activa con aria-activedescendant. Teclado: flechas, Inicio/Fin, Enter o
 * Espacio para elegir, Esc para cerrar, Tab elige y sigue, y escribir salta a la opción que empieza
 * con esas letras. Con muchas opciones, el foco pasa a un buscador dentro de la lista.
 */
export function Listbox({
  options,
  value,
  defaultValue = "",
  onChange,
  name,
  id,
  disabled,
  variant = "field",
  label,
  icon,
  className,
  ...aria
}: ListboxProps) {
  const autoId = useId();
  const buttonId = id ?? `${autoId}-button`;
  const listId = `${autoId}-list`;
  const labelId = `${autoId}-label`;
  const optionId = (index: number) => `${autoId}-opt-${index}`;

  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const searchable = options.length > SEARCH_FROM;
  const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const visible = searchable && query ? options.filter((o) => normalize(o.label).includes(normalize(query))) : options;
  const selected = options.find((o) => o.value === current) ?? options[0];

  const openList = () => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === current)));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (option: ListboxOption | undefined, refocus = true) => {
    if (option) {
      if (value === undefined) setInner(option.value);
      if (option.value !== current) onChange?.(option.value);
    }
    close(refocus);
  };

  // Cierra al tocar afuera.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Con buscador, el foco va a él al abrir.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // La opción activa siempre a la vista.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (event: KeyboardEvent) => {
    const last = visible.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(last);
        return;
      case "Enter":
        event.preventDefault();
        choose(visible[active]);
        return;
      case " ":
        if (searchable) return; // En el buscador, el espacio se escribe.
        event.preventDefault();
        choose(visible[active]);
        return;
      case "Escape":
        event.preventDefault();
        close();
        return;
      case "Tab":
        choose(visible[active], false);
        return;
    }
    // Búsqueda por tipeo (sin buscador): salta a la primera opción que empieza con lo escrito.
    if (!searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + event.key, at: now };
      const match = visible.findIndex((o) => normalize(o.label).startsWith(normalize(typed.current.text)));
      if (match >= 0) setActive(match);
    }
  };

  const activeId = open && visible[active] ? optionId(active) : undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={searchable ? undefined : activeId}
        aria-labelledby={label ? `${labelId} ${buttonId}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "group/lb flex w-full cursor-pointer items-center gap-3 text-left outline-none disabled:cursor-not-allowed",
          variant === "field" &&
            "h-11 rounded-xl border border-line-strong bg-surface px-3.5 text-base text-ink shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-brand-400 focus-visible:border-electric-500 focus-visible:ring-4 focus-visible:ring-electric-500/20 disabled:bg-canvas disabled:text-muted aria-expanded:border-electric-500 aria-expanded:ring-4 aria-expanded:ring-electric-500/20 aria-invalid:border-danger-600",
          variant === "hero" &&
            "h-full min-h-16 rounded-xl px-4 py-2 transition-colors duration-150 hover:bg-canvas focus-visible:bg-canvas focus-visible:ring-2 focus-visible:ring-electric-500 aria-expanded:bg-canvas",
        )}
        {...aria}
      >
        {icon && <span className="shrink-0 text-brand-600">{icon}</span>}
        <span className="flex min-w-0 flex-1 flex-col">
          {label && (
            <span id={labelId} className="text-xs font-semibold text-muted-strong">
              {label}
            </span>
          )}
          <span className={cn("truncate", variant === "hero" && "text-base font-semibold text-ink")}>{selected?.label}</span>
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted transition-transform duration-200 ease-out-soft group-aria-expanded/lb:rotate-180"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+0.375rem)] left-0 z-40 w-full min-w-56 origin-top overflow-hidden rounded-2xl border border-line bg-surface shadow-raised",
            "animate-[pop-in_160ms_var(--ease-out-soft)]",
          )}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label="Buscar en la lista"
                placeholder="Buscar…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                className="h-11 w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
              />
            </div>
          )}
          <ul ref={listRef} id={listId} role="listbox" aria-labelledby={label ? labelId : buttonId} className="max-h-72 overflow-y-auto p-1.5">
            {visible.length === 0 && <li className="px-3 py-2.5 text-sm text-muted">Sin resultados</li>}
            {visible.map((option, index) => {
              const isSelected = option.value === current;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  // pointerdown: elige antes de que el botón pierda el foco.
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  onPointerMove={() => setActive(index)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-[0.95rem] text-ink transition-colors duration-100",
                    index === active && "bg-brand-50 text-brand-900",
                    isSelected && "font-semibold text-brand-700",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-brand-600" strokeWidth={2.5} aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
