"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { useSessionActions } from "./session-provider";

/**
 * Cerrar sesión con confirmación ("¿Seguro que querés salir?") y aviso al terminar. Lo usan el menú de
 * la cuenta, el menú del celular y la lista de dispositivos. `onDone` corre al terminar (p. ej. cerrar
 * el menú). Devuelve la función para abrir la pregunta y el diálogo, que va en el árbol.
 */
export function useSignOut(onDone?: () => void): { ask: () => void; dialog: ReactNode } {
  const { signOut } = useSessionActions();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      await signOut();
    } finally {
      setPending(false);
      setOpen(false);
      onDone?.();
      toast.info("Cerraste sesión", "¡Hasta pronto! Te esperamos cuando necesites otro arreglo.");
      router.push("/");
    }
  };

  return {
    ask: () => setOpen(true),
    dialog: (
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="¿Seguro que querés salir?"
        description="Vas a tener que volver a ingresar para ver tus mensajes, pedidos y trabajos."
        confirmLabel="Cerrar sesión"
        cancelLabel="Quedarme"
        tone="primary"
        pending={pending}
        onConfirm={() => void confirm()}
      />
    ),
  };
}
