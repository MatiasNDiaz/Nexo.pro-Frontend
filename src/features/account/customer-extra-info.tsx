"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { errorMessage } from "@/lib/api/errors";
import { accountKeys, getCustomerProfile, updateCustomerProfile } from "./api";
import { SettingsSection } from "./settings-section";

/** Máximo del backend (UpdateCustomerProfileDto.extraInfo). */
const MAX = 300;

/** Datos útiles para el profesional (solo clientes): timbre, piso, horarios para coordinar, etc. */
export function CustomerExtraInfo() {
  const profile = useQuery({ queryKey: accountKeys.customer, queryFn: getCustomerProfile });
  return (
    <SettingsSection
      id="para-el-profesional"
      title="Datos para el profesional"
      description="Lo ven los profesionales con los que coordinás un trabajo. Por ejemplo: piso y departamento, timbre o en qué horarios estás."
    >
      {profile.isPending ? (
        <Skeleton className="h-28 w-full" />
      ) : profile.isError ? (
        <Alert tone="danger">{errorMessage(profile.error)}</Alert>
      ) : (
        <ExtraInfoForm initial={profile.data.extraInfo ?? ""} />
      )}
    </SettingsSection>
  );
}

function ExtraInfoForm({ initial }: { initial: string }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(initial);
  // Último valor guardado: habilita "Guardar" solo si hay cambios respecto de él.
  const [savedText, setSavedText] = useState(initial);
  const mutation = useMutation({
    // Vacío = se borra (el backend acepta null o texto vacío).
    mutationFn: () => updateCustomerProfile(text.trim() || null),
    meta: { success: { title: "Guardamos los datos", description: "Los van a ver los profesionales con los que coordines un trabajo." } },
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.customer, data);
      setSavedText(text);
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="flex flex-col gap-4"
    >
      {mutation.isError && <Alert tone="danger">{errorMessage(mutation.error)}</Alert>}
      <Field id="extra-info" label="Datos útiles (opcional)" hint={`${text.length}/${MAX} caracteres`}>
        {(a11y) => (
          <Textarea
            {...a11y}
            value={text}
            maxLength={MAX}
            rows={3}
            onChange={(event) => setText(event.target.value)}
          />
        )}
      </Field>
      <Button type="submit" loading={mutation.isPending} disabled={text === savedText} className="self-start">
        Guardar
      </Button>
    </form>
  );
}
