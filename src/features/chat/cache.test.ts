import { describe, expect, it } from "vitest";
import type { Conversation, Message } from "./api";
import { applyMessageToList, chronological, totalUnread, upsertMessage, type MessagePages } from "./cache";

const ME = "me";
const OTHER = "other";

const message = (id: string, createdAt: string, overrides: Partial<Message> = {}): Message => ({
  id,
  conversationId: "c1",
  senderType: "CUSTOMER",
  senderId: OTHER,
  body: `mensaje ${id}`,
  edited: false,
  deleted: false,
  serviceRequestId: null,
  attachments: [],
  createdAt,
  ...overrides,
});

const conversation = (id: string, last: Message | null, unread = 0): Conversation => ({
  id,
  myRole: "PROFESSIONAL",
  counterpart: { userId: OTHER, firstName: "Ana", lastName: "Pérez", avatarUrl: null, deactivated: false },
  lastMessage: last,
  unread,
  counterpartReadAt: null,
  canWrite: true,
  lastMessageAt: last?.createdAt ?? null,
});

const pages = (...list: Message[][]): MessagePages => ({ pages: list, pageParams: list.map(() => undefined) });

describe("upsertMessage", () => {
  it("agrega el mensaje nuevo al principio de la página más reciente", () => {
    const data = pages([message("2", "2026-11-04T10:02:00Z"), message("1", "2026-11-04T10:01:00Z")]);
    const result = upsertMessage(data, message("3", "2026-11-04T10:03:00Z"));
    expect(result!.pages[0]!.map((m) => m.id)).toEqual(["3", "2", "1"]);
  });

  it("reemplaza un mensaje existente (edición o el aviso del propio envío)", () => {
    const data = pages([message("2", "2026-11-04T10:02:00Z")], [message("1", "2026-11-04T10:01:00Z")]);
    const result = upsertMessage(data, message("1", "2026-11-04T10:01:00Z", { body: "", deleted: true }));
    expect(result!.pages[1]![0]).toMatchObject({ id: "1", deleted: true });
    expect(result!.pages[0]).toHaveLength(1);
  });

  it("sin datos cargados no inventa una página", () => {
    expect(upsertMessage(undefined, message("1", "2026-11-04T10:01:00Z"))).toBeUndefined();
  });
});

describe("chronological", () => {
  it("ordena de lo más viejo a lo más nuevo y saca repetidos entre páginas", () => {
    const data = pages(
      [message("3", "2026-11-04T10:03:00Z"), message("2", "2026-11-04T10:02:00Z")],
      [message("2", "2026-11-04T10:02:00Z"), message("1", "2026-11-04T10:01:00Z")],
    );
    expect(chronological(data).map((m) => m.id)).toEqual(["1", "2", "3"]);
  });
});

describe("applyMessageToList", () => {
  const context = { myId: ME, openId: null };

  it("un mensaje nuevo del otro sube la conversación y suma un no leído", () => {
    const list = [conversation("c2", message("x", "2026-11-04T09:00:00Z", { conversationId: "c2" })), conversation("c1", message("1", "2026-11-04T08:00:00Z"))];
    const result = applyMessageToList(list, message("2", "2026-11-04T10:00:00Z"), context)!;
    expect(result.map((c) => c.id)).toEqual(["c1", "c2"]);
    expect(result[0]).toMatchObject({ unread: 1, lastMessageAt: "2026-11-04T10:00:00Z", lastMessage: { id: "2" } });
  });

  it("los mensajes propios y los de la conversación abierta no suman no leídos", () => {
    const list = [conversation("c1", null)];
    expect(applyMessageToList(list, message("2", "2026-11-04T10:00:00Z", { senderId: ME }), context)![0]!.unread).toBe(0);
    expect(applyMessageToList(list, message("3", "2026-11-04T10:01:00Z"), { myId: ME, openId: "c1" })![0]!.unread).toBe(0);
  });

  it("el aviso de un mensaje ya contado (mi envío + el eco del tiempo real) no cuenta dos veces", () => {
    const sent = message("2", "2026-11-04T10:00:00Z");
    const once = applyMessageToList([conversation("c1", null)], sent, context)!;
    const twice = applyMessageToList(once, sent, context)!;
    expect(twice[0]!.unread).toBe(1);
  });

  it("editar o eliminar el último mensaje lo actualiza sin mover ni sumar", () => {
    const last = message("2", "2026-11-04T10:00:00Z");
    const list = [conversation("c2", message("x", "2026-11-04T11:00:00Z", { conversationId: "c2" })), conversation("c1", last, 1)];
    const result = applyMessageToList(list, { ...last, body: "", deleted: true }, context)!;
    expect(result.map((c) => c.id)).toEqual(["c2", "c1"]);
    expect(result[1]).toMatchObject({ unread: 1, lastMessage: { deleted: true } });
  });

  it("una conversación que no está en la lista pide volver a cargarla", () => {
    expect(applyMessageToList([], message("1", "2026-11-04T10:00:00Z"), context)).toBeNull();
  });

  it("suma los no leídos de todas las conversaciones", () => {
    expect(totalUnread([conversation("a", null, 2), conversation("b", null, 3)])).toBe(5);
    expect(totalUnread(undefined)).toBe(0);
  });
});
