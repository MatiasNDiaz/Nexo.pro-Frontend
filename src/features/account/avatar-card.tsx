"use client";

import { Camera, Clock, Upload } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { useSessionActions } from "@/features/session/session-provider";
import { errorMessage } from "@/lib/api/errors";
import { ACCEPTED_TYPES, uploadFile } from "@/lib/uploads";
import { setAvatar } from "./api";
import { SettingsSection } from "./settings-section";
import { useMe } from "./use-me";

/** Peso máximo de la foto de perfil (file-policies.ts: AVATAR 5 MB). El backend lo vuelve a controlar. */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; underReview: boolean } | { kind: "error"; message: string };

/**
 * Foto de perfil: elegir, ver cómo queda y guardar. Se sube en tres pasos (lib/uploads.ts) y se
 * asigna con `PUT /users/me/avatar`. Con la identidad aprobada, la foto nueva queda en revisión y en
 * público se sigue viendo la anterior (ADR 0019).
 */
export function AvatarCard() {
  const me = useMe();
  const { refreshSession } = useSessionActions();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Vista previa: URL local del navegador para el archivo elegido; se libera al cambiarlo o salir.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = (selected: File | undefined) => {
    setStatus({ kind: "idle" });
    if (!selected) return;
    if (!ACCEPTED_TYPES.IMAGE.includes(selected.type)) {
      setStatus({ kind: "error", message: "Elegí una imagen JPG, PNG o WebP." });
      return;
    }
    if (selected.size > MAX_AVATAR_BYTES) {
      setStatus({ kind: "error", message: "La foto puede pesar hasta 5 MB." });
      return;
    }
    setFile(selected);
  };

  const save = async () => {
    if (!file) return;
    setStatus({ kind: "saving" });
    try {
      const uploaded = await uploadFile(file, "AVATAR");
      const result = await setAvatar(uploaded.id);
      await refreshSession();
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setStatus({ kind: "saved", underReview: result.underReview });
    } catch (error) {
      setStatus({ kind: "error", message: errorMessage(error) });
    }
  };

  const shown = preview ?? me.avatarUrl;

  return (
    <SettingsSection
      id="foto"
      title="Foto de perfil"
      description="Una foto donde se vea bien tu cara. Es obligatoria para verificar tu identidad."
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-3xl bg-brand-50 text-brand-300 ring-1 ring-line">
          {preview ? (
            // Vista previa local (blob:): next/image no aplica.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa de la foto nueva" className="size-full object-cover" />
          ) : shown ? (
            <RemoteImage src={shown} alt="Tu foto de perfil" fill sizes="112px" className="object-cover" />
          ) : (
            <Camera className="size-10" aria-hidden="true" />
          )}
        </span>
        <div className="flex flex-col gap-3">
          {me.pendingAvatarUrl && !preview && (
            <p className="flex items-center gap-1.5 text-sm text-amber-800">
              <Clock className="size-4" aria-hidden="true" />
              Tenés una foto nueva en revisión. Mientras tanto se ve la anterior.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={ACCEPTED_TYPES.IMAGE.join(",")}
              className="peer sr-only"
              onChange={(event) => choose(event.target.files?.[0])}
            />
            {/* El campo real está oculto: el foco del teclado se muestra en la etiqueta. */}
            <label
              htmlFor={inputId}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-5 text-[0.9375rem] font-semibold text-brand-800 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric-500"
            >
              <Upload className="size-4" aria-hidden="true" />
              {me.avatarUrl || me.pendingAvatarUrl ? "Cambiar foto" : "Elegir foto"}
            </label>
            {file && (
              <Button onClick={save} loading={status.kind === "saving"}>
                Guardar foto
              </Button>
            )}
          </div>
          <p className="text-xs text-muted">JPG, PNG o WebP, hasta 5 MB.</p>
        </div>
      </div>
      {status.kind === "error" && <Alert tone="danger">{status.message}</Alert>}
      {status.kind === "saved" && (
        <Alert tone="success" title={status.underReview ? "Foto enviada a revisión" : "Foto guardada"}>
          {status.underReview
            ? "Como tu identidad ya está aprobada, nuestro equipo revisa la foto nueva. Mientras tanto se ve la anterior."
            : "Ya es tu foto de perfil."}
        </Alert>
      )}
    </SettingsSection>
  );
}
