import { describe, expect, it } from "vitest";
import { forumHref, parseForumFilters, toForumQuery } from "./filters";

const LOCALITY = "8ab78460-a121-4479-b288-8ac832ee04c8";
const professions = [{ id: "d6bda813-60d8-44d6-a3bc-87348e224b13", slug: "plomero" }];

describe("filtros del foro", () => {
  it("lee tipo, oficio, localidad, estado y página", () => {
    expect(
      parseForumFilters({ tipo: "busco-profesional", oficio: "plomero", localidad: LOCALITY, estado: "abiertas", pagina: "2" }),
    ).toEqual({ type: "PROFESSIONAL_WANTED", professionSlug: "plomero", localityId: LOCALITY, resolved: false, page: 2 });
  });

  it("ignora valores inválidos", () => {
    expect(parseForumFilters({ tipo: "spam", localidad: "x", estado: "quizas", pagina: "0" })).toEqual({
      type: null,
      professionSlug: null,
      localityId: null,
      resolved: null,
      page: 1,
    });
  });

  it("traduce al backend y vuelve a la misma URL", () => {
    const filters = parseForumFilters({ tipo: "preguntas", oficio: "plomero", estado: "resueltas" });
    expect(toForumQuery(filters, professions)).toEqual({
      type: "QUESTION",
      professionId: professions[0]!.id,
      localityId: null,
      resolved: true,
      page: 1,
      limit: 15,
    });
    expect(forumHref(filters)).toBe("/foro?tipo=preguntas&oficio=plomero&estado=resueltas");
    expect(forumHref({})).toBe("/foro");
  });
});
