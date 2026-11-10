"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, FileBadge, Film, Pencil, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { SettingsSection } from "@/features/account/settings-section";
import { BIO_MAX, BUSINESS_NAME_MAX, YEARS_MAX, type ProfessionalMe } from "@/features/pro-profile/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";
import { ActionDialog } from "./action-dialog";
import { Notice } from "./admin-ui";
import { getProProfile, HIDE_MAX, hideContent, moderationKeys, NOTE_MIN, restoreContent, updateProProfile } from "./moderation-api";

type Item = { kind: "professionals/media" | "professionals/certifications"; id: string; label: string; hidden: boolean };
type Dialog = { type: "hide" | "restore"; item: Item } | { type: "edit" } | null;

const purposeLabel: Record<ProfessionalMe["media"][number]["purpose"], string> = {
  PRESENTATION: "Presentación",
  WORK: "Trabajo",
  CATALOG_VIDEO: "Video del catálogo",
  PROFILE_VIDEO: "Video de presentación",
  BANNER: "Portada",
};

/**
 * Contenido del perfil de un profesional en su ficha (E-020 a E-024): sus datos, fotos, videos y
 * certificados con su estado. El admin oculta o restaura cada uno y edita los datos, con motivo.
 * Lo trae GET /admin/professionals/:userId/profile (lo mismo que ve el profesional en su panel).
 */
