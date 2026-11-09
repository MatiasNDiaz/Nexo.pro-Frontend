import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, Card } from "@/components/ui/card";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { DialogDemo } from "./dialog-demo";

export const metadata: Metadata = { title: "Sistema de diseño", robots: { index: false, follow: false } };

const swatches: { name: string; token: string; className: string; dark?: boolean }[] = [
  { name: "Azul profesional", token: "brand-700 · #123B7A", className: "bg-brand-700", dark: true },
  { name: "Azul noche", token: "brand-900 · #0B1F3A", className: "bg-brand-900", dark: true },
  { name: "Azul eléctrico", token: "electric-500 · #3B82F6", className: "bg-electric-500", dark: true },
  { name: "Ámbar", token: "amber-400 · #F4A340", className: "bg-amber-400" },
  { name: "Blanco azulado", token: "canvas · #F5F8FC", className: "bg-canvas" },
  { name: "Blanco", token: "surface · #FFFFFF", className: "bg-surface" },
  { name: "Texto principal", token: "ink · #10213D", className: "bg-ink", dark: true },
  { name: "Texto secundario", token: "muted · #64748B", className: "bg-muted", dark: true },
  { name: "Bordes", token: "line · #DCE5F2", className: "bg-line" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section data-reveal className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold text-brand-900">{title}</h2>
      {children}
    </section>
  );
}

/** Muestrario interno del sistema de diseño. Solo existe en desarrollo. */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <PageHeader eyebrow="Interno" title="Sistema de diseño" description="Tokens y componentes base de Repara Ya." />
      <div className="container-page flex flex-col gap-14 py-12">
        <Section title="Colores">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {swatches.map((swatch) => (
              <li key={swatch.token} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className={`h-20 ${swatch.className}`} />
                <div className="p-3">
                  <p className="text-sm font-semibold text-ink">{swatch.name}</p>
                  <p className="text-xs text-muted">{swatch.token}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tipografía">
          <div className="flex flex-col gap-3">
            <p className="font-display text-5xl font-bold text-brand-900">Títulos en Archivo semicondensada</p>
            <p className="text-2xl font-semibold text-brand-900">Subtítulo de sección</p>
            <p className="max-w-2xl text-lg leading-relaxed text-ink">
              Texto de lectura en Inter. Pensado para leerse cómodo en el celular: 16 a 18 px, interlineado amplio y
              líneas que no superan los 70 caracteres.
            </p>
            <p className="text-sm text-muted-strong">Texto secundario sobre el fondo de la página.</p>
          </div>
        </Section>

        <Section title="Botones">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primario</Button>
            <Button variant="accent">Llamado a la acción</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button variant="danger">Eliminar</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Chico</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg">Grande</Button>
          </div>
          <div className="flex flex-wrap gap-3 rounded-2xl bg-brand-900 p-5">
            <Button variant="inverse">Sobre azul noche</Button>
            <Button variant="accent">Llamado a la acción</Button>
          </div>
        </Section>

        <Section title="Formularios">
          <Card className="grid gap-5 p-6 sm:grid-cols-2">
            <Field id="demo-nombre" label="Nombre" required hint="Como figura en tu documento.">
              {(a11y) => <Input {...a11y} autoComplete="given-name" placeholder="Ej.: Ana" />}
            </Field>
            <Field id="demo-email" label="Email" required error="Ingresá un email válido.">
              {(a11y) => <Input {...a11y} type="email" defaultValue="ana@" />}
            </Field>
            <Field id="demo-oficio" label="Oficio">
              {(a11y) => (
                <Select {...a11y} defaultValue="">
                  <option value="" disabled>
                    Elegí un oficio
                  </option>
                  <option>Electricidad</option>
                  <option>Plomería</option>
                </Select>
              )}
            </Field>
            <Field id="demo-deshabilitado" label="Deshabilitado">
              {(a11y) => <Input {...a11y} disabled value="No editable" readOnly />}
            </Field>
            <Field id="demo-detalle" label="Detalle" className="sm:col-span-2">
              {(a11y) => <Textarea {...a11y} placeholder="Contanos qué necesitás" />}
            </Field>
            <Checkbox label="Acepto los términos y condiciones" className="sm:col-span-2" />
          </Card>
        </Section>

        <Section title="Mensajes y estados">
          <div className="grid gap-3 lg:grid-cols-2">
            <Alert tone="info" title="Información">Tu identidad está en revisión.</Alert>
            <Alert tone="success" title="Listo">Guardamos los cambios.</Alert>
            <Alert tone="warning" title="Atención">Tu prueba vence en 3 días.</Alert>
            <Alert tone="danger" title="No se pudo guardar">Revisá los campos marcados.</Alert>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand">Marca</Badge>
            <Badge tone="electric">Disponible</Badge>
            <Badge tone="amber">Premium</Badge>
            <Badge tone="success">Aprobado</Badge>
            <Badge tone="danger">Rechazado</Badge>
          </div>
        </Section>

        <Section title="Tarjetas, carga y vacío">
          <div className="grid gap-5 md:grid-cols-3">
            <Card interactive className="flex items-center gap-4 p-5">
              <Avatar name="Ana Pérez" size="lg" />
              <div>
                <p className="font-semibold text-ink">Tarjeta interactiva</p>
                <p className="text-sm text-muted">Se eleva al pasar el mouse.</p>
              </div>
            </Card>
            <Card className="flex flex-col gap-3 p-5" aria-busy="true">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </Card>
            <EmptyState icon={Inbox} title="Sin pedidos todavía" description="Cuando llegue uno, lo vas a ver acá." />
          </div>
        </Section>

        <Section title="Modales">
          <DialogDemo />
        </Section>
      </div>
    </>
  );
}
