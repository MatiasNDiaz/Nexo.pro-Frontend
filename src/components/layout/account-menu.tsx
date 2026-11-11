"use client";

import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/components/ui/card";
import type { Me } from "@/features/session/api";
import { useSignOut } from "@/features/session/sign-out";
import { cn } from "@/lib/cn";

const itemClass =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[0.9375rem] font-medium text-ink transition-colors hover:bg-brand-50 focus-visible:bg-brand-50";

/**
 * Menú de la cuenta en escritorio: botón que despliega un panel (patrón disclosure). Se cierra con
 * Esc, tocando afuera o al elegir una opción, y devuelve el foco al botón.
 */
export function AccountMenu({ user }: { user: Me }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const signOut = useSignOut();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-xl py-1 pr-2.5 pl-1 text-[0.9375rem] font-medium text-brand-900 transition-colors hover:bg-brand-50"
      >
        <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
        <span className="max-w-32 truncate">{user.firstName}</span>
        <ChevronDown className={cn("size-4 text-muted transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right animate-fade-in rounded-2xl border border-line bg-surface p-2 shadow-raised"
      >
        <div className="border-b border-line px-3 pt-1 pb-3">
          <p className="truncate font-semibold text-ink">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
        <ul className="flex flex-col gap-0.5 pt-2">
          <li>
            <Link href="/panel" className={itemClass} onClick={() => setOpen(false)}>
              <LayoutDashboard className="size-4 text-brand-600" aria-hidden="true" />
              Mi panel
            </Link>
          </li>
          <li>
            <button
              type="button"
              className={itemClass}
              onClick={() => {
                setOpen(false);
                signOut.ask();
              }}
            >
              <LogOut className="size-4 text-brand-600" aria-hidden="true" />
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
      {signOut.dialog}
    </div>
  );
}