export function ProContent({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: moderationKeys.proProfile(userId), queryFn: () => getProProfile(userId), retry: (count, error) => !isApiError(error) && count < 2 });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const done = (message: string) => {
    setDialog(null);
    setNotice(message);
    void queryClient.invalidateQueries({ queryKey: moderationKeys.proProfile(userId) });
  };

  return (
    <SettingsSection title="Contenido del perfil" description="Lo que muestra en su página. Lo que ocultás deja de verse y el profesional ve el motivo.">
      {profile.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : profile.isError ? (
        isApiError(profile.error, "PROFILE_NOT_FOUND") ? (
          <p className="text-sm text-muted-strong">No tiene un perfil profesional activo.</p>
        ) : (
          <Alert tone="danger">{errorMessage(profile.error)}</Alert>
        )
      ) : (
        <>
          <Notice message={notice} />
          <div className="flex flex-col gap-2 rounded-2xl bg-canvas p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <dl className="grid flex-1 gap-1 text-sm">
                <div className="flex flex-wrap gap-1">
                  <dt className="text-muted-strong">Nombre comercial:</dt>
                  <dd className="text-ink">{profile.data.businessName ?? "—"}</dd>
                </div>
                <div className="flex flex-wrap gap-1">
                  <dt className="text-muted-strong">Experiencia:</dt>
                  <dd className="text-ink">{profile.data.yearsExperience !== null ? `${profile.data.yearsExperience} años` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-strong">Descripción:</dt>
                  <dd className="whitespace-pre-line break-words text-ink">{profile.data.bio ?? "Sin descripción."}</dd>
                </div>
              </dl>
              <Button size="sm" variant="secondary" onClick={() => setDialog({ type: "edit" })}>
                <Pencil className="size-4" aria-hidden="true" />
                Editar
              </Button>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-muted-strong">Fotos y videos ({profile.data.media.length})</h3>
          {profile.data.media.length === 0 ? (
            <p className="text-sm text-muted-strong">No subió fotos ni videos.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {profile.data.media.map((media) => {
                const hidden = media.status === "HIDDEN_BY_ADMIN";
                const url = mediaUrl(media.url);
                const item: Item = { kind: "professionals/media", id: media.id, label: `${purposeLabel[media.purpose].toLowerCase()} (${media.kind === "VIDEO" ? "video" : "foto"})`, hidden };
                return (
                  <li key={media.id} className="flex flex-col gap-2">
                    <span className={cn("relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-canvas", hidden && "opacity-60")}>
                      {url && media.kind === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- vista de moderación, archivos de la API
                        <img src={url} alt={`${purposeLabel[media.purpose]} ${media.position + 1}`} className="size-full object-cover" />
                      ) : (
                        <Film className="size-8 text-muted" aria-label="Video" />
                      )}
                    </span>
                    <span className="flex flex-wrap gap-1">
                      <Badge>{purposeLabel[media.purpose]}</Badge>
                      {hidden && <Badge tone="danger">Oculta</Badge>}
                      {media.status === "HIDDEN_BY_PLAN" && <Badge tone="amber">Fuera del plan</Badge>}
                    </span>
                    {media.hiddenReason && <span className="text-xs text-muted-strong">{media.hiddenReason}</span>}
                    {media.status !== "HIDDEN_BY_PLAN" && <ToggleButton item={item} onClick={() => setDialog({ type: hidden ? "restore" : "hide", item })} />}
                  </li>
                );
              })}
            </ul>
          )}

          <h3 className="text-sm font-semibold text-muted-strong">Certificados ({profile.data.certifications.length})</h3>
          {profile.data.certifications.length === 0 ? (
            <p className="text-sm text-muted-strong">No cargó certificados.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {profile.data.certifications.map((cert) => {
                const hidden = cert.status === "HIDDEN_BY_ADMIN";
                const url = mediaUrl(cert.url);
                const item: Item = { kind: "professionals/certifications", id: cert.id, label: `el certificado «${cert.title}»`, hidden };
                return (
                  <li key={cert.id} className="flex flex-wrap items-center gap-3 py-3">
                    <FileBadge className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium text-ink">
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {cert.title}
                          </a>
                        ) : (
                          cert.title
                        )}
                      </span>
                      <span className="text-sm text-muted-strong">{[cert.institution, cert.issuedYear].filter(Boolean).join(" · ") || "Sin datos de emisión"}</span>
                      {cert.hiddenReason && <span className="text-xs text-danger-600">Oculto: {cert.hiddenReason}</span>}
                    </span>
                    <ToggleButton item={item} onClick={() => setDialog({ type: hidden ? "restore" : "hide", item })} />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      {dialog?.type === "edit" && profile.data && <EditProDialog userId={userId} profile={profile.data} onClose={() => setDialog(null)} onDone={done} />}
      {dialog && dialog.type !== "edit" && (
        <ActionDialog
          tone={dialog.type === "hide" ? "danger" : "primary"}
          title={dialog.type === "hide" ? `Ocultar ${dialog.item.label}` : `Volver a mostrar ${dialog.item.label}`}
          description={dialog.type === "hide" ? "Deja de verse en su página. El profesional ve el motivo en su panel." : "Vuelve a verse en su página."}
          confirmLabel={dialog.type === "hide" ? "Ocultar" : "Volver a mostrar"}
          reasonLabel={dialog.type === "hide" ? "Motivo (lo ve el profesional)" : "Motivo"}
          minReason={NOTE_MIN}
          maxReason={HIDE_MAX}
          run={(reason) => (dialog.type === "hide" ? hideContent(dialog.item.kind, dialog.item.id, reason) : restoreContent(dialog.item.kind, dialog.item.id, reason))}
          done={dialog.type === "hide" ? "Lo ocultaste." : "Se ve otra vez."}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      )}
    </SettingsSection>
  );
}

function ToggleButton({ item, onClick }: { item: Item; onClick: () => void }) {
  return (
    <Button size="sm" variant={item.hidden ? "secondary" : "ghost"} onClick={onClick} className={cn("self-start", !item.hidden && "text-danger-600 hover:bg-danger-50")}>
      {item.hidden ? <RotateCcw className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
      {item.hidden ? "Mostrar" : "Ocultar"}
      <span className="sr-only"> {item.label}</span>
    </Button>
  );
}

/** Datos del perfil (ADR 0021): se aplican directo, con motivo. Solo se manda lo que cambió. */
function EditProDialog({ userId, profile, onClose, onDone }: { userId: string; profile: ProfessionalMe; onClose: () => void; onDone: (message: string) => void }) {
  const id = useId();
  const [businessName, setBusinessName] = useState(profile.businessName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [years, setYears] = useState(profile.yearsExperience !== null ? String(profile.yearsExperience) : "");
  const changes = () => {
    const next: { bio?: string | null; businessName?: string | null; yearsExperience?: number | null } = {};
    const name = businessName.trim();
    if ((name || null) !== profile.businessName) next.businessName = name || null;
    const text = bio.trim();
    if ((text || null) !== profile.bio) next.bio = text || null;
    const value = years.trim() === "" ? null : Number(years);
    if (value !== profile.yearsExperience) next.yearsExperience = value;
    return next;
  };
  return (
    <ActionDialog
      title="Editar el perfil profesional"
      description="Se aplica directo, sin revisión, y queda en la auditoría."
      confirmLabel="Guardar"
      validate={() => {
        const next = changes();
        if (businessName.trim() && businessName.trim().length < 2) return "El nombre comercial tiene que tener al menos 2 letras.";
        if (next.yearsExperience !== undefined && next.yearsExperience !== null && (!Number.isInteger(next.yearsExperience) || next.yearsExperience < 0 || next.yearsExperience > YEARS_MAX)) {
          return `Los años de experiencia van de 0 a ${YEARS_MAX}.`;
        }
        return Object.keys(next).length ? null : "No cambiaste ningún dato.";
      }}
      run={(reason) => updateProProfile(userId, { ...changes(), reason })}
      done="Guardaste los datos del perfil."
      onClose={onClose}
      onDone={onDone}
    >
      <Field id={`${id}-nombre`} label="Nombre comercial (opcional)" hint={`${businessName.length}/${BUSINESS_NAME_MAX}`}>
        {(a11y) => <Input {...a11y} value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={BUSINESS_NAME_MAX} />}
      </Field>
      <Field id={`${id}-anios`} label="Años de experiencia (opcional)">
        {(a11y) => <Input {...a11y} type="number" inputMode="numeric" min={0} max={YEARS_MAX} value={years} onChange={(e) => setYears(e.target.value)} />}
      </Field>
      <Field id={`${id}-bio`} label="Descripción (opcional)" hint={`${bio.length}/${BIO_MAX}`}>
        {(a11y) => <Textarea {...a11y} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={BIO_MAX} rows={3} />}
      </Field>
    </ActionDialog>
  );
}
