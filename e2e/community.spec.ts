import { expect, test } from "@playwright/test";
import { chooseOption } from "./support/listbox";
import { expectNoHorizontalScroll } from "./support/layout";
import { API, json, me, mockApi, type Handler } from "./support/mock-api";

/*
 * Etapa 5.3: foro participativo, reportes, soporte, sanciones y apelaciones, opinión sobre la
 * plataforma y novedades. La publicación del foro la arma el servidor con la API simulada
 * (mock-server.mjs); lo que pide el navegador después lo responde mockApi.
 */

const POST_ID = "aaaaaaaa-0000-4000-8000-000000000001";
const activeCustomer = me({ status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

function signedIn(handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, activeCustomer),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /chat/conversations": () => json(200, []),
    ...handlers,
  };
}

test.describe("foro participativo", () => {
  test("me gusta, responder y reportar en una publicación", async ({ page, request }) => {
    const post = (await (await request.get(`${API}/forum/posts/${POST_ID}`)).json()) as {
      likeCount: number;
      replyCount: number;
      replies: Record<string, unknown>[];
    };
    let liked = false;
    let replyBody: Record<string, unknown> | null = null;
    let report: Record<string, unknown> | null = null;
    const current = () => ({
      ...post,
      likeCount: post.likeCount + (liked ? 1 : 0),
      replyCount: post.replyCount + (replyBody ? 1 : 0),
      replies: replyBody
        ? [
            ...post.replies,
            {
              id: "cccccccc-0000-4000-8000-000000000009",
              parentReplyId: null,
              author: { userId: activeCustomer.id, firstName: "Ana", lastName: "Pérez", avatarUrl: null, role: "CUSTOMER", memberSince: "2026-01-01T00:00:00.000Z" },
              body: replyBody.body,
              proposedPrice: null,
              removed: false,
              likeCount: 0,
              edited: false,
              createdAt: new Date().toISOString(),
            },
          ]
        : post.replies,
    });
    await mockApi(
      page,
      signedIn({
        [`GET /forum/posts/${POST_ID}`]: () => json(200, current()),
        [`GET /forum/posts/${POST_ID}/my-likes`]: () => json(200, { post: liked, replyIds: [] }),
        [`PUT /forum/posts/${POST_ID}/like`]: () => {
          liked = true;
          return json(204);
        },
        [`POST /forum/posts/${POST_ID}/replies`]: (req) => {
          replyBody = req.postDataJSON() as Record<string, unknown>;
          return json(201, current().replies.at(-1));
        },
        "POST /reports": (req) => {
          report = req.postDataJSON() as Record<string, unknown>;
          return json(201, { id: "r1", ...report, status: "SUBMITTED", createdAt: new Date().toISOString() });
        },
      }),
    );

    await page.goto(`/foro/${POST_ID}`);
    const main = page.getByRole("main");
    const like = main.getByRole("button", { name: `Me gusta la publicación (${post.likeCount})` });
    await like.click();
    await expect(main.getByRole("button", { name: `Quitar me gusta de la publicación (${post.likeCount + 1})` })).toHaveAttribute("aria-pressed", "true");

    await main.getByRole("textbox", { name: "Tu respuesta" }).fill("Yo también lo necesito, ¿alguien recomienda?");
    await main.getByRole("button", { name: "Responder", exact: true }).last().click();
    await expect(main.getByText("Yo también lo necesito, ¿alguien recomienda?")).toBeVisible();
    expect(replyBody).toEqual({ body: "Yo también lo necesito, ¿alguien recomienda?" });

    await main.getByRole("button", { name: "Reportar" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Reportar esta publicación" });
    await dialog.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(dialog.getByText("Elegí un motivo.")).toBeVisible();
    await chooseOption(dialog, "Motivo", "Spam o publicidad");
    await dialog.getByRole("textbox", { name: "¿Qué pasó?" }).fill("Está ofreciendo cosas que no tienen nada que ver.");
    await dialog.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(page.getByRole("dialog", { name: "Gracias por avisarnos" })).toBeVisible();
    expect(report).toEqual({ targetType: "FORUM_POST", targetId: POST_ID, reason: "SPAM", description: "Está ofreciendo cosas que no tienen nada que ver." });
  });

  test("publicar: tipo, texto y oficio, y lleva a la publicación", async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await mockApi(
      page,
      signedIn({
        "POST /forum/posts": (req) => {
          sent = req.postDataJSON() as Record<string, unknown>;
          return json(201, { id: POST_ID });
        },
      }),
    );
    await page.goto("/foro");
    await page.getByRole("main").getByRole("link", { name: /Publicar en el foro/ }).click();
    await expect(page).toHaveURL(/\/foro\/nueva$/);
    await page.locator("label").filter({ hasText: "Busco un profesional" }).click();
    await page.getByRole("button", { name: "Publicar", exact: true }).click();
    await expect(page.getByText("Contá un poco más")).toBeVisible();
    await page.getByRole("textbox", { name: /¿Qué necesitás\?/ }).fill("Necesito cambiar la instalación eléctrica de la cocina.");
    await page.getByRole("button", { name: "Electricista" }).click();
    await page.getByRole("button", { name: "Publicar", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/foro/${POST_ID}$`));
    expect(sent).toMatchObject({ type: "PROFESSIONAL_WANTED", body: "Necesito cambiar la instalación eléctrica de la cocina.", professionIds: [expect.any(String)] });
    await expectNoHorizontalScroll(page);
  });
});

test.describe("ayuda", () => {
  test("soporte: nueva consulta y respuesta en la conversación", async ({ page }) => {
    const ticket = {
      id: "dddddddd-0000-4000-8000-000000000001",
      category: "BUG",
      status: "OPEN",
      messages: [{ id: "m1", fromStaff: false, body: "La página no carga las fotos del perfil.", fileId: null, createdAt: "2026-11-05T10:00:00.000Z" }],
      createdAt: "2026-11-05T10:00:00.000Z",
      updatedAt: "2026-11-05T10:00:00.000Z",
    };
    let created = false;
    let replied: string | null = null;
    const withReply = () =>
      replied
        ? { ...ticket, messages: [...ticket.messages, { id: "m2", fromStaff: false, body: replied, fileId: null, createdAt: new Date().toISOString() }] }
        : ticket;
    await mockApi(
      page,
      signedIn({
        "GET /support/tickets": () => json(200, created ? [ticket] : []),
        "POST /support/tickets": (req) => {
          expect(req.postDataJSON()).toEqual({ category: "BUG", body: "La página no carga las fotos del perfil." });
          created = true;
          return json(201, ticket);
        },
        [`GET /support/tickets/${ticket.id}`]: () => json(200, withReply()),
        [`POST /support/tickets/${ticket.id}/messages`]: (req) => {
          replied = (req.postDataJSON() as { body: string }).body;
          return json(201, withReply());
        },
      }),
    );
    await page.goto("/panel/soporte");
    await page.getByRole("button", { name: "Nueva consulta" }).click();
    await chooseOption(page, "Motivo", "Falla de la página");
    await page.getByRole("textbox", { name: "Contanos" }).fill("La página no carga las fotos del perfil.");
    await page.getByRole("button", { name: "Enviar consulta" }).click();
    await page.getByRole("link", { name: /Falla de la página/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Falla de la página" })).toBeVisible();
    await page.getByRole("textbox", { name: "Tu respuesta" }).fill("Pasa en el celular y en la compu.");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("Pasa en el celular y en la compu.")).toBeVisible();
  });

  test("sanciones: se apela un strike y queda en revisión", async ({ page }) => {
    let appeal: Record<string, unknown> | null = null;
    await mockApi(
      page,
      signedIn({
        "GET /moderation/me": () =>
          json(200, {
            sanctions: [],
            strikes: [{ id: "s1", weight: 1, reason: "Lenguaje ofensivo en el foro.", voided: false, voidReason: null, createdAt: "2026-11-01T10:00:00.000Z" }],
            appeals: appeal ? [{ id: "a1", strikeId: "s1", sanctionId: null, body: appeal.body, status: "OPEN", decisionNote: null, createdAt: new Date().toISOString() }] : [],
          }),
        "POST /moderation/appeals": (req) => {
          appeal = req.postDataJSON() as Record<string, unknown>;
          return json(201, { id: "a1" });
        },
      }),
    );
    await page.goto("/panel/moderacion");
    await page.getByRole("button", { name: "Apelar" }).click();
    await page.getByRole("textbox", { name: "Tu apelación" }).fill("No fui yo: me hackearon la cuenta ese día.");
    await page.getByRole("button", { name: "Enviar apelación" }).click();
    await expect(page.getByText("Apelación en revisión")).toBeVisible();
    expect(appeal).toEqual({ body: "No fui yo: me hackearon la cuenta ese día.", strikeId: "s1" });
  });

  test("opinión: se califica la plataforma y queda en revisión", async ({ page }) => {
    let saved: Record<string, unknown> | null = null;
    await mockApi(
      page,
      signedIn({
        "GET /platform-reviews/me": () => json(200, null),
        "PUT /platform-reviews/me": (req) => {
          saved = req.postDataJSON() as Record<string, unknown>;
          return json(200, { id: "p1", ...saved, author: { displayName: "Ana P." }, published: false, createdAt: new Date().toISOString() });
        },
      }),
    );
    await page.goto("/panel/opinion");
    await page.locator("label").filter({ has: page.getByRole("radio", { name: "5 de 5, Excelente" }) }).click();
    await page.getByRole("textbox", { name: /Comentario/ }).fill("Encontré electricista en una hora.");
    await page.getByRole("button", { name: "Enviar opinión" }).click();
    await expect(page.getByText("En revisión")).toBeVisible();
    expect(saved).toEqual({ rating: 5, comment: "Encontré electricista en una hora." });
  });

  test("novedad: se abre desde su notificación", async ({ page }) => {
    await mockApi(
      page,
      signedIn({
        "GET /announcements/ee000000-0000-4000-8000-000000000001": () =>
          json(200, { id: "ee000000-0000-4000-8000-000000000001", title: "Llegó el chat con fotos", body: "Ahora podés mandar fotos y videos.", publishedAt: "2026-11-06T10:00:00.000Z" }),
      }),
    );
    await page.goto("/panel/novedades/ee000000-0000-4000-8000-000000000001");
    await expect(page.getByRole("heading", { level: 1, name: "Llegó el chat con fotos" })).toBeVisible();
    await expect(page.getByText("Ahora podés mandar fotos y videos.")).toBeVisible();
  });
});
