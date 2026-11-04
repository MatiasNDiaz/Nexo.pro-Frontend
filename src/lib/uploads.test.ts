import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setCsrfToken } from "@/lib/api/client";
import { kindOf, uploadFile } from "./uploads";

const API = "http://localhost:3001/api/v1";
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const created = { id: "f-1", purpose: "AVATAR", kind: "IMAGE", status: "PENDING_UPLOAD", mimeType: null, sizeBytes: null, durationMs: null, url: null, createdAt: "" };
const ready = { ...created, status: "READY", mimeType: "image/png", sizeBytes: 3, url: "https://res.cloudinary.com/x/a.png" };

const png = () => new File([new Uint8Array([1, 2, 3])], "foto.png", { type: "image/png" });

describe("uploadFile", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    setCsrfToken("csrf-1");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("Cloudinary: sube directo con los campos firmados, sin cookies ni CSRF, y confirma", async () => {
    fetchMock
      .mockResolvedValueOnce(
        json(201, {
          file: created,
          upload: { method: "POST", url: "https://api.cloudinary.com/v1_1/demo/image/upload", fields: { signature: "s", api_key: "k" }, maxBytes: 5_000_000, expiresAt: "" },
        }),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(json(200, ready));

    await expect(uploadFile(png(), "AVATAR")).resolves.toMatchObject({ status: "READY" });

    const [createUrl, createInit] = fetchMock.mock.calls[0]!;
    expect(String(createUrl)).toBe(`${API}/uploads`);
    expect(createInit!.body).toBe('{"purpose":"AVATAR","kind":"IMAGE"}');

    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1]!;
    expect(String(uploadUrl)).toBe("https://api.cloudinary.com/v1_1/demo/image/upload");
    expect(uploadInit!.credentials).toBe("omit");
    expect(uploadInit!.headers).toBeUndefined();
    const form = uploadInit!.body as FormData;
    expect(form.get("signature")).toBe("s");
    expect(form.get("api_key")).toBe("k");
    expect(form.get("file")).toBeInstanceOf(File);

    expect(String(fetchMock.mock.calls[2]![0])).toBe(`${API}/uploads/f-1/complete`);
  });

  it("disco local: PUT multipart a la API con cookies y CSRF, sin fijar el Content-Type", async () => {
    fetchMock
      .mockResolvedValueOnce(
        json(201, { file: created, upload: { method: "PUT", url: "/api/v1/uploads/f-1/content", fields: {}, maxBytes: 5_000_000, expiresAt: "" } }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(json(200, ready));

    await uploadFile(png(), "AVATAR");

    const [url, init] = fetchMock.mock.calls[1]!;
    expect(String(url)).toBe(`${API}/uploads/f-1/content`);
    const headers = init!.headers as Record<string, string>;
    expect(init!.credentials).toBe("include");
    expect(headers["X-CSRF-Token"]).toBe("csrf-1");
    expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
    expect(headers["Content-Type"]).toBeUndefined();
    expect((init!.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("no sube si el archivo supera el peso del ticket", async () => {
    fetchMock.mockResolvedValueOnce(
      json(201, { file: created, upload: { method: "POST", url: "https://api.cloudinary.com/x", fields: {}, maxBytes: 2, expiresAt: "" } }),
    );
    await expect(uploadFile(png(), "AVATAR")).rejects.toMatchObject({ code: "FILE_TOO_LARGE" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rechaza tipos no admitidos sin llamar a la API", async () => {
    const exe = new File(["x"], "virus.exe", { type: "application/x-msdownload" });
    await expect(uploadFile(exe, "AVATAR")).rejects.toMatchObject({ code: "UNSUPPORTED_FILE_TYPE" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("propaga el rechazo del backend al confirmar (mensaje para mostrar)", async () => {
    fetchMock
      .mockResolvedValueOnce(json(201, { file: created, upload: { method: "POST", url: "https://api.cloudinary.com/x", fields: {}, maxBytes: 5_000_000, expiresAt: "" } }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(json(415, { statusCode: 415, code: "UNSUPPORTED_FILE_TYPE", message: "El archivo no es una imagen válida." }));
    await expect(uploadFile(png(), "AVATAR")).rejects.toMatchObject({ code: "UNSUPPORTED_FILE_TYPE", message: "El archivo no es una imagen válida." });
  });
});

describe("kindOf", () => {
  it("clasifica por el tipo declarado", () => {
    expect(kindOf(new File([""], "a.webp", { type: "image/webp" }))).toBe("IMAGE");
    expect(kindOf(new File([""], "a.mov", { type: "video/quicktime" }))).toBe("VIDEO");
    expect(kindOf(new File([""], "a.pdf", { type: "application/pdf" }))).toBe("DOCUMENT");
    expect(kindOf(new File([""], "a.gif", { type: "image/gif" }))).toBeNull();
  });
});
