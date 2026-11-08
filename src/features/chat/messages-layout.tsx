"use client";

import { MessagesSquare } from "lucide-react";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Inbox } from "./inbox";

/**
 * Mensajes: en pantallas anchas, la lista y la conversación lado a lado; en el celular, una por vez
 * (la lista, o la conversación abierta con su botón para volver).
 */
export function MessagesLayout({ children }: { children: ReactNode }) {
  const activeId = useSelectedLayoutSegment();
  const open = activeId !== null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className={cn("text-3xl font-bold text-brand-900 animate-fade-up", open && "sr-only lg:not-sr-only")}>Mensajes</h1>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className={cn("min-w-0", open && "hidden lg:block")}>
          <Inbox activeId={activeId} />
        </div>
        <section
          aria-label="Conversación"
          className={cn(
            "flex h-[calc(100dvh-11rem)] min-h-[26rem] min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-canvas shadow-card lg:h-[calc(100dvh-13rem)]",
            !open && "hidden lg:flex",
          )}
        >
          {children}
        </section>
      </div>
    </div>
  );
}

/** Lo que se ve a la derecha cuando no hay una conversación elegida (solo pantallas anchas). */
export function NoConversationSelected() {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <MessagesSquare className="size-6" aria-hidden="true" />
        </span>
        <p>Elegí una conversación para leerla.</p>
      </div>
    </div>
  );
}
