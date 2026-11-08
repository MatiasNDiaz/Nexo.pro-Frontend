"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { chatKeys, openConversation } from "@/features/chat/api";
import { useViewer } from "@/features/session/viewer";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { RequestQuoteDialog } from "./request-quote-dialog";

interface ProfileActionsProps {
  slug: string;
  professionalUserId: string;
  firstName: string;
  professions: { id: string; name: string; isPrimary: boolean }[];
}

/**
 * Chat y pedido de presupuesto desde el perfil público. Solo el cliente con la cuenta activa los usa
 * (el backend lo exige); al resto se le explica qué falta. La página es pública y está en caché: esto
 * se resuelve en el navegador con la sesión de cada persona.
 */
export function ProfileActions({ slug, professionalUserId, firstName, professions }: ProfileActionsProps) {
  const viewer = useViewer();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [requesting, setRequesting] = useState(false);

  const chat = useMutation({
    mutationFn: () => openConversation(professionalUserId),
    onSuccess: async (conversation) => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
      router.push(`/panel/mensajes/${conversation.id}` as Route);
    },
  });

  if (viewer.status === "loading") {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    );
  }

  if (viewer.status === "anonymous") {
    return (
      <p className="text-sm text-muted">
        Para escribirle por el chat y pedirle un presupuesto,{" "}
        <Link
          href={`/ingresar?siguiente=${encodeURIComponent(`/profesionales/${slug}`)}` as Route}
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          ingresá a tu cuenta
        </Link>
        .
      </p>
    );
  }

  const { user } = viewer;
  // Los profesionales y el admin no inician chats ni pedidos (solo el cliente, ADR 0024/0025).
  if (user.role !== "CUSTOMER") return null;

  if (user.status !== "ACTIVE") {
    return (
      <div className="flex flex-col gap-2 text-sm text-muted">
        <p>Para escribirle y pedirle presupuestos, primero activá tu cuenta.</p>
        <ButtonLink href="/panel" variant="secondary" size="sm" className="self-start">
          Ver cómo activarla
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {chat.isError && (
        <Alert tone="danger">
          {isApiError(chat.error, "PROFESSIONAL_NOT_AVAILABLE", "PROFESSIONAL_UNAVAILABLE")
            ? `${firstName} no está disponible para el chat en este momento.`
            : errorMessage(chat.error)}
        </Alert>
      )}
      <Button variant="primary" fullWidth onClick={() => chat.mutate()} loading={chat.isPending}>
        <MessageCircle className="size-4" aria-hidden="true" />
        Escribirle por el chat
      </Button>
      {professions.length > 0 && (
        <>
          <Button variant="secondary" fullWidth onClick={() => setRequesting(true)}>
            <FileText className="size-4" aria-hidden="true" />
            Pedir presupuesto
          </Button>
          <RequestQuoteDialog
            open={requesting}
            onClose={() => setRequesting(false)}
            professional={{ userId: professionalUserId, firstName, professions }}
          />
        </>
      )}
    </div>
  );
}
