import type { NextConfig } from "next";

/**
 * Encabezados de seguridad base para todas las rutas. La Content-Security-Policy se agrega en la
 * etapa de cierre: con nonces obliga a renderizar dinámicamente, y hay que medir ese costo.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Las páginas de enlaces de email llevan `?token=`: no se filtra el path completo a otros sitios.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La app nunca se muestra dentro de un iframe (clickjacking). Lo reemplaza `frame-ancestors` con la CSP.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Sin `includeSubDomains` ni `preload` hasta definir el dominio de producción (decisión pendiente).
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  // Solo `next dev`: deja que un celular de la red local cargue los recursos de desarrollo (Next los
  // bloquea si el pedido viene de otra dirección que localhost). No afecta la build de producción.
  allowedDevOrigins: ["192.168.0.253"],
  images: {
    // Next 16 solo acepta las calidades listadas: 60 para las fotos del héroe (bajo un velo oscuro), 75 el resto.
    qualities: [60, 75],
    // Archivos públicos subidos por los usuarios (Cloudinary). Se restringe a la carpeta de la cuenta
    // cuando esté definido el cloud name de producción.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
