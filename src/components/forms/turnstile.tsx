"use client";

import { useEffect, useRef } from "react";
import { env } from "@/config/env";
import { Alert } from "@/components/ui/feedback";

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      language?: string;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<TurnstileApi> | null = null;

/** Carga el script de Cloudflare una sola vez, y solo cuando hace falta mostrar el desafío. */
function loadTurnstile(): Promise<TurnstileApi> {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Verificación de Cloudflare Turnstile. Se muestra solo cuando el backend la pide
 * (`CAPTCHA_REQUIRED`) o en formularios que siempre la exigen con el CAPTCHA activado. Entrega el
 * token con `onToken` (null cuando vence o falla).
 */
export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const siteKey = env.turnstileSiteKey;
    if (!siteKey || !containerRef.current) return;
    let widgetId: string | null = null;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          language: "es",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, []);

  if (!env.turnstileSiteKey) {
    // El backend pide CAPTCHA pero este frontend no tiene la clave pública: error de configuración.
    return (
      <Alert tone="warning" title="No podemos mostrar la verificación">
        Intentá de nuevo en unos minutos o escribinos desde Contacto.
      </Alert>
    );
  }
  return <div ref={containerRef} className="min-h-[65px]" />;
}
