"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Base común: <dialog> nativo abierto con showModal(). El navegador se encarga de atrapar el foco,
 * cerrar con Esc, volver el foco al botón que lo abrió y dejar inerte el resto de la página.
 * Se cierra también tocando el fondo. Las animaciones son CSS (@starting-style + transition-discrete).
 */
function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    // Al salir de la página Next la conserva oculta (para volver atrás al instante) y React desmonta
    // sus efectos: un modal que quedara abierto dejaría inerte la página nueva. Se cierra acá.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Esc dispara "cancel" y el navegador cierra solo: avisamos al dueño del estado. El evento "close"
    // llega después (en otra tarea): si para entonces el diálogo está abierto otra vez, ese cierre fue
    // nuestro y ya se deshizo. Pasa en desarrollo, donde React monta, desmonta y vuelve a montar los
    // efectos (Strict Mode): sin este control, todo diálogo se cerraba apenas se abría.
    const handleClose = () => {
      if (!dialog.open) onClose();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return { ref, onBackdropClick };
}

const backdrop = "backdrop:bg-brand-950/55 backdrop:backdrop-blur-[2px]";
const discrete = "transition-[opacity,translate,overlay,display] transition-discrete duration-250 ease-out-soft";

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-brand-50 hover:text-brand-800"
    >
      <X className="size-5" aria-hidden="true" />
      <span className="sr-only">Cerrar</span>
    </button>
  );
}

/**
 * Modal centrado (en celular se apoya abajo, al alcance del pulgar). Con `icon`, formato de aviso
 * (estilo SweetAlert): ícono grande, título y texto centrados; con `role="alertdialog"` para las
 * confirmaciones.
 */
export function Dialog({ open, onClose, title, description, children, className, icon, role }: DialogBaseProps & { icon?: ReactNode; role?: "alertdialog" }) {
  const { ref, onBackdropClick } = useNativeDialog(open, onClose);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={onBackdropClick}
      className={cn(
        "m-0 mt-auto w-full max-w-none rounded-t-3xl bg-surface p-0 shadow-raised sm:m-auto sm:max-w-lg sm:rounded-3xl",
        "translate-y-6 opacity-0 open:translate-y-0 open:opacity-100 starting:open:translate-y-6 starting:open:opacity-0",
        discrete,
        backdrop,
        icon ? "sm:max-w-md" : null,
        className,
      )}
    >
      {icon ? (
        <div className="relative flex flex-col items-center gap-4 px-5 pt-8 pb-5 text-center sm:px-7 sm:pb-7">
          <div className="absolute top-3 right-3">
            <CloseButton onClose={onClose} />
          </div>
          {/* La clave reinicia la animación del ícono cada vez que se abre. */}
          <div key={open ? "abierto" : "cerrado"}>{icon}</div>
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-xl font-semibold text-balance text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm leading-relaxed text-pretty text-muted-strong">
                {description}
              </p>
            )}
          </div>
          {/* Los campos de un formulario se leen mejor alineados a la izquierda. */}
          <div className="w-full text-left">{children}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className="text-xl font-semibold text-ink">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <CloseButton onClose={onClose} />
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** Panel lateral (menú móvil desde la derecha; filtros desde la izquierda, donde están en escritorio). */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
  side = "right",
}: DialogBaseProps & { side?: "left" | "right" }) {
  const { ref, onBackdropClick } = useNativeDialog(open, onClose);
  const titleId = useId();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={onBackdropClick}
      className={cn(
        "fixed inset-y-0 m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-surface p-0 shadow-raised",
        side === "right"
          ? "right-0 left-auto translate-x-full open:translate-x-0 starting:open:translate-x-full"
          : "right-auto left-0 -translate-x-full open:translate-x-0 starting:open:-translate-x-full",
        discrete,
        backdrop,
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
          <CloseButton onClose={onClose} />
        </div>
        {description && <p className="px-5 pt-4 text-sm text-muted">{description}</p>}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
