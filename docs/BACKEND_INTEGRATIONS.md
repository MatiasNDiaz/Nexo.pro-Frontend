# Backend: integraciones externas

> Servicios de terceros que usa el backend, cómo se eligen y qué implica cada uno para el frontend. Solo figuran los **nombres** de las variables de entorno, nunca sus valores. Fuente: `src/config/env.validation.ts` y `src/integrations/*`.

## 1. Cómo están armadas

- **Interfaz más adaptadores:** cada integración es una interfaz con un adaptador real y uno simulado (`fake`, `console`, `memory` o `local`). La variable `*_PROVIDER` elige cuál se usa.
- **Producción:** la validación del entorno **impide arrancar** con los simulados (`productionRules`, `env.validation.ts:424`).
- **Proveedores opcionales:** con `disabled`, la función queda apagada y sus rutas responden un error explícito (por ejemplo `GOOGLE_LOGIN_DISABLED`).

| Integración | Variable que la elige | Valores posibles | Valor por defecto | Estado real |
| --- | --- | --- | --- | --- |
| Almacenamiento de archivos | `STORAGE_PROVIDER` | `local`, `cloudinary` | `local` | Cloudinary implementado; `local` solo para desarrollo |
| Pagos | `PAYMENTS_PROVIDER` | `disabled`, `mercadopago`, `fake` | `disabled` | Mercado Pago implementado; requiere credenciales |
| Login con Google | `GOOGLE_PROVIDER` | `disabled`, `google`, `fake` | `disabled` | Implementado (OpenID Connect); requiere credenciales |
| Verificación de identidad | `IDENTITY_PROVIDER` | `manual`, `fake` | `manual` | **Solo manual** (decide el admin); no hay proveedor externo |
| Email | `MAIL_PROVIDER` | `console`, `memory` | `console` | **No hay proveedor real** (ver §6) |
| Push web | `PUSH_PROVIDER` | `disabled`, `webpush`, `fake` | `disabled` | Implementado (VAPID); requiere claves |
| CAPTCHA | `TURNSTILE_SECRET_KEY` (presente o no) | — | apagado | Cloudflare Turnstile implementado |
| Contraseñas filtradas | `PASSWORD_BREACH_CHECK` | `true`/`false` | `false` | Have I Been Pwned implementado |
| Ciudad aproximada | `CLOUDFLARE_EDGE_SECRET` (presente o no) | — | sin ciudad | Encabezados de Cloudflare |
| Reporte de errores | `SENTRY_DSN` (presente o no) | — | apagado | Sentry implementado |
| Base de datos | `DATABASE_URL`, `DATABASE_MIGRATIONS_URL` | — | — | PostgreSQL 17 |

## 2. Almacenamiento: Cloudinary y disco local

Archivos: `src/integrations/storage/*` y `src/uploads/*`. Variables: `STORAGE_PROVIDER`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER` y `STORAGE_LOCAL_DIR`.

- **Subida directa del navegador:** el archivo no pasa por la API. `POST /uploads` devuelve un ticket (`UploadTicketDto`: `method`, `url`, `fields`, `maxBytes`, `expiresAt`); dura 30 minutos (`UPLOAD_TICKET_TTL_MS`).
  - **Con Cloudinary:** `method: "POST"` a `https://api.cloudinary.com/v1_1/<cloud>/<tipo>/upload`, en `multipart/form-data`, con todos los `fields` tal cual más el campo `file`. La firma la arma el backend. **No mandar cookies ni `X-CSRF-Token` a Cloudinary.**
  - **Con disco local:** `method: "PUT"` a la ruta **relativa** `/api/v1/uploads/:id/content`, a la que hay que anteponer el origen de la API. Como es la propia API, exige cookies, `X-CSRF-Token`, `X-Requested-With: XMLHttpRequest` y `Origin`. Solo existe en desarrollo.
