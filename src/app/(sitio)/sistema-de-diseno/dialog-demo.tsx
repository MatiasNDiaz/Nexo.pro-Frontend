"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, Sheet } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form-controls";

export function DialogDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => setDialogOpen(true)}>
        Abrir modal
      </Button>
      <Button variant="secondary" onClick={() => setSheetOpen(true)}>
        Abrir panel lateral
      </Button>
      <Button
        loading={saving}
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1500);
        }}
      >
        Guardar (estado de carga)
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirmar acción"
        description="Así se ven los modales: en celular se apoyan abajo, en escritorio se centran."
      >
        <Field id="demo-motivo" label="Motivo">
          {(a11y) => <Input {...a11y} placeholder="Opcional" />}
        </Field>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setDialogOpen(false)}>Confirmar</Button>
        </div>
      </Dialog>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filtros">
        <p className="p-5 text-sm text-muted">Contenido del panel lateral.</p>
      </Sheet>
    </div>
  );
}
