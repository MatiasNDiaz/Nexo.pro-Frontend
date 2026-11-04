# Contrato entre el frontend y el backend

> Reglas técnicas que el frontend de Repara Ya tiene que cumplir para consumir la API actual. Todo está tomado del código del backend (`Nexo.pro-Backend`), con la ruta del archivo como evidencia. El detalle de cada ruta (cuerpo, respuesta, errores) está en [BACKEND_ENDPOINTS.md](BACKEND_ENDPOINTS.md); qué puede ver o hacer cada rol, en [BACKEND_ROLES_AND_PERMISSIONS.md](BACKEND_ROLES_AND_PERMISSIONS.md).

## 1. Base de la API

- **URL base:** `<origen de la API>/api/v1`. El prefijo sale de `API_PREFIX` y la versión va en la ruta (`src/app.setup.ts`).
- **Formato:** JSON en UTF-8. Las fechas van como texto ISO 8601 en UTC y los ids son UUID.
- **Tamaño máximo del cuerpo:** 100 KB (`BODY_LIMIT`). Los archivos no pasan por la API: ver §8.
- **Swagger:** solo en desarrollo (`SWAGGER_ENABLED`; prohibido en producción).

## 2. Dominio y cookies

**La sesión vive solo en cookies `HttpOnly`.** El frontend **nunca** ve, guarda ni manda tokens de sesión: nada en `localStorage`, `sessionStorage`, en el cuerpo ni en logs.

| Cookie (producción) | En desarrollo | Path | Dura | Para qué |
| --- | --- | --- | --- | --- |
| `__Host-nx_at` | `nx_at` | `/` | 10 min (admin 5) | Access token |
| `__Secure-nx_rt` | `nx_rt` | `/api/v1/auth` | hasta 14 días sin uso (admin 12 h), máx. 30 días (admin 7) | Refresh token |
| `__Host-nx_csrf` | `nx_csrf` | `/` | la sesión | Mitad del par CSRF |
| `__Secure-nx_mfa` | `nx_mfa` | `/api/v1/auth/mfa` | 5 min | Desafío del segundo factor (admin) |
| `__Secure-nx_oauth` | `nx_oauth` | `/api/v1/auth/google` | 10 min | State, nonce y PKCE de Google (cifrado) |
| `__Secure-nx_oauth_pending` | `nx_oauth_pending` | `/api/v1/auth/google` | 30 min | Vínculo o registro con Google a medio terminar |
| `__Secure-nx_device` | `nx_device` | `/api/v1/auth` | 400 días | Reconoce el dispositivo (aviso de inicio de sesión) |

Fuente: `src/config/auth.config.ts` y `src/auth/services/auth-cookies.service.ts`. Todas son `HttpOnly`, `SameSite=Lax` y `Secure` en producción.

**Consecuencias para el despliegue (confirmadas):**
- **Mismo sitio:** con `SameSite=Lax` el navegador **no manda** las cookies en `fetch` entre sitios distintos. El frontend y la API tienen que compartir el dominio registrable (por ejemplo `app.dominio.com` y `api.dominio.com`). Un frontend en `*.vercel.app` con la API en `*.railway.app` **no funcionaría**.
- **Orígenes exactos:** el origen del frontend tiene que estar en `FRONTEND_ORIGINS`, con esquema y puerto, sin barra ni comodines.
- **`credentials: 'include'`** en todos los `fetch` (o `withCredentials: true` en axios y Socket.IO).

## 3. Encabezados

| Encabezado | Cuándo | Si falta |
| --- | --- | --- |
| `Content-Type: application/json` | Pedidos con cuerpo | `400` / `415` |
| `X-Requested-With: XMLHttpRequest` | **Todo** `POST`, `PUT`, `PATCH` y `DELETE`, con o sin sesión | `403 MISSING_REQUESTED_WITH` |
| `Origin` | Lo pone el navegador; tiene que estar en la lista | `403 ORIGIN_NOT_ALLOWED` |
| `X-CSRF-Token: <csrfToken>` | Todo `POST`, `PUT`, `PATCH` y `DELETE` **con sesión**, y en `/auth/refresh` y `/auth/logout` | `403 CSRF_INVALID` |