- **Confirmación:** `POST /uploads/:id/complete`. El backend inspecciona el archivo real (tipo por contenido, peso y duración del video) y lo deja `READY` o `REJECTED`.
- **Archivos públicos:** la `url` sale en `FileResponseDto.url` y en los DTO que los usan. Con disco local es una ruta de la API (anteponer su origen).
- **Archivos privados** (adjuntos del chat y evidencias de reportes):
  - se piden a la API: `GET /chat/attachments/:fileId` y la ruta de evidencias de moderación;
  - la API autoriza y responde `302` a un enlace firmado de Cloudinary de **5 minutos**, o, con disco local, entrega el contenido;
  - sirven como `src` de `<img>` o `<video>` porque las cookies viajan. Un enlace firmado no se guarda: hay que volver a pedir la ruta.
- **Ocultar contenido** (admin o plan): el archivo pasa a privado en Cloudinary (`setAccess`).

## 3. Pagos: Mercado Pago

Archivos: `src/integrations/payments/*` y `src/payments/*`. Variables: `PAYMENTS_PROVIDER`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` y `API_PUBLIC_URL`.

- **Modelo** (ADR 0026): Checkout Pro de un solo pago por período. **No hay suscripción automática ni débito recurrente.**
- **Ida:** `POST /subscriptions/checkout` crea el pago `CREATED` y una preferencia con:
  - `external_reference` = id del pago interno;
  - `notification_url` = `<API_PUBLIC_URL>/api/v1/webhooks/payments`;
  - `back_urls` (éxito, pendiente y fallo) = `<FRONTEND_URL>/suscripcion/resultado`.

  El frontend redirige a `checkoutUrl`.
- **Aviso:** `POST /webhooks/payments` es público y no usa cookies ni CSRF. Lo llama Mercado Pago, nunca el frontend.
  - Se valida la firma `x-signature` con `MERCADOPAGO_WEBHOOK_SECRET`.
  - El backend consulta el pago a la API de Mercado Pago y no confía en el cuerpo del aviso.
  - Monto, moneda y plan se comparan con lo esperado.
  - Cada evento se registra (`payment_events`) para no aplicarlo dos veces.
- **Vuelta:** la página `/suscripcion/resultado` del frontend **no debe deducir el resultado de los parámetros de la URL**. Tiene que consultar `GET /subscriptions/me` (y opcionalmente `GET /subscriptions/payments`); el aviso puede llegar segundos después.
- **Reembolsos y contracargos:** llegan por el mismo aviso y revierten el período (`REFUNDED`, `CHARGED_BACK`).
- **Facturación (AFIP):** **no implementada**.

## 4. Login con Google (OpenID Connect)

Archivos: `src/integrations/oauth/*` y `src/auth/google/*`. Variables: `GOOGLE_PROVIDER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_CALLBACK_URL`.

- **Inicio:** es una **navegación**, no un `fetch`. El frontend hace `window.location = <API>/api/v1/auth/google`. La API guarda state, nonce y PKCE en la cookie cifrada `nx_oauth` (10 minutos) y redirige a Google.
- **Callback:** Google vuelve a `/api/v1/auth/google/callback` y la API **siempre** redirige a `<FRONTEND_URL>/ingresar/google?resultado=<…>[&codigo=<…>]`:

  | `resultado` | Qué pasó | Qué hace el frontend |
  | --- | --- | --- |
  | `session` | La cuenta de Google ya estaba vinculada: hay sesión (cookies puestas) | `GET /auth/csrf` y `GET /auth/me`, y entrar |
  | `link` | El email ya existe con contraseña: hay que probar que es el dueño | `GET /auth/google/pending`; luego `POST /auth/google/link` (contraseña) o `POST /auth/google/link/email` (enlace) |
  | `signup` | Email nuevo: hay que completar el registro | `GET /auth/google/pending` y `POST /auth/google/register` con los mismos datos que el registro común |
  | `error` | Falló | Mostrar el mensaje según `codigo`: `CANCELLED`, `INVALID_STATE`, `GOOGLE_FAILED`, `EMAIL_NOT_VERIFIED`, `ACCOUNT_UNAVAILABLE`, `GOOGLE_NOT_ALLOWED` (admin), `OTHER_GOOGLE_ACCOUNT` |

- **Pendiente de vincular o registrar:** dura 30 minutos (cookie `nx_oauth_pending`). Vencido: `GOOGLE_PENDING_EXPIRED`.
- **Vínculo por email:** el enlace llega a `/vincular-google?token=…` y se confirma con `POST /auth/google/link/confirm`.
- **Desvincular:** `DELETE /auth/google/link`. Si la cuenta no tiene contraseña, primero hay que crearla.
- **El admin no puede usar Google.**

## 5. Verificación de identidad

Archivos: `src/integrations/identity/*` y `src/identity-verification/*`. Variables: `IDENTITY_PROVIDER`, `IDENTITY_MAX_ATTEMPTS` y `FAKE_IDENTITY_WEBHOOK_SECRET`.

- **`manual`** (el único válido en producción): el intento queda `PENDING` y lo resuelve el admin. No hay pantalla de un tercero, no se guarda DNI, selfie ni biometría, y no hay redirección.
- **`fake`:** solo desarrollo y tests. Simula un proveedor con avisos firmados en `POST /webhooks/identity`.
- **Proveedor real (KYC):** **no está integrado**. Su incorporación y el almacenamiento de documentos o biometría requieren aprobación expresa del fundador y revisión legal.

## 6. Email

Archivos: `src/integrations/mail/*`. Variables: `MAIL_PROVIDER` y `MAIL_FROM`.

- **Adaptadores:** solo existen `console` (imprime en el log) y `memory` (tests). **No hay adaptador para un proveedor real.**
- **Consecuencia confirmada:** `productionRules` rechaza `console` y `memory` con `NODE_ENV=production` (`env.validation.ts:461`). **Hoy el backend no puede arrancar en modo producción** hasta que se integre un proveedor real; está listado en `docs/checklist-produccion.md` del backend.
- **Emails que manda:**
  - verificación de email (`/verificar-email?token=…`);
  - restablecer contraseña (`/restablecer-contrasena?token=…`);
  - vincular Google (`/vincular-google?token=…`);
  - aviso de dispositivo nuevo (`/cerrar-sesion?token=…`);
  - aviso de "ya tenés cuenta" en el registro;
  - respuesta de soporte;
  - alertas de seguridad al admin.
- **Páginas que tiene que tener el frontend:** las de los enlaces anteriores. Todas leen `token` de la URL y lo mandan en el **cuerpo** del `POST` correspondiente. El token no se guarda ni se loguea.

## 7. Push web (VAPID)

Archivos: `src/integrations/push/*` y `src/notifications/push.service.ts`. Variables: `PUSH_PROVIDER`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`.

- **Suscripción:**
  1. `GET /notifications/push/key` devuelve `{ enabled, publicKey }`. Con `enabled: false` no se ofrece activar avisos.
  2. El service worker se suscribe con `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`.
  3. `POST /notifications/push/subscriptions` con `endpoint` y `keys` (`p256dh`, `auth`). Solo se aceptan endpoints de los servicios de push conocidos (`isPushServiceEndpoint`).
- **Baja:** `POST /notifications/push/subscriptions/remove`.
- **Preferencias por categoría:** `GET` / `PUT /notifications/preferences`.
- **Atado a la sesión:** la suscripción queda atada a la sesión del dispositivo. Al cerrar sesión deja de recibir y la limpieza nocturna la borra.
- **Contenido del aviso** (JSON que recibe el service worker): `id`, `type`, `category`, `title`, `body`, `targetType`, `targetId` y `tag`. Con el mismo `tag` el aviso se reemplaza.
- **Cuándo no se manda:** si el usuario tiene alguna conexión de tiempo real abierta (`isOnline`).

## 8. Tiempo real (Socket.IO)

Archivo: `src/realtime/realtime.gateway.ts`.

- **Conexión:** namespace `/realtime` en el mismo origen de la API, con las cookies del navegador (`withCredentials: true`). Se valida el `Origin` contra `FRONTEND_ORIGINS`.
- **Rechazo:** sin cookie de acceso válida, el servidor emite `error` con `{ code: "UNAUTHORIZED" }` y desconecta. El frontend tiene que hacer `POST /auth/refresh` y reconectar.
- **Sesión cerrada:** cada 60 segundos el servidor corta las conexiones de sesiones cerradas, suspendidas o dadas de baja.
- **Eventos** (solo servidor → cliente; el cliente no emite nada):

  | Evento | Contenido | Cuándo |
  | --- | --- | --- |
  | `message:new` | `MessageDto` | Mensaje nuevo (incluye los de sistema) |
  | `message:updated` | `MessageDto` | Mensaje editado o eliminado (`deleted: true`, `body: ""`) |
  | `conversation:read` | `{ conversationId, readAt }` | El otro participante leyó |
  | `notification:new` | `NotificationDto` | Notificación nueva |

## 9. Antiabuso, ubicación y monitoreo

- **Cloudflare Turnstile** (`TURNSTILE_SECRET_KEY`):
  - **Dónde se pide el token:**
    - en el registro y en el formulario público de soporte, siempre (`captcha.assert`);
    - en el login, después de 3 fallos desde la IP (`assertForLogin`, error `CAPTCHA_REQUIRED`).
  - **Qué hace el frontend:** muestra el widget de Turnstile y manda el token en el campo `captchaToken` del cuerpo (ver los DTO en `BACKEND_ENDPOINTS.md`).
  - **Sin la clave:** no se exige.
- **Have I Been Pwned** (`PASSWORD_BREACH_CHECK`):
  - consulta por k-anonimato (no se envía la contraseña);
  - si la contraseña está filtrada, falla con `BREACHED_PASSWORD` (`password.service.ts:79`);
  - si el servicio no responde en 3 segundos, se deja pasar (ADR 0011).
- **Ciudad aproximada** (`CLOUDFLARE_EDGE_SECRET`):
  - para el aviso de dispositivo nuevo se usan los encabezados de ubicación de Cloudflare;
  - solo si el pedido trae `x-nexo-edge-secret`. No se guarda ubicación en tiempo real.
- **Sentry** (`SENTRY_DSN`): errores 5xx del backend, sin cookies ni cuerpos. El frontend no tiene integración de Sentry definida por el backend.

## 10. Variables que afectan al frontend

| Variable | Qué determina para el frontend |
| --- | --- |
| `FRONTEND_ORIGINS` | Orígenes exactos que la API acepta (CORS, `Origin` y Socket.IO) |
| `FRONTEND_URL` | Base de los enlaces de emails y de las vueltas de Google y Mercado Pago |
| `API_PREFIX` | Prefijo de la API (por defecto `api` → `/api/v1`) |
| `COOKIE_SECURE` | Nombres de cookies con prefijo `__Host-` o `__Secure-` (obligatorio en producción) |
| `SWAGGER_ENABLED` | Documentación interactiva en desarrollo; prohibida en producción |
| `PASSWORD_SELF_RESET_ENABLED` | "Olvidé mi contraseña" (apagado: responde 404) |
| `GOOGLE_PROVIDER` | Si se muestra el botón de Google |
| `PAYMENTS_PROVIDER` | Si se puede pagar |
| `PUSH_PROVIDER` | Si se ofrece activar avisos |
| `TURNSTILE_SECRET_KEY` | Si hay que mostrar CAPTCHA; la clave **pública** del widget la configura el frontend |
