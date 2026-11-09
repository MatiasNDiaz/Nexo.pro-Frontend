"use client";

import { getPushKey, subscribePush, unsubscribePush } from "./api";

/*
 * Avisos push en este navegador (contrato §11). El service worker (public/sw.js) solo muestra los
 * avisos; no guarda páginas ni intercepta pedidos. El backend envía solo a dispositivos con sesión
 * abierta, así que al cerrar sesión dejan de llegar.
 */

export type PushState = "unsupported" | "disabled-server" | "denied" | "off" | "on";

const SW_URL = "/sw.js";

export const pushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/** La clave VAPID llega en base64url; `subscribe` la pide como bytes. */
function keyToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration(SW_URL);
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Estado actual en este navegador, sin pedir permisos. */
export async function readPushState(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  const key = await getPushKey();
  if (!key.enabled || !key.publicKey) return "disabled-server";
  if (Notification.permission === "denied") return "denied";
  return (await currentSubscription()) ? "on" : "off";
}

/** Pide permiso, registra el service worker y le pasa la suscripción al backend. */
export async function enablePush(): Promise<PushState> {
  const key = await getPushKey();
  if (!key.enabled || !key.publicKey) return "disabled-server";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  const registration = await navigator.serviceWorker.register(SW_URL);
  await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(key.publicKey) }));
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) throw new Error("El navegador no devolvió una suscripción válida.");
  await subscribePush({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
  return "on";
}

export async function disablePush(): Promise<PushState> {
  const subscription = await currentSubscription();
  if (subscription) {
    await unsubscribePush(subscription.endpoint);
    await subscription.unsubscribe();
  }
  return "off";
}
