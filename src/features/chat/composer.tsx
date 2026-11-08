"use client";

import { Paperclip, SendHorizontal, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { ACCEPTED_TYPES, kindOf } from "@/lib/uploads";
import { cn } from "@/lib/cn";
import { MAX_ATTACHMENTS, MESSAGE_MAX_LENGTH, type Message } from "./api";

/** Tipos que admite el chat: fotos y videos (AttachmentDto). */
const CHAT_TYPES = [...ACCEPTED_TYPES.IMAGE, ...ACCEPTED_TYPES.VIDEO];

export interface ComposerSubmit {
  body: string;
  files: File[];
}

interface ComposerProps {
  /** Mensaje que se está editando (solo texto); null para uno nuevo. */
  editing: Message | null;
  onCancelEdit: () => void;
  onSubmit: (input: ComposerSubmit) => Promise<void>;
  sending: boolean;
  error: string | null;
}

/**
 * Escribir un mensaje: texto (hasta 2000 caracteres) y hasta 5 fotos o videos. Enter envía y
 * Shift+Enter hace un salto de línea. Editando, solo se cambia el texto. Quien lo usa le pone
 * `key` con el mensaje en edición: así el campo arranca con ese texto.
 */
export function Composer({ editing, onCancelEdit, onSubmit, sending, error }: ComposerProps) {
  const fileInputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(editing?.body ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Al empezar a editar, el foco va al campo.
  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const trimmed = text.trim();
  const canSend = !sending && (editing ? trimmed.length > 0 && trimmed !== editing.body : trimmed.length > 0 || files.length > 0);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    try {
      await onSubmit({ body: trimmed, files });
      setText("");
      setFiles([]);
      setFileError(null);
      textareaRef.current?.focus();
    } catch {
      // El error lo muestra quien envía (prop `error`); el texto queda para reintentar.
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
    if (event.key === "Escape" && editing) onCancelEdit();
  };

  const addFiles = (list: FileList | null) => {
    setFileError(null);
    const picked = [...(list ?? [])];
    if (fileInput.current) fileInput.current.value = "";
    const invalid = picked.find((file) => !CHAT_TYPES.includes(file.type) || !kindOf(file));
    if (invalid) {
      setFileError(`"${invalid.name}" no es una foto o un video admitido (JPG, PNG, WebP, MP4 o MOV).`);
      return;
    }
    const next = [...files, ...picked];
    if (next.length > MAX_ATTACHMENTS) {
      setFileError(`Podés adjuntar hasta ${MAX_ATTACHMENTS} archivos por mensaje.`);
      return;
    }
    setFiles(next);
  };

  const remaining = MESSAGE_MAX_LENGTH - text.length;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-line bg-surface p-3 sm:p-4">
      {(error || fileError) && <Alert tone="danger">{fileError ?? error}</Alert>}
      {editing && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">
          <span>Editando tu mensaje (podés hacerlo durante 15 minutos).</span>
          <Button variant="ghost" size="sm" onClick={onCancelEdit}>
            Cancelar
          </Button>
        </div>
      )}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Archivos para enviar">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex max-w-full items-center gap-1 rounded-full bg-brand-50 py-1 pr-1 pl-3 text-sm text-brand-900">
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                className="grid size-7 shrink-0 place-items-center rounded-full hover:bg-brand-100"
              >
                <X className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Quitar {file.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-2">
        {!editing && (
          <>
            <input
              ref={fileInput}
              id={fileInputId}
              type="file"
              multiple
              accept={CHAT_TYPES.join(",")}
              className="peer sr-only"
              onChange={(event) => addFiles(event.target.files)}
              disabled={sending}
            />
            <label
              htmlFor={fileInputId}
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-brand-700 transition-colors hover:bg-brand-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric-500 peer-disabled:opacity-55"
            >
              <Paperclip className="size-5" aria-hidden="true" />
              <span className="sr-only">Adjuntar fotos o videos</span>
            </label>
          </>
        )}
        <label htmlFor={`${fileInputId}-texto`} className="sr-only">
          {editing ? "Editar mensaje" : "Escribí un mensaje"}
        </label>
        <textarea
          ref={textareaRef}
          id={`${fileInputId}-texto`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={1}
          placeholder="Escribí un mensaje"
          aria-describedby={remaining < 200 ? `${fileInputId}-restantes` : undefined}
          className={cn(
            "max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-base leading-snug text-ink shadow-xs [field-sizing:content]",
            "placeholder:text-muted focus:border-electric-500 focus:ring-4 focus:ring-electric-500/20 focus:outline-none",
          )}
        />
        <Button type="submit" disabled={!canSend} loading={sending} className="size-11 shrink-0 px-0">
          {!sending && <SendHorizontal className="size-5" aria-hidden="true" />}
          <span className="sr-only">{editing ? "Guardar cambio" : "Enviar"}</span>
        </Button>
      </div>
      {remaining < 200 && (
        <p id={`${fileInputId}-restantes`} className="text-right text-xs text-muted" aria-live="polite">
          Te quedan {remaining} caracteres.
        </p>
      )}
    </form>
  );
}