Fuente: `src/common/guards/origin.guard.ts` y `csrf.guard.ts`. Solo los avisos de Mercado Pago y del proveedor de identidad se saltean estos controles; el frontend no los usa.

**Respuesta:** la API devuelve `X-Request-Id` (expuesto por CORS) y el mismo valor va en `requestId` de los errores. Conviene mostrarlo en las pantallas de error para soporte.

## 4. Token CSRF

- **De dónde sale:** el cuerpo de las respuestas de sesión trae `csrfToken`:
  - `POST /auth/login`, `/auth/mfa/verify` y `/auth/refresh`;
  - registro con Google, vínculos con Google y `POST /auth/password/set`.
- **Dónde se guarda:** **solo en memoria** (una variable del cliente HTTP). No es un secreto de sesión, pero tampoco se persiste.
- **Al recargar la página:** se pierde. Se pide de nuevo con `GET /auth/csrf`, que funciona con la cookie de refresh aunque el access haya vencido; sin sesión responde `401 UNAUTHORIZED`.
- **Es por dispositivo:** está ligado a la familia de la sesión, así que no cambia al renovar el access. Después de un `refresh`, usar el que devuelve.

**Arranque recomendado de la app:**

```text
GET /auth/csrf ──401──> sin sesión (pantallas públicas)
     └─200──> guardar csrfToken en memoria ──> GET /auth/me ──> usuario y estado
```

## 5. Renovar la sesión

```text
pedido ──401 ACCESS_TOKEN_EXPIRED──> POST /auth/refresh (X-CSRF-Token)
                                        ├─200 {csrfToken} ──> reintentar UNA vez
                                        └─401 INVALID_REFRESH_TOKEN | REFRESH_TOKEN_REUSED ──> a "Ingresar"
```

- **Solo con `ACCESS_TOKEN_EXPIRED`.** Un `401 UNAUTHORIZED` significa que no hay sesión y no se reintenta (`src/common/guards/jwt-auth.guard.ts`).
- **Un refresh a la vez:** si varios pedidos vencen juntos, esperan al mismo `refresh`. Mandar dos refresh con la misma cookie fuera de la gracia de 10 segundos revoca el dispositivo (`REFRESH_TOKEN_REUSED`).
- **Límite:** `POST /auth/refresh` admite 30 pedidos por minuto.
- **Cierre de sesión:**
  - `POST /auth/logout` cierra este dispositivo; es tolerante: borra las cookies aunque la sesión ya no exista.
  - `POST /auth/logout-all` cierra todos.
  - Después, el frontend borra su estado en memoria y cierra la conexión de tiempo real.

## 6. Login y segundo factor

- **Login:** `POST /auth/login` con `{ email, password, captchaToken? }`. Responde una de dos:
  - `200 { user, csrfToken }`: sesión iniciada;
  - `200 { mfaRequired: true }`: solo para el admin. Sigue `POST /auth/mfa/verify` con `{ code }` o `{ recoveryCode }` dentro de 5 minutos.
- **Errores:**
  - `401 INVALID_CREDENTIALS`: siempre el mismo mensaje, sin decir si el email existe;
  - `429` por bloqueo de cuenta o de IP;
  - `400 CAPTCHA_REQUIRED` (`src/integrations/abuse/captcha.service.ts:10`): hay que mostrar Turnstile y mandar `captchaToken`.
- **Estado de la cuenta:** `GET /auth/me` devuelve `status`, `statusReason` (solo suspendida o baneada), `verificationStatus`, `emailVerified`, `avatarUrl`, `pendingAvatarUrl`, `hasPassword` y `googleLinked`. Con eso el frontend decide qué pantallas mostrar (§11).

## 7. Errores

