import { api, ApiError, NETWORK_ERROR, type Schemas } from "@/lib/api/client";

export type UploadPurpose = Schemas["CreateUploadDto"]["purpose"];
export type UploadKind = Schemas["CreateUploadDto"]["kind"];
export type UploadedFile = Schemas["FileResponseDto"];

/**
 * Tipos admitidos por el backend (file-policies.ts, ALLOWED_MIME_TYPES). El backend vuelve a
 * comprobar el tipo REAL del archivo al confirmar (no la extensión): esto solo evita subidas inútiles.
 */
export const ACCEPTED_TYPES: Record<UploadKind, readonly string[]> = {
  IMAGE: ["image/jpeg", "image/png", "image/webp"],
  VIDEO: ["video/mp4", "video/quicktime"],
  DOCUMENT: ["application/pdf"],
};

export function kindOf(file: File): UploadKind | null {
  for (const [kind, types] of Object.entries(ACCEPTED_TYPES) as [UploadKind, readonly string[]][]) {
    if (types.includes(file.type)) return kind;
  }
  return null;
}

const mb = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

/** El prefijo de la API que trae el ticket local (`/api/v1/...`) lo pone el cliente HTTP. */
const API_PREFIX = /^\/api\/v1(?=\/)/;

/**
 * Sube un archivo en los tres pasos del backend (contrato §8):
 * 1. `POST /uploads` registra el archivo y devuelve el ticket (destino, campos firmados, peso máximo).
 * 2. El navegador sube el archivo:
 *    - Cloudinary (`POST` a una URL absoluta): multipart con los campos firmados tal cual + `file`,
 *      SIN cookies ni token CSRF (es otro sitio).
 *    - Disco local, solo desarrollo (`PUT` a una ruta de la API): multipart con `file`, por el
 *      cliente HTTP (cookies, CSRF, X-Requested-With).
 * 3. `POST /uploads/:id/complete`: el backend inspecciona el archivo real y lo deja listo o lo rechaza
 *    con un mensaje para mostrar (peso, tipo, duración).
 */
export async function uploadFile(file: File, purpose: UploadPurpose, signal?: AbortSignal): Promise<UploadedFile> {
  const kind = kindOf(file);
  if (!kind) {
    throw new ApiError(415, "UNSUPPORTED_FILE_TYPE", "Ese tipo de archivo no está permitido.");
  }

  const { file: created, upload } = await api<Schemas["CreateUploadResponseDto"]>("/uploads", {
    method: "POST",
    body: { purpose, kind },
    signal,
  });

  if (file.size > upload.maxBytes) {
    throw new ApiError(413, "FILE_TOO_LARGE", `El archivo puede pesar hasta ${mb(upload.maxBytes)} MB.`);
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(upload.fields)) form.append(key, value);
  form.append("file", file);

  if (upload.method === "PUT") {
    await api(upload.url.replace(API_PREFIX, ""), { method: "PUT", body: form, signal });
  } else {
    let response: Response;
    try {
      response = await fetch(upload.url, { method: "POST", body: form, credentials: "omit", signal });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new ApiError(0, NETWORK_ERROR, "No pudimos subir el archivo. Revisá tu conexión e intentá de nuevo.");
    }
    if (!response.ok) {
      throw new ApiError(response.status, "UPLOAD_FAILED", "No pudimos subir el archivo. Intentá de nuevo.");
    }
  }

  return api<UploadedFile>(`/uploads/${created.id}/complete`, { method: "POST", signal });
}
