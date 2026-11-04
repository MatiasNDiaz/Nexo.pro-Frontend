# Frontend: decisiones técnicas y pendientes

> Decisiones de arquitectura del frontend de Repara Ya y lo que quedó pendiente, con su motivo. Complementa la auditoría del backend (`BACKEND_*.md`); no la reemplaza.

## Datos y sesión

| Decisión | Motivo |
| --- | --- |
| Los datos **privados** se piden solo desde el navegador | Las cookies de sesión (`__Host-`) son del dominio de la API: el servidor de Next nunca las recibe |
| El token CSRF vive **solo en memoria** y se recupera con `GET /auth/csrf` | Contrato §4. Nada de la sesión en `localStorage`, cuerpos ni logs |
| Una sola renovación de sesión compartida ante `ACCESS_TOKEN_EXPIRED` | Dos refresh con la misma cookie revocan el dispositivo (contrato §5) |
| Al cerrar sesión se descartan los datos privados, pero la consulta de sesión se pone en `null` en vez de borrarse | Con `clear()`, el header quedaba mostrando al usuario anterior (error encontrado en las pruebas) |
| No se muestran los detalles de validación del backend | Vienen en inglés técnico; el frontend valida con las mismas reglas y muestra textos propios |

## Páginas públicas (catálogo, perfil)

| Decisión | Motivo |
| --- | --- |
| Se arman en el servidor con `"use cache"` (perfil `minutes`; oficios y localidades `days`) | Velocidad, buscadores, y no superar el límite del backend de 100 pedidos por minuto por IP |
| El servidor de Next se identifica como robot (`User-Agent` con "bot") | El backend no cuenta a los robots en las métricas Premium (ADR 0033); si no, todas las visitas serían "una persona" |
| El navegador repite la consulta del catálogo o del perfil (`ViewBeacon`, `ProfileContact`) | Es la que cuenta la visita real para las métricas, con la sesión o la IP de la persona |
| **Teléfono y email del profesional no van en el HTML**; se muestran con "Ver contacto" | El HTML queda en caché: se podrían recolectar sin pasar por el límite del backend contra la recolección de contactos (C-19, 30 por minuto por IP) |
| JSON-LD escapado (`<`, `>`, `&`, U+2028, U+2029) y sin datos de contacto | Evita cerrar el `<script>` con texto del usuario |
| Redes del profesional: solo `http(s)`, con `rel="nofollow ugc noopener noreferrer"` | Un `javascript:` en un enlace es XSS aunque React escape el texto |
| Imágenes de Cloudinary optimizadas por `next/image`; las del almacenamiento local, sin optimizar | `next/image` bloquea IPs locales por seguridad (solo afecta desarrollo) |
| Filtros en la URL en castellano y el oficio por slug | URLs legibles e indexables (`/profesionales?oficio=electricista`) |

## Foro, contacto y SEO

| Decisión | Motivo |
| --- | --- |
| Foro de solo lectura en esta etapa; publicar, responder y "me gusta" llegan con el panel | No se muestran botones que todavía no funcionan |
| Respuestas eliminadas u ocultas se muestran como "Respuesta eliminada" solo si el backend las devuelve (cuando tienen respuestas) | Igual que el backend: se conserva el hilo sin mostrar el contenido |
| Contacto público con las mismas reglas que `ContactDto`, CAPTCHA si hay clave y aviso específico ante el límite de 3 por hora | El backend responde `{ received: true }`; el plazo que se comunica es de 48 a 72 horas hábiles |
| `robots.txt` permite todo; las páginas privadas no se bloquean ahí | Llevan `noindex`: un buscador bloqueado por robots no lo ve y podría listar la URL igual |
| `sitemap.xml` con páginas fijas, perfiles (hasta 1000) y foro (hasta 500), en caché de una hora | Cada página de la lista es un pedido al backend; si la API no responde, quedan las páginas fijas |
| La aparición al hacer scroll se dispara cuando asoman 40 px | Con un umbral en porcentaje, un bloque alto en el borde inferior quedaba como una franja vacía |

## 404

Las rutas inexistentes caen en `(sitio)/[...resto]` y muestran `(sitio)/not-found.tsx` dentro del layout del sitio. El `not-found.tsx` raíz es mínimo porque Next lo incluye en lo que manda a **todas** las páginas: con header y footer, cada página pesaba alrededor de un 25 % más.

Costo aceptado: sin JavaScript, el 404 se ve en blanco. El estado HTTP sigue siendo 404 con `noindex`, que es lo que importa para los buscadores, y el resto de la app necesita JavaScript igual.

Un perfil inexistente responde **200** con `noindex` y la pantalla de "no disponible". Es el comportamiento documentado de Next cuando `notFound()` ocurre después de empezar a enviar la página.

## Diferencias con el contrato del backend

| Tema | Detalle | Qué hace el frontend |
| --- | --- | --- |
| `PublicAvailabilityDto` | El OpenAPI declara `slots` y `exceptions` como `string[]`; el código devuelve objetos | Tipado a mano en `src/features/catalog/types.ts` según el código |
| `MfaRequiredDto` | No figura en el OpenAPI (el login declara solo la respuesta con sesión) | Tipado a mano en `src/features/session/api.ts` |

## Pendientes y riesgos

| Tema | Detalle | Cuándo |
| --- | --- | --- |
| Límite del detalle de perfil desde el servidor de Next | Todos los pedidos del servidor salen de una IP: con muchos perfiles distintos sin caché podría llegar a 30 por minuto. Solución posible en el backend: reconocer al servidor del frontend con un encabezado secreto | Antes de producción |
| Personalización del perfil (`theme`: color, fuente, animación) | El backend la devuelve según el plan; todavía no se aplica en la página | Etapa de diseño |
| Abrir chat, favoritos, pedir presupuesto y reportar desde el perfil | Ya es posible con `professionalUserId` (H-01 resuelto); las pantallas llegan con el panel | Etapa 5 |
| Respuesta al formulario de contacto | El admin responde por email: sin proveedor real de email (H-03) no le llega a quien escribió | Antes de producción |
| Consentimiento de términos en el registro | El backend no registra la aceptación; los textos legales son provisorios | Con el texto legal definitivo |
