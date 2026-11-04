"use client";

import { Hammer } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";
import { AccountStatus, AccountSummary } from "./account-status";
import { useMe } from "./use-me";

/** Inicio del panel. Pedidos, chat y trabajos llegan en las etapas 5 y 6. */
export function PanelHome() {
  const user = useMe();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 animate-fade-up">
        <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">Hola, {user.firstName}</h1>
        <AccountSummary user={user} />
      </header>
      <div data-reveal>
        <AccountStatus user={user} />
      </div>
      <div data-reveal>
        <EmptyState
          icon={Hammer}
          title="Tus pedidos y conversaciones llegan pronto"
          description="Muy pronto vas a ver acá tus pedidos, conversaciones y trabajos."
        />
      </div>
    </div>
  );
}
