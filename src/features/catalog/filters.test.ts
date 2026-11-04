import { describe, expect, it } from "vitest";
import { catalogHref, parseCatalogFilters, toBackendQuery, totalPages } from "./filters";

const LOCALITY = "8ab78460-a121-4479-b288-8ac832ee04c8";
const NEIGHBORHOOD = "44444444-4444-4444-8444-444444444444";
const professions = [{ id: "d6bda813-60d8-44d6-a3bc-87348e224b13", slug: "electricista" }];

describe("parseCatalogFilters", () => {
  it("lee los filtros válidos de la URL", () => {
    expect(
      parseCatalogFilters({ oficio: "Electricista", localidad: LOCALITY, barrio: NEIGHBORHOOD, disponible: "1", pagina: "3" }),
    ).toEqual({
      professionSlug: "electricista",
      localityId: LOCALITY,
      neighborhoodId: NEIGHBORHOOD,
      availableNow: true,
      page: 3,
    });
  });

  it("ignora valores inválidos o maliciosos en vez de mandarlos al backend", () => {
    expect(
      parseCatalogFilters({ oficio: "<script>", localidad: "1 OR 1=1", disponible: "true", pagina: "-2" }),
    ).toEqual({ professionSlug: null, localityId: null, neighborhoodId: null, availableNow: false, page: 1 });
    expect(parseCatalogFilters({ pagina: "501" }).page).toBe(1);
    expect(parseCatalogFilters({ pagina: "2.5" }).page).toBe(2);
  });

  it("el barrio sin localidad no se usa", () => {
    expect(parseCatalogFilters({ barrio: NEIGHBORHOOD }).neighborhoodId).toBeNull();
  });

  it("si un parámetro viene repetido, toma el primero", () => {
    expect(parseCatalogFilters({ oficio: ["plomero", "gasista"] }).professionSlug).toBe("plomero");
  });
});

describe("toBackendQuery", () => {
  it("traduce el slug del oficio a su id y omite lo que no se filtra", () => {
    const filters = parseCatalogFilters({ oficio: "electricista", localidad: LOCALITY });
    expect(toBackendQuery(filters, professions)).toEqual({
      professionId: professions[0]!.id,
      localityId: LOCALITY,
      neighborhoodId: null,
      availableNow: null,
      page: 1,
      limit: 12,
    });
  });

  it("un oficio que no existe no filtra", () => {
    expect(toBackendQuery(parseCatalogFilters({ oficio: "astronauta" }), professions).professionId).toBeNull();
  });
});

describe("catalogHref", () => {
  it("arma URLs limpias, sin la página 1", () => {
    expect(catalogHref({})).toBe("/profesionales");
    expect(catalogHref({ professionSlug: "electricista", availableNow: true, page: 1 })).toBe(
      "/profesionales?oficio=electricista&disponible=1",
    );
    expect(catalogHref({ localityId: LOCALITY, neighborhoodId: NEIGHBORHOOD, page: 2 })).toBe(
      `/profesionales?localidad=${LOCALITY}&barrio=${NEIGHBORHOOD}&pagina=2`,
    );
  });
});

describe("totalPages", () => {
  it("siempre al menos 1", () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(25)).toBe(3);
  });
});
