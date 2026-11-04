"use client";

import { Hammer } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";
import { RequireSession } from "@/features/session/require-session";
import { AccountStatus, AccountSummary } from "./account-status";

/** Inicio del panel. Las secciones de cada rol llegan en las etapas 4 a 6. */
export function PanelHome() {
  return (
    <RequireSession>
      {(user) => (
        <div className="container-page flex flex-col gap-8 py-10 sm:py-14">
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
              title="Tu panel está en construcción"
              description="Pronto vas a ver acá tus pedidos, conversaciones, trabajos y la configuración de tu cuenta."
            />
          </div>
        </div>
      )}
    </RequireSession>
  );
}
