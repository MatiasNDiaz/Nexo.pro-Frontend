import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Skeleton } from "@/components/ui/feedback";
import { LoginForm } from "@/features/session/login-form";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Entrá a tu cuenta de Repara Ya.",
  alternates: { canonical: "/ingresar" },
};

export default function LoginPage() {
  return (
    <AuthShell title="Ingresá a tu cuenta" description="Seguí tus pedidos, conversaciones y trabajos.">
      {/* El formulario lee ?siguiente= de la URL: se resuelve en el navegador. */}
      <Suspense fallback={<FormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-13 w-full" />
    </div>
  );
}
