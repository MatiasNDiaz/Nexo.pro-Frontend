import { QueryClient } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { createFeedbackMutationCache } from "@/lib/mutation-feedback";
import { Toaster, resetToasts, toast } from "./toast";

describe("avisos flotantes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetToasts();
  });
  afterEach(() => {
    act(() => resetToasts());
    vi.useRealTimers();
  });

  it("muestra el aviso y se cierra solo después de su tiempo", () => {
    render(<Toaster />);
    act(() => toast.success("Guardamos tus datos", "Ya se ven en tu perfil."));
    expect(screen.getByRole("status")).toHaveTextContent("Guardamos tus datos");
    expect(screen.getByText("Ya se ven en tu perfil.")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4000 + 300));
    expect(screen.queryByText("Guardamos tus datos")).not.toBeInTheDocument();
  });

  it("los errores se anuncian enseguida (role=alert) y duran más", () => {
    render(<Toaster />);
    act(() => toast.error("No se pudo guardar"));
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("el mismo aviso repetido no se apila y nunca hay más de 3", () => {
    render(<Toaster />);
    act(() => {
      toast.success("Guardado");
      toast.success("Guardado");
    });
    expect(screen.getAllByText("Guardado")).toHaveLength(1);
    act(() => {
      toast.info("Uno");
      toast.info("Dos");
      toast.info("Tres");
    });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getAllByRole("status")).toHaveLength(3);
    expect(screen.queryByText("Guardado")).not.toBeInTheDocument();
  });

  it("se puede cerrar con el botón", () => {
    render(<Toaster />);
    act(() => toast.info("Novedad"));
    act(() => screen.getByRole("button", { name: "Cerrar aviso" }).click());
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByText("Novedad")).not.toBeInTheDocument();
  });
});

describe("avisos de las mutaciones (meta)", () => {
  beforeEach(() => resetToasts());
  afterEach(() => act(() => resetToasts()));

  const client = () => new QueryClient({ mutationCache: createFeedbackMutationCache() });

  it("con meta.success muestra el aviso; con un texto armado según la respuesta", async () => {
    render(<Toaster />);
    const queryClient = client();
    await act(() =>
      queryClient
        .getMutationCache()
        .build(queryClient, { mutationFn: async () => ({ name: "Ana" }), meta: { success: (data) => `Hola, ${(data as { name: string }).name}` } })
        .execute(undefined),
    );
    expect(await screen.findByText("Hola, Ana")).toBeInTheDocument();
  });

  it("los errores van en aviso solo si la mutación lo pide (meta.error)", async () => {
    render(<Toaster />);
    const queryClient = client();
    const fail = async () => {
      throw new ApiError(409, "CONFLICT", "Ya existe.");
    };
    await act(() => queryClient.getMutationCache().build(queryClient, { mutationFn: fail }).execute(undefined).catch(() => undefined));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(() => queryClient.getMutationCache().build(queryClient, { mutationFn: fail, meta: { error: true } }).execute(undefined).catch(() => undefined));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo completar");
  });
});
