"use client";

import { ImagePlus, Loader2, TriangleAlert, Video, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { ACCEPTED_TYPES, kindOf, uploadFile, type UploadKind, type UploadPurpose } from "@/lib/uploads";

interface Item {
  key: string;
  file: File;
  preview: string;
  kind: UploadKind;
  status: "uploading" | "ready" | "error";
  fileId?: string;
  error?: string;
}

/**
 * Fotos (y opcionalmente videos) que se suben apenas se eligen, en los tres pasos del backend
 * (lib/uploads.ts). Muestra la vista previa, el estado y permite quitarlas. Avisa a quien lo usa los
 * ids listos y si queda alguna subiendo (para no enviar el formulario a medias).
 */
export function MediaPicker({
  purpose,
  maxImages,
  maxVideos = 0,
  onChange,
  label = "Agregar fotos",
}: {
  purpose: UploadPurpose;
  maxImages: number;
  maxVideos?: number;
  onChange: (state: { fileIds: string[]; busy: boolean }) => void;
  label?: string;
}) {
  const inputId = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    onChangeRef.current({
      fileIds: items.filter((item) => item.status === "ready" && item.fileId).map((item) => item.fileId!),
      busy: items.some((item) => item.status === "uploading"),
    });
  }, [items]);

  // Libera las vistas previas al salir.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const count = (kind: UploadKind) => items.filter((item) => item.kind === kind).length;
  const accept = [...ACCEPTED_TYPES.IMAGE, ...(maxVideos > 0 ? ACCEPTED_TYPES.VIDEO : [])].join(",");
  const full = count("IMAGE") >= maxImages && count("VIDEO") >= maxVideos;

  const add = (files: FileList | null) => {
    setNotice(null);
    let images = count("IMAGE");
    let videos = count("VIDEO");
    for (const file of Array.from(files ?? [])) {
      const kind = kindOf(file);
      if (kind !== "IMAGE" && !(kind === "VIDEO" && maxVideos > 0)) {
        setNotice("Ese tipo de archivo no se puede subir acá.");
        continue;
      }
      if ((kind === "IMAGE" && images >= maxImages) || (kind === "VIDEO" && videos >= maxVideos)) {
        setNotice(maxVideos > 0 ? `Podés sumar hasta ${maxImages} fotos y ${maxVideos} video.` : `Podés sumar hasta ${maxImages} fotos.`);
        continue;
      }
      if (kind === "IMAGE") images += 1;
      else videos += 1;
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      setItems((list) => [...list, { key, file, preview, kind, status: "uploading" }]);
      uploadFile(file, purpose)
        .then((uploaded) => setItems((list) => list.map((item) => (item.key === key ? { ...item, status: "ready", fileId: uploaded.id } : item))))
        .catch((error: unknown) =>
          setItems((list) => list.map((item) => (item.key === key ? { ...item, status: "error", error: errorMessage(error) } : item))),
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-3">
        {items.map((item) => (
          <li key={item.key} className="relative size-24 overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-line animate-[pop-in_200ms_var(--ease-out-soft)]">
            {item.kind === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), no pasa por next/image
              <img src={item.preview} alt={`Vista previa de ${item.file.name}`} className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-brand-700">
                <Video className="size-7" aria-hidden="true" />
                <span className="sr-only">Video {item.file.name}</span>
              </span>
            )}
            {item.status !== "ready" && (
              <span
                className={cn(
                  "absolute inset-0 grid place-items-center",
                  item.status === "uploading" ? "bg-brand-950/45 text-white" : "bg-danger-600/80 text-white",
                )}
                title={item.error}
              >
                {item.status === "uploading" ? (
                  <Loader2 className="size-6 animate-spin" aria-label="Subiendo" />
                ) : (
                  <TriangleAlert className="size-6" aria-label={`No se pudo subir: ${item.error ?? ""}`} />
                )}
              </span>
            )}
            <button
              type="button"
              onClick={() => setItems((list) => list.filter((other) => other.key !== item.key))}
              className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-white/95 text-ink shadow-xs transition-transform hover:scale-110"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Quitar {item.file.name}</span>
            </button>
          </li>
        ))}
        {!full && (
          <li>
            <label
              htmlFor={inputId}
              className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line-strong text-center text-xs font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50 has-focus-visible:outline-2 has-focus-visible:outline-electric-500"
            >
              <ImagePlus className="size-6" aria-hidden="true" />
              {label}
              <input id={inputId} type="file" accept={accept} multiple className="sr-only" onChange={(event) => {
                add(event.target.files);
                event.target.value = "";
              }} />
            </label>
          </li>
        )}
      </ul>
      {items.some((item) => item.status === "error") && (
        <p className="text-sm text-danger-600">{items.find((item) => item.status === "error")?.error} Quitala y probá con otra.</p>
      )}
      {notice && <p className="text-sm text-amber-800">{notice}</p>}
    </div>
  );
}
