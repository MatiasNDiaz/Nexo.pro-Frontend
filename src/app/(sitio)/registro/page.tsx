import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Skeleton } from "@/components/ui/feedback";
import { scenes } from "@/content/photos";
import { RegisterForm } from "@/features/session/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registrate gratis como cliente o creá tu perfil profesional con 30 días de prueba.",
  alternates: { canonical: "/registro" },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Creá tu cuenta"
      description="Es gratis para clientes. Si sos profesional, probalo 30 días."
      wide
      side={{
        photo: scenes.aberturas,
        heading: "Empezá hoy: tu cuenta es gratis.",
        points: ["Pedí presupuestos sin compromiso", "Chateá y coordiná en un solo lugar", "Profesionales: 30 días de prueba"],
      }}
    >
      {/* El formulario lee ?rol= de la URL: se resuelve en el navegador. */}
      <Suspense
        fallback={
          <div className="flex flex-col gap-5" aria-busy="true">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
