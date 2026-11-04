import { describe, expect, it } from "vitest";
import { phoneSchema, registerSchema, resetPasswordSchema, safeNextPath, toRegistrationBody, profileSchema } from "./schemas";

const LOCALITY = "8ab78460-a121-4479-b288-8ac832ee04c8";
const PROFESSION = "d6bda813-60d8-44d6-a3bc-87348e224b13";

const customer = {
  role: "CUSTOMER" as const,
  firstName: "María José",
  lastName: "O'Connor",
  phone: "351 506-7276",
  email: "maria@example.com",
  password: "una-clave-larga",
  customerLocalityId: LOCALITY,
  customerNeighborhood: "Nueva Córdoba",
  professionId: "",
  serviceAreas: [],
};

describe("registerSchema", () => {
  it("acepta un cliente válido y normaliza el teléfono", () => {
    const result = registerSchema.parse(customer);
    expect(result.phone).toBe("3515067276");
  });

  it("al cliente le exige localidad y barrio, no oficio ni zonas", () => {
    const result = registerSchema.safeParse({ ...customer, customerLocalityId: "", customerNeighborhood: "" });
    const paths = result.error?.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["customerLocalityId", "customerNeighborhood"]));
    expect(paths).not.toContain("professionId");
  });

  it("al profesional le exige oficio y al menos una zona", () => {
    const result = registerSchema.safeParse({ ...customer, role: "PROFESSIONAL", customerLocalityId: "", customerNeighborhood: "" });
    const paths = result.error?.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["professionId", "serviceAreas"]));
    expect(paths).not.toContain("customerNeighborhood");
  });

  it("rechaza nombres con números y contraseñas cortas, como el backend", () => {
    const result = registerSchema.safeParse({ ...customer, firstName: "A1", password: "1234567" });
    const paths = result.error?.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(expect.arrayContaining(["firstName", "password"]));
  });
});

describe("phoneSchema", () => {
  it.each(["+5493515067276", "3515067276", "(351) 506-7276"])("acepta %s", (value) => {
    expect(phoneSchema.safeParse(value).success).toBe(true);
  });
  it.each(["1234567", "351-ABC-7276", "+54 9 351 506 7276 0000"])("rechaza %s", (value) => {
    expect(phoneSchema.safeParse(value).success).toBe(false);
  });
});

describe("toRegistrationBody", () => {
  it("cliente: solo el barrio, sin campos del profesional (el backend rechaza campos de más)", () => {
    expect(toRegistrationBody(profileSchema.parse(customer))).toEqual({
      role: "CUSTOMER",
      firstName: "María José",
      lastName: "O'Connor",
      phone: "3515067276",
      neighborhood: { localityId: LOCALITY, name: "Nueva Córdoba" },
    });
  });

  it("profesional: oficio y zonas; una zona sin barrio cubre toda la localidad", () => {
    const body = toRegistrationBody(
      profileSchema.parse({
        ...customer,
        role: "PROFESSIONAL",
        professionId: PROFESSION,
        serviceAreas: [
          { localityId: LOCALITY, neighborhoodName: "" },
          { localityId: LOCALITY, neighborhoodName: " Alberdi " },
        ],
      }),
    );
    expect(body).toEqual({
      role: "PROFESSIONAL",
      firstName: "María José",
      lastName: "O'Connor",
      phone: "3515067276",
      professionId: PROFESSION,
      serviceAreas: [{ localityId: LOCALITY }, { localityId: LOCALITY, neighborhoodName: "Alberdi" }],
    });
  });
});

describe("resetPasswordSchema", () => {
  it("exige que las contraseñas coincidan", () => {
    const result = resetPasswordSchema.safeParse({ newPassword: "una-clave-larga", confirmPassword: "otra-clave-larga" });
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/panel/pedidos", "/panel/pedidos"],
    [null, "/panel"],
    ["https://malicioso.com", "/panel"],
    ["//malicioso.com", "/panel"],
    ["/\\malicioso.com", "/panel"],
  ])("%s → %s", (value, expected) => {
    expect(safeNextPath(value)).toBe(expected);
  });
});