Formato único (`src/common/filters/all-exceptions.filter.ts`):

```json
{
  "statusCode": 409,
  "code": "REVIEW_WINDOW_CLOSED",
  "message": "Texto en español para mostrar",
  "details": [{ "field": "rating", "errors": ["..."] }],
  "requestId": "…",
  "timestamp": "2026-11-03T12:00:00.000Z"
}
```

- **Usar `code`** para decidir qué hacer, no `message` ni el estado HTTP solo. El catálogo completo de códigos por ruta está en el Anexo B de [BACKEND_ENDPOINTS.md](BACKEND_ENDPOINTS.md).
- **`message`** está en español y se puede mostrar tal cual. En los 5xx es genérico, sin detalles internos.
- **`details`** solo aparece en `400 VALIDATION_FAILED`: un elemento por campo, con nombres anidados (`neighborhood.name`).
  - **Campos de más:** mandar un campo que el DTO no declara también da `400` (`forbidNonWhitelisted`). El frontend no debe agregar campos extra.
- **Conflictos de base de datos:** dan `409 CONFLICT`.
- **Códigos por defecto:**

  | HTTP | Código |
  | --- | --- |
  | 400 | `BAD_REQUEST` |
  | 401 | `UNAUTHORIZED` |
  | 403 | `FORBIDDEN` |
  | 404 | `NOT_FOUND` |
  | 405 | `METHOD_NOT_ALLOWED` |
  | 409 | `CONFLICT` |
  | 413 | `PAYLOAD_TOO_LARGE` |
  | 415 | `UNSUPPORTED_MEDIA_TYPE` |
  | 422 | `UNPROCESSABLE_ENTITY` |
  | 429 | `TOO_MANY_REQUESTS` |
  | 500 | `INTERNAL_ERROR` |
  | 503 | `SERVICE_UNAVAILABLE` |

- **Límite de pedidos:** 100 por minuto por IP en toda la API (`THROTTLE_LIMIT`), con límites más bajos en rutas sensibles (ver cada ruta). Ante un `429`, esperar y no reintentar en bucle.

## 8. Archivos

Flujo único para fotos, videos y PDF:

```text
1. POST /uploads {purpose, kind}             → {file, upload: {method, url, fields, maxBytes, expiresAt}}
2. Validar en el navegador el tipo y que el tamaño no supere maxBytes
3a. method POST (Cloudinary): multipart a upload.url con todos los fields + "file". SIN cookies ni CSRF.
3b. method PUT  (solo desarrollo): PUT <origen API><upload.url> con el archivo crudo, cookies, CSRF y X-Requested-With.
4. POST /uploads/:id/complete                → file con status READY (o 4xx si el archivo no cumple)
5. Usar file.id en la ruta que corresponda (avatar, medios del perfil, adjunto, foro, evidencia, certificado)
```

