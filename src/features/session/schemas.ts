import { z } from "@/lib/zod";

/*
 * Validaciones del navegador. Copian las reglas del backend (docs/BACKEND_ENDPOINTS.md, Anexo A:
 * LoginDto, RegisterDto, NeighborhoodInputDto, ServiceAreaInputDto, ResetPasswordDto, MfaVerifyDto)
 * para avisar antes de enviar. El backend vuelve a validar todo: esto es solo experiencia de usuario.
 */

const email = z.email("Ingresá un email válido.").max(254, "El email es demasiado largo.");

/** Mismo patrón que el backend: empieza con letra; letras, espacios, apóstrofo, punto y guion. */
export const personName = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresá tu ${label}.`)
    .max(60, `El ${label} puede tener hasta 60 caracteres.`)
    .regex(/^\p{L}[\p{L} '.-]*$/u, `El ${label} solo puede tener letras, espacios, apóstrofos, puntos y guiones.`);

export const newPasswordSchema = z
  .string()
  .min(8, "La contraseña tiene que tener al menos 8 caracteres.")
  .max(128, "La contraseña puede tener hasta 128 caracteres.");

/**
 * Teléfono: el backend acepta `+` opcional y de 8 a 15 dígitos. Se aceptan espacios, guiones y
 * paréntesis al escribir y se quitan antes de validar.
 */
export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{8,15}$/, "Ingresá un teléfono con código de área, solo números (8 a 15 dígitos)."));

const uuid = (message: string) => z.uuid(message);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña.").max(128, "La contraseña puede tener hasta 128 caracteres."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const mfaSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("code"), code: z.string().regex(/^\d{6}$/, "El código tiene 6 números.") }),
  z.object({
    method: z.literal("recovery"),
    recoveryCode: z.string().trim().min(10, "Revisá el código de recuperación.").max(11, "Revisá el código de recuperación."),
  }),
]);
export type MfaValues = z.infer<typeof mfaSchema>;

export const neighborhoodName = z
  .string()
  .trim()
  .min(2, "El barrio tiene que tener al menos 2 caracteres.")
  .max(60, "El barrio puede tener hasta 60 caracteres.");

const serviceArea = z.object({
  localityId: uuid("Elegí la localidad."),
  /** Vacío = toda la localidad. */
  neighborhoodName: z.union([z.literal(""), neighborhoodName]),
});

/** Máximo de zonas por profesional (MAX_SERVICE_AREAS del backend, por defecto 20). */
export const MAX_SERVICE_AREAS = 20;

/** Ubicación según el rol: barrio del cliente, u oficio y zonas del profesional. */
const locationShape = {
  role: z.enum(["CUSTOMER", "PROFESSIONAL"]),
  // Cliente
  customerLocalityId: z.string(),
  customerNeighborhood: z.string(),
  // Profesional
  professionId: z.string(),
  serviceAreas: z.array(serviceArea).max(MAX_SERVICE_AREAS, `Podés cargar hasta ${MAX_SERVICE_AREAS} zonas.`),
};

type LocationOutput = z.output<z.ZodObject<typeof locationShape>>;

function checkLocation(values: LocationOutput, ctx: z.RefinementCtx) {
  if (values.role === "CUSTOMER") {
    if (!z.uuid().safeParse(values.customerLocalityId).success) {
      ctx.addIssue({ code: "custom", path: ["customerLocalityId"], message: "Elegí la localidad." });
    }
    const neighborhood = neighborhoodName.safeParse(values.customerNeighborhood);
    if (!neighborhood.success) {
      ctx.addIssue({
        code: "custom",
        path: ["customerNeighborhood"],
        message: values.customerNeighborhood.trim() ? neighborhood.error.issues[0]!.message : "Ingresá el barrio.",
      });
    }
  } else {
    if (!z.uuid().safeParse(values.professionId).success) {
      ctx.addIssue({ code: "custom", path: ["professionId"], message: "Elegí el oficio principal." });
    }
    if (values.serviceAreas.length === 0) {
      ctx.addIssue({ code: "custom", path: ["serviceAreas"], message: "Agregá al menos una zona de trabajo." });
    }
  }
}

/** Solo la ubicación: la usa el admin al cambiar el rol de una cuenta (ChangeRoleDto). */
export const locationSchema = z.object(locationShape).superRefine(checkLocation);
export type LocationValues = z.input<typeof locationSchema>;

/** Datos personales y de ubicación: comunes al registro con contraseña y al registro con Google. */
export const profileSchema = z
  .object({
    ...locationShape,
    firstName: personName("nombre"),
    lastName: personName("apellido"),
    phone: phoneSchema,
  })
  .superRefine(checkLocation);
export type ProfileValues = z.input<typeof profileSchema>;

/** La parte de ubicación del cuerpo de registro o de cambio de rol, solo con los campos del rol. */
export function toLocationBody(values: LocationOutput) {
  if (values.role === "CUSTOMER") {
    return { neighborhood: { localityId: values.customerLocalityId, name: values.customerNeighborhood.trim() } };
  }
  return {
    professionId: values.professionId,
    serviceAreas: values.serviceAreas.map((area) => ({
      localityId: area.localityId,
      ...(area.neighborhoodName.trim() ? { neighborhoodName: area.neighborhoodName.trim() } : {}),
    })),
  };
}

export const registerSchema = profileSchema.and(
  z.object({
    email,
    password: newPasswordSchema,
  }),
);
export type RegisterValues = z.input<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({ newPassword: newPasswordSchema, confirmPassword: z.string() })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/** Arma el cuerpo de `POST /auth/register` o `/auth/google/register` con solo los campos del rol. */
export function toRegistrationBody(values: z.output<typeof profileSchema>) {
  return {
    role: values.role,
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    ...toLocationBody(values),
  };
}

/**
 * Destino después de ingresar. Solo rutas internas (`/algo`): evita redirecciones abiertas a otros
 * sitios con `?siguiente=https://...` o `//otro.sitio`.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/panel"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