- **Reglas:** propósitos, tipos, pesos y quién puede subir cada uno están en [BACKEND_BUSINESS_FLOWS.md §4](BACKEND_BUSINESS_FLOWS.md#4-archivos-subida-en-tres-pasos).
- **Plazos y límites:**
  - el ticket vence a los 30 minutos;
  - un archivo sin confirmar se descarta a las 24 horas;
  - hay hasta 10 subidas pendientes por usuario.
- **Archivos públicos:** usar la `url` que viene en las respuestas. Con disco local es relativa: anteponer el origen de la API.
- **Archivos privados:** `GET /chat/attachments/:fileId` y las evidencias de moderación responden `302` a un enlace de 5 minutos.
  - Se pueden usar como `src`; el navegador manda las cookies porque es el mismo sitio.
  - El enlace final no se guarda.

## 9. Listas y paginación

Hay tres formas, según la ruta (cada una está en [BACKEND_ENDPOINTS.md](BACKEND_ENDPOINTS.md)):

| Forma | Pedido | Respuesta | Dónde |
| --- | --- | --- | --- |
| Paginada | `?page=1&limit=20` | `{ data: [...], meta: { page, limit, total, totalPages } }` | Catálogo, foro, reseñas, pagos, paneles del admin, entre otras |
| Hacia atrás por fecha | `?before=<ISO>&limit=30` (máx. 50) | Lista de mensajes | Mensajes del chat |
| Lista completa | — | Arreglo | Listas cortas (oficios, mis favoritos, mis dispositivos, etc.) |

- **Filtros:** van como parámetros de consulta validados con el mismo formato de error (`400 VALIDATION_FAILED`). Un parámetro desconocido también da `400`.

## 10. Tiempo real

- **Conexión:** `io('<origen API>/realtime', { withCredentials: true })` después de tener sesión. Usa la cookie de acceso, así que conviene conectar justo después de un login o refresh exitoso.
- **Si se rechaza:** llega `error { code: 'UNAUTHORIZED' }` y el servidor desconecta. Hacer `POST /auth/refresh` y reconectar.
- **Eventos** (solo del servidor): `message:new`, `message:updated`, `conversation:read` y `notification:new`. El detalle está en [BACKEND_INTEGRATIONS.md §8](BACKEND_INTEGRATIONS.md#8-tiempo-real-socketio).
- **Solo avisos:** todo se envía por REST. Al reconectar, volver a pedir por REST lo que se pudo perder (`GET /notifications/unread-count`, la conversación abierta).
- **Push:** mientras haya una conexión abierta no se manda push web (§13).

## 11. Qué puede hacer cada estado de cuenta

| Estado (`/auth/me`.status) | Qué puede hacer el frontend |
| --- | --- |
| `PENDING_VERIFICATION` | Solo las rutas habilitadas para este estado (51; ver la matriz de permisos): completar el perfil, verificar el email, subir la foto, iniciar la identidad, leer lo público. Con el resto da `403 ACCOUNT_STATE_NOT_ALLOWED` |
| `ACTIVE` | Todo lo que permita su rol (y, al profesional, su plan) |
| `SUSPENDED` / `BANNED` | Solo 6 rutas con sesión: `GET /auth/me`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout-all`, `GET /moderation/me` y `POST /moderation/appeals` (más las públicas, como `POST /auth/logout`). Mostrar `statusReason` y la opción de apelar |
| `DEACTIVATED` | No puede iniciar sesión; la restauración la hace el admin |

**Profesionales:** además del estado, muchas funciones exigen **plan vigente** (`livePlan`).
- **No hay un código único** para "sin plan"; depende del módulo. Por ejemplo:
  - `SUBSCRIPTION_REQUIRED` en archivos;
  - `PLAN_FEATURE_REQUIRED` en métricas;
  - `PLAN_LIMIT_REACHED` y `THEME_NOT_IN_PLAN` en el perfil;
  - `PROFESSIONAL_UNAVAILABLE` en chat y pedidos.

  En el chat, el profesional recibe `409 CUSTOMER_UNAVAILABLE` si el cliente dio de baja su cuenta (no tiene que ver con el plan).

  El código exacto de cada ruta está en [BACKEND_ENDPOINTS.md](BACKEND_ENDPOINTS.md).
- **Para decidir qué mostrar:** `GET /subscriptions/me` trae `live` (si el plan está vigente), el plan con sus límites y el vencimiento; `GET /subscriptions/plans` dice qué se puede pagar.

## 12. Páginas que el backend espera que existan

Los emails y las redirecciones apuntan a `FRONTEND_URL` más estas rutas (`src/auth/auth-mail.templates.ts`, `src/config/payments.config.ts`):

| Ruta del frontend | Llega con | Qué hace |
| --- | --- | --- |
| `/verificar-email` | `?token=` | `POST /auth/email/verify { token }` |
| `/restablecer-contrasena` | `?token=` | `POST /auth/password/reset { token, newPassword }` |
| `/vincular-google` | `?token=` | `POST /auth/google/link/confirm { token }` |
| `/cerrar-sesion` | `?token=` | Botón que hace `POST /auth/sessions/close-by-link { token }` (no automático al cargar) |
| `/ingresar/google` | `?resultado=session\|link\|signup\|error[&codigo=]` | Ver [BACKEND_INTEGRATIONS.md §4](BACKEND_INTEGRATIONS.md#4-login-con-google-openid-connect) |
| `/suscripcion/resultado` | Parámetros de Mercado Pago | Consultar `GET /subscriptions/me`; **no** confiar en los parámetros |

En todas, el token se lee de la URL, se manda en el cuerpo y después se quita de la barra de direcciones (`history.replaceState`) para que no quede en el historial ni se filtre por `Referer`.

## 13. Push web

1. `GET /notifications/push/key` → `{ enabled, publicKey }`. Si `enabled` es `false`, no ofrecerlo.
2. Pedir permiso al navegador **solo después de un gesto del usuario**.
3. Registrar un service worker y suscribirse con `applicationServerKey: publicKey`.
4. `POST /notifications/push/subscriptions` con `{ endpoint, keys: { p256dh, auth } }`.
5. En el service worker, mostrar `title` y `body` del aviso con `tag`. Al tocarlo, navegar según `targetType` y `targetId`.
6. Al cerrar sesión: `POST /notifications/push/subscriptions/remove`. El backend igual deja de mandar a suscripciones sin sesión.

## 14. Seguridad del lado del frontend

- **Texto de usuarios como texto:** nombres, mensajes, reseñas, foro, soporte y motivos se muestran como texto, **nunca** como HTML (sin `dangerouslySetInnerHTML` ni `v-html`). El backend no sanitiza HTML: guarda el texto tal cual.
- **Enlaces externos:** solo `checkoutUrl` de Mercado Pago y la redirección a Google.
- **Lo que no se guarda en el navegador:** datos sensibles de otros usuarios. La cookie `nx_device` no se toca.
- **Lo que el backend no expone:** datos del usuario que reportó (al denunciado), la versión original de mensajes editados (solo al admin desde un reporte), emails de otros usuarios y ubicación exacta.

## 15. Limitaciones conocidas que afectan al frontend

Detalle y evidencia en [BACKEND_AUDIT.md](BACKEND_AUDIT.md).

| # | Limitación | Impacto | Estado |
| --- | --- | --- | --- |
| H-01 | ~~El catálogo y el perfil público no devolvían el id de usuario del profesional~~ | Usar `professionalUserId` para chat, favoritos, pedidos y reportes de perfil | **Resuelto** (backend `0997e21`) |
| H-02 | ~~Si la otra parte de un chat fue anonimizada, listar o abrir la conversación fallaba con 500~~ | Con la otra parte dada de baja: `counterpart.deactivated: true`, `canWrite: false` y, anonimizada, el nombre «Cuenta eliminada». Mostrar el chat de solo lectura | **Resuelto** (backend `4e4f810`) |
| H-03 | No hay proveedor real de email | Sin verificación de email ni avisos por correo en producción; el backend no arranca con `NODE_ENV=production` | Confirmado |
| H-04 | `GET /platform-reviews/me` responde `200` con cuerpo vacío si no hay opinión | Tratar el cuerpo vacío como `null` | Confirmado |
| H-05 | Las solicitudes y contrataciones devuelven ids, no nombres | Hay que cruzar con la conversación o pedir otros datos | Confirmado |
| H-07 | Clientes sin activar no pueden abrir consultas de soporte en la app | Ofrecerles el formulario público | Confirmado |
| H-08 | La lista de conversaciones trae como máximo 100, sin paginación | Para casi todos los usuarios alcanza; no hay "cargar más" | Confirmado |
| H-12 | Cookies `SameSite=Lax` | Frontend y API en el mismo sitio (§2) | Confirmado |
| — | "Olvidé mi contraseña" está apagado (404) | Ofrecer "contactá a soporte"; el admin dispara el restablecimiento | Decisión de producto (ADR 0002), no es un defecto |
