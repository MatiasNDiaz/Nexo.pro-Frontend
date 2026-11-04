# Backend: inventario de endpoints y contratos

> Generado desde el código del backend (`Nexo.pro-Backend`, commit `0997e21`): decoradores de las rutas, DTOs con sus validaciones (class-validator + Swagger), firmas de los handlers, servicios llamados y excepciones con código. Las rutas `src/…` son relativas a `Nexo.pro-Backend/`. Lo que no se pudo inferir del código está marcado; las observaciones de estado salen de la lectura manual (ver `BACKEND_AUDIT.md`).

**Total: 199 endpoints.** Coincide 1 a 1 con `Nexo.pro-Backend/docs/endpoints.md`, que verifica la CI.

## Convenciones comunes a todas las rutas

- **Base:** `https://<api>/api/v1`. Prefijo `api` (`API_PREFIX`) y versión por URI `v1`.
- **Sesión:** solo por cookies HttpOnly (`nx_at`, `nx_rt`, `nx_csrf`; en producción con prefijos `__Host-`/`__Secure-`). Ningún endpoint devuelve tokens en el cuerpo. Usar `credentials: "include"`.
- **Escrituras (POST, PUT, PATCH, DELETE):** `Origin` permitido + `X-Requested-With: XMLHttpRequest` siempre (salvo webhooks); con sesión, además `X-CSRF-Token` con el `csrfToken` recibido al iniciar sesión o en `GET /auth/csrf`.
- **Errores:** siempre `{ statusCode, code, message, details: [{ field, errors[] }], requestId, timestamp }`. Los 5xx no exponen detalles. `code` es estable: el frontend decide por `code`, no por `message`.
- **Validación:** se rechazan campos no declarados (`forbidNonWhitelisted`): mandar solo los campos del DTO. Error `400 VALIDATION_FAILED` con `details` por campo.
- **Estados de cuenta:** por defecto solo pasan cuentas `ACTIVE`; cada ruta lista los que admite.
- **Fechas:** ISO 8601 en UTC en las respuestas. Importes como texto con 2 decimales (`"15000.00"`).
- **IDs ajenos:** los recursos de otro usuario responden 404 (no confirman que existen).

## Índice

| ID | Método | Ruta | Roles | Estados de cuenta | Estado |
| --- | --- | --- | --- | --- | --- |
| [E-001](#e-001) | GET | `/api/v1/admin/announcements` | ADMIN | ACTIVE | Implementado |
| [E-002](#e-002) | POST | `/api/v1/admin/announcements` | ADMIN | ACTIVE | Implementado |
| [E-003](#e-003) | GET | `/api/v1/admin/appeals` | ADMIN | ACTIVE | Implementado |
| [E-004](#e-004) | POST | `/api/v1/admin/appeals/:id/decide` | ADMIN | ACTIVE | Implementado |
| [E-005](#e-005) | GET | `/api/v1/admin/dashboard` | ADMIN | ACTIVE | Implementado |
| [E-006](#e-006) | POST | `/api/v1/admin/forum/posts/:id/hide` | ADMIN | ACTIVE | Implementado |
| [E-007](#e-007) | POST | `/api/v1/admin/forum/posts/:id/restore` | ADMIN | ACTIVE | Implementado |
| [E-008](#e-008) | POST | `/api/v1/admin/forum/replies/:id/hide` | ADMIN | ACTIVE | Implementado |
| [E-009](#e-009) | POST | `/api/v1/admin/forum/replies/:id/restore` | ADMIN | ACTIVE | Implementado |
| [E-010](#e-010) | GET | `/api/v1/admin/identity-verifications` | ADMIN | ACTIVE | Implementado |
| [E-011](#e-011) | POST | `/api/v1/admin/identity-verifications/:id/decision` | ADMIN | ACTIVE | Implementado |
| [E-012](#e-012) | GET | `/api/v1/admin/neighborhoods` | ADMIN | ACTIVE | Implementado |
| [E-013](#e-013) | PATCH | `/api/v1/admin/neighborhoods/:id` | ADMIN | ACTIVE | Implementado |
| [E-014](#e-014) | POST | `/api/v1/admin/neighborhoods/:id/approve` | ADMIN | ACTIVE | Implementado |
| [E-015](#e-015) | POST | `/api/v1/admin/neighborhoods/:id/merge` | ADMIN | ACTIVE | Implementado |
| [E-016](#e-016) | GET | `/api/v1/admin/payments` | ADMIN | ACTIVE | Implementado |
| [E-017](#e-017) | GET | `/api/v1/admin/platform-reviews` | ADMIN | ACTIVE | Implementado |
| [E-018](#e-018) | POST | `/api/v1/admin/platform-reviews/:id/publish` | ADMIN | ACTIVE | Implementado |
| [E-019](#e-019) | POST | `/api/v1/admin/platform-reviews/:id/unpublish` | ADMIN | ACTIVE | Implementado |
| [E-020](#e-020) | PATCH | `/api/v1/admin/professionals/:userId/profile` | ADMIN | ACTIVE | Implementado |
| [E-021](#e-021) | POST | `/api/v1/admin/professionals/certifications/:id/hide` | ADMIN | ACTIVE | Implementado |
| [E-022](#e-022) | POST | `/api/v1/admin/professionals/certifications/:id/restore` | ADMIN | ACTIVE | Implementado |
| [E-023](#e-023) | POST | `/api/v1/admin/professionals/media/:id/hide` | ADMIN | ACTIVE | Implementado |
| [E-024](#e-024) | POST | `/api/v1/admin/professionals/media/:id/restore` | ADMIN | ACTIVE | Implementado |
| [E-025](#e-025) | GET | `/api/v1/admin/reports` | ADMIN | ACTIVE | Implementado |
| [E-026](#e-026) | GET | `/api/v1/admin/reports/:id` | ADMIN | ACTIVE | Implementado |
| [E-027](#e-027) | GET | `/api/v1/admin/reports/:id/conversation` | ADMIN | ACTIVE | Implementado |
| [E-028](#e-028) | POST | `/api/v1/admin/reports/:id/resolve` | ADMIN | ACTIVE | Implementado |
| [E-029](#e-029) | POST | `/api/v1/admin/reports/:id/review` | ADMIN | ACTIVE | Implementado |
| [E-030](#e-030) | POST | `/api/v1/admin/revenue/exports` | ADMIN | ACTIVE | Implementado |
| [E-031](#e-031) | GET | `/api/v1/admin/revenue/payments` | ADMIN | ACTIVE | Implementado |
| [E-032](#e-032) | GET | `/api/v1/admin/revenue/registrations` | ADMIN | ACTIVE | Implementado |
| [E-033](#e-033) | GET | `/api/v1/admin/revenue/summary` | ADMIN | ACTIVE | Implementado |
| [E-034](#e-034) | POST | `/api/v1/admin/reviews/:id/hide` | ADMIN | ACTIVE | Implementado |
| [E-035](#e-035) | POST | `/api/v1/admin/reviews/:id/restore` | ADMIN | ACTIVE | Implementado |
| [E-036](#e-036) | POST | `/api/v1/admin/sanctions/:id/lift` | ADMIN | ACTIVE | Implementado |
| [E-037](#e-037) | POST | `/api/v1/admin/strikes/:id/void` | ADMIN | ACTIVE | Implementado |
| [E-038](#e-038) | POST | `/api/v1/admin/subscriptions/:userId/plan` | ADMIN | ACTIVE | Implementado |
| [E-039](#e-039) | GET | `/api/v1/admin/support/tickets` | ADMIN | ACTIVE | Implementado |
| [E-040](#e-040) | GET | `/api/v1/admin/support/tickets/:id` | ADMIN | ACTIVE | Implementado |
| [E-041](#e-041) | POST | `/api/v1/admin/support/tickets/:id/close` | ADMIN | ACTIVE | Implementado |
| [E-042](#e-042) | POST | `/api/v1/admin/support/tickets/:id/messages` | ADMIN | ACTIVE | Implementado |
| [E-043](#e-043) | GET | `/api/v1/admin/users` | ADMIN | ACTIVE | Implementado |
| [E-044](#e-044) | DELETE | `/api/v1/admin/users/:id` | ADMIN | ACTIVE | Implementado |
| [E-045](#e-045) | GET | `/api/v1/admin/users/:id` | ADMIN | ACTIVE | Implementado |
| [E-046](#e-046) | PATCH | `/api/v1/admin/users/:id` | ADMIN | ACTIVE | Implementado |
| [E-047](#e-047) | POST | `/api/v1/admin/users/:id/ban` | ADMIN | ACTIVE | Implementado |
| [E-048](#e-048) | POST | `/api/v1/admin/users/:id/change-role` | ADMIN | ACTIVE | Implementado |
| [E-049](#e-049) | POST | `/api/v1/admin/users/:id/message` | ADMIN | ACTIVE | Implementado |
| [E-050](#e-050) | GET | `/api/v1/admin/users/:id/metrics` | ADMIN | ACTIVE | Implementado |
| [E-051](#e-051) | POST | `/api/v1/admin/users/:id/password-reset` | ADMIN | ACTIVE | Implementado |
| [E-052](#e-052) | POST | `/api/v1/admin/users/:id/restore` | ADMIN | ACTIVE | Implementado |
| [E-053](#e-053) | POST | `/api/v1/admin/users/:id/revoke-sessions` | ADMIN | ACTIVE | Implementado |
| [E-054](#e-054) | POST | `/api/v1/admin/users/:id/sanctions` | ADMIN | ACTIVE | Implementado |
| [E-055](#e-055) | POST | `/api/v1/admin/users/:id/strikes` | ADMIN | ACTIVE | Implementado |
| [E-056](#e-056) | POST | `/api/v1/admin/users/:id/suspend` | ADMIN | ACTIVE | Implementado |
| [E-057](#e-057) | GET | `/api/v1/announcements/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-058](#e-058) | GET | `/api/v1/auth/csrf` | Público | — | Implementado |
| [E-059](#e-059) | POST | `/api/v1/auth/email/resend` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-060](#e-060) | POST | `/api/v1/auth/email/verify` | Público | — | Implementado |
| [E-061](#e-061) | GET | `/api/v1/auth/google` | Público | — | Implementado (requiere credenciales) |
| [E-062](#e-062) | GET | `/api/v1/auth/google/callback` | Público | — | Implementado (requiere credenciales) |
| [E-063](#e-063) | DELETE | `/api/v1/auth/google/link` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado (requiere credenciales) |
| [E-064](#e-064) | POST | `/api/v1/auth/google/link` | Público | — | Implementado (requiere credenciales) |
| [E-065](#e-065) | POST | `/api/v1/auth/google/link/confirm` | Público | — | Implementado (requiere credenciales) |
| [E-066](#e-066) | POST | `/api/v1/auth/google/link/email` | Público | — | Implementado (requiere credenciales) |
| [E-067](#e-067) | GET | `/api/v1/auth/google/pending` | Público | — | Implementado (requiere credenciales) |
| [E-068](#e-068) | POST | `/api/v1/auth/google/register` | Público | — | Implementado (requiere credenciales) |
| [E-069](#e-069) | POST | `/api/v1/auth/login` | Público | — | Implementado |
| [E-070](#e-070) | POST | `/api/v1/auth/logout` | Público | — | Implementado |
| [E-071](#e-071) | POST | `/api/v1/auth/logout-all` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED | Implementado |
| [E-072](#e-072) | GET | `/api/v1/auth/me` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED | Implementado |
| [E-073](#e-073) | POST | `/api/v1/auth/mfa/verify` | Público | — | Implementado |
| [E-074](#e-074) | POST | `/api/v1/auth/password/change` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-075](#e-075) | POST | `/api/v1/auth/password/forgot` | Público | — | Apagado |
| [E-076](#e-076) | POST | `/api/v1/auth/password/reset` | Público | — | Implementado |
| [E-077](#e-077) | POST | `/api/v1/auth/password/set` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-078](#e-078) | POST | `/api/v1/auth/refresh` | Público | — | Implementado |
| [E-079](#e-079) | POST | `/api/v1/auth/register` | Público | — | Implementado |
| [E-080](#e-080) | GET | `/api/v1/auth/sessions` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED | Implementado |
| [E-081](#e-081) | DELETE | `/api/v1/auth/sessions/:id` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED | Implementado |
| [E-082](#e-082) | POST | `/api/v1/auth/sessions/close-by-link` | Público | — | Implementado |
| [E-083](#e-083) | GET | `/api/v1/catalog/professionals` | Público | — | Implementado |
| [E-084](#e-084) | GET | `/api/v1/catalog/professionals/:slug` | Público | — | Implementado |
| [E-085](#e-085) | GET | `/api/v1/catalog/professionals/:slug/reviews` | Público | — | Implementado |
| [E-086](#e-086) | GET | `/api/v1/chat/attachments/:fileId` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-087](#e-087) | GET | `/api/v1/chat/conversations` | CUSTOMER, PROFESSIONAL | ACTIVE | Problemático |
| [E-088](#e-088) | POST | `/api/v1/chat/conversations` | CUSTOMER | ACTIVE | Parcial |
| [E-089](#e-089) | GET | `/api/v1/chat/conversations/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Problemático |
| [E-090](#e-090) | GET | `/api/v1/chat/conversations/:id/messages` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-091](#e-091) | POST | `/api/v1/chat/conversations/:id/messages` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-092](#e-092) | POST | `/api/v1/chat/conversations/:id/read` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-093](#e-093) | DELETE | `/api/v1/chat/messages/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-094](#e-094) | PATCH | `/api/v1/chat/messages/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-095](#e-095) | GET | `/api/v1/contracts` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-096](#e-096) | GET | `/api/v1/contracts/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-097](#e-097) | POST | `/api/v1/contracts/:id/cancel` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-098](#e-098) | POST | `/api/v1/contracts/:id/complete` | PROFESSIONAL | ACTIVE | Implementado |
| [E-099](#e-099) | POST | `/api/v1/contracts/:id/schedule` | PROFESSIONAL | ACTIVE | Implementado |
| [E-100](#e-100) | POST | `/api/v1/contracts/:id/start` | PROFESSIONAL | ACTIVE | Implementado |
| [E-101](#e-101) | GET | `/api/v1/customers/me` | CUSTOMER | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-102](#e-102) | PATCH | `/api/v1/customers/me` | CUSTOMER | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-103](#e-103) | GET | `/api/v1/evidence/:fileId` | CUSTOMER, PROFESSIONAL, ADMIN | ACTIVE | Implementado |
| [E-104](#e-104) | GET | `/api/v1/favorites` | CUSTOMER | ACTIVE | Implementado |
| [E-105](#e-105) | DELETE | `/api/v1/favorites/:professionalId` | CUSTOMER | ACTIVE | Implementado |
| [E-106](#e-106) | PATCH | `/api/v1/favorites/:professionalId` | CUSTOMER | ACTIVE | Implementado |
| [E-107](#e-107) | PUT | `/api/v1/favorites/:professionalId` | CUSTOMER | ACTIVE | Parcial |
| [E-108](#e-108) | GET | `/api/v1/forum/posts` | Público | — | Implementado |
| [E-109](#e-109) | POST | `/api/v1/forum/posts` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-110](#e-110) | DELETE | `/api/v1/forum/posts/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-111](#e-111) | GET | `/api/v1/forum/posts/:id` | Público | — | Implementado |
| [E-112](#e-112) | PATCH | `/api/v1/forum/posts/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-113](#e-113) | DELETE | `/api/v1/forum/posts/:id/like` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-114](#e-114) | PUT | `/api/v1/forum/posts/:id/like` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-115](#e-115) | GET | `/api/v1/forum/posts/:id/my-likes` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-116](#e-116) | POST | `/api/v1/forum/posts/:id/replies` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-117](#e-117) | POST | `/api/v1/forum/posts/:id/resolve` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-118](#e-118) | DELETE | `/api/v1/forum/replies/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-119](#e-119) | PATCH | `/api/v1/forum/replies/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-120](#e-120) | DELETE | `/api/v1/forum/replies/:id/like` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-121](#e-121) | PUT | `/api/v1/forum/replies/:id/like` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-122](#e-122) | GET | `/api/v1/health/live` | Público | — | Solo infraestructura |
| [E-123](#e-123) | GET | `/api/v1/health/ready` | Público | — | Solo infraestructura |
| [E-124](#e-124) | POST | `/api/v1/identity-verification` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado (proveedor manual) |
| [E-125](#e-125) | GET | `/api/v1/identity-verification/me` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-126](#e-126) | GET | `/api/v1/locations/localities` | Público | — | Implementado |
| [E-127](#e-127) | GET | `/api/v1/locations/neighborhoods` | Público | — | Implementado |
| [E-128](#e-128) | GET | `/api/v1/locations/provinces` | Público | — | Implementado |
| [E-129](#e-129) | POST | `/api/v1/moderation/appeals` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED | Implementado |
| [E-130](#e-130) | GET | `/api/v1/moderation/me` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED | Implementado |
| [E-131](#e-131) | GET | `/api/v1/notifications` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-132](#e-132) | POST | `/api/v1/notifications/:id/read` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-133](#e-133) | GET | `/api/v1/notifications/preferences` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-134](#e-134) | PUT | `/api/v1/notifications/preferences` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-135](#e-135) | GET | `/api/v1/notifications/push/key` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-136](#e-136) | POST | `/api/v1/notifications/push/subscriptions` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-137](#e-137) | POST | `/api/v1/notifications/push/subscriptions/remove` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-138](#e-138) | POST | `/api/v1/notifications/read-all` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-139](#e-139) | GET | `/api/v1/notifications/unread-count` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-140](#e-140) | GET | `/api/v1/platform-reviews` | Público | — | Implementado |
| [E-141](#e-141) | DELETE | `/api/v1/platform-reviews/me` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-142](#e-142) | GET | `/api/v1/platform-reviews/me` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-143](#e-143) | PUT | `/api/v1/platform-reviews/me` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-144](#e-144) | GET | `/api/v1/professionals/me` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-145](#e-145) | PATCH | `/api/v1/professionals/me` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-146](#e-146) | PUT | `/api/v1/professionals/me/attention-status` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-147](#e-147) | PUT | `/api/v1/professionals/me/availability` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-148](#e-148) | POST | `/api/v1/professionals/me/availability/exceptions` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-149](#e-149) | DELETE | `/api/v1/professionals/me/availability/exceptions/:id` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-150](#e-150) | POST | `/api/v1/professionals/me/certifications` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-151](#e-151) | DELETE | `/api/v1/professionals/me/certifications/:id` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-152](#e-152) | POST | `/api/v1/professionals/me/media` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-153](#e-153) | DELETE | `/api/v1/professionals/me/media/:id` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-154](#e-154) | PUT | `/api/v1/professionals/me/media/order` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-155](#e-155) | PUT | `/api/v1/professionals/me/media/visible` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-156](#e-156) | GET | `/api/v1/professionals/me/metrics` | PROFESSIONAL | ACTIVE | Implementado |
| [E-157](#e-157) | PUT | `/api/v1/professionals/me/professions` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-158](#e-158) | PUT | `/api/v1/professionals/me/professions/visible` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-159](#e-159) | PUT | `/api/v1/professionals/me/service-areas` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-160](#e-160) | PUT | `/api/v1/professionals/me/social-links` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-161](#e-161) | PUT | `/api/v1/professionals/me/theme` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-162](#e-162) | GET | `/api/v1/professions` | Público | — | Implementado |
| [E-163](#e-163) | POST | `/api/v1/reports` | CUSTOMER, PROFESSIONAL | ACTIVE | Parcial |
| [E-164](#e-164) | GET | `/api/v1/reports/mine` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-165](#e-165) | GET | `/api/v1/requests` | CUSTOMER | ACTIVE | Implementado |
| [E-166](#e-166) | POST | `/api/v1/requests` | CUSTOMER | ACTIVE | Parcial |
| [E-167](#e-167) | GET | `/api/v1/requests/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-168](#e-168) | POST | `/api/v1/requests/:id/cancel` | CUSTOMER | ACTIVE | Implementado |
| [E-169](#e-169) | POST | `/api/v1/requests/quotes/:quoteId/withdraw` | PROFESSIONAL | ACTIVE | Implementado |
| [E-170](#e-170) | GET | `/api/v1/requests/received` | PROFESSIONAL | ACTIVE | Implementado |
| [E-171](#e-171) | POST | `/api/v1/requests/targets/:targetId/decline` | PROFESSIONAL | ACTIVE | Implementado |
| [E-172](#e-172) | POST | `/api/v1/requests/targets/:targetId/quotes` | PROFESSIONAL | ACTIVE | Implementado |
| [E-173](#e-173) | POST | `/api/v1/requests/targets/:targetId/select` | CUSTOMER | ACTIVE | Implementado |
| [E-174](#e-174) | POST | `/api/v1/reviews` | CUSTOMER | ACTIVE | Implementado |
| [E-175](#e-175) | DELETE | `/api/v1/reviews/:id` | CUSTOMER | ACTIVE | Implementado |
| [E-176](#e-176) | PATCH | `/api/v1/reviews/:id` | CUSTOMER | ACTIVE | Implementado |
| [E-177](#e-177) | DELETE | `/api/v1/reviews/:id/reply` | PROFESSIONAL | ACTIVE | Implementado |
| [E-178](#e-178) | PUT | `/api/v1/reviews/:id/reply` | PROFESSIONAL | ACTIVE | Implementado |
| [E-179](#e-179) | GET | `/api/v1/reviews/mine` | CUSTOMER | ACTIVE | Implementado |
| [E-180](#e-180) | GET | `/api/v1/reviews/received` | PROFESSIONAL | ACTIVE | Implementado |
| [E-181](#e-181) | POST | `/api/v1/subscriptions/checkout` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado (requiere credenciales) |
| [E-182](#e-182) | GET | `/api/v1/subscriptions/me` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-183](#e-183) | GET | `/api/v1/subscriptions/me/payments` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-184](#e-184) | GET | `/api/v1/subscriptions/plans` | PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-185](#e-185) | POST | `/api/v1/support/contact` | Público | — | Implementado |
| [E-186](#e-186) | GET | `/api/v1/support/tickets` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-187](#e-187) | POST | `/api/v1/support/tickets` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-188](#e-188) | GET | `/api/v1/support/tickets/:id` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-189](#e-189) | POST | `/api/v1/support/tickets/:id/messages` | CUSTOMER, PROFESSIONAL | ACTIVE | Implementado |
| [E-190](#e-190) | POST | `/api/v1/uploads` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-191](#e-191) | POST | `/api/v1/uploads/:id/complete` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-192](#e-192) | GET | `/api/v1/uploads/:id/content` | Público | — | Solo desarrollo |
| [E-193](#e-193) | PUT | `/api/v1/uploads/:id/content` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Solo desarrollo |
| [E-194](#e-194) | DELETE | `/api/v1/users/me` | Cualquier rol autenticado | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-195](#e-195) | GET | `/api/v1/users/me` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-196](#e-196) | PATCH | `/api/v1/users/me` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-197](#e-197) | PUT | `/api/v1/users/me/avatar` | CUSTOMER, PROFESSIONAL | PENDING_VERIFICATION, ACTIVE | Implementado |
| [E-198](#e-198) | POST | `/api/v1/webhooks/identity` | Público | — | Solo backend |
| [E-199](#e-199) | POST | `/api/v1/webhooks/payments` | Público | — | Solo backend |

## Módulo `admin/announcements`

<a id="e-001"></a>

### E-001 · `GET /api/v1/admin/announcements`

Lista las novedades publicadas, con la cantidad de destinatarios de cada una.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.announcementsList` · `src/support/support.controller.ts:143` |
| Servicio | `AnnouncementsService.adminList` · `src/support/announcements.service.ts:98` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`AdminAnnouncementDto`](BACKEND_ENDPOINTS.md#dto-adminannouncementdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: soporte y novedades |

<a id="e-002"></a>

### E-002 · `POST /api/v1/admin/announcements`

Crea y publica: una notificación por cada cuenta activa que cumple el segmento.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.publish` · `src/support/support.controller.ts:149` |
| Servicio | `AnnouncementsService.publish` · `src/support/announcements.service.ts:34` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`CreateAnnouncementDto`](BACKEND_ENDPOINTS.md#dto-createannouncementdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`AdminAnnouncementDto`](BACKEND_ENDPOINTS.md#dto-adminannouncementdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: soporte y novedades |

## Módulo `admin/appeals`

<a id="e-003"></a>

### E-003 · `GET /api/v1/admin/appeals`

Lista paginada de apelaciones (filtrable por estado), con los datos de la cuenta que apeló.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.appeals` · `src/moderation/moderation.controller.ts:234` |
| Servicio | `SanctionsService.adminAppeals` · `src/moderation/sanctions.service.ts:374` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`AdminAppealsQueryDto`](BACKEND_ENDPOINTS.md#dto-adminappealsquerydto) |
| Respuesta | `200` · `{ data: AdminAppealDto[], page, limit, total }` (`sanctions.service.ts` `adminAppeals`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

<a id="e-004"></a>

### E-004 · `POST /api/v1/admin/appeals/:id/decide`

Aceptar anula el strike o levanta la sanción; rechazar la deja como está. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.decide` · `src/moderation/moderation.controller.ts:239` |
| Servicio | `SanctionsService.decide` · `src/moderation/sanctions.service.ts:398` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`DecideAppealDto`](BACKEND_ENDPOINTS.md#dto-decideappealdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AppealDto`](BACKEND_ENDPOINTS.md#dto-appealdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

## Módulo `admin/dashboard`

<a id="e-005"></a>

### E-005 · `GET /api/v1/admin/dashboard`

Cifras generales del panel: usuarios por rol y estado, suscripciones, planes vigentes y colas pendientes.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminPanelController.dashboard` · `src/admin/admin-panel.controller.ts:20` |
| Servicio | `AdminPanelService.dashboard` · `src/admin/admin-panel.service.ts:23` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`DashboardDto`](BACKEND_ENDPOINTS.md#dto-dashboarddto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: inicio |

## Módulo `admin/forum`

<a id="e-006"></a>

### E-006 · `POST /api/v1/admin/forum/posts/:id/hide`

Oculta una publicación del foro, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminForumController.hidePost` · `src/forum/forum.controller.ts:196` |
| Servicio | `ForumService.moderatePost` · `src/forum/forum.service.ts:364` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

<a id="e-007"></a>

### E-007 · `POST /api/v1/admin/forum/posts/:id/restore`

Restaura una publicación del foro oculta, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminForumController.restorePost` · `src/forum/forum.controller.ts:207` |
| Servicio | `ForumService.moderatePost` · `src/forum/forum.service.ts:364` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

<a id="e-008"></a>

### E-008 · `POST /api/v1/admin/forum/replies/:id/hide`

Oculta una respuesta del foro, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminForumController.hideReply` · `src/forum/forum.controller.ts:218` |
| Servicio | `ForumService.moderateReply` · `src/forum/forum.service.ts:390` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

<a id="e-009"></a>

### E-009 · `POST /api/v1/admin/forum/replies/:id/restore`

Restaura una respuesta del foro oculta, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminForumController.restoreReply` · `src/forum/forum.controller.ts:229` |
| Servicio | `ForumService.moderateReply` · `src/forum/forum.service.ts:390` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

## Módulo `admin/identity-verifications`

<a id="e-010"></a>

### E-010 · `GET /api/v1/admin/identity-verifications`

Cola de revisión del admin: las más viejas primero, con los datos para reconocer a la persona.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminIdentityVerificationController.list` · `src/identity-verification/identity-verification.controller.ts:79` |
| Servicio | `IdentityVerificationService.adminList` · `src/identity-verification/identity-verification.service.ts:334` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`ListVerificationsQueryDto`](BACKEND_ENDPOINTS.md#dto-listverificationsquerydto) |
| Respuesta | `200` · [`AdminVerificationListDto`](BACKEND_ENDPOINTS.md#dto-adminverificationlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: verificaciones de identidad |

<a id="e-011"></a>

### E-011 · `POST /api/v1/admin/identity-verifications/:id/decision`

Decisión manual del admin. Motivo obligatorio y auditoría en la misma transacción.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminIdentityVerificationController.decide` · `src/identity-verification/identity-verification.controller.ts:85` |
| Servicio | `IdentityVerificationService.adminDecide` · `src/identity-verification/identity-verification.service.ts:222` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AdminDecisionDto`](BACKEND_ENDPOINTS.md#dto-admindecisiondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminVerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-adminverificationresponsedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 INVALID_STATE_TRANSITION`, `422 PROFILE_INCOMPLETE`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: verificaciones de identidad |

## Módulo `admin/neighborhoods`

<a id="e-012"></a>

### E-012 · `GET /api/v1/admin/neighborhoods`

Por defecto, los pendientes (los más viejos primero) con cuánto se usan.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminNeighborhoodsController.list` · `src/locations/admin-neighborhoods.controller.ts:33` |
| Servicio | `NeighborhoodModerationService.list` · `src/locations/neighborhood-moderation.service.ts:36` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`ListNeighborhoodsQueryDto`](BACKEND_ENDPOINTS.md#dto-listneighborhoodsquerydto) |
| Respuesta | `200` · [`AdminNeighborhoodListDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhoodlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: barrios |

<a id="e-013"></a>

### E-013 · `PATCH /api/v1/admin/neighborhoods/:id`

Corrige el nombre que se muestra. Si el nombre nuevo ya existe en la localidad (como barrio o alias), responde 409: lo que corresponde es fusionarlos.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminNeighborhoodsController.rename` · `src/locations/admin-neighborhoods.controller.ts:51` |
| Servicio | `NeighborhoodModerationService.rename` · `src/locations/neighborhood-moderation.service.ts:84` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`RenameNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-renameneighborhooddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto) |
| Errores | `400 INVALID_NEIGHBORHOOD`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 NEIGHBORHOOD_NOT_FOUND`, `409 NEIGHBORHOOD_MERGED`, `409 NEIGHBORHOOD_NAME_TAKEN`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: barrios |

<a id="e-014"></a>

### E-014 · `POST /api/v1/admin/neighborhoods/:id/approve`

PENDING → APPROVED: desde ahora aparece en el autocompletado y en los filtros públicos.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminNeighborhoodsController.approve` · `src/locations/admin-neighborhoods.controller.ts:39` |
| Servicio | `NeighborhoodModerationService.approve` · `src/locations/neighborhood-moderation.service.ts:64` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ModerationReasonDto`](BACKEND_ENDPOINTS.md#dto-moderationreasondto-locations-dto-neighborhood-admin-dto-ts) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 NEIGHBORHOOD_NOT_FOUND`, `409 NEIGHBORHOOD_ALREADY_APPROVED`, `409 NEIGHBORHOOD_MERGED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: barrios |

<a id="e-015"></a>

### E-015 · `POST /api/v1/admin/neighborhoods/:id/merge`

Fusiona `id` en `targetId` (aprobado, misma localidad): mueve a los clientes y las zonas de trabajo (sin duplicar zonas de un mismo profesional) y deja `id` como alias del destino, así quien vuelva a escribir ese nombre cae en el barrio correcto.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminNeighborhoodsController.merge` · `src/locations/admin-neighborhoods.controller.ts:62` |
| Servicio | `NeighborhoodModerationService.merge` · `src/locations/neighborhood-moderation.service.ts:122` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`MergeNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-mergeneighborhooddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto) |
| Errores | `400 INVALID_MERGE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 NEIGHBORHOOD_NOT_FOUND`, `409 NEIGHBORHOOD_MERGED`, `409 TARGET_NOT_APPROVED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: barrios |

## Módulo `admin/payments`

<a id="e-016"></a>

### E-016 · `GET /api/v1/admin/payments`

Lista paginada de pagos (filtrable por usuario y estado), con la marca de los que hay que revisar.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminPaymentsController.list` · `src/payments/payments.controller.ts:85` |
| Servicio | `PaymentsService.adminList` · `src/payments/payments.service.ts:595` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`AdminPaymentsQueryDto`](BACKEND_ENDPOINTS.md#dto-adminpaymentsquerydto) |
| Respuesta | `200` · [`AdminPaymentListDto`](BACKEND_ENDPOINTS.md#dto-adminpaymentlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: pagos |

## Módulo `admin/platform-reviews`

<a id="e-017"></a>

### E-017 · `GET /api/v1/admin/platform-reviews`

Lista de opiniones sobre la plataforma (publicadas o no) para moderar.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminReviewsController.platformReviews` · `src/reviews/reviews.controller.ts:202` |
| Servicio | `PlatformReviewsService.adminList` · `src/reviews/platform-reviews.service.ts:53` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`AdminPlatformReviewsQueryDto`](BACKEND_ENDPOINTS.md#dto-adminplatformreviewsquerydto) |
| Respuesta | `200` · [`PlatformReviewPageDto`](BACKEND_ENDPOINTS.md#dto-platformreviewpagedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

<a id="e-018"></a>

### E-018 · `POST /api/v1/admin/platform-reviews/:id/publish`

Publica una opinión sobre la plataforma. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminReviewsController.publish` · `src/reviews/reviews.controller.ts:208` |
| Servicio | `PlatformReviewsService.setPublished` · `src/reviews/platform-reviews.service.ts:63` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

<a id="e-019"></a>

### E-019 · `POST /api/v1/admin/platform-reviews/:id/unpublish`

Despublica una opinión sobre la plataforma. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminReviewsController.unpublish` · `src/reviews/reviews.controller.ts:215` |
| Servicio | `PlatformReviewsService.setPublished` · `src/reviews/platform-reviews.service.ts:63` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

## Módulo `admin/professionals`

<a id="e-020"></a>

### E-020 · `PATCH /api/v1/admin/professionals/:userId/profile`

Edita los datos del perfil de un profesional (ADR 0021), con motivo y auditoría.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminProfessionalContentController.updateProfile` · `src/professionals/professionals.controller.ts:220` |
| Servicio | `ProfileService.update` · `src/professionals/profile.service.ts:187` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `userId` (uuid) |
| Body | [`AdminUpdateProfessionalProfileDto`](BACKEND_ENDPOINTS.md#dto-adminupdateprofessionalprofiledto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 RATE_INCOMPLETE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: contenido de perfiles |

<a id="e-021"></a>

### E-021 · `POST /api/v1/admin/professionals/certifications/:id/hide`

Oculta un certificado de un profesional (pasa a privado en el almacenamiento). Con motivo y auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminProfessionalContentController.hideCertification` · `src/professionals/professionals.controller.ts:251` |
| Servicio | `ContentModerationService.hide` · `src/professionals/content-moderation.service.ts:44` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: contenido de perfiles |

<a id="e-022"></a>

### E-022 · `POST /api/v1/admin/professionals/certifications/:id/restore`

Restaura un certificado oculto. Con motivo y auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminProfessionalContentController.restoreCertification` · `src/professionals/professionals.controller.ts:261` |
| Servicio | `ContentModerationService.restore` · `src/professionals/content-moderation.service.ts:48` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: contenido de perfiles |

<a id="e-023"></a>

### E-023 · `POST /api/v1/admin/professionals/media/:id/hide`

Oculta una imagen o video del perfil de un profesional. Con motivo y auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminProfessionalContentController.hideMedia` · `src/professionals/professionals.controller.ts:231` |
| Servicio | `ContentModerationService.hide` · `src/professionals/content-moderation.service.ts:44` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: contenido de perfiles |

<a id="e-024"></a>

### E-024 · `POST /api/v1/admin/professionals/media/:id/restore`

Restaura un medio oculto. Con motivo y auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminProfessionalContentController.restoreMedia` · `src/professionals/professionals.controller.ts:241` |
| Servicio | `ContentModerationService.restore` · `src/professionals/content-moderation.service.ts:48` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: contenido de perfiles |

## Módulo `admin/reports`

<a id="e-025"></a>

### E-025 · `GET /api/v1/admin/reports`

Lista paginada de reportes, filtrable por estado y tipo de contenido.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.list` · `src/moderation/moderation.controller.ts:149` |
| Servicio | `ReportsService.adminList` · `src/moderation/reports.service.ts:144` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`AdminReportsQueryDto`](BACKEND_ENDPOINTS.md#dto-adminreportsquerydto) |
| Respuesta | `200` · [`AdminReportListDto`](BACKEND_ENDPOINTS.md#dto-adminreportlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

<a id="e-026"></a>

### E-026 · `GET /api/v1/admin/reports/:id`

Detalle de un reporte con el contenido reportado, el denunciante, el denunciado y la evidencia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.get` · `src/moderation/moderation.controller.ts:155` |
| Servicio | `ReportsService.adminGet` · `src/moderation/reports.service.ts:162` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 REPORT_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

<a id="e-027"></a>

### E-027 · `GET /api/v1/admin/reports/:id/conversation`

C-32: solo desde un reporte de mensaje; cada acceso queda auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.conversation` · `src/moderation/moderation.controller.ts:183` |
| Servicio | `ReportsService.conversation` · `src/moderation/reports.service.ts:238` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`ReportConversationDto`](BACKEND_ENDPOINTS.md#dto-reportconversationdto) |
| Errores | `400 NOT_A_MESSAGE_REPORT`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 REPORT_NOT_FOUND`, `404 REPORT_TARGET_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

<a id="e-028"></a>

### E-028 · `POST /api/v1/admin/reports/:id/resolve`

Válido o rechazado (ADR 0029). Al denunciante se le avisa que se revisó; al denunciado, solo si es válido y sin decir quién lo reportó. Un rechazo no tiene consecuencias para nadie.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.resolve` · `src/moderation/moderation.controller.ts:171` |
| Servicio | `ReportsService.resolve` · `src/moderation/reports.service.ts:192` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ResolveReportDto`](BACKEND_ENDPOINTS.md#dto-resolvereportdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REPORT_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

<a id="e-029"></a>

### E-029 · `POST /api/v1/admin/reports/:id/review`

Enviado → en revisión (el denunciante lo ve en su lista).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.review` · `src/moderation/moderation.controller.ts:161` |
| Servicio | `ReportsService.startReview` · `src/moderation/reports.service.ts:173` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REPORT_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

## Módulo `admin/revenue`

<a id="e-030"></a>

### E-030 · `POST /api/v1/admin/revenue/exports`

POST y no GET: deja un registro de auditoría, así que exige CSRF y Origin como toda escritura (otro sitio no puede hacer que el navegador del admin genere una exportación).

| Campo | Valor |
| --- | --- |
| Controller / handler | `RevenueController.export` · `src/admin/revenue/revenue.controller.ts:63` |
| Servicio | `RevenueService.export` · `src/admin/revenue/revenue.service.ts:255` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por hora |
| Body | [`RevenueExportDto`](BACKEND_ENDPOINTS.md#dto-revenueexportdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token`, respuesta `text/csv` |
| Respuesta | `200` · Archivo CSV (`text/csv; charset=utf-8`, `Content-Disposition: attachment`): UTF-8 con BOM, separador `;`, coma decimal |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: panel de ingresos |

<a id="e-031"></a>

### E-031 · `GET /api/v1/admin/revenue/payments`

Panel de ingresos: lista de pagos con quién pagó, plan, tipo, estado y fecha (ADR 0030).

| Campo | Valor |
| --- | --- |
| Controller / handler | `RevenueController.payments` · `src/admin/revenue/revenue.controller.ts:41` |
| Servicio | `RevenueService.payments` · `src/admin/revenue/revenue.service.ts:193` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`RevenuePaymentsQueryDto`](BACKEND_ENDPOINTS.md#dto-revenuepaymentsquerydto) |
| Respuesta | `200` · [`RevenuePaymentListDto`](BACKEND_ENDPOINTS.md#dto-revenuepaymentlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: panel de ingresos |

<a id="e-032"></a>

### E-032 · `GET /api/v1/admin/revenue/registrations`

Panel de ingresos: registros con rol, localidad, plan actual y si pagó alguna vez.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RevenueController.registrations` · `src/admin/revenue/revenue.controller.ts:47` |
| Servicio | `RevenueService.registrations` · `src/admin/revenue/revenue.service.ts:202` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`RevenueRegistrationsQueryDto`](BACKEND_ENDPOINTS.md#dto-revenueregistrationsquerydto) |
| Respuesta | `200` · [`RevenueRegistrationListDto`](BACKEND_ENDPOINTS.md#dto-revenueregistrationlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: panel de ingresos |

<a id="e-033"></a>

### E-033 · `GET /api/v1/admin/revenue/summary`

Panel de ingresos: cobrado, reembolsos, contracargos y neto por período y plan, con el período anterior.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RevenueController.summary` · `src/admin/revenue/revenue.controller.ts:53` |
| Servicio | `RevenueService.summary` · `src/admin/revenue/revenue.service.ts:211` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`RevenueSummaryQueryDto`](BACKEND_ENDPOINTS.md#dto-revenuesummaryquerydto) |
| Respuesta | `200` · [`RevenueSummaryDto`](BACKEND_ENDPOINTS.md#dto-revenuesummarydto) |
| Errores | `400 RANGE_TOO_LONG`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: panel de ingresos |

## Módulo `admin/reviews`

<a id="e-034"></a>

### E-034 · `POST /api/v1/admin/reviews/:id/hide`

Oculta una reseña, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminReviewsController.hide` · `src/reviews/reviews.controller.ts:180` |
| Servicio | `ReviewsService.adminModerate` · `src/reviews/reviews.service.ts:213` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

<a id="e-035"></a>

### E-035 · `POST /api/v1/admin/reviews/:id/restore`

Restaura una reseña oculta, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminReviewsController.restore` · `src/reviews/reviews.controller.ts:191` |
| Servicio | `ReviewsService.adminModerate` · `src/reviews/reviews.service.ts:213` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`HideContentDto`](BACKEND_ENDPOINTS.md#dto-hidecontentdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación de reseñas y foro |

## Módulo `admin/sanctions`

<a id="e-036"></a>

### E-036 · `POST /api/v1/admin/sanctions/:id/lift`

Levanta una sanción. Suspensión y baneo: la cuenta vuelve a su estado (restore).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.lift` · `src/moderation/moderation.controller.ts:223` |
| Servicio | `SanctionsService.lift` · `src/moderation/sanctions.service.ts:214` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ModerationReasonDto`](BACKEND_ENDPOINTS.md#dto-moderationreasondto-locations-dto-neighborhood-admin-dto-ts) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`SanctionDto`](BACKEND_ENDPOINTS.md#dto-sanctiondto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

## Módulo `admin/strikes`

<a id="e-037"></a>

### E-037 · `POST /api/v1/admin/strikes/:id/void`

Anula un strike, con motivo. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.voidStrike` · `src/moderation/moderation.controller.ts:202` |
| Servicio | `SanctionsService.voidStrike` · `src/moderation/sanctions.service.ts:132` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ModerationReasonDto`](BACKEND_ENDPOINTS.md#dto-moderationreasondto-locations-dto-neighborhood-admin-dto-ts) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`StrikeDto`](BACKEND_ENDPOINTS.md#dto-strikedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: moderación |

## Módulo `admin/subscriptions`

<a id="e-038"></a>

### E-038 · `POST /api/v1/admin/subscriptions/:userId/plan`

Cambio de plan de común acuerdo (FI §6.4): con motivo, historial y auditoría.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminPaymentsController.changePlan` · `src/payments/payments.controller.ts:91` |
| Servicio | `PaymentsService.adminChangePlan` · `src/payments/payments.service.ts:535` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `userId` (uuid) |
| Body | [`AdminChangePlanDto`](BACKEND_ENDPOINTS.md#dto-adminchangeplandto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PLAN_NOT_FOUND`, `409 SAME_PLAN`, `409 SUBSCRIPTION_NOT_LIVE`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

## Módulo `admin/support`

<a id="e-039"></a>

### E-039 · `GET /api/v1/admin/support/tickets`

Lista paginada de consultas de soporte (filtrable por estado), las más viejas primero.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.tickets` · `src/support/support.controller.ts:112` |
| Servicio | `SupportService.adminList` · `src/support/support.service.ts:116` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`AdminTicketsQueryDto`](BACKEND_ENDPOINTS.md#dto-adminticketsquerydto) |
| Respuesta | `200` · `{ data: AdminTicketDto[], page, limit, total }` (`support.service.ts` `adminList`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: soporte y novedades |

<a id="e-040"></a>

### E-040 · `GET /api/v1/admin/support/tickets/:id`

Detalle de una consulta de soporte con todos sus mensajes.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.ticket` · `src/support/support.controller.ts:117` |
| Servicio | `SupportService.adminGet` · `src/support/support.service.ts:130` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`AdminTicketDto`](BACKEND_ENDPOINTS.md#dto-adminticketdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 TICKET_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: soporte y novedades |

<a id="e-041"></a>

### E-041 · `POST /api/v1/admin/support/tickets/:id/close`

Cierra una consulta de soporte. Auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.close` · `src/support/support.controller.ts:133` |
| Servicio | `SupportService.adminClose` · `src/support/support.service.ts:178` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AdminTicketDto`](BACKEND_ENDPOINTS.md#dto-adminticketdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 TICKET_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: soporte y novedades |

<a id="e-042"></a>

### E-042 · `POST /api/v1/admin/support/tickets/:id/messages`

Respuesta del admin: en la plataforma (si tiene cuenta) y por email.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.replyTicket` · `src/support/support.controller.ts:123` |
| Servicio | `SupportService.adminReply` · `src/support/support.service.ts:139` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AdminTicketReplyDto`](BACKEND_ENDPOINTS.md#dto-adminticketreplydto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`AdminTicketDto`](BACKEND_ENDPOINTS.md#dto-adminticketdto) |
| Errores | `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 TICKET_NOT_FOUND`, `409 FILE_IN_USE`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: soporte y novedades |

## Módulo `admin/users`

<a id="e-043"></a>

### E-043 · `GET /api/v1/admin/users`

Búsqueda por nombre o email, rol y estado (las cuentas anonimizadas no aparecen).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminPanelController.search` · `src/admin/admin-panel.controller.ts:26` |
| Servicio | `AdminPanelService.search` · `src/admin/admin-panel.service.ts:90` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`AdminUsersQueryDto`](BACKEND_ENDPOINTS.md#dto-adminusersquerydto) |
| Respuesta | `200` · [`AdminUserListDto`](BACKEND_ENDPOINTS.md#dto-adminuserlistdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-044"></a>

### E-044 · `DELETE /api/v1/admin/users/:id`

Baja (ADR 0013 y 0016): restaurable con `restore` durante el período de gracia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.delete` · `src/users/admin-users.controller.ts:118` |
| Servicio | `AccountsService.deleteByAdmin` · `src/users/accounts.service.ts:214` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AccountActionDto`](BACKEND_ENDPOINTS.md#dto-accountactiondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 DELETION_ALREADY_SCHEDULED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-045"></a>

### E-045 · `GET /api/v1/admin/users/:id`

Ficha completa: datos, suscripción, sanciones, strikes, reportes y pagos (FI §19).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminPanelController.detail` · `src/admin/admin-panel.controller.ts:32` |
| Servicio | `AdminPanelService.detail` · `src/admin/admin-panel.service.ts:125` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`AdminUserDetailDto`](BACKEND_ENDPOINTS.md#dto-adminuserdetaildto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-046"></a>

### E-046 · `PATCH /api/v1/admin/users/:id`

Edita datos de un cliente o profesional (ADR 0021): se aplican directo, con motivo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.updateData` · `src/users/admin-users.controller.ts:47` |
| Servicio | `PersonalDataService.updateByAdmin` · `src/users/personal-data.service.ts:66` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AdminUpdatePersonalDataDto`](BACKEND_ENDPOINTS.md#dto-adminupdatepersonaldatadto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`PersonalDataDto`](BACKEND_ENDPOINTS.md#dto-personaldatadto) |
| Errores | `400 FIELD_NOT_ALLOWED`, `400 INVALID_LOCALITY`, `400 INVALID_NEIGHBORHOOD`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-047"></a>

### E-047 · `POST /api/v1/admin/users/:id/ban`

Baneo: dura hasta que el admin lo levante; reemplaza a una suspensión en curso.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.ban` · `src/users/admin-users.controller.ts:73` |
| Servicio | `AccountsService.ban` · `src/users/accounts.service.ts:88` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`BanAccountDto`](BACKEND_ENDPOINTS.md#dto-banaccountdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-048"></a>

### E-048 · `POST /api/v1/admin/users/:id/change-role`

Cambio de rol (ADR 0012): el perfil anterior queda inactivo (no se borra) y las sesiones se revocan para que el nuevo rol rija desde el próximo login.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.changeRole` · `src/users/admin-users.controller.ts:95` |
| Servicio | `AccountsService.changeRole` · `src/users/accounts.service.ts:187` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ChangeRoleDto`](BACKEND_ENDPOINTS.md#dto-changeroledto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) |
| Errores | `400 INVALID_LOCALITY`, `400 INVALID_NEIGHBORHOOD`, `400 INVALID_PROFESSION`, `400 INVALID_SERVICE_AREAS`, `400 NEIGHBORHOOD_REQUIRED`, `400 PROFESSIONAL_DATA_REQUIRED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `409 SAME_ROLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-049"></a>

### E-049 · `POST /api/v1/admin/users/:id/message`

Mensaje del admin a un usuario (FI §19): una notificación, auditada.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminSupportController.message` · `src/support/support.controller.ts:158` |
| Servicio | `AnnouncementsService.message` · `src/support/announcements.service.ts:135` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AdminMessageDto`](BACKEND_ENDPOINTS.md#dto-adminmessagedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-050"></a>

### E-050 · `GET /api/v1/admin/users/:id/metrics`

Para el admin (solo lectura) o el propio profesional ya autorizado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminMetricsController.forUser` · `src/metrics/metrics.controller.ts:33` |
| Servicio | `MetricsService.forUser` · `src/metrics/metrics.service.ts:96` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Query | [`MetricsQueryDto`](BACKEND_ENDPOINTS.md#dto-metricsquerydto) |
| Respuesta | `200` · [`ProfessionalMetricsDto`](BACKEND_ENDPOINTS.md#dto-professionalmetricsdto) |
| Errores | `400 INVALID_RANGE`, `400 RANGE_TOO_LONG`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: ficha del usuario (métricas) |

<a id="e-051"></a>

### E-051 · `POST /api/v1/admin/users/:id/password-reset`

Envía al email registrado del usuario un enlace de un solo uso (30 min) para elegir una contraseña nueva. El admin nunca ve ni define la contraseña. Motivo obligatorio y auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminAuthController.passwordReset` · `src/auth/admin-auth.controller.ts:22` |
| Servicio | `AuthService.adminRequestPasswordReset` · `src/auth/services/auth.service.ts:211` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AdminReasonDto`](BACKEND_ENDPOINTS.md#dto-adminreasondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `202` · [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-052"></a>

### E-052 · `POST /api/v1/admin/users/:id/restore`

Levanta una suspensión, un baneo o una baja todavía en período de gracia (ADR 0016). Vuelve a ACTIVE solo si la identidad está aprobada; si no, a PENDING_VERIFICATION.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.restore` · `src/users/admin-users.controller.ts:84` |
| Servicio | `AccountsService.restore` · `src/users/accounts.service.ts:147` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AccountActionDto`](BACKEND_ENDPOINTS.md#dto-accountactiondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-053"></a>

### E-053 · `POST /api/v1/admin/users/:id/revoke-sessions`

Cuenta comprometida (ADR 0014): cierra todos sus dispositivos.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.revokeSessions` · `src/users/admin-users.controller.ts:107` |
| Servicio | `AccountsService.revokeSessions` · `src/users/accounts.service.ts:175` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AccountActionDto`](BACKEND_ENDPOINTS.md#dto-accountactiondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-054"></a>

### E-054 · `POST /api/v1/admin/users/:id/sanctions`

Aplica una sanción (advertencia, suspensión, baneo o perfil oculto). Con motivo, notificada y auditada.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.sanction` · `src/moderation/moderation.controller.ts:213` |
| Servicio | `SanctionsService.apply` · `src/moderation/sanctions.service.ts:141` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ApplySanctionDto`](BACKEND_ENDPOINTS.md#dto-applysanctiondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`SanctionDto`](BACKEND_ENDPOINTS.md#dto-sanctiondto) |
| Errores | `400 END_DATE_NOT_ALLOWED`, `400 INVALID_END_DATE`, `400 INVALID_REPORT`, `400 NOT_A_PROFESSIONAL`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-055"></a>

### E-055 · `POST /api/v1/admin/users/:id/strikes`

Agrega un strike (peso 1 a 3) a una cuenta, opcionalmente ligado a un reporte. Notificado y auditado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminModerationController.addStrike` · `src/moderation/moderation.controller.ts:192` |
| Servicio | `SanctionsService.addStrike` · `src/moderation/sanctions.service.ts:98` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`AddStrikeDto`](BACKEND_ENDPOINTS.md#dto-addstrikedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`StrikeDto`](BACKEND_ENDPOINTS.md#dto-strikedto) |
| Errores | `400 INVALID_REPORT`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

<a id="e-056"></a>

### E-056 · `POST /api/v1/admin/users/:id/suspend`

Suspensión (ADR 0029): con fecha de fin se levanta sola al llegar (tarea horaria); sin fecha, hasta que el admin la levante. Queda en el historial de sanciones.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AdminUsersController.suspend` · `src/users/admin-users.controller.ts:57` |
| Servicio | `AccountsService.suspend` · `src/users/accounts.service.ts:65` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`SuspendAccountDto`](BACKEND_ENDPOINTS.md#dto-suspendaccountdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) |
| Errores | `400 INVALID_END_DATE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Admin: usuarios y ficha |

## Módulo `announcements`

<a id="e-057"></a>

### E-057 · `GET /api/v1/announcements/:id`

Texto completo, solo para quien la recibió.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AnnouncementsController.get` · `src/support/support.controller.ts:90` |
| Servicio | `AnnouncementsService.get` · `src/support/announcements.service.ts:120` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`AnnouncementDto`](BACKEND_ENDPOINTS.md#dto-announcementdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ayuda: soporte, contacto y novedades |

## Módulo `auth`

<a id="e-058"></a>

### E-058 · `GET /api/v1/auth/csrf`

Token CSRF para un frontend recién recargado (lo tenía solo en memoria). Funciona con la cookie de refresh, así sirve aunque el access haya vencido. CORS impide que otro sitio lea la respuesta.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.csrfToken` · `src/auth/auth.controller.ts:222` |
| Servicio | `AuthCookiesService.read` · `src/auth/services/auth-cookies.service.ts:16`<br>`SessionsService.activeFamilyOf` · `src/auth/services/sessions.service.ts:156` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`CsrfTokenDto`](BACKEND_ENDPOINTS.md#dto-csrftokendto) |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `401 UNAUTHORIZED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Cliente HTTP (renovación de sesión y token CSRF) |

<a id="e-059"></a>

### E-059 · `POST /api/v1/auth/email/resend`

Reenvía el email de verificación a la cuenta en sesión.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.resendEmail` · `src/auth/auth.controller.ts:280` |
| Servicio | `AuthService.resendEmailVerification` · `src/auth/services/auth.service.ts:191` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 3 por hora |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Verificar email (/verificar-email) y aviso de reenvío |

<a id="e-060"></a>

### E-060 · `POST /api/v1/auth/email/verify`

Verifica el email con el token del enlace recibido.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.verifyEmail` · `src/auth/auth.controller.ts:272` |
| Servicio | `AuthService.verifyEmail` · `src/auth/services/auth.service.ts:180` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 10 por minuto |
| Body | [`TokenDto`](BACKEND_ENDPOINTS.md#dto-tokendto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 INVALID_TOKEN`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Verificar email (/verificar-email) y aviso de reenvío |

<a id="e-061"></a>

### E-061 · `GET /api/v1/auth/google`

El botón "Entrar con Google" navega acá; redirige a Google.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.start` · `src/auth/google/google-auth.controller.ts:41` |
| Servicio | `GoogleAuthService.start` · `src/auth/google/google-auth.service.ts:102` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: 20 por minuto |
| Respuesta | `200` · 302 a Google |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `404 GOOGLE_LOGIN_DISABLED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-062"></a>

### E-062 · `GET /api/v1/auth/google/callback`

Vuelta de Google. Redirige al frontend: `/ingresar/google?resultado=session|link|signup|error` (con `codigo` si hubo error). Con `session`, las cookies de sesión ya quedaron puestas.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.callback` · `src/auth/google/google-auth.controller.ts:53` |
| Servicio | `GoogleAuthService.callback` · `src/auth/google/google-auth.service.ts:125` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: 20 por minuto |
| Respuesta | `200` · 302 a `<FRONTEND_URL>/ingresar/google?resultado=session|link|signup|error[&codigo=…]` |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `? ACCOUNT_UNAVAILABLE`, `? CANCELLED`, `? EMAIL_NOT_VERIFIED`, `? GOOGLE_FAILED`, `? GOOGLE_NOT_ALLOWED`, `? INVALID_STATE`, `? OTHER_GOOGLE_ACCOUNT`, `404 GOOGLE_LOGIN_DISABLED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-063"></a>

### E-063 · `DELETE /api/v1/auth/google/link`

Desvincular Google: solo si la cuenta tiene contraseña.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.unlink` · `src/auth/google/google-auth.controller.ts:120` |
| Servicio | `GoogleAuthService.unlink` · `src/auth/google/google-auth.service.ts:233` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 PASSWORD_REQUIRED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-064"></a>

### E-064 · `POST /api/v1/auth/google/link`

Vincular probando la contraseña de la cuenta existente.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.link` · `src/auth/google/google-auth.controller.ts:70` |
| Servicio | `GoogleAuthService.linkWithPassword` · `src/auth/google/google-auth.service.ts:150` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 5 por minuto |
| Body | [`GoogleLinkPasswordDto`](BACKEND_ENDPOINTS.md#dto-googlelinkpassworddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `200` · [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 GOOGLE_PENDING_EXPIRED`, `401 INVALID_CREDENTIALS`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `404 GOOGLE_LOGIN_DISABLED`, `409 GOOGLE_ALREADY_LINKED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-065"></a>

### E-065 · `POST /api/v1/auth/google/link/confirm`

Confirma con el enlace del email (puede abrirse en otro navegador): vincula e inicia sesión.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.confirm` · `src/auth/google/google-auth.controller.ts:92` |
| Servicio | `GoogleAuthService.confirmEmailLink` · `src/auth/google/google-auth.service.ts:182` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 10 por minuto |
| Body | [`GoogleLinkConfirmDto`](BACKEND_ENDPOINTS.md#dto-googlelinkconfirmdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `200` · [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 GOOGLE_PENDING_EXPIRED`, `401 INVALID_TOKEN`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `409 GOOGLE_ALREADY_LINKED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-066"></a>

### E-066 · `POST /api/v1/auth/google/link/email`

Vincular con un enlace al email de la cuenta existente.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.linkByEmail` · `src/auth/google/google-auth.controller.ts:84` |
| Servicio | `GoogleAuthService.requestEmailLink` · `src/auth/google/google-auth.service.ts:170` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 3 por minuto |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `202` · Sin cuerpo |
| Errores | `401 GOOGLE_PENDING_EXPIRED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `404 GOOGLE_LOGIN_DISABLED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-067"></a>

### E-067 · `GET /api/v1/auth/google/pending`

Datos de la vinculación o del registro pendiente (cookie de 30 minutos).

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.pending` · `src/auth/google/google-auth.controller.ts:62` |
| Servicio | `GoogleAuthService.pending` · `src/auth/google/google-auth.service.ts:139` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`GooglePendingDto`](BACKEND_ENDPOINTS.md#dto-googlependingdto) |
| Errores | `401 GOOGLE_PENDING_EXPIRED`, `404 GOOGLE_LOGIN_DISABLED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-068"></a>

### E-068 · `POST /api/v1/auth/google/register`

Registro con Google: completa los datos obligatorios y queda en PENDING_VERIFICATION.

| Campo | Valor |
| --- | --- |
| Controller / handler | `GoogleAuthController.register` · `src/auth/google/google-auth.controller.ts:106` |
| Servicio | `GoogleAuthService.register` · `src/auth/google/google-auth.service.ts:206` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 5 por minuto |
| Body | [`GoogleRegisterDto`](BACKEND_ENDPOINTS.md#dto-googleregisterdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `201` · [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 INVALID_NEIGHBORHOOD`, `400 INVALID_PROFESSION`, `400 VALIDATION_FAILED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 GOOGLE_PENDING_EXPIRED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `404 GOOGLE_LOGIN_DISABLED`, `409 GOOGLE_ACCOUNT_EXISTS`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Con `GOOGLE_PROVIDER=disabled` responde 404; en desarrollo hay un proveedor simulado. Faltan las credenciales reales. |
| Interfaz | Ingresar / registrarse con Google |

<a id="e-069"></a>

### E-069 · `POST /api/v1/auth/login`

Login con contraseña. Se auditan los intentos (SEG §20.2) con la IP seudonimizada; un email que no existe queda sin usuario asociado (no se guarda el email).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.login` · `src/auth/auth.controller.ts:89` |
| Servicio | `AuthService.login` · `src/auth/services/auth.service.ts:74`<br>`LoginContextService.forLogin` · `src/auth/services/login-context.service.ts:26`<br>`TokenService.signMfaChallenge` · `src/auth/services/token.service.ts:84`<br>`AuthCookiesService.set` · `src/auth/services/auth-cookies.service.ts:21`<br>`SessionResponderService.respond` · `src/auth/services/session-responder.service.ts:26` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 5 por minuto |
| Body | [`LoginDto`](BACKEND_ENDPOINTS.md#dto-logindto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `200` · `SessionResponseDto` (`{ user, csrfToken }`) o, para el admin, `MfaRequiredDto` (`{ mfaRequired: true }`) + cookie `nx_mfa` |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 CAPTCHA_REQUIRED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 INVALID_CREDENTIALS`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ingresar (y segundo factor del admin) |

<a id="e-070"></a>

### E-070 · `POST /api/v1/auth/logout`

Tolerante: borra las cookies aunque la sesión ya no exista. Si existe, exige CSRF.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.logout` · `src/auth/auth.controller.ts:178` |
| Servicio | `AuthCookiesService.read` · `src/auth/services/auth-cookies.service.ts:16`<br>`SessionsService.activeFamilyOf` · `src/auth/services/sessions.service.ts:156`<br>`CsrfService.assertValid` · `src/auth/services/csrf.service.ts:32`<br>`SessionsService.revokeFamilyOf` · `src/auth/services/sessions.service.ts:195`<br>`AuthCookiesService.clearSession` · `src/auth/services/auth-cookies.service.ts:32` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: global |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `204` · Sin cuerpo |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `403 CSRF_INVALID`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: dispositivos y cerrar sesión |

<a id="e-071"></a>

### E-071 · `POST /api/v1/auth/logout-all`

Cierra todas las sesiones de la cuenta (todos los dispositivos) y borra las cookies.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.logoutAll` · `src/auth/auth.controller.ts:193` |
| Servicio | `SessionsService.revokeAllForUser` · `src/auth/services/sessions.service.ts:201`<br>`AuthCookiesService.clearSession` · `src/auth/services/auth-cookies.service.ts:32` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: dispositivos y cerrar sesión |

<a id="e-072"></a>

### E-072 · `GET /api/v1/auth/me`

Usuario en sesión: datos, estado, verificación, fotos y métodos de acceso (contraseña, Google).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.me` · `src/auth/auth.controller.ts:206` |
| Servicio | `AuthService.currentUser` · `src/auth/services/auth.service.ts:176`<br>`UploadsService.avatarUrls` · `src/uploads/uploads.service.ts:221`<br>`GoogleAuthService.accessMethods` · `src/auth/google/google-auth.service.ts:258` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`MeDto`](BACKEND_ENDPOINTS.md#dto-medto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Sesión actual (layout, guardas de rutas) |

<a id="e-073"></a>

### E-073 · `POST /api/v1/auth/mfa/verify`

Devuelve el id del usuario o null si el desafío es inválido o venció.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.verifyMfa` · `src/auth/auth.controller.ts:112` |
| Servicio | `TokenService.verifyMfaChallenge` · `src/auth/services/token.service.ts:100`<br>`AuthCookiesService.read` · `src/auth/services/auth-cookies.service.ts:16`<br>`AuthService.verifyMfa` · `src/auth/services/auth.service.ts:148`<br>`LoginContextService.forLogin` · `src/auth/services/login-context.service.ts:26`<br>`AuthCookiesService.clear` · `src/auth/services/auth-cookies.service.ts:28`<br>`SessionResponderService.respond` · `src/auth/services/session-responder.service.ts:26` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 5 por minuto |
| Body | [`MfaVerifyDto`](BACKEND_ENDPOINTS.md#dto-mfaverifydto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `200` · [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 INVALID_MFA`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ingresar (y segundo factor del admin) |

<a id="e-074"></a>

### E-074 · `POST /api/v1/auth/password/change`

Cambio con la contraseña actual: cierra los demás dispositivos y conserva el actual.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.changePassword` · `src/auth/auth.controller.ts:309` |
| Servicio | `AuthService.changePassword` · `src/auth/services/auth.service.ts:265` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 5 por minuto |
| Body | [`ChangePasswordDto`](BACKEND_ENDPOINTS.md#dto-changepassworddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 INVALID_CURRENT_PASSWORD`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 NO_PASSWORD_SET`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |

<a id="e-075"></a>

### E-075 · `POST /api/v1/auth/password/forgot`

Apagado por defecto (ADR 0002): responde 404 mientras PASSWORD_SELF_RESET_ENABLED=false.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.forgotPassword` · `src/auth/auth.controller.ts:291` |
| Servicio | `AuthService.requestSelfPasswordReset` · `src/auth/services/auth.service.ts:203` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 3 por hora |
| Body | [`EmailDto`](BACKEND_ENDPOINTS.md#dto-emaildto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `202` · [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Apagado |
| Observaciones | Responde 404 mientras `PASSWORD_SELF_RESET_ENABLED=false` (ADR 0002: el restablecimiento lo dispara el admin). |
| Interfaz | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |

<a id="e-076"></a>

### E-076 · `POST /api/v1/auth/password/reset`

Usa el enlace del email (lo dispara el admin, ADR 0002). Cierra todas las sesiones.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.resetPassword` · `src/auth/auth.controller.ts:301` |
| Servicio | `AuthService.resetPassword` · `src/auth/services/auth.service.ts:234` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 5 por minuto |
| Body | [`ResetPasswordDto`](BACKEND_ENDPOINTS.md#dto-resetpassworddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 INVALID_TOKEN`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |

<a id="e-077"></a>

### E-077 · `POST /api/v1/auth/password/set`

Cuentas solo Google: crear la primera contraseña, con un login reciente (ADR 0023).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.setPassword` · `src/auth/auth.controller.ts:320` |
| Servicio | `AuthService.setPassword` · `src/auth/services/auth.service.ts:305` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 5 por minuto |
| Body | [`SetPasswordDto`](BACKEND_ENDPOINTS.md#dto-setpassworddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 REAUTH_REQUIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 PASSWORD_ALREADY_SET`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |

<a id="e-078"></a>

### E-078 · `POST /api/v1/auth/refresh`

Rota el refresh y renueva el access. Exige el token CSRF del dispositivo (se valida acá porque el access puede estar vencido). Reutilizar un refresh ya rotado revoca toda la familia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.refresh` · `src/auth/auth.controller.ts:138` |
| Servicio | `AuthCookiesService.read` · `src/auth/services/auth-cookies.service.ts:16`<br>`SessionsService.activeFamilyOf` · `src/auth/services/sessions.service.ts:156`<br>`CsrfService.assertValid` · `src/auth/services/csrf.service.ts:32`<br>`SessionsService.rotate` · `src/auth/services/sessions.service.ts:100`<br>`AuthCookiesService.clearSession` · `src/auth/services/auth-cookies.service.ts:32`<br>`TokenService.signAccessToken` · `src/auth/services/token.service.ts:42`<br>`AuthCookiesService.set` · `src/auth/services/auth-cookies.service.ts:21`<br>`TokenService.accessTtlFor` · `src/auth/services/token.service.ts:36` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 30 por minuto |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `200` · [`CsrfTokenDto`](BACKEND_ENDPOINTS.md#dto-csrftokendto) |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `403 CSRF_INVALID`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Cliente HTTP (renovación de sesión y token CSRF) |

<a id="e-079"></a>

### E-079 · `POST /api/v1/auth/register`

Registro de cliente o profesional. Responde siempre 202 con un mensaje genérico (exista o no el email).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.register` · `src/auth/auth.controller.ts:79` |
| Servicio | `RegistrationService.register` · `src/auth/services/registration.service.ts:45` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 5 por minuto |
| Body | [`RegisterDto`](BACKEND_ENDPOINTS.md#dto-registerdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `202` · [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) |
| Errores | `400 CAPTCHA_REQUIRED`, `400 INVALID_NEIGHBORHOOD`, `400 INVALID_PROFESSION`, `400 VALIDATION_FAILED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Registro (cliente o profesional) |

<a id="e-080"></a>

### E-080 · `GET /api/v1/auth/sessions`

Dispositivos activos del usuario: la fila vigente de cada familia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.listSessions` · `src/auth/auth.controller.ts:236` |
| Servicio | `SessionsService.listActive` · `src/auth/services/sessions.service.ts:218` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`SessionSummaryDto`](BACKEND_ENDPOINTS.md#dto-sessionsummarydto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: dispositivos y cerrar sesión |

<a id="e-081"></a>

### E-081 · `DELETE /api/v1/auth/sessions/:id`

Cierra un dispositivo propio. 404 si no existe o no es del usuario (no confirma existencia).

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.closeSession` · `src/auth/auth.controller.ts:244` |
| Servicio | `SessionsService.closeOwnFamily` · `src/auth/services/sessions.service.ts:234`<br>`AuthCookiesService.clearSession` · `src/auth/services/auth-cookies.service.ts:32` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: dispositivos y cerrar sesión |

<a id="e-082"></a>

### E-082 · `POST /api/v1/auth/sessions/close-by-link`

"No fui yo" del email de dispositivo nuevo (ADR 0031): cierra esa sesión sin estar logueado. Es POST (los servicios de email abren los enlaces para revisarlos): el enlace lleva a una página del frontend con un botón.

| Campo | Valor |
| --- | --- |
| Controller / handler | `AuthController.closeByLink` · `src/auth/auth.controller.ts:263` |
| Servicio | `SessionsService.closeByLink` · `src/auth/services/sessions.service.ts:256` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 10 por hora |
| Body | [`TokenDto`](BACKEND_ENDPOINTS.md#dto-tokendto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `200` · [`SessionClosedDto`](BACKEND_ENDPOINTS.md#dto-sessioncloseddto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Página /cerrar-sesion (enlace del email de dispositivo nuevo) |

## Módulo `catalog`

<a id="e-083"></a>

### E-083 · `GET /api/v1/catalog/professionals`

Orden (ADR 0022): plan, disponibles ahora, perfil más completo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `CatalogController.search` · `src/catalog/catalog.controller.ts:24` |
| Servicio | `CatalogService.search` · `src/catalog/catalog.service.ts:139`<br>`MetricsViewerService.identify` · `src/metrics/metrics-viewer.service.ts:34` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`CatalogQueryDto`](BACKEND_ENDPOINTS.md#dto-catalogquerydto) |
| Respuesta | `200` · [`CatalogPageDto`](BACKEND_ENDPOINTS.md#dto-catalogpagedto) |
| Errores | `400 INVALID_NEIGHBORHOOD`, `400 VALIDATION_FAILED / BAD_REQUEST`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Catálogo de profesionales (búsqueda y filtros) |

<a id="e-084"></a>

### E-084 · `GET /api/v1/catalog/professionals/:slug`

Detalle con email y teléfono: límite más estricto contra la recolección de contactos (C-19).

| Campo | Valor |
| --- | --- |
| Controller / handler | `CatalogController.profile` · `src/catalog/catalog.controller.ts:31` |
| Servicio | `CatalogService.profile` · `src/catalog/catalog.service.ts:219`<br>`MetricsViewerService.identify` · `src/metrics/metrics-viewer.service.ts:34` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: 30 por minuto |
| Parámetros de ruta | `slug` |
| Respuesta | `200` · [`PublicProfileDto`](BACKEND_ENDPOINTS.md#dto-publicprofiledto) |
| Errores | `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Perfil público del profesional |

<a id="e-085"></a>

### E-085 · `GET /api/v1/catalog/professionals/:slug/reviews`

Reseñas públicas de un profesional del catálogo, las más recientes primero.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PublicReviewsController.list` · `src/reviews/reviews.controller.ts:118` |
| Servicio | `ReviewsService.forProfile` · `src/reviews/reviews.service.ts:178` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `slug` |
| Query | [`PageQueryDto`](BACKEND_ENDPOINTS.md#dto-pagequerydto-reviews-dto-reviews-dto-ts) |
| Respuesta | `200` · [`ReviewPageDto`](BACKEND_ENDPOINTS.md#dto-reviewpagedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Perfil público: reseñas |

## Módulo `chat`

<a id="e-086"></a>

### E-086 · `GET /api/v1/chat/attachments/:fileId`

Adjunto privado: enlace firmado de 5 minutos (Cloudinary) o el contenido (local).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.attachment` · `src/chat/chat.controller.ts:115` |
| Servicio | `ChatService.attachment` · `src/chat/chat.service.ts:266` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `fileId` (uuid) |
| Respuesta | `200` · 302 a un enlace firmado de 5 minutos (Cloudinary) o el binario con `Cache-Control: private, no-store` (local) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 CONVERSATION_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-087"></a>

### E-087 · `GET /api/v1/chat/conversations`

Mis conversaciones, las más recientes primero (hasta 100).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.list` · `src/chat/chat.controller.ts:55` |
| Servicio | `ChatService.list` · `src/chat/chat.service.ts:108` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`ConversationDto`](BACKEND_ENDPOINTS.md#dto-conversationdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `409 PROFESSIONAL_UNAVAILABLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Problemático |
| Observaciones | **Riesgo probable:** si la contraparte se dio de baja y se anonimizó, `chat.service.ts:441` la busca sin `withDeleted` y la respuesta sería 500. |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-088"></a>

### E-088 · `POST /api/v1/chat/conversations`

Solo el cliente abre un chat, y solo con un profesional visible en el catálogo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.open` · `src/chat/chat.controller.ts:47` |
| Servicio | `ChatService.open` · `src/chat/chat.service.ts:71` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 20 por minuto |
| Body | [`OpenConversationDto`](BACKEND_ENDPOINTS.md#dto-openconversationdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`ConversationDto`](BACKEND_ENDPOINTS.md#dto-conversationdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFESSIONAL_NOT_AVAILABLE`, `409 PROFESSIONAL_UNAVAILABLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Parcial |
| Observaciones | El catálogo y el perfil público **no devuelven el id del profesional** que pide este endpoint: desde el catálogo no se puede iniciar. Solo funciona con ids que el frontend ya tenga por otra vía (chat, favoritos, foro). **Riesgo probable:** si la contraparte se dio de baja y se anonimizó, `chat.service.ts:441` la busca sin `withDeleted` y la respuesta sería 500. |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-089"></a>

### E-089 · `GET /api/v1/chat/conversations/:id`

Una conversación propia: contraparte, último mensaje, no leídos y si puedo escribir.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.get` · `src/chat/chat.controller.ts:61` |
| Servicio | `ChatService.get` · `src/chat/chat.service.ts:124` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`ConversationDto`](BACKEND_ENDPOINTS.md#dto-conversationdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 CONVERSATION_NOT_FOUND`, `409 PROFESSIONAL_UNAVAILABLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Problemático |
| Observaciones | **Riesgo probable:** si la contraparte se dio de baja y se anonimizó, `chat.service.ts:441` la busca sin `withDeleted` y la respuesta sería 500. |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-090"></a>

### E-090 · `GET /api/v1/chat/conversations/:id/messages`

Mensajes de una conversación propia, paginados hacia atrás con `before`.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.messages` · `src/chat/chat.controller.ts:70` |
| Servicio | `ChatService.messages` · `src/chat/chat.service.ts:129` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Query | [`MessagesQueryDto`](BACKEND_ENDPOINTS.md#dto-messagesquerydto) |
| Respuesta | `200` · Array de [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 CONVERSATION_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-091"></a>

### E-091 · `POST /api/v1/chat/conversations/:id/messages`

Envía un mensaje (texto y/o hasta 5 adjuntos CHAT_ATTACHMENT). Avisa en tiempo real y notifica.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.send` · `src/chat/chat.controller.ts:80` |
| Servicio | `ChatService.send` · `src/chat/chat.service.ts:144` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: 30 por minuto |
| Parámetros de ruta | `id` (uuid) |
| Body | [`SendMessageDto`](BACKEND_ENDPOINTS.md#dto-sendmessagedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) |
| Errores | `400 EMPTY_MESSAGE`, `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONVERSATION_NOT_FOUND`, `404 FILE_NOT_FOUND`, `409 FILE_NOT_READY`, `409 PROFESSIONAL_UNAVAILABLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-092"></a>

### E-092 · `POST /api/v1/chat/conversations/:id/read`

Confirmación de lectura: avisa al otro hasta dónde leyó.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.read` · `src/chat/chat.controller.ts:91` |
| Servicio | `ChatService.markRead` · `src/chat/chat.service.ts:251` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONVERSATION_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-093"></a>

### E-093 · `DELETE /api/v1/chat/messages/:id`

Eliminar: siempre; se oculta para los dos. Guarda la versión original (ADR 0024).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.remove` · `src/chat/chat.controller.ts:108` |
| Servicio | `ChatService.remove` · `src/chat/chat.service.ts:241` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONVERSATION_NOT_FOUND`, `404 MESSAGE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mensajes (lista de chats y conversación) |

<a id="e-094"></a>

### E-094 · `PATCH /api/v1/chat/messages/:id`

Solo durante los 15 minutos siguientes al envío.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ChatController.edit` · `src/chat/chat.controller.ts:98` |
| Servicio | `ChatService.edit` · `src/chat/chat.service.ts:221` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`EditMessageDto`](BACKEND_ENDPOINTS.md#dto-editmessagedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) |
| Errores | `400 EMPTY_MESSAGE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONVERSATION_NOT_FOUND`, `404 MESSAGE_NOT_FOUND`, `409 EDIT_WINDOW_EXPIRED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mensajes (lista de chats y conversación) |

## Módulo `contracts`

<a id="e-095"></a>

### E-095 · `GET /api/v1/contracts`

Sin plan vigente, el profesional ve solo las contrataciones en curso (C-12, ADR 0027).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ContractsController.list` · `src/requests/requests.controller.ts:130` |
| Servicio | `RequestsService.listContracts` · `src/requests/requests.service.ts:529` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Trabajos (contrataciones) |

<a id="e-096"></a>

### E-096 · `GET /api/v1/contracts/:id`

Una contratación propia (como cliente o profesional).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ContractsController.get` · `src/requests/requests.controller.ts:136` |
| Servicio | `RequestsService.getContract` · `src/requests/requests.service.ts:546` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 CONTRACT_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Trabajos (contrataciones) |

<a id="e-097"></a>

### E-097 · `POST /api/v1/contracts/:id/cancel`

Avance o cancelación de la contratación (tabla de transiciones, ADR 0025). No exige plan: solo se mueven contrataciones en curso, y el profesional sin plan puede llevarlas hasta el cierre (C-12, ADR 0027).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ContractsController.cancel` · `src/requests/requests.controller.ts:180` |
| Servicio | `RequestsService.transition` · `src/requests/requests.service.ts:408` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ReasonDto`](BACKEND_ENDPOINTS.md#dto-reasondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `400 INVALID_DATE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONTRACT_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Trabajos (contrataciones) |

<a id="e-098"></a>

### E-098 · `POST /api/v1/contracts/:id/complete`

Terminar: no hace falta que el cliente confirme (FI §11.4).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ContractsController.complete` · `src/requests/requests.controller.ts:169` |
| Servicio | `RequestsService.transition` · `src/requests/requests.service.ts:408` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `400 INVALID_DATE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONTRACT_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Trabajos (contrataciones) |

<a id="e-099"></a>

### E-099 · `POST /api/v1/contracts/:id/schedule`

Avance o cancelación de la contratación (tabla de transiciones, ADR 0025). No exige plan: solo se mueven contrataciones en curso, y el profesional sin plan puede llevarlas hasta el cierre (C-12, ADR 0027).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ContractsController.schedule` · `src/requests/requests.controller.ts:142` |
| Servicio | `RequestsService.transition` · `src/requests/requests.service.ts:408` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ScheduleDto`](BACKEND_ENDPOINTS.md#dto-scheduledto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `400 INVALID_DATE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONTRACT_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Trabajos (contrataciones) |

<a id="e-100"></a>

### E-100 · `POST /api/v1/contracts/:id/start`

Empezar: la respuesta sugiere ponerse en "Trabajando" (C-30).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ContractsController.start` · `src/requests/requests.controller.ts:157` |
| Servicio | `RequestsService.transition` · `src/requests/requests.service.ts:408` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `400 INVALID_DATE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONTRACT_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Trabajos (contrataciones) |

## Módulo `customers`

<a id="e-101"></a>

### E-101 · `GET /api/v1/customers/me`

Datos extra del cliente que ve el profesional (texto libre).

| Campo | Valor |
| --- | --- |
| Controller / handler | `CustomersController.me` · `src/users/customers.controller.ts:43` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`CustomerProfileDto`](BACKEND_ENDPOINTS.md#dto-customerprofiledto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta (cliente): datos para el profesional |

<a id="e-102"></a>

### E-102 · `PATCH /api/v1/customers/me`

Actualiza los datos extra del cliente (null o texto vacío los borra).

| Campo | Valor |
| --- | --- |
| Controller / handler | `CustomersController.update` · `src/users/customers.controller.ts:52` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`UpdateCustomerProfileDto`](BACKEND_ENDPOINTS.md#dto-updatecustomerprofiledto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`CustomerProfileDto`](BACKEND_ENDPOINTS.md#dto-customerprofiledto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta (cliente): datos para el profesional |

## Módulo `evidence`

<a id="e-103"></a>

### E-103 · `GET /api/v1/evidence/:fileId`

Entrega un archivo privado ya autorizado por el llamador (adjuntos del chat): un enlace firmado de 5 minutos (Cloudinary) o el contenido (adaptador local).

| Campo | Valor |
| --- | --- |
| Controller / handler | `EvidenceController.content` · `src/moderation/moderation.controller.ts:112` |
| Servicio | `UploadsService.privateContent` · `src/uploads/uploads.service.ts:261` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL, ADMIN |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `fileId` (uuid) |
| Respuesta | `200` · 302 a un enlace firmado (Cloudinary) o el binario (local) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reportar contenido / mis reportes |

## Módulo `favorites`

<a id="e-104"></a>

### E-104 · `GET /api/v1/favorites`

Mis favoritos; los que ya no aparecen en el catálogo vienen sin datos personales (`listed: false`).

| Campo | Valor |
| --- | --- |
| Controller / handler | `FavoritesController.list` · `src/favorites/favorites.controller.ts:32` |
| Servicio | `FavoritesService.list` · `src/favorites/favorites.service.ts:37` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`FavoriteDto`](BACKEND_ENDPOINTS.md#dto-favoritedto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Favoritos (cliente) |

<a id="e-105"></a>

### E-105 · `DELETE /api/v1/favorites/:professionalId`

Quita un favorito.

| Campo | Valor |
| --- | --- |
| Controller / handler | `FavoritesController.remove` · `src/favorites/favorites.controller.ts:60` |
| Servicio | `FavoritesService.remove` · `src/favorites/favorites.service.ts:98` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `professionalId` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Favoritos (cliente) |

<a id="e-106"></a>

### E-106 · `PATCH /api/v1/favorites/:professionalId`

Activa o desactiva el aviso de disponibilidad de un favorito.

| Campo | Valor |
| --- | --- |
| Controller / handler | `FavoritesController.setAlerts` · `src/favorites/favorites.controller.ts:49` |
| Servicio | `FavoritesService.setAlerts` · `src/favorites/favorites.service.ts:91` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `professionalId` (uuid) |
| Body | [`FavoriteAlertsDto`](BACKEND_ENDPOINTS.md#dto-favoritealertsdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Favoritos (cliente) |

<a id="e-107"></a>

### E-107 · `PUT /api/v1/favorites/:professionalId`

Guarda (o actualiza) un favorito. Solo profesionales que aparecen en el catálogo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `FavoritesController.save` · `src/favorites/favorites.controller.ts:38` |
| Servicio | `FavoritesService.save` · `src/favorites/favorites.service.ts:75` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `professionalId` (uuid) |
| Body | [`SaveFavoriteDto`](BACKEND_ENDPOINTS.md#dto-savefavoritedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFESSIONAL_NOT_AVAILABLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Parcial |
| Observaciones | El catálogo y el perfil público **no devuelven el id del profesional** que pide este endpoint: desde el catálogo no se puede iniciar. Solo funciona con ids que el frontend ya tenga por otra vía (chat, favoritos, foro). |
| Interfaz | Favoritos (cliente) |

## Módulo `forum`

<a id="e-108"></a>

### E-108 · `GET /api/v1/forum/posts`

Lista pública y paginada de publicaciones del foro, con filtros.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.list` · `src/forum/forum.controller.ts:48` |
| Servicio | `ForumService.list` · `src/forum/forum.service.ts:77` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`ForumQueryDto`](BACKEND_ENDPOINTS.md#dto-forumquerydto) |
| Respuesta | `200` · [`ForumPageDto`](BACKEND_ENDPOINTS.md#dto-forumpagedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-109"></a>

### E-109 · `POST /api/v1/forum/posts`

Crea una publicación del foro (clientes activos; profesionales con plan vigente).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.create` · `src/forum/forum.controller.ts:73` |
| Servicio | `ForumService.create` · `src/forum/forum.service.ts:153` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Body | [`CreateForumPostDto`](BACKEND_ENDPOINTS.md#dto-createforumpostdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) |
| Errores | `400 FORUM_MEDIA_LIMIT`, `400 INVALID_PLACE`, `400 INVALID_PROFESSION`, `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 FORUM_POST_NOT_FOUND`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-110"></a>

### E-110 · `DELETE /api/v1/forum/posts/:id`

Borrar la publicación oculta también sus respuestas; las fotos se borran del almacenamiento.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.remove` · `src/forum/forum.controller.ts:97` |
| Servicio | `ForumService.remove` · `src/forum/forum.service.ts:227` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_POST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-111"></a>

### E-111 · `GET /api/v1/forum/posts/:id`

Detalle público de una publicación con sus respuestas.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.get` · `src/forum/forum.controller.ts:55` |
| Servicio | `ForumService.get` · `src/forum/forum.service.ts:103` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `404 FORUM_POST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-112"></a>

### E-112 · `PATCH /api/v1/forum/posts/:id`

Edita una publicación propia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.update` · `src/forum/forum.controller.ts:85` |
| Servicio | `ForumService.update` · `src/forum/forum.service.ts:193` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`UpdateForumPostDto`](BACKEND_ENDPOINTS.md#dto-updateforumpostdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) |
| Errores | `400 INVALID_PLACE`, `400 INVALID_PROFESSION`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_POST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-113"></a>

### E-113 · `DELETE /api/v1/forum/posts/:id/like`

Quita el "me gusta" de una publicación.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.unlikePost` · `src/forum/forum.controller.ts:162` |
| Servicio | `ForumService.likePost` · `src/forum/forum.service.ts:346` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_POST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-114"></a>

### E-114 · `PUT /api/v1/forum/posts/:id/like`

Da "me gusta" a una publicación.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.likePost` · `src/forum/forum.controller.ts:154` |
| Servicio | `ForumService.likePost` · `src/forum/forum.service.ts:346` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_POST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-115"></a>

### E-115 · `GET /api/v1/forum/posts/:id/my-likes`

Qué marcó con "me gusta" el usuario en una publicación (la lectura pública no sabe quién es).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.myLikes` · `src/forum/forum.controller.ts:62` |
| Servicio | `ForumService.myLikes` · `src/forum/forum.service.ts:138` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`ForumLikesDto`](BACKEND_ENDPOINTS.md#dto-forumlikesdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-116"></a>

### E-116 · `POST /api/v1/forum/posts/:id/replies`

Responde una publicación (o a otra respuesta) del foro.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.reply` · `src/forum/forum.controller.ts:118` |
| Servicio | `ForumService.reply` · `src/forum/forum.service.ts:261` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: 30 por minuto |
| Parámetros de ruta | `id` (uuid) |
| Body | [`CreateForumReplyDto`](BACKEND_ENDPOINTS.md#dto-createforumreplydto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`ForumReplyDto`](BACKEND_ENDPOINTS.md#dto-forumreplydto) |
| Errores | `400 PRICE_NOT_ALLOWED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_POST_NOT_FOUND`, `404 FORUM_REPLY_NOT_FOUND`, `409 FORUM_POST_RESOLVED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-117"></a>

### E-117 · `POST /api/v1/forum/posts/:id/resolve`

Resuelta: deja de admitir respuestas y sigue visible.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.resolve` · `src/forum/forum.controller.ts:106` |
| Servicio | `ForumService.resolve` · `src/forum/forum.service.ts:245` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_POST_NOT_FOUND`, `409 FORUM_POST_RESOLVED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-118"></a>

### E-118 · `DELETE /api/v1/forum/replies/:id`

Borra una respuesta propia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.removeReply` · `src/forum/forum.controller.ts:143` |
| Servicio | `ForumService.removeReply` · `src/forum/forum.service.ts:337` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_REPLY_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-119"></a>

### E-119 · `PATCH /api/v1/forum/replies/:id`

Edita una respuesta propia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.updateReply` · `src/forum/forum.controller.ts:131` |
| Servicio | `ForumService.updateReply` · `src/forum/forum.service.ts:319` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`UpdateForumReplyDto`](BACKEND_ENDPOINTS.md#dto-updateforumreplydto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ForumReplyDto`](BACKEND_ENDPOINTS.md#dto-forumreplydto) |
| Errores | `400 PRICE_NOT_ALLOWED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_REPLY_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-120"></a>

### E-120 · `DELETE /api/v1/forum/replies/:id/like`

Quita el "me gusta" de una respuesta.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.unlikeReply` · `src/forum/forum.controller.ts:178` |
| Servicio | `ForumService.likeReply` · `src/forum/forum.service.ts:354` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_REPLY_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

<a id="e-121"></a>

### E-121 · `PUT /api/v1/forum/replies/:id/like`

Da "me gusta" a una respuesta.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ForumController.likeReply` · `src/forum/forum.controller.ts:170` |
| Servicio | `ForumService.likeReply` · `src/forum/forum.service.ts:354` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FORUM_REPLY_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Foro |

## Módulo `health`

<a id="e-122"></a>

### E-122 · `GET /api/v1/health/live`

Liveness: el proceso responde.

| Campo | Valor |
| --- | --- |
| Controller / handler | `HealthController.live` · `src/health/health.controller.ts:16` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · `{ status: "ok" }` |
| Errores | `429 TOO_MANY_REQUESTS` |
| Estado | Solo infraestructura |
| Observaciones | Monitoreo; no es para el frontend. |
| Interfaz | Ninguna (monitoreo) |

<a id="e-123"></a>

### E-123 · `GET /api/v1/health/ready`

Readiness: además, la base de datos responde a tiempo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `HealthController.ready` · `src/health/health.controller.ts:23` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · `{ status: "ok" }` o 503 |
| Errores | `429 TOO_MANY_REQUESTS` |
| Estado | Solo infraestructura |
| Observaciones | Monitoreo; no es para el frontend. |
| Interfaz | Ninguna (monitoreo) |

## Módulo `identity-verification`

<a id="e-124"></a>

### E-124 · `POST /api/v1/identity-verification`

El usuario (cliente o profesional) inicia la verificación. Idempotente si ya hay un intento abierto.

| Campo | Valor |
| --- | --- |
| Controller / handler | `IdentityVerificationController.start` · `src/identity-verification/identity-verification.controller.ts:55` |
| Servicio | `IdentityVerificationService.start` · `src/identity-verification/identity-verification.service.ts:78` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 5 por minuto |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`StartVerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-startverificationresponsedto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 ALREADY_VERIFIED`, `422 PROFILE_INCOMPLETE`, `422 VERIFICATION_ATTEMPTS_EXCEEDED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado (proveedor manual) |
| Observaciones | Con el proveedor manual no hay redirección ni widget: el intento queda PENDING y lo decide el admin. |
| Interfaz | Verificación de identidad |

<a id="e-125"></a>

### E-125 · `GET /api/v1/identity-verification/me`

Último intento de verificación de identidad propio y su estado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `IdentityVerificationController.getMine` · `src/identity-verification/identity-verification.controller.ts:64` |
| Servicio | `IdentityVerificationService.getMine` · `src/identity-verification/identity-verification.service.ts:145` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`VerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-verificationresponsedto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Verificación de identidad |

## Módulo `locations`

<a id="e-126"></a>

### E-126 · `GET /api/v1/locations/localities`

Localidades activas de una provincia (para registro y filtros).

| Campo | Valor |
| --- | --- |
| Controller / handler | `LocationsController.localities` · `src/locations/locations.controller.ts:33` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`LocalitiesQueryDto`](BACKEND_ENDPOINTS.md#dto-localitiesquerydto) |
| Respuesta | `200` · `Array<{ id, name }>` |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Selectores de provincia, localidad, barrio y oficio |

<a id="e-127"></a>

### E-127 · `GET /api/v1/locations/neighborhoods`

Autocompletado de barrios: solo los aprobados por el admin (ADR 0010).

| Campo | Valor |
| --- | --- |
| Controller / handler | `LocationsController.neighborhoodsSearch` · `src/locations/locations.controller.ts:42` |
| Servicio | `NeighborhoodsService.searchApproved` · `src/locations/neighborhoods.service.ts:24` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`NeighborhoodSearchQueryDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodsearchquerydto) |
| Respuesta | `200` · `Array<{ id, name }>` (solo barrios aprobados) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Selectores de provincia, localidad, barrio y oficio |

<a id="e-128"></a>

### E-128 · `GET /api/v1/locations/provinces`

Provincias activas.

| Campo | Valor |
| --- | --- |
| Controller / handler | `LocationsController.provinces` · `src/locations/locations.controller.ts:25` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · `Array<{ id, name }>` |
| Errores | `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Selectores de provincia, localidad, barrio y oficio |

## Módulo `moderation`

<a id="e-129"></a>

### E-129 · `POST /api/v1/moderation/appeals`

Apelación de un strike vigente o de una sanción vigente (una abierta por cada uno).

| Campo | Valor |
| --- | --- |
| Controller / handler | `MyModerationController.appeal` · `src/moderation/moderation.controller.ts:93` |
| Servicio | `SanctionsService.appeal` · `src/moderation/sanctions.service.ts:315` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| Protecciones | CSRF: sí · Origin: sí · Límite: 5 por minuto |
| Body | [`CreateAppealDto`](BACKEND_ENDPOINTS.md#dto-createappealdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`AppealDto`](BACKEND_ENDPOINTS.md#dto-appealdto) |
| Errores | `400 INVALID_APPEAL_TARGET`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 APPEAL_TARGET_NOT_FOUND`, `409 APPEAL_ALREADY_OPEN`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Estado de la cuenta, sanciones y apelaciones |

<a id="e-130"></a>

### E-130 · `GET /api/v1/moderation/me`

Mis sanciones, strikes y apelaciones. Disponible también con la cuenta suspendida o baneada.

| Campo | Valor |
| --- | --- |
| Controller / handler | `MyModerationController.me` · `src/moderation/moderation.controller.ts:87` |
| Servicio | `SanctionsService.mine` · `src/moderation/sanctions.service.ts:295` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`MyModerationDto`](BACKEND_ENDPOINTS.md#dto-mymoderationdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Estado de la cuenta, sanciones y apelaciones |

## Módulo `notifications`

<a id="e-131"></a>

### E-131 · `GET /api/v1/notifications`

Mis notificaciones paginadas, con el total de no leídas.

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.list` · `src/notifications/notifications.controller.ts:101` |
| Servicio | `NotificationsService.list` · `src/notifications/notifications.service.ts:108` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`NotificationsQueryDto`](BACKEND_ENDPOINTS.md#dto-notificationsquerydto) |
| Respuesta | `200` · `{ data: NotificationDto[], page, limit, total, unread }` (`notifications.service.ts` `list`) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Campana / centro de notificaciones |

<a id="e-132"></a>

### E-132 · `POST /api/v1/notifications/:id/read`

Marca una notificación propia como leída.

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.read` · `src/notifications/notifications.controller.ts:111` |
| Servicio | `NotificationsService.markRead` · `src/notifications/notifications.service.ts:122` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Campana / centro de notificaciones |

<a id="e-133"></a>

### E-133 · `GET /api/v1/notifications/preferences`

Mis preferencias de push por categoría (sin cambios, todas activadas).

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.preferences` · `src/notifications/notifications.controller.ts:85` |
| Servicio | `PushService.preferences` · `src/notifications/push.service.ts:100` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`NotificationPreferenceDto`](BACKEND_ENDPOINTS.md#dto-notificationpreferencedto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ajustes de notificaciones y push |

<a id="e-134"></a>

### E-134 · `PUT /api/v1/notifications/preferences`

Actualiza las preferencias de push por categoría.

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.updatePreferences` · `src/notifications/notifications.controller.ts:91` |
| Servicio | `PushService.updatePreferences` · `src/notifications/push.service.ts:111` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`UpdatePreferencesDto`](BACKEND_ENDPOINTS.md#dto-updatepreferencesdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · Array de [`NotificationPreferenceDto`](BACKEND_ENDPOINTS.md#dto-notificationpreferencedto) |
| Errores | `400 INVALID_CATEGORY`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ajustes de notificaciones y push |

<a id="e-135"></a>

### E-135 · `GET /api/v1/notifications/push/key`

Clave pública VAPID para `pushManager.subscribe` (o `enabled: false` si no hay push).

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.pushKey` · `src/notifications/notifications.controller.ts:62` |
| Servicio | `PushService.publicKey` · `src/notifications/push.service.ts:54` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`PushKeyDto`](BACKEND_ENDPOINTS.md#dto-pushkeydto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ajustes de notificaciones y push |

<a id="e-136"></a>

### E-136 · `POST /api/v1/notifications/push/subscriptions`

Este navegador quiere avisos push (después de que la persona dio permiso).

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.subscribe` · `src/notifications/notifications.controller.ts:69` |
| Servicio | `PushService.subscribe` · `src/notifications/push.service.ts:62` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Body | [`PushSubscribeDto`](BACKEND_ENDPOINTS.md#dto-pushsubscribedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 INVALID_PUSH_ENDPOINT`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS`, `503 PUSH_DISABLED` |
| Estado | Implementado |
| Interfaz | Ajustes de notificaciones y push |

<a id="e-137"></a>

### E-137 · `POST /api/v1/notifications/push/subscriptions/remove`

Este navegador ya no quiere avisos push.

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.unsubscribe` · `src/notifications/notifications.controller.ts:78` |
| Servicio | `PushService.unsubscribe` · `src/notifications/push.service.ts:96` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`PushUnsubscribeDto`](BACKEND_ENDPOINTS.md#dto-pushunsubscribedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ajustes de notificaciones y push |

<a id="e-138"></a>

### E-138 · `POST /api/v1/notifications/read-all`

Marca todas mis notificaciones como leídas.

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.readAll` · `src/notifications/notifications.controller.ts:118` |
| Servicio | `NotificationsService.markAllRead` · `src/notifications/notifications.service.ts:129` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Campana / centro de notificaciones |

<a id="e-139"></a>

### E-139 · `GET /api/v1/notifications/unread-count`

Cantidad de notificaciones sin leer.

| Campo | Valor |
| --- | --- |
| Controller / handler | `NotificationsController.unread` · `src/notifications/notifications.controller.ts:106` |
| Servicio | `NotificationsService.unreadCount` · `src/notifications/notifications.service.ts:118` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · `{ unread: number }` |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Campana / centro de notificaciones |

## Módulo `platform-reviews`

<a id="e-140"></a>

### E-140 · `GET /api/v1/platform-reviews`

Públicas: solo las publicadas, de cuentas que siguen existiendo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PlatformReviewsController.published` · `src/reviews/reviews.controller.ts:131` |
| Servicio | `PlatformReviewsService.published` · `src/reviews/platform-reviews.service.ts:49` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`PageQueryDto`](BACKEND_ENDPOINTS.md#dto-pagequerydto-reviews-dto-reviews-dto-ts) |
| Respuesta | `200` · [`PlatformReviewPageDto`](BACKEND_ENDPOINTS.md#dto-platformreviewpagedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Opiniones sobre la plataforma (home y Mi cuenta) |

<a id="e-141"></a>

### E-141 · `DELETE /api/v1/platform-reviews/me`

Borra mi opinión sobre la plataforma.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PlatformReviewsController.remove` · `src/reviews/reviews.controller.ts:158` |
| Servicio | `PlatformReviewsService.remove` · `src/reviews/platform-reviews.service.ts:43` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Opiniones sobre la plataforma (home y Mi cuenta) |

<a id="e-142"></a>

### E-142 · `GET /api/v1/platform-reviews/me`

Mi opinión sobre la plataforma, si existe.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PlatformReviewsController.mine` · `src/reviews/reviews.controller.ts:138` |
| Servicio | `PlatformReviewsService.mine` · `src/reviews/platform-reviews.service.ts:25` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`PlatformReviewDto`](BACKEND_ENDPOINTS.md#dto-platformreviewdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Observaciones | Si no hay opinión responde **200 con cuerpo vacío** (no `null` en JSON): el frontend tiene que tolerar un cuerpo vacío. |
| Interfaz | Opiniones sobre la plataforma (home y Mi cuenta) |

<a id="e-143"></a>

### E-143 · `PUT /api/v1/platform-reviews/me`

Crea o reemplaza mi opinión sobre la plataforma (queda sin publicar hasta que la publique el admin).

| Campo | Valor |
| --- | --- |
| Controller / handler | `PlatformReviewsController.upsert` · `src/reviews/reviews.controller.ts:146` |
| Servicio | `PlatformReviewsService.upsert` · `src/reviews/platform-reviews.service.ts:32` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`PlatformReviewInputDto`](BACKEND_ENDPOINTS.md#dto-platformreviewinputdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`PlatformReviewDto`](BACKEND_ENDPOINTS.md#dto-platformreviewdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Opiniones sobre la plataforma (home y Mi cuenta) |

## Módulo `professionals`

<a id="e-144"></a>

### E-144 · `GET /api/v1/professionals/me`

Mi perfil profesional completo (incluye lo oculto por el plan o por el admin, con su estado).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.me` · `src/professionals/professionals.controller.ts:57` |
| Servicio | `ProfileService.me` · `src/professionals/profile.service.ts:95` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-145"></a>

### E-145 · `PATCH /api/v1/professionals/me`

Datos del perfil. El admin también puede editarlos, con motivo y auditoría (ADR 0021).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.update` · `src/professionals/professionals.controller.ts:63` |
| Servicio | `ProfileService.update` · `src/professionals/profile.service.ts:187` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`UpdateProfessionalProfileDto`](BACKEND_ENDPOINTS.md#dto-updateprofessionalprofiledto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 RATE_INCOMPLETE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-146"></a>

### E-146 · `PUT /api/v1/professionals/me/attention-status`

Cambia el estado de atención (disponible, trabajando, etc.).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.setAttention` · `src/professionals/professionals.controller.ts:81` |
| Servicio | `ProfileService.setAttention` · `src/professionals/profile.service.ts:260` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`AttentionStatusDto`](BACKEND_ENDPOINTS.md#dto-attentionstatusdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 INVALID_UNTIL`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-147"></a>

### E-147 · `PUT /api/v1/professionals/me/availability`

Horario semanal completo (hora de Córdoba), sin franjas superpuestas en un mismo día.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.replaceAvailability` · `src/professionals/professionals.controller.ts:179` |
| Servicio | `ProfileService.replaceAvailability` · `src/professionals/profile.service.ts:537` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`ReplaceAvailabilityDto`](BACKEND_ENDPOINTS.md#dto-replaceavailabilitydto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 INVALID_AVAILABILITY`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-148"></a>

### E-148 · `POST /api/v1/professionals/me/availability/exceptions`

Agrega una excepción de disponibilidad (días sin atención).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.addException` · `src/professionals/professionals.controller.ts:188` |
| Servicio | `ProfileService.addException` · `src/professionals/profile.service.ts:575` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`AddAvailabilityExceptionDto`](BACKEND_ENDPOINTS.md#dto-addavailabilityexceptiondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 INVALID_EXCEPTION_DATES`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `409 TOO_MANY_EXCEPTIONS`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-149"></a>

### E-149 · `DELETE /api/v1/professionals/me/availability/exceptions/:id`

Borra una excepción de disponibilidad propia.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.removeException` · `src/professionals/professionals.controller.ts:197` |
| Servicio | `ProfileService.removeException` · `src/professionals/profile.service.ts:618` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-150"></a>

### E-150 · `POST /api/v1/professionals/me/certifications`

ADR 0020: se publica en el momento, como "certificado cargado por el profesional".

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.addCertification` · `src/professionals/professionals.controller.ts:152` |
| Servicio | `ProfileService.addCertification` · `src/professionals/profile.service.ts:453` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`AddCertificationDto`](BACKEND_ENDPOINTS.md#dto-addcertificationdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`CertificationItemDto`](BACKEND_ENDPOINTS.md#dto-certificationitemdto) |
| Errores | `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 PROFILE_NOT_FOUND`, `409 CERTIFICATION_LIMIT_REACHED`, `409 FILE_IN_USE`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-151"></a>

### E-151 · `DELETE /api/v1/professionals/me/certifications/:id`

Borra un certificado propio (y el archivo).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.removeCertification` · `src/professionals/professionals.controller.ts:161` |
| Servicio | `ProfileService.removeCertification` · `src/professionals/profile.service.ts:488` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-152"></a>

### E-152 · `POST /api/v1/professionals/me/media`

Suma una imagen o un video (FI §6.3). Cuenta solo el total del plan (no el reparto presentación/trabajos, aprobado el 02/11/2026). El banner no cuenta; uno nuevo reemplaza al anterior. Imagen de banner: Medium o más; video de banner: Premium.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.addMedia` · `src/professionals/professionals.controller.ts:108` |
| Servicio | `ProfileService.addMedia` · `src/professionals/profile.service.ts:348` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`AddMediaDto`](BACKEND_ENDPOINTS.md#dto-addmediadto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`MediaItemDto`](BACKEND_ENDPOINTS.md#dto-mediaitemdto) |
| Errores | `? PLAN_LIMIT_REACHED`, `400 INVALID_MEDIA_PURPOSE`, `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 PROFILE_NOT_FOUND`, `409 FILE_IN_USE`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-153"></a>

### E-153 · `DELETE /api/v1/professionals/me/media/:id`

Borra un medio propio (y el archivo).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.removeMedia` · `src/professionals/professionals.controller.ts:142` |
| Servicio | `ProfileService.removeMedia` · `src/professionals/profile.service.ts:436` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-154"></a>

### E-154 · `PUT /api/v1/professionals/me/media/order`

Nuevo orden: hay que mandar todos los medios del profesional.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.reorderMedia` · `src/professionals/professionals.controller.ts:114` |
| Servicio | `ProfileService.reorderMedia` · `src/professionals/profile.service.ts:415` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`ReorderMediaDto`](BACKEND_ENDPOINTS.md#dto-reordermediadto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 INVALID_MEDIA_ORDER`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-155"></a>

### E-155 · `PUT /api/v1/professionals/me/media/visible`

Al bajar de plan: qué imágenes y videos mostrar dentro del límite (ADR 0026).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.chooseVisibleMedia` · `src/professionals/professionals.controller.ts:124` |
| Servicio | `ProfileService.chooseVisibleMedia` · `src/professionals/profile.service.ts:716` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`VisibleMediaDto`](BACKEND_ENDPOINTS.md#dto-visiblemediadto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `? PLAN_LIMIT_REACHED`, `400 INVALID_MEDIA`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-156"></a>

### E-156 · `GET /api/v1/professionals/me/metrics`

Las del propio profesional: solo con un plan vigente que las incluya.

| Campo | Valor |
| --- | --- |
| Controller / handler | `MetricsController.mine` · `src/metrics/metrics.controller.ts:15` |
| Servicio | `MetricsService.mine` · `src/metrics/metrics.service.ts:84` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | solo planes con la función (`PLAN_FEATURE_REQUIRED`) |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Query | [`MetricsQueryDto`](BACKEND_ENDPOINTS.md#dto-metricsquerydto) |
| Respuesta | `200` · [`ProfessionalMetricsDto`](BACKEND_ENDPOINTS.md#dto-professionalmetricsdto) |
| Errores | `400 INVALID_RANGE`, `400 RANGE_TOO_LONG`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 PLAN_FEATURE_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: métricas (Premium) |

<a id="e-157"></a>

### E-157 · `PUT /api/v1/professionals/me/professions`

Profesiones: entre 1 y las que permita el plan, con una principal (FI §6.3 y §7.1).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.replaceProfessions` · `src/professionals/professionals.controller.ts:90` |
| Servicio | `ProfileService.replaceProfessions` · `src/professionals/profile.service.ts:290` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`ReplaceProfessionsDto`](BACKEND_ENDPOINTS.md#dto-replaceprofessionsdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `? PLAN_LIMIT_REACHED`, `400 INVALID_PRIMARY_PROFESSION`, `400 INVALID_PROFESSION`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-158"></a>

### E-158 · `PUT /api/v1/professionals/me/professions/visible`

Lo mismo con las profesiones: la principal tiene que quedar visible.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.chooseVisibleProfessions` · `src/professionals/professionals.controller.ts:133` |
| Servicio | `ProfileService.chooseVisibleProfessions` · `src/professionals/profile.service.ts:755` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`VisibleProfessionsDto`](BACKEND_ENDPOINTS.md#dto-visibleprofessionsdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `? PLAN_LIMIT_REACHED`, `400 INVALID_PROFESSIONS`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-159"></a>

### E-159 · `PUT /api/v1/professionals/me/service-areas`

Zonas de trabajo (ADR 0010). Los barrios nuevos quedan PENDING y a nombre del profesional.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.replaceServiceAreas` · `src/professionals/professionals.controller.ts:99` |
| Servicio | `ProfileService.replaceServiceAreas` · `src/professionals/profile.service.ts:327` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`ReplaceServiceAreasDto`](BACKEND_ENDPOINTS.md#dto-replaceserviceareasdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 INVALID_LOCALITY`, `400 INVALID_NEIGHBORHOOD`, `400 INVALID_SERVICE_AREAS`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-160"></a>

### E-160 · `PUT /api/v1/professionals/me/social-links`

Reemplaza las redes sociales del perfil (solo enlaces https de cada red).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.replaceSocialLinks` · `src/professionals/professionals.controller.ts:170` |
| Servicio | `ProfileService.replaceSocialLinks` · `src/professionals/profile.service.ts:501` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`ReplaceSocialLinksDto`](BACKEND_ENDPOINTS.md#dto-replacesociallinksdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 INVALID_SOCIAL_LINKS`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

<a id="e-161"></a>

### E-161 · `PUT /api/v1/professionals/me/theme`

Reemplaza la personalización. Solo lo que admite el plan vigente (FI §6.3).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionalsController.setTheme` · `src/professionals/professionals.controller.ts:72` |
| Servicio | `ProfileService.setTheme` · `src/professionals/profile.service.ts:242` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`ProfileThemeDto`](BACKEND_ENDPOINTS.md#dto-profilethemedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 THEME_NOT_IN_PLAN`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFILE_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: mi perfil |

## Módulo `professions`

<a id="e-162"></a>

### E-162 · `GET /api/v1/professions`

Oficios activos.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ProfessionsController.list` · `src/professions/professions.controller.ts:14` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · `Array<{ id, name, slug }>` |
| Errores | `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Selectores de provincia, localidad, barrio y oficio |

## Módulo `reports`

<a id="e-163"></a>

### E-163 · `POST /api/v1/reports`

Reporta un perfil, mensaje, publicación, respuesta del foro o reseña, con motivo, descripción y hasta 3 fotos.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReportsController.create` · `src/moderation/moderation.controller.ts:60` |
| Servicio | `ReportsService.create` · `src/moderation/reports.service.ts:85` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Body | [`CreateReportDto`](BACKEND_ENDPOINTS.md#dto-createreportdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`MyReportDto`](BACKEND_ENDPOINTS.md#dto-myreportdto) |
| Errores | `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 REPORT_TARGET_NOT_FOUND`, `409 FILE_NOT_READY`, `409 REPORT_ALREADY_OPEN`, `429 TOO_MANY_REQUESTS` |
| Estado | Parcial |
| Observaciones | Para reportar un PERFIL hace falta el id del usuario, que el catálogo y el perfil público no devuelven. Mensajes, publicaciones, respuestas y reseñas sí tienen id visible. |
| Interfaz | Reportar contenido / mis reportes |

<a id="e-164"></a>

### E-164 · `GET /api/v1/reports/mine`

Mis reportes y su estado.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReportsController.mine` · `src/moderation/moderation.controller.ts:67` |
| Servicio | `ReportsService.mine` · `src/moderation/reports.service.ts:128` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`MyReportDto`](BACKEND_ENDPOINTS.md#dto-myreportdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reportar contenido / mis reportes |

## Módulo `requests`

<a id="e-165"></a>

### E-165 · `GET /api/v1/requests`

Mis solicitudes (cliente), las más recientes primero (hasta 100).

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.mine` · `src/requests/requests.controller.ts:39` |
| Servicio | `RequestsService.listForCustomer` · `src/requests/requests.service.ts:494` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

<a id="e-166"></a>

### E-166 · `POST /api/v1/requests`

El cliente envía un pedido a uno o varios profesionales (cada uno en su chat).

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.create` · `src/requests/requests.controller.ts:31` |
| Servicio | `RequestsService.create` · `src/requests/requests.service.ts:89` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Body | [`CreateRequestDto`](BACKEND_ENDPOINTS.md#dto-createrequestdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `400 INVALID_PROFESSION`, `400 PROFESSION_NOT_OFFERED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PROFESSIONAL_NOT_AVAILABLE`, `404 REQUEST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Parcial |
| Observaciones | El catálogo y el perfil público **no devuelven el id del profesional** que pide este endpoint: desde el catálogo no se puede iniciar. Solo funciona con ids que el frontend ya tenga por otra vía (chat, favoritos, foro). |
| Interfaz | Solicitudes y presupuestos |

<a id="e-167"></a>

### E-167 · `GET /api/v1/requests/:id`

El cliente ve todo su pedido; cada profesional, solo su negociación.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.get` · `src/requests/requests.controller.ts:54` |
| Servicio | `RequestsService.getRequest` · `src/requests/requests.service.ts:515` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 REQUEST_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Observaciones | A diferencia de `GET /requests/received`, no exige plan vigente al profesional (inconsistencia menor). |
| Interfaz | Solicitudes y presupuestos |

<a id="e-168"></a>

### E-168 · `POST /api/v1/requests/:id/cancel`

El cliente cancela el pedido (antes de elegir).

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.cancel` · `src/requests/requests.controller.ts:61` |
| Servicio | `RequestsService.cancel` · `src/requests/requests.service.ts:155` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ReasonDto`](BACKEND_ENDPOINTS.md#dto-reasondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REQUEST_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

<a id="e-169"></a>

### E-169 · `POST /api/v1/requests/quotes/:quoteId/withdraw`

El profesional retira su presupuesto vigente.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.withdraw` · `src/requests/requests.controller.ts:97` |
| Servicio | `RequestsService.withdrawQuote` · `src/requests/requests.service.ts:274` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `quoteId` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REQUEST_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

<a id="e-170"></a>

### E-170 · `GET /api/v1/requests/received`

Pedidos recibidos por el profesional (solo su negociación).

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.received` · `src/requests/requests.controller.ts:47` |
| Servicio | `RequestsService.listReceived` · `src/requests/requests.service.ts:503` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

<a id="e-171"></a>

### E-171 · `POST /api/v1/requests/targets/:targetId/decline`

El profesional no toma el pedido.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.decline` · `src/requests/requests.controller.ts:73` |
| Servicio | `RequestsService.decline` · `src/requests/requests.service.ts:189` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `targetId` (uuid) |
| Body | [`ReasonDto`](BACKEND_ENDPOINTS.md#dto-reasondto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REQUEST_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

<a id="e-172"></a>

### E-172 · `POST /api/v1/requests/targets/:targetId/quotes`

Presupuesto: reemplaza al vigente si había uno.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.quote` · `src/requests/requests.controller.ts:86` |
| Servicio | `RequestsService.sendQuote` · `src/requests/requests.service.ts:215` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `targetId` (uuid) |
| Body | [`SendQuoteDto`](BACKEND_ENDPOINTS.md#dto-sendquotedto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) |
| Errores | `400 INVALID_DATE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REQUEST_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

<a id="e-173"></a>

### E-173 · `POST /api/v1/requests/targets/:targetId/select`

El cliente elige al profesional: nace la contratación.

| Campo | Valor |
| --- | --- |
| Controller / handler | `RequestsController.select` · `src/requests/requests.controller.ts:109` |
| Servicio | `RequestsService.select` · `src/requests/requests.service.ts:306` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `targetId` (uuid) |
| Body | [`SelectTargetDto`](BACKEND_ENDPOINTS.md#dto-selecttargetdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) |
| Errores | `400 INVALID_QUOTE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONTRACT_NOT_FOUND`, `404 REQUEST_NOT_FOUND`, `409 INVALID_STATE_TRANSITION`, `409 PROFESSIONAL_UNAVAILABLE`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Solicitudes y presupuestos |

## Módulo `reviews`

<a id="e-174"></a>

### E-174 · `POST /api/v1/reviews`

Reseña de una contratación terminada propia, dentro de los 30 días.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.create` · `src/reviews/reviews.controller.ts:48` |
| Servicio | `ReviewsService.create` · `src/reviews/reviews.service.ts:57` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Body | [`CreateReviewDto`](BACKEND_ENDPOINTS.md#dto-createreviewdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 CONTRACT_NOT_FOUND`, `404 REVIEW_NOT_FOUND`, `409 CONTRACT_NOT_COMPLETED`, `409 REVIEW_EXISTS`, `409 REVIEW_WINDOW_CLOSED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

<a id="e-175"></a>

### E-175 · `DELETE /api/v1/reviews/:id`

Borrar se puede siempre (ADR 0028). Queda la fila para moderación, fuera de la vista.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.remove` · `src/reviews/reviews.controller.ts:82` |
| Servicio | `ReviewsService.remove` · `src/reviews/reviews.service.ts:132` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REVIEW_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

<a id="e-176"></a>

### E-176 · `PATCH /api/v1/reviews/:id`

Dentro de los 30 días desde que terminó el trabajo.

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.update` · `src/reviews/reviews.controller.ts:71` |
| Servicio | `ReviewsService.update` · `src/reviews/reviews.service.ts:110` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`UpdateReviewDto`](BACKEND_ENDPOINTS.md#dto-updatereviewdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REVIEW_NOT_FOUND`, `409 REVIEW_WINDOW_CLOSED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

<a id="e-177"></a>

### E-177 · `DELETE /api/v1/reviews/:id/reply`

Respuesta pública del profesional (una; mandarla de nuevo la reemplaza).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.removeReply` · `src/reviews/reviews.controller.ts:100` |
| Servicio | `ReviewsService.reply` · `src/reviews/reviews.service.ts:140` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REVIEW_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

<a id="e-178"></a>

### E-178 · `PUT /api/v1/reviews/:id/reply`

Respuesta pública del profesional (una; mandarla de nuevo la reemplaza).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.reply` · `src/reviews/reviews.controller.ts:89` |
| Servicio | `ReviewsService.reply` · `src/reviews/reviews.service.ts:140` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`ReviewReplyDto`](BACKEND_ENDPOINTS.md#dto-reviewreplydto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 REVIEW_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

<a id="e-179"></a>

### E-179 · `GET /api/v1/reviews/mine`

Reseñas que escribí (cliente).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.mine` · `src/reviews/reviews.controller.ts:56` |
| Servicio | `ReviewsService.mine` · `src/reviews/reviews.service.ts:169` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

<a id="e-180"></a>

### E-180 · `GET /api/v1/reviews/received`

Reseñas que recibí (profesional).

| Campo | Valor |
| --- | --- |
| Controller / handler | `ReviewsController.received` · `src/reviews/reviews.controller.ts:63` |
| Servicio | `ReviewsService.received` · `src/reviews/reviews.service.ts:173` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Reseñas (mis reseñas / recibidas) |

## Módulo `subscriptions`

<a id="e-181"></a>

### E-181 · `POST /api/v1/subscriptions/checkout`

Crea el pago y devuelve el enlace al checkout de Mercado Pago.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PaymentsController.checkout` · `src/payments/payments.controller.ts:61` |
| Servicio | `PaymentsService.checkout` · `src/payments/payments.service.ts:125` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 10 por minuto |
| Body | [`CheckoutDto`](BACKEND_ENDPOINTS.md#dto-checkoutdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`CheckoutResponseDto`](BACKEND_ENDPOINTS.md#dto-checkoutresponsedto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 PLAN_NOT_FOUND`, `409 NO_SUBSCRIPTION`, `429 TOO_MANY_REQUESTS`, `502 PAYMENT_PROVIDER_ERROR`, `503 PAYMENTS_UNAVAILABLE` |
| Estado | Implementado (requiere credenciales) |
| Observaciones | Sin credenciales de Mercado Pago usa el adaptador simulado (dev) o responde 503 (`PAYMENTS_DISABLED`). |
| Interfaz | Panel profesional: plan, prueba y pagos |

<a id="e-182"></a>

### E-182 · `GET /api/v1/subscriptions/me`

Plan, límites y contador de días de la prueba (ADR 0017).

| Campo | Valor |
| --- | --- |
| Controller / handler | `SubscriptionsController.me` · `src/subscriptions/subscriptions.controller.ts:16` |
| Servicio | `SubscriptionsService.summary` · `src/subscriptions/subscriptions.service.ts:117` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`SubscriptionSummaryDto`](BACKEND_ENDPOINTS.md#dto-subscriptionsummarydto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: plan, prueba y pagos |

<a id="e-183"></a>

### E-183 · `GET /api/v1/subscriptions/me/payments`

Mis pagos de planes.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PaymentsController.mine` · `src/payments/payments.controller.ts:70` |
| Servicio | `PaymentsService.mine` · `src/payments/payments.service.ts:198` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`PaymentItemDto`](BACKEND_ENDPOINTS.md#dto-paymentitemdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: plan, prueba y pagos |

<a id="e-184"></a>

### E-184 · `GET /api/v1/subscriptions/plans`

Planes con lo que costaría hoy cada uno: el mes, la diferencia o por qué todavía no.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PaymentsController.plans` · `src/payments/payments.controller.ts:54` |
| Servicio | `PaymentsService.planOptions` · `src/payments/payments.service.ts:100` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`PlanOptionDto`](BACKEND_ENDPOINTS.md#dto-planoptiondto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Panel profesional: plan, prueba y pagos |

## Módulo `support`

<a id="e-185"></a>

### E-185 · `POST /api/v1/support/contact`

Formulario de contacto público (FI §2.4): 3 por hora por IP.

| Campo | Valor |
| --- | --- |
| Controller / handler | `SupportController.contact` · `src/support/support.controller.ts:36` |
| Servicio | `SupportService.contact` · `src/support/support.service.ts:62` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: sí · Límite: 3 por hora |
| Body | [`ContactDto`](BACKEND_ENDPOINTS.md#dto-contactdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest` |
| Respuesta | `202` · — |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ayuda: soporte, contacto y novedades |

<a id="e-186"></a>

### E-186 · `GET /api/v1/support/tickets`

Mis consultas de soporte (hasta 50).

| Campo | Valor |
| --- | --- |
| Controller / handler | `SupportController.list` · `src/support/support.controller.ts:53` |
| Servicio | `SupportService.list` · `src/support/support.service.ts:81` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · Array de [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ayuda: soporte, contacto y novedades |

<a id="e-187"></a>

### E-187 · `POST /api/v1/support/tickets`

Crea una consulta de soporte con categoría, texto y una foto opcional.

| Campo | Valor |
| --- | --- |
| Controller / handler | `SupportController.create` · `src/support/support.controller.ts:44` |
| Servicio | `SupportService.create` · `src/support/support.service.ts:47` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 5 por minuto |
| Body | [`CreateTicketDto`](BACKEND_ENDPOINTS.md#dto-createticketdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) |
| Errores | `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 TICKET_NOT_FOUND`, `409 FILE_IN_USE`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ayuda: soporte, contacto y novedades |

<a id="e-188"></a>

### E-188 · `GET /api/v1/support/tickets/:id`

Una consulta de soporte propia con sus mensajes.

| Campo | Valor |
| --- | --- |
| Controller / handler | `SupportController.get` · `src/support/support.controller.ts:61` |
| Servicio | `SupportService.mine` · `src/support/support.service.ts:90` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `404 TICKET_NOT_FOUND`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ayuda: soporte, contacto y novedades |

<a id="e-189"></a>

### E-189 · `POST /api/v1/support/tickets/:id/messages`

El usuario sigue la conversación; una consulta cerrada se reabre.

| Campo | Valor |
| --- | --- |
| Controller / handler | `SupportController.reply` · `src/support/support.controller.ts:69` |
| Servicio | `SupportService.reply` · `src/support/support.service.ts:99` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Body | [`TicketMessageInputDto`](BACKEND_ENDPOINTS.md#dto-ticketmessageinputdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) |
| Errores | `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `404 TICKET_NOT_FOUND`, `409 FILE_IN_USE`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Ayuda: soporte, contacto y novedades |

## Módulo `uploads`

<a id="e-190"></a>

### E-190 · `POST /api/v1/uploads`

Paso 1 de la subida: registra el archivo y devuelve el ticket para subirlo directo al almacenamiento.

| Campo | Valor |
| --- | --- |
| Controller / handler | `UploadsController.create` · `src/uploads/uploads.controller.ts:55` |
| Servicio | `UploadsService.create` · `src/uploads/uploads.service.ts:77` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: 20 por minuto |
| Body | [`CreateUploadDto`](BACKEND_ENDPOINTS.md#dto-createuploaddto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `201` · [`CreateUploadResponseDto`](BACKEND_ENDPOINTS.md#dto-createuploadresponsedto) |
| Errores | `400 INVALID_FILE_KIND`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FILE_KIND_NOT_IN_PLAN`, `403 FILE_PURPOSE_NOT_ALLOWED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_PENDING_UPLOADS`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Componente de subida de archivos |

<a id="e-191"></a>

### E-191 · `POST /api/v1/uploads/:id/complete`

Confirma la subida. Idempotente: un archivo ya READY se devuelve tal cual.

| Campo | Valor |
| --- | --- |
| Controller / handler | `UploadsController.complete` · `src/uploads/uploads.controller.ts:65` |
| Servicio | `UploadsService.complete` · `src/uploads/uploads.service.ts:137` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`FileResponseDto`](BACKEND_ENDPOINTS.md#dto-fileresponsedto) |
| Errores | `? FILE_TOO_LARGE`, `? UNSUPPORTED_FILE_TYPE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `409 FILE_NOT_PENDING`, `409 UPLOAD_NOT_RECEIVED`, `422 VIDEO_TOO_LONG`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Componente de subida de archivos |

<a id="e-192"></a>

### E-192 · `GET /api/v1/uploads/:id/content`

Contenido de un archivo público del adaptador local (solo desarrollo y tests).

| Campo | Valor |
| --- | --- |
| Controller / handler | `LocalFilesController.content` · `src/uploads/uploads.controller.ts:103` |
| Servicio | `UploadsService.readLocalPublic` · `src/uploads/uploads.service.ts:273` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Respuesta | `200` · Binario del archivo (solo almacenamiento local) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `429 TOO_MANY_REQUESTS` |
| Estado | Solo desarrollo |
| Observaciones | Sirve archivos públicos del almacenamiento local. En producción las URLs apuntan a Cloudinary. |
| Interfaz | Componente de subida de archivos |

<a id="e-193"></a>

### E-193 · `PUT /api/v1/uploads/:id/content`

Destino del ticket con el adaptador local (desarrollo y tests). Con Cloudinary responde 404: el navegador sube directo a Cloudinary.

| Campo | Valor |
| --- | --- |
| Controller / handler | `UploadsController.uploadContent` · `src/uploads/uploads.controller.ts:85` |
| Servicio | `UploadsService.storeLocalContent` · `src/uploads/uploads.service.ts:248` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Restricción por plan | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Parámetros de ruta | `id` (uuid) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token`, `multipart/form-data` (campo `file`) |
| Respuesta | `204` · Sin cuerpo |
| Errores | `? FILE_TOO_LARGE`, `400 FILE_REQUIRED`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 SUBSCRIPTION_REQUIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `409 FILE_NOT_PENDING`, `429 TOO_MANY_REQUESTS` |
| Estado | Solo desarrollo |
| Observaciones | Destino del ticket con el almacenamiento local. Con Cloudinary responde 404 y el navegador sube directo a Cloudinary. |
| Interfaz | Componente de subida de archivos |

## Módulo `users`

<a id="e-194"></a>

### E-194 · `DELETE /api/v1/users/me`

Baja de la propia cuenta (ADR 0013 y 0016): exige la contraseña y cierra todas las sesiones. La cuenta queda desactivada durante el período de gracia y después se anonimiza. No disponible para cuentas suspendidas o baneadas (ADR 0007).

| Campo | Valor |
| --- | --- |
| Controller / handler | `UsersController.deleteMe` · `src/users/users.controller.ts:70` |
| Servicio | `AccountsService.deleteOwn` · `src/users/accounts.service.ts:267`<br>`AuthCookiesService.clearSession` · `src/auth/services/auth-cookies.service.ts:32` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | Cualquier rol autenticado |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: 5 por minuto |
| Body | [`DeleteOwnAccountDto`](BACKEND_ENDPOINTS.md#dto-deleteownaccountdto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `204` · Sin cuerpo |
| Cookies | Escribe o borra cookies de sesión (`Set-Cookie`) |
| Errores | `400 INVALID_CURRENT_PASSWORD`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 ADMIN_CANNOT_SELF_DELETE`, `403 REAUTH_REQUIRED`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `409 CANNOT_MODIFY_ADMIN`, `409 DELETION_ALREADY_SCHEDULED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: datos personales y baja |

<a id="e-195"></a>

### E-195 · `GET /api/v1/users/me`

Mis datos personales (incluye el nombre en revisión si lo hay).

| Campo | Valor |
| --- | --- |
| Controller / handler | `UsersController.personal` · `src/users/users.controller.ts:26` |
| Servicio | `PersonalDataService.get` · `src/users/personal-data.service.ts:37` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: no aplica (GET) · Origin: no aplica · Límite: global |
| Respuesta | `200` · [`PersonalDataDto`](BACKEND_ENDPOINTS.md#dto-personaldatadto) |
| Errores | `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: datos personales y baja |

<a id="e-196"></a>

### E-196 · `PATCH /api/v1/users/me`

Datos personales (ADR 0021). Teléfono y barrio: inmediato. Nombre y apellido con la identidad aprobada: quedan en revisión del admin y en público se ve el anterior ( ameUnderReview).

| Campo | Valor |
| --- | --- |
| Controller / handler | `UsersController.updatePersonal` · `src/users/users.controller.ts:39` |
| Servicio | Acceso directo a la base en el controller |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`UpdatePersonalDataDto`](BACKEND_ENDPOINTS.md#dto-updatepersonaldatadto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`PersonalDataDto`](BACKEND_ENDPOINTS.md#dto-personaldatadto) |
| Errores | `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Mi cuenta: datos personales y baja |

<a id="e-197"></a>

### E-197 · `PUT /api/v1/users/me/avatar`

Foto de perfil (paso 2 del registro, ADR 0006): un archivo AVATAR propio ya confirmado. Con la identidad aprobada, la foto nueva queda en revisión del admin y se sigue viendo la anterior (ADR 0019).

| Campo | Valor |
| --- | --- |
| Controller / handler | `UsersController.setAvatar` · `src/users/users.controller.ts:56` |
| Servicio | `IdentityVerificationService.changeAvatar` · `src/identity-verification/identity-verification.service.ts:300` |
| Autenticación | Sí (cookie `nx_at`) |
| Roles | CUSTOMER, PROFESSIONAL |
| Estados de cuenta | PENDING_VERIFICATION, ACTIVE |
| Protecciones | CSRF: sí · Origin: sí · Límite: global |
| Body | [`SetAvatarDto`](BACKEND_ENDPOINTS.md#dto-setavatardto) |
| Headers | `Origin`, `X-Requested-With: XMLHttpRequest`, `X-CSRF-Token` |
| Respuesta | `200` · [`AvatarResponseDto`](BACKEND_ENDPOINTS.md#dto-avatarresponsedto) |
| Errores | `400 WRONG_FILE_PURPOSE`, `400 VALIDATION_FAILED / BAD_REQUEST`, `401 UNAUTHORIZED / ACCESS_TOKEN_EXPIRED`, `403 FORBIDDEN (rol)`, `403 ACCOUNT_STATE_NOT_ALLOWED`, `403 ORIGIN_NOT_ALLOWED / MISSING_REQUESTED_WITH`, `403 CSRF_INVALID`, `404 FILE_NOT_FOUND`, `409 FILE_NOT_READY`, `429 TOO_MANY_REQUESTS` |
| Estado | Implementado |
| Interfaz | Registro paso 2 / Mi cuenta: foto de perfil |

## Módulo `webhooks`

<a id="e-198"></a>

### E-198 · `POST /api/v1/webhooks/identity`

Procesa un aviso del proveedor. La firma se valida en el adaptador; el resultado se consulta al proveedor (no se confía en el cuerpo). Idempotente por (provider, eventId).

| Campo | Valor |
| --- | --- |
| Controller / handler | `IdentityWebhookController.receive` · `src/identity-verification/identity-verification.controller.ts:116` |
| Servicio | `IdentityVerificationService.handleWebhook` · `src/identity-verification/identity-verification.service.ts:153` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: no (firma) · Límite: 60 por minuto |
| Respuesta | `200` · `{ received: true, outcome }` |
| Errores | `429 TOO_MANY_REQUESTS` |
| Estado | Solo backend |
| Observaciones | Lo llama el proveedor de identidad (firma). Con el proveedor manual responde 404. El frontend nunca lo usa. |
| Interfaz | Ninguna (servidor a servidor) |

<a id="e-199"></a>

### E-199 · `POST /api/v1/webhooks/payments`

Aviso de Mercado Pago. Se valida la firma, se guarda una sola vez por id de aviso y se consulta el estado real del pago. Si el proveedor no responde, se responde error para que reintente.

| Campo | Valor |
| --- | --- |
| Controller / handler | `PaymentsWebhookController.receive` · `src/payments/payments.controller.ts:123` |
| Servicio | `PaymentsService.handleWebhook` · `src/payments/payments.service.ts:214` |
| Autenticación | No (pública) |
| Roles | Público |
| Protecciones | CSRF: no · Origin: no (firma) · Límite: 120 por minuto |
| Respuesta | `200` · `{ received: true, outcome }` |
| Errores | `429 TOO_MANY_REQUESTS` |
| Estado | Solo backend |
| Observaciones | Lo llama Mercado Pago (firma `x-signature`). El frontend nunca lo usa. |
| Interfaz | Ninguna (servidor a servidor) |

## Anexo A · DTOs

Todos los DTOs de entrada y salida que declara el backend, con sus validaciones reales. "Obligatorio" solo aplica a los DTOs de entrada (los de salida no tienen validadores: `—`).

<a id="dto-accountactiondto"></a>

#### AccountActionDto

`src/users/dto/account-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |

<a id="dto-accountsummarydto"></a>

#### AccountSummaryDto

`src/users/dto/account-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `status` | `string` | — | — | uno de: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED |  |

<a id="dto-addavailabilityexceptiondto"></a>

#### AddAvailabilityExceptionDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `startDate` | `String` | Sí | — | formato `/^\d{4}-\d{2}-\d{2}$/` |  |
| `endDate` | `String` | Sí | — | formato `/^\d{4}-\d{2}-\d{2}$/` |  |
| `type` | `string` | Sí | — | uno de: DAY_OFF, HOLIDAY, VACATION |  |
| `note` | `String` | No | — | 1–120 caracteres; texto |  |

<a id="dto-addcertificationdto"></a>

#### AddCertificationDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `fileId` | `String` | Sí | — | uuid | Archivo CERTIFICATE propio, confirmado |
| `title` | `String` | Sí | — | 2–120 caracteres; texto |  |
| `institution` | `String` | No | — | 2–120 caracteres; texto |  |
| `issuedYear` | `Number` | No | — | ≤ 2027; ≥ 1950; entero |  |
| `sensitiveDataConfirmed` | `Boolean` | Sí | — | debe ser `true` | Obligatorio (ADR 0020): el documento no muestra DNI, dirección ni fecha de nacimiento, o están tapados. |

<a id="dto-addmediadto"></a>

#### AddMediaDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `fileId` | `String` | Sí | — | uuid | Archivo PROFILE_MEDIA propio, confirmado |
| `purpose` | `string` | Sí | — | uno de: PRESENTATION, WORK, CATALOG_VIDEO, PROFILE_VIDEO, BANNER | Imagen: PRESENTATION, WORK o BANNER. Video: CATALOG_VIDEO, PROFILE_VIDEO o BANNER. |

<a id="dto-addstrikedto"></a>

#### AddStrikeDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `weight` | `Number` | Sí | — | ≤ 3; ≥ 1; entero | Peso según la gravedad |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |
| `reportId` | `String` | No | — | uuid |  |

<a id="dto-adminannouncementdto"></a>

#### AdminAnnouncementDto

`src/support/dto/support.dto.ts` · extiende [`AnnouncementDto`](BACKEND_ENDPOINTS.md#dto-announcementdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `title` | `String` | — | — | — |  |
| `body` | `String` | — | — | — |  |
| `publishedAt` | `Date` | — | Sí | — |  |
| `segment` | [`AnnouncementSegmentDto`](BACKEND_ENDPOINTS.md#dto-announcementsegmentdto) | — | — | — |  |
| `recipients` | `Number` | — | — | — | A cuántas personas les llegó |

<a id="dto-adminappealsquerydto"></a>

#### AdminAppealsQueryDto

`src/moderation/dto/moderation.dto.ts` · extiende [`PageDto`](BACKEND_ENDPOINTS.md#dto-pagedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | No | — | uno de: OPEN, ACCEPTED, REJECTED |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-adminchangeplandto"></a>

#### AdminChangePlanDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `planCode` | `String` | Sí | — | formato `/^[A-Z_]{2,20}$/`; texto |  |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |

<a id="dto-admindecisiondto"></a>

#### AdminDecisionDto

`src/identity-verification/dto/identity-verification.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `decision` | `string` | Sí | — | uno de: APPROVE, REJECT, REVOKE |  |
| `reason` | `String` | Sí | — | 5–300 caracteres; texto |  |
| `reasonCode` | `String` | No | — | formato `/^[A-Z][A-Z0-9_]{2,59}$/` | Código corto visible para el usuario, p. ej. DOCUMENT_MISMATCH |
| `adminNote` | `String` | No | — | 1–500 caracteres; texto | Cómo se verificó (videollamada, presencial…). Interno: el usuario no lo ve. |

<a id="dto-adminmessagedto"></a>

#### AdminMessageDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `title` | `String` | Sí | — | 3–120 caracteres; texto |  |
| `body` | `String` | Sí | — | 3–300 caracteres; texto |  |

<a id="dto-adminneighborhooddto"></a>

#### AdminNeighborhoodDto

`src/locations/dto/neighborhood-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `localityId` | `String` | — | — | — |  |
| `name` | `String` | — | — | — |  |
| `normalizedName` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: PENDING, APPROVED, MERGED |  |
| `mergedIntoId` | `String` | — | Sí | — |  |
| `createdByUserId` | `String` | — | Sí | — |  |
| `reviewedById` | `String` | — | Sí | — |  |
| `reviewedAt` | `Date` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `usage` | [`NeighborhoodUsageDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodusagedto) | — | — | — |  |

<a id="dto-adminneighborhoodlistdto"></a>

#### AdminNeighborhoodListDto

`src/locations/dto/neighborhood-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto)[] | — | — | — |  |
| `total` | `Number` | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |

<a id="dto-adminpaymentitemdto"></a>

#### AdminPaymentItemDto

`src/payments/dto/payments.dto.ts` · extiende [`PaymentItemDto`](BACKEND_ENDPOINTS.md#dto-paymentitemdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `planCode` | `String` | — | — | — |  |
| `purpose` | `string` | — | — | uno de: SUBSCRIPTION, UPGRADE_DIFFERENCE |  |
| `amount` | `String` | — | — | — |  |
| `currency` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: CREATED, PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK |  |
| `applied` | `Boolean` | — | — | — |  |
| `reverted` | `Boolean` | — | — | — |  |
| `grantedFrom` | `Date` | — | Sí | — |  |
| `grantedUntil` | `Date` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `userId` | `String` | — | — | — |  |
| `providerPaymentId` | `String` | — | Sí | — |  |
| `needsReview` | `Boolean` | — | — | — | Aprobado sin aplicar: no coincidió, ver auditoría |

<a id="dto-adminpaymentlistdto"></a>

#### AdminPaymentListDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`AdminPaymentItemDto`](BACKEND_ENDPOINTS.md#dto-adminpaymentitemdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-adminpaymentsquerydto"></a>

#### AdminPaymentsQueryDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `userId` | `String` | No | — | uuid |  |
| `status` | `string` | No | — | uno de: CREATED, PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-adminpaymentsummarydto"></a>

#### AdminPaymentSummaryDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `planCode` | `String` | — | — | — |  |
| `purpose` | `String` | — | — | — |  |
| `amount` | `String` | — | — | — |  |
| `status` | `String` | — | — | — |  |
| `applied` | `Boolean` | — | — | — |  |
| `reverted` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-adminplatformreviewsquerydto"></a>

#### AdminPlatformReviewsQueryDto

`src/reviews/dto/reviews.dto.ts` · extiende [`PageQueryDto`](BACKEND_ENDPOINTS.md#dto-pagequerydto-reviews-dto-reviews-dto-ts)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `published` | `Boolean` | No | — | booleano |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 20 |  |

<a id="dto-adminreasondto"></a>

#### AdminReasonDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |

<a id="dto-adminreportdto"></a>

#### AdminReportDto

`src/moderation/dto/moderation.dto.ts` · extiende [`MyReportDto`](BACKEND_ENDPOINTS.md#dto-myreportdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `targetType` | `string` | — | — | uno de: PROFILE, MESSAGE, FORUM_POST, FORUM_REPLY, REVIEW |  |
| `targetId` | `String` | — | — | — |  |
| `reason` | `string` | — | — | uno de: DISCRIMINATION, DISRESPECT, HARASSMENT, NO_SHOW, NOT_AS_AGREED, FRAUD, THREATS, OFFENSIVE_CONTENT, SPAM, OTHER |  |
| `status` | `string` | — | — | uno de: SUBMITTED, UNDER_REVIEW, VALID, REJECTED |  |
| `createdAt` | `Date` | — | — | — |  |
| `description` | `String` | — | — | — |  |
| `reporter` | [`UserRefDto`](BACKEND_ENDPOINTS.md#dto-userrefdto) | — | — | — |  |
| `reportedUser` | [`UserRefDto`](BACKEND_ENDPOINTS.md#dto-userrefdto) | — | — | — |  |
| `evidenceFileIds` | `String[]` | — | — | — | Ver con GET /evidence/:fileId |
| `target` | `Object` | — | Sí | — | El contenido reportado como estaba (texto, estado) |
| `resolvedAt` | `Date` | — | Sí | — |  |
| `resolutionNote` | `String` | — | Sí | — |  |

<a id="dto-adminreportlistdto"></a>

#### AdminReportListDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-adminreportsquerydto"></a>

#### AdminReportsQueryDto

`src/moderation/dto/moderation.dto.ts` · extiende [`PageDto`](BACKEND_ENDPOINTS.md#dto-pagedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | No | — | uno de: SUBMITTED, UNDER_REVIEW, VALID, REJECTED |  |
| `targetType` | `string` | No | — | uno de: PROFILE, MESSAGE, FORUM_POST, FORUM_REPLY, REVIEW |  |
| `reportedUserId` | `String` | No | — | uuid |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-adminsubscriptionsummarydto"></a>

#### AdminSubscriptionSummaryDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `String` | — | — | — |  |
| `planCode` | `String` | — | Sí | — |  |
| `trialEndsAt` | `Date` | — | Sí | — |  |
| `currentPeriodEnd` | `Date` | — | Sí | — |  |

<a id="dto-adminticketdto"></a>

#### AdminTicketDto

`src/support/dto/support.dto.ts` · extiende [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `category` | `string` | — | — | uno de: SUGGESTION, BUG, INCIDENT, COMPLAINT, OTHER |  |
| `status` | `string` | — | — | uno de: OPEN, ANSWERED, CLOSED |  |
| `messages` | [`TicketMessageDto`](BACKEND_ENDPOINTS.md#dto-ticketmessagedto)[] | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `updatedAt` | `Date` | — | — | — |  |
| `userId` | `String` | — | Sí | — |  |
| `email` | `String` | — | — | — | Email de la cuenta o del formulario público |
| `name` | `String` | — | Sí | — |  |

<a id="dto-adminticketreplydto"></a>

#### AdminTicketReplyDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | Sí | — | 1–2000 caracteres; texto |  |

<a id="dto-adminticketsquerydto"></a>

#### AdminTicketsQueryDto

`src/support/dto/support.dto.ts` · extiende [`PageQueryDto`](BACKEND_ENDPOINTS.md#dto-pagequerydto-reviews-dto-reviews-dto-ts)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | No | — | uno de: OPEN, ANSWERED, CLOSED |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-adminupdatepersonaldatadto"></a>

#### AdminUpdatePersonalDataDto

`src/users/dto/personal-data.dto.ts` · extiende [`UpdatePersonalDataDto`](BACKEND_ENDPOINTS.md#dto-updatepersonaldatadto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `extraInfo` | `Object` | No | Sí | máx. 300 caracteres; texto; condicional | Solo clientes |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |
| `firstName` | `String` | No | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto | Con la identidad aprobada queda en revisión del admin (ADR 0021) |
| `lastName` | `String` | No | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `phone` | `String` | No | — | formato `/^\+?\d{8,15}$/`; texto |  |
| `neighborhood` | [`NeighborhoodInputDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodinputdto) | No | — | objeto validado | Solo clientes: barrio donde vive |

<a id="dto-adminupdateprofessionalprofiledto"></a>

#### AdminUpdateProfessionalProfileDto

`src/professionals/dto/professional-profile.dto.ts` · extiende [`UpdateProfessionalProfileDto`](BACKEND_ENDPOINTS.md#dto-updateprofessionalprofiledto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |
| `businessName` | `Object` | No | Sí | 2–80 caracteres; texto; condicional |  |
| `bio` | `Object` | No | Sí | 1–200 caracteres; texto; condicional | Descripción (FI §7.1) |
| `yearsExperience` | `Object` | No | Sí | ≤ 70; ≥ 0; entero; condicional |  |
| `worksWithTeam` | `Boolean` | No | — | booleano |  |
| `hasMobility` | `Boolean` | No | — | booleano |  |
| `freeQuote` | `Boolean` | No | — | booleano |  |
| `autoStatusFromSchedule` | `Boolean` | No | — | booleano |  |
| `referenceRate` | `Object` | No | Sí | ≤ 99999999; ≥ 0; número (máx. 2 decimales); condicional | Tarifa de referencia en ARS. Va junto con rateMode (los dos o ninguno). |
| `rateMode` | `string` | No | Sí | uno de: PER_VISIT, PER_HOUR, PER_JOB; condicional |  |

<a id="dto-adminuserdetaildto"></a>

#### AdminUserDetailDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `phone` | `String` | — | — | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `status` | `string` | — | — | uno de: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED |  |
| `statusReason` | `String` | — | Sí | — |  |
| `verificationStatus` | `String` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `deletedAt` | `Date` | — | Sí | — |  |
| `deletionScheduledFor` | `Date` | — | Sí | — |  |
| `subscription` | [`AdminSubscriptionSummaryDto`](BACKEND_ENDPOINTS.md#dto-adminsubscriptionsummarydto) | — | Sí | — |  |
| `sanctions` | [`SanctionDto`](BACKEND_ENDPOINTS.md#dto-sanctiondto)[] | — | — | — |  |
| `strikes` | [`StrikeDto`](BACKEND_ENDPOINTS.md#dto-strikedto)[] | — | — | — |  |
| `activeStrikeWeight` | `Number` | — | — | — | Suma del peso de los strikes no anulados |
| `reportsAgainst` | `Number` | — | — | — |  |
| `validReportsAgainst` | `Number` | — | — | — |  |
| `reportsMade` | `Number` | — | — | — |  |
| `payments` | [`AdminPaymentSummaryDto`](BACKEND_ENDPOINTS.md#dto-adminpaymentsummarydto)[] | — | — | — |  |

<a id="dto-adminuseritemdto"></a>

#### AdminUserItemDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `status` | `string` | — | — | uno de: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED |  |
| `verificationStatus` | `String` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-adminuserlistdto"></a>

#### AdminUserListDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`AdminUserItemDto`](BACKEND_ENDPOINTS.md#dto-adminuseritemdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-adminusersquerydto"></a>

#### AdminUsersQueryDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `q` | `String` | No | — | 2–100 caracteres; texto | Nombre, apellido o email |
| `role` | `string` | No | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `status` | `string` | No | — | uno de: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-adminverificationlistdto"></a>

#### AdminVerificationListDto

`src/identity-verification/dto/identity-verification.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`AdminVerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-adminverificationresponsedto)[] | — | — | — |  |
| `meta` | [`PaginationMetaDto`](BACKEND_ENDPOINTS.md#dto-paginationmetadto) | — | — | — |  |

<a id="dto-adminverificationresponsedto"></a>

#### AdminVerificationResponseDto

`src/identity-verification/dto/identity-verification.dto.ts` · extiende [`VerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-verificationresponsedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | Sí | — |  |
| `kind` | `string` | — | Sí | uno de: IDENTITY, PROFILE_CHANGE | IDENTITY o PROFILE_CHANGE (revisión de foto o nombre nuevos, ADR 0019 y 0021) |
| `status` | `string` | — | — | uno de: NOT_STARTED, PENDING, REQUIRES_REVIEW, APPROVED, REJECTED, REVOKED |  |
| `provider` | `String` | — | Sí | — |  |
| `attemptNumber` | `Number` | — | — | — |  |
| `submittedAt` | `String` | — | Sí | — |  |
| `decidedAt` | `String` | — | Sí | — |  |
| `reasonCode` | `String` | — | Sí | — |  |
| `userId` | `String` | — | — | — |  |
| `decisionSource` | `String` | — | Sí | — |  |
| `decidedBy` | `String` | — | Sí | — |  |
| `adminNote` | `String` | — | Sí | — |  |
| `subject` | [`VerificationSubjectDto`](BACKEND_ENDPOINTS.md#dto-verificationsubjectdto) | — | — | — |  |

<a id="dto-announcementdto"></a>

#### AnnouncementDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `title` | `String` | — | — | — |  |
| `body` | `String` | — | — | — |  |
| `publishedAt` | `Date` | — | Sí | — |  |

<a id="dto-announcementsegmentdto"></a>

#### AnnouncementSegmentDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `roles` | `array[]` | No | — | uno de: CUSTOMER, PROFESSIONAL (cada uno); sin repetidos; lista |  |
| `professionIds` | `String[]` | No | — | uuid (cada uno); sin repetidos; máx. 50 elementos; lista | Profesionales que ofrecen alguno |
| `planCodes` | `String[]` | No | — | formato `/^[A-Z_]{2,20}$/` (cada uno); sin repetidos; máx. 10 elementos; lista | Profesionales con alguno de esos planes vigente |

<a id="dto-appealdto"></a>

#### AppealDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `strikeId` | `String` | — | Sí | — |  |
| `sanctionId` | `String` | — | Sí | — |  |
| `body` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: OPEN, ACCEPTED, REJECTED |  |
| `decisionNote` | `String` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-applysanctiondto"></a>

#### ApplySanctionDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `type` | `string` | Sí | — | uno de: WARNING, SUSPENSION, BAN, PROFILE_HIDDEN |  |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto | El usuario lo ve |
| `endsAt` | `String` | No | — | fecha ISO | Solo suspensión y perfil oculto: se levanta sola |
| `reportId` | `String` | No | — | uuid |  |

<a id="dto-attachmentdto"></a>

#### AttachmentDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `fileId` | `String` | — | — | — |  |
| `kind` | `string` | — | — | uno de: IMAGE, VIDEO |  |
| `mimeType` | `String` | — | Sí | — |  |

<a id="dto-attentiondto"></a>

#### AttentionDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `manual` | `string` | — | — | uno de: AVAILABLE, WORKING, RESTING | Estado elegido a mano |
| `until` | `Date` | — | Sí | — |  |
| `autoFromSchedule` | `Boolean` | — | — | — |  |
| `effective` | `string` | — | — | uno de: AVAILABLE, WORKING, RESTING | Estado que se muestra ahora |

<a id="dto-attentionstatusdto"></a>

#### AttentionStatusDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | Sí | — | uno de: AVAILABLE, WORKING, RESTING |  |
| `until` | `Object` | No | Sí | fecha ISO; condicional | Hasta cuándo vale (máximo 7 días). Sin fecha, vale hasta que lo cambie. |

<a id="dto-availabilitydto"></a>

#### AvailabilityDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `slots` | [`AvailabilitySlotDto`](BACKEND_ENDPOINTS.md#dto-availabilityslotdto)[] | — | — | — |  |
| `exceptions` | [`AvailabilityExceptionDto`](BACKEND_ENDPOINTS.md#dto-availabilityexceptiondto)[] | — | — | — | Las que no terminaron |

<a id="dto-availabilityexceptiondto"></a>

#### AvailabilityExceptionDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `startDate` | `String` | — | — | — |  |
| `endDate` | `String` | — | — | — |  |
| `type` | `string` | — | — | uno de: DAY_OFF, HOLIDAY, VACATION |  |
| `note` | `String` | — | Sí | — |  |

<a id="dto-availabilityslotdto"></a>

#### AvailabilitySlotDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `weekday` | `Number` | — | — | — |  |
| `start` | `String` | — | — | — |  |
| `end` | `String` | — | — | — |  |

<a id="dto-availabilityslotinputdto"></a>

#### AvailabilitySlotInputDto

`src/null`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `weekday` | `Number` | Sí | — | ≤ 7; ≥ 1; entero | 1 = lunes … 7 = domingo |
| `start` | `String` | Sí | — | formato `/^([01]\d\|2[0-3]):[0-5]\d$/` |  |
| `end` | `String` | Sí | — | formato `/^([01]\d\|2[0-3]):[0-5]\d$/` |  |

<a id="dto-avatarresponsedto"></a>

#### AvatarResponseDto

`src/identity-verification/dto/identity-verification.dto.ts` · extiende [`FileResponseDto`](BACKEND_ENDPOINTS.md#dto-fileresponsedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `purpose` | `string` | — | — | uno de: AVATAR, PROFILE_MEDIA, CERTIFICATE, CHAT_ATTACHMENT, FORUM_MEDIA, EVIDENCE |  |
| `kind` | `string` | — | — | uno de: IMAGE, VIDEO, DOCUMENT |  |
| `status` | `string` | — | — | uno de: PENDING_UPLOAD, READY, REJECTED, DELETED |  |
| `mimeType` | `String` | — | Sí | — |  |
| `sizeBytes` | `Number` | — | Sí | — |  |
| `durationMs` | `Number` | — | Sí | — |  |
| `url` | `String` | — | Sí | — | URL pública si el archivo está listo. Con el adaptador local es una ruta de la API (anteponer su origen). |
| `createdAt` | `Date` | — | — | — |  |
| `underReview` | `Boolean` | — | — | — |  |

<a id="dto-banaccountdto"></a>

#### BanAccountDto

`src/users/dto/account-admin.dto.ts` · extiende [`AccountActionDto`](BACKEND_ENDPOINTS.md#dto-accountactiondto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reportId` | `String` | No | — | uuid | Reporte que lo originó |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |

<a id="dto-catalogitemdto"></a>

#### CatalogItemDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `slug` | `String` | — | — | — |  |
| `professionalUserId` | `String` | — | — | — | Id de usuario del profesional: el que piden chat, favoritos, solicitudes y reportes de perfil |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `businessName` | `String` | — | Sí | — |  |
| `avatarUrl` | `String` | — | Sí | — |  |
| `bio` | `String` | — | Sí | — |  |
| `yearsExperience` | `Number` | — | Sí | — |  |
| `referenceRate` | `String` | — | Sí | — |  |
| `rateMode` | `string` | — | Sí | uno de: PER_VISIT, PER_HOUR, PER_JOB |  |
| `freeQuote` | `Boolean` | — | — | — |  |
| `attentionStatus` | `string` | — | — | uno de: AVAILABLE, WORKING, RESTING | Estado que se muestra ahora |
| `identityVerified` | `Boolean` | — | — | — | Siempre true: el catálogo solo muestra identidades aprobadas |
| `professions` | [`PublicProfessionDto`](BACKEND_ENDPOINTS.md#dto-publicprofessiondto)[] | — | — | — |  |
| `serviceAreas` | [`PublicAreaDto`](BACKEND_ENDPOINTS.md#dto-publicareadto)[] | — | — | — |  |
| `coverImageUrl` | `String` | — | Sí | — | Primera imagen de presentación |
| `catalogVideoUrl` | `String` | — | Sí | — | Video de presentación en catálogo |
| `ratingAverage` | `Number` | — | Sí | — | Promedio de estrellas (un decimal) |
| `ratingCount` | `Number` | — | — | — | Cantidad de reseñas visibles |

<a id="dto-catalogpagedto"></a>

#### CatalogPageDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`CatalogItemDto`](BACKEND_ENDPOINTS.md#dto-catalogitemdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-catalogquerydto"></a>

#### CatalogQueryDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `professionId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid |  |
| `neighborhoodId` | `String` | No | — | uuid | Barrio aprobado. Incluye a quienes cubren toda la localidad. |
| `availableNow` | `Boolean` | No | — | booleano | Solo los disponibles en este momento ("Disponible ya") |
| `page` | `Number` | No | — | ≤ 500; ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 20 |  |

<a id="dto-certificationitemdto"></a>

#### CertificationItemDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `title` | `String` | — | — | — |  |
| `institution` | `String` | — | Sí | — |  |
| `issuedYear` | `Number` | — | Sí | — |  |
| `kind` | `string` | — | — | uno de: IMAGE, DOCUMENT |  |
| `status` | `string` | — | — | uno de: ACTIVE, HIDDEN_BY_ADMIN |  |
| `url` | `String` | — | Sí | — |  |
| `verified` | `Boolean` | — | — | — | Siempre false: "certificado cargado por el profesional" (ADR 0020) |
| `hiddenReason` | `String` | — | Sí | — |  |

<a id="dto-changepassworddto"></a>

#### ChangePasswordDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `currentPassword` | `String` | Sí | — | máx. 128 caracteres; texto |  |
| `newPassword` | `String` | Sí | — | máx. 128 caracteres; mín. 8 caracteres; texto |  |

<a id="dto-changeroledto"></a>

#### ChangeRoleDto

`src/users/dto/account-admin.dto.ts` · extiende [`AccountActionDto`](BACKEND_ENDPOINTS.md#dto-accountactiondto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `role` | `string` | Sí | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `neighborhood` | [`NeighborhoodInputDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodinputdto) | No | — | objeto validado |  |
| `professionId` | `String` | No | — | uuid |  |
| `serviceAreas` | [`ServiceAreaInputDto`](BACKEND_ENDPOINTS.md#dto-serviceareainputdto)[] | No | — | objeto validado (cada uno); máx. 100 elementos; mín. 1 elementos; lista |  |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |

<a id="dto-checkoutdto"></a>

#### CheckoutDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `planCode` | `String` | Sí | — | formato `/^[A-Z_]{2,20}$/`; texto |  |

<a id="dto-checkoutresponsedto"></a>

#### CheckoutResponseDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `paymentId` | `String` | — | — | — |  |
| `purpose` | `string` | — | — | uno de: SUBSCRIPTION, UPGRADE_DIFFERENCE |  |
| `amount` | `String` | — | — | — |  |
| `currency` | `String` | — | — | — |  |
| `checkoutUrl` | `String` | — | — | — | Enlace al checkout de Mercado Pago |

<a id="dto-contactdto"></a>

#### ContactDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` | Sí | — | 2–80 caracteres; texto |  |
| `email` | `String` | Sí | — | máx. 254 caracteres; email |  |
| `category` | `string` | Sí | — | uno de: SUGGESTION, BUG, INCIDENT, COMPLAINT, OTHER |  |
| `body` | `String` | Sí | — | 10–2000 caracteres; texto |  |
| `captchaToken` | `String` | No | — | máx. 2048 caracteres; texto | Turnstile: obligatorio cuando el CAPTCHA está activado |

<a id="dto-contractdto"></a>

#### ContractDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `requestId` | `String` | — | — | — |  |
| `customerId` | `String` | — | — | — |  |
| `professionalId` | `String` | — | — | — |  |
| `conversationId` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: ACCEPTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED_BY_CLIENT, CANCELLED_BY_PRO |  |
| `acceptedQuote` | [`QuoteDto`](BACKEND_ENDPOINTS.md#dto-quotedto) | — | Sí | — |  |
| `scheduledAt` | `Date` | — | Sí | — |  |
| `startedAt` | `Date` | — | Sí | — |  |
| `completedAt` | `Date` | — | Sí | — |  |
| `cancelledAt` | `Date` | — | Sí | — |  |
| `cancelReason` | `String` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `suggestedAttentionStatus` | `String` | — | — | — | C-30: al empezar, sugerencia para el estado de atención (no se cambia solo) |

<a id="dto-conversationdto"></a>

#### ConversationDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `myRole` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `counterpart` | [`CounterpartDto`](BACKEND_ENDPOINTS.md#dto-counterpartdto) | — | — | — |  |
| `lastMessage` | [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | — | Sí | — |  |
| `unread` | `Number` | — | — | — |  |
| `counterpartReadAt` | `Date` | — | Sí | — | Hasta dónde leyó el otro |
| `canWrite` | `Boolean` | — | — | — | false si no se pueden mandar mensajes (profesional sin plan) |
| `lastMessageAt` | `Date` | — | Sí | — |  |

<a id="dto-conversationmessagedto"></a>

#### ConversationMessageDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `senderType` | `String` | — | — | — |  |
| `senderId` | `String` | — | Sí | — |  |
| `body` | `String` | — | — | — |  |
| `originalBody` | `String` | — | Sí | — | Versión original (ADR 0024) |
| `edited` | `Boolean` | — | — | — |  |
| `deleted` | `Boolean` | — | — | — |  |
| `reported` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-counterpartdto"></a>

#### CounterpartDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `userId` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `avatarUrl` | `String` | — | Sí | — |  |
| `slug` | `Object` | — | — | — | Solo si es profesional |
| `businessName` | `String` | — | Sí | — |  |
| `neighborhoodName` | `Object` | — | — | — | Solo si es cliente (C-13) |
| `extraInfo` | `String` | — | Sí | — |  |

<a id="dto-createannouncementdto"></a>

#### CreateAnnouncementDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `title` | `String` | Sí | — | 3–120 caracteres; texto |  |
| `body` | `String` | Sí | — | 3–2000 caracteres; texto |  |
| `segment` | [`AnnouncementSegmentDto`](BACKEND_ENDPOINTS.md#dto-announcementsegmentdto) | No | — | objeto validado | Vacío = todos |

<a id="dto-createappealdto"></a>

#### CreateAppealDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `strikeId` | `String` | No | — | uuid | Uno de los dos |
| `sanctionId` | `String` | No | — | uuid |  |
| `body` | `String` | Sí | — | 10–2000 caracteres; texto |  |

<a id="dto-createforumpostdto"></a>

#### CreateForumPostDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `type` | `string` | Sí | — | uno de: QUESTION, PROFESSIONAL_WANTED |  |
| `body` | `String` | Sí | — | 5–2000 caracteres; texto |  |
| `professionIds` | `String[]` | No | — | uuid (cada uno); sin repetidos; máx. 4 elementos; lista |  |
| `localityId` | `String` | No | — | uuid |  |
| `neighborhoodId` | `String` | No | — | uuid | Barrio aprobado de esa localidad |
| `budgetEstimate` | `Number` | No | — | ≤ 9999999999; ≥ 1; número (máx. 2 decimales) | Presupuesto estimado en ARS |
| `deadline` | `String` | No | — | fecha ISO |  |
| `mediaFileIds` | `String[]` | No | — | uuid (cada uno); sin repetidos; máx. 3 elementos; lista | Archivos FORUM_MEDIA propios, confirmados |

<a id="dto-createforumreplydto"></a>

#### CreateForumReplyDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | Sí | — | 1–1000 caracteres; texto |  |
| `parentReplyId` | `String` | No | — | uuid | Respuesta a la que contesta |
| `proposedPrice` | `Number` | No | — | ≤ 9999999999; ≥ 1; número (máx. 2 decimales) | Solo profesionales, en "Solicito profesional" |

<a id="dto-createreportdto"></a>

#### CreateReportDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `targetType` | `string` | Sí | — | uno de: PROFILE, MESSAGE, FORUM_POST, FORUM_REPLY, REVIEW |  |
| `targetId` | `String` | Sí | — | uuid | En PROFILE, el id del usuario |
| `reason` | `string` | Sí | — | uno de: DISCRIMINATION, DISRESPECT, HARASSMENT, NO_SHOW, NOT_AS_AGREED, FRAUD, THREATS, OFFENSIVE_CONTENT, SPAM, OTHER |  |
| `description` | `String` | Sí | — | 10–2000 caracteres; texto |  |
| `evidenceFileIds` | `String[]` | No | — | uuid (cada uno); sin repetidos; máx. 3 elementos; lista | Archivos EVIDENCE propios, confirmados |

<a id="dto-createrequestdto"></a>

#### CreateRequestDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `professionalIds` | `String[]` | Sí | — | uuid (cada uno); sin repetidos; máx. 10 elementos; mín. 1 elementos; lista | Usuarios de los profesionales (1 a 10) |
| `professionId` | `String` | Sí | — | uuid | Oficio (los profesionales tienen que ofrecerlo) |
| `description` | `String` | Sí | — | 5–1000 caracteres; texto |  |
| `urgency` | `string` | Sí | — | uno de: CAN_WAIT, IMPATIENT, URGENT |  |

<a id="dto-createreviewdto"></a>

#### CreateReviewDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `contractId` | `String` | Sí | — | uuid | Contratación terminada propia |
| `rating` | `Number` | Sí | — | ≤ 5; ≥ 1; entero |  |
| `comment` | `Object` | No | Sí | 1–1000 caracteres; texto; condicional |  |

<a id="dto-createticketdto"></a>

#### CreateTicketDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `category` | `string` | Sí | — | uno de: SUGGESTION, BUG, INCIDENT, COMPLAINT, OTHER |  |
| `body` | `String` | Sí | — | 10–2000 caracteres; texto |  |
| `fileId` | `String` | No | — | uuid | Una foto (archivo EVIDENCE propio) |

<a id="dto-createuploaddto"></a>

#### CreateUploadDto

`src/uploads/dto/uploads.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `purpose` | `string` | Sí | — | uno de: AVATAR, PROFILE_MEDIA, CERTIFICATE, CHAT_ATTACHMENT, FORUM_MEDIA, EVIDENCE |  |
| `kind` | `string` | Sí | — | uno de: IMAGE, VIDEO, DOCUMENT |  |

<a id="dto-createuploadresponsedto"></a>

#### CreateUploadResponseDto

`src/uploads/dto/uploads.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `file` | [`FileResponseDto`](BACKEND_ENDPOINTS.md#dto-fileresponsedto) | — | — | — |  |
| `upload` | [`UploadTicketDto`](BACKEND_ENDPOINTS.md#dto-uploadticketdto) | — | — | — |  |

<a id="dto-csrftokendto"></a>

#### CsrfTokenDto

`src/auth/dto/auth-responses.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `csrfToken` | `String` | — | — | — |  |

<a id="dto-currentuserdto"></a>

#### CurrentUserDto

`src/auth/dto/auth-responses.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `status` | `string` | — | — | uno de: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED |  |
| `statusReason` | `String` | — | Sí | — | Motivo, solo si la cuenta está suspendida o baneada (ADR 0007) |
| `verificationStatus` | `string` | — | — | uno de: NOT_STARTED, PENDING, REQUIRES_REVIEW, APPROVED, REJECTED, REVOKED |  |
| `emailVerified` | `Boolean` | — | — | — |  |
| `avatarUrl` | `String` | — | Sí | — | Foto de perfil (null si no cargó) |
| `pendingAvatarUrl` | `String` | — | Sí | — | Foto nueva en revisión del admin (ADR 0019); en público se ve avatarUrl |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-customerprofiledto"></a>

#### CustomerProfileDto

`src/users/customers.controller.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `extraInfo` | `String` | — | Sí | — |  |

<a id="dto-dashboarddto"></a>

#### DashboardDto

`src/admin/dto/admin-panel.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `usersByRole` | `Object` | — | — | — | Clientes y profesionales |
| `usersByStatus` | `Object` | — | — | — |  |
| `subscriptionsByStatus` | `Object` | — | — | — | Última suscripción de cada profesional |
| `professionalsByPlan` | `Object` | — | — | — | Con prueba o plan vigente |
| `newUsersLast7Days` | `Number` | — | — | — |  |
| `newForumPostsLast7Days` | `Number` | — | — | — |  |
| `newReportsLast7Days` | `Number` | — | — | — |  |
| `openReports` | `Number` | — | — | — |  |
| `openAppeals` | `Number` | — | — | — |  |
| `openSupportTickets` | `Number` | — | — | — |  |
| `pendingVerifications` | `Number` | — | — | — |  |
| `sanctionedUsers` | `Number` | — | — | — |  |
| `paymentsToReview` | `Number` | — | — | — | Pagos aprobados sin aplicar (ADR 0026) |

<a id="dto-decideappealdto"></a>

#### DecideAppealDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `decision` | `string` | Sí | — | uno de: ACCEPTED, REJECTED |  |
| `note` | `String` | Sí | — | 5–500 caracteres; texto |  |

<a id="dto-deleteownaccountdto"></a>

#### DeleteOwnAccountDto

`src/users/dto/account-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `password` | `String` | No | — | máx. 128 caracteres; texto |  |

<a id="dto-editmessagedto"></a>

#### EditMessageDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | Sí | — | máx. 2000 caracteres; texto |  |

<a id="dto-emaildto"></a>

#### EmailDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `email` | `String` | Sí | — | máx. 254 caracteres; email |  |

<a id="dto-favoritealertsdto"></a>

#### FavoriteAlertsDto

`src/favorites/dto/favorites.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `availabilityAlerts` | `Boolean` | Sí | — | booleano |  |

<a id="dto-favoritedto"></a>

#### FavoriteDto

`src/favorites/dto/favorites.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `professionalId` | `String` | — | — | — |  |
| `listed` | `Boolean` | — | — | — | false si hoy no aparece en el catálogo |
| `slug` | `String` | — | Sí | — |  |
| `firstName` | `String` | — | Sí | — |  |
| `lastName` | `String` | — | Sí | — |  |
| `businessName` | `String` | — | Sí | — |  |
| `avatarUrl` | `String` | — | Sí | — |  |
| `availabilityAlerts` | `Boolean` | — | — | — |  |
| `alertsAvailable` | `Boolean` | — | — | — | Si su plan incluye los avisos de disponibilidad |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-fileresponsedto"></a>

#### FileResponseDto

`src/uploads/dto/uploads.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `purpose` | `string` | — | — | uno de: AVATAR, PROFILE_MEDIA, CERTIFICATE, CHAT_ATTACHMENT, FORUM_MEDIA, EVIDENCE |  |
| `kind` | `string` | — | — | uno de: IMAGE, VIDEO, DOCUMENT |  |
| `status` | `string` | — | — | uno de: PENDING_UPLOAD, READY, REJECTED, DELETED |  |
| `mimeType` | `String` | — | Sí | — |  |
| `sizeBytes` | `Number` | — | Sí | — |  |
| `durationMs` | `Number` | — | Sí | — |  |
| `url` | `String` | — | Sí | — | URL pública si el archivo está listo. Con el adaptador local es una ruta de la API (anteponer su origen). |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-forumauthordto"></a>

#### ForumAuthorDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `userId` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `avatarUrl` | `String` | — | Sí | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `memberSince` | `Date` | — | — | — | Fecha de registro |

<a id="dto-forumlikesdto"></a>

#### ForumLikesDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `post` | `Boolean` | — | — | — |  |
| `replyIds` | `String[]` | — | — | — |  |

<a id="dto-forummediadto"></a>

#### ForumMediaDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `kind` | `string` | — | — | uno de: IMAGE, VIDEO, DOCUMENT |  |
| `url` | `String` | — | — | — |  |

<a id="dto-forumpagedto"></a>

#### ForumPageDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`ForumPostDto`](BACKEND_ENDPOINTS.md#dto-forumpostdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-forumpostdetaildto"></a>

#### ForumPostDetailDto

`src/forum/dto/forum.dto.ts` · extiende [`ForumPostDto`](BACKEND_ENDPOINTS.md#dto-forumpostdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `type` | `string` | — | — | uno de: QUESTION, PROFESSIONAL_WANTED |  |
| `body` | `String` | — | — | — |  |
| `author` | [`ForumAuthorDto`](BACKEND_ENDPOINTS.md#dto-forumauthordto) | — | — | — |  |
| `professions` | [`NamedRefDto`](BACKEND_ENDPOINTS.md#dto-namedrefdto)[] | — | — | — |  |
| `locality` | [`NamedRefDto`](BACKEND_ENDPOINTS.md#dto-namedrefdto) | — | Sí | — |  |
| `neighborhood` | [`NamedRefDto`](BACKEND_ENDPOINTS.md#dto-namedrefdto) | — | Sí | — |  |
| `budgetEstimate` | `String` | — | Sí | — |  |
| `deadline` | `String` | — | Sí | — |  |
| `resolved` | `Boolean` | — | — | — |  |
| `media` | [`ForumMediaDto`](BACKEND_ENDPOINTS.md#dto-forummediadto)[] | — | — | — |  |
| `likeCount` | `Number` | — | — | — |  |
| `replyCount` | `Number` | — | — | — |  |
| `edited` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `replies` | [`ForumReplyDto`](BACKEND_ENDPOINTS.md#dto-forumreplydto)[] | — | — | — | En orden; se anidan con parentReplyId |

<a id="dto-forumpostdto"></a>

#### ForumPostDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `type` | `string` | — | — | uno de: QUESTION, PROFESSIONAL_WANTED |  |
| `body` | `String` | — | — | — |  |
| `author` | [`ForumAuthorDto`](BACKEND_ENDPOINTS.md#dto-forumauthordto) | — | — | — |  |
| `professions` | [`NamedRefDto`](BACKEND_ENDPOINTS.md#dto-namedrefdto)[] | — | — | — |  |
| `locality` | [`NamedRefDto`](BACKEND_ENDPOINTS.md#dto-namedrefdto) | — | Sí | — |  |
| `neighborhood` | [`NamedRefDto`](BACKEND_ENDPOINTS.md#dto-namedrefdto) | — | Sí | — |  |
| `budgetEstimate` | `String` | — | Sí | — |  |
| `deadline` | `String` | — | Sí | — |  |
| `resolved` | `Boolean` | — | — | — |  |
| `media` | [`ForumMediaDto`](BACKEND_ENDPOINTS.md#dto-forummediadto)[] | — | — | — |  |
| `likeCount` | `Number` | — | — | — |  |
| `replyCount` | `Number` | — | — | — |  |
| `edited` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-forumquerydto"></a>

#### ForumQueryDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `type` | `string` | No | — | uno de: QUESTION, PROFESSIONAL_WANTED |  |
| `professionId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid |  |
| `resolved` | `Boolean` | No | — | booleano |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 20 |  |

<a id="dto-forumreplydto"></a>

#### ForumReplyDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `parentReplyId` | `String` | — | Sí | — |  |
| `author` | [`ForumAuthorDto`](BACKEND_ENDPOINTS.md#dto-forumauthordto) | — | Sí | — |  |
| `body` | `String` | — | — | — | Vacío si se borró o la ocultó el admin |
| `proposedPrice` | `String` | — | Sí | — |  |
| `removed` | `Boolean` | — | — | — | Borrada o oculta: queda el lugar para las respuestas a ella |
| `likeCount` | `Number` | — | — | — |  |
| `edited` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-googlelinkconfirmdto"></a>

#### GoogleLinkConfirmDto

`src/auth/google/google-auth.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `token` | `String` | Sí | — | 20–100 caracteres; texto | Token del enlace enviado por email |

<a id="dto-googlelinkpassworddto"></a>

#### GoogleLinkPasswordDto

`src/auth/google/google-auth.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `password` | `String` | Sí | — | máx. 128 caracteres; texto |  |

<a id="dto-googlependingdto"></a>

#### GooglePendingDto

`src/auth/google/google-auth.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `kind` | `string` | — | — | uno de: LINK, SIGNUP |  |
| `email` | `String` | — | — | — |  |
| `firstName` | `String` | — | Sí | — |  |
| `lastName` | `String` | — | Sí | — |  |

<a id="dto-googleregisterdto"></a>

#### GoogleRegisterDto

`src/auth/google/google-auth.dto.ts` · extiende [`OmitRegisterDtoEmailPassword`](BACKEND_ENDPOINTS.md#dto-omitregisterdtoemailpassword)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `role` | `string` | Sí | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `firstName` | `String` | Sí | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `lastName` | `String` | Sí | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `phone` | `String` | Sí | — | formato `/^\+?\d{8,15}$/`; texto |  |
| `neighborhood` | [`NeighborhoodInputDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodinputdto) | No | — | objeto validado; condicional | Obligatorio para clientes |
| `professionId` | `String` | No | — | uuid; condicional | Obligatoria para profesionales |
| `serviceAreas` | [`ServiceAreaInputDto`](BACKEND_ENDPOINTS.md#dto-serviceareainputdto)[] | No | — | objeto validado (cada uno); máx. 100 elementos; mín. 1 elementos; lista; condicional | Profesionales: 1 a 20 zonas |
| `captchaToken` | `String` | No | — | máx. 2048 caracteres; texto | Turnstile: obligatorio cuando el CAPTCHA está activado |

<a id="dto-hidecontentdto"></a>

#### HideContentDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | Sí | — | 5–300 caracteres; texto | Motivo (auditado) |

<a id="dto-listneighborhoodsquerydto"></a>

#### ListNeighborhoodsQueryDto

`src/locations/dto/neighborhood-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | No | — | uno de: PENDING, APPROVED, MERGED; defecto: "PENDING" |  |
| `localityId` | `String` | No | — | uuid |  |
| `search` | `String` | No | — | máx. 60 caracteres; texto |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-listverificationsquerydto"></a>

#### ListVerificationsQueryDto

`src/identity-verification/dto/identity-verification.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | No | — | uno de: NOT_STARTED, PENDING, REQUIRES_REVIEW, APPROVED, REJECTED, REVOKED |  |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 20 |  |

<a id="dto-localitiesquerydto"></a>

#### LocalitiesQueryDto

`src/locations/dto/location-queries.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `provinceId` | `String` | Sí | — | uuid |  |

<a id="dto-logindto"></a>

#### LoginDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `email` | `String` | Sí | — | máx. 254 caracteres; email |  |
| `password` | `String` | Sí | — | máx. 128 caracteres; texto |  |
| `captchaToken` | `String` | No | — | máx. 2048 caracteres; texto | Turnstile: solo si la API respondió CAPTCHA_REQUIRED |

<a id="dto-mediaitemdto"></a>

#### MediaItemDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `fileId` | `String` | — | — | — |  |
| `purpose` | `string` | — | — | uno de: PRESENTATION, WORK, CATALOG_VIDEO, PROFILE_VIDEO, BANNER |  |
| `kind` | `string` | — | — | uno de: IMAGE, VIDEO |  |
| `position` | `Number` | — | — | — |  |
| `status` | `string` | — | — | uno de: ACTIVE, HIDDEN_BY_PLAN, HIDDEN_BY_ADMIN |  |
| `url` | `String` | — | Sí | — |  |
| `hiddenReason` | `String` | — | Sí | — |  |

<a id="dto-medto"></a>

#### MeDto

`src/auth/dto/auth-responses.dto.ts` · extiende [`CurrentUserDto`](BACKEND_ENDPOINTS.md#dto-currentuserdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `status` | `string` | — | — | uno de: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, DEACTIVATED |  |
| `statusReason` | `String` | — | Sí | — | Motivo, solo si la cuenta está suspendida o baneada (ADR 0007) |
| `verificationStatus` | `string` | — | — | uno de: NOT_STARTED, PENDING, REQUIRES_REVIEW, APPROVED, REJECTED, REVOKED |  |
| `emailVerified` | `Boolean` | — | — | — |  |
| `avatarUrl` | `String` | — | Sí | — | Foto de perfil (null si no cargó) |
| `pendingAvatarUrl` | `String` | — | Sí | — | Foto nueva en revisión del admin (ADR 0019); en público se ve avatarUrl |
| `createdAt` | `Date` | — | — | — |  |
| `hasPassword` | `Boolean` | — | — | — | false en cuentas creadas con Google sin contraseña |
| `googleLinked` | `Boolean` | — | — | — |  |

<a id="dto-mergeneighborhooddto"></a>

#### MergeNeighborhoodDto

`src/locations/dto/neighborhood-admin.dto.ts` · extiende [`ModerationReasonDto`](BACKEND_ENDPOINTS.md#dto-moderationreasondto-locations-dto-neighborhood-admin-dto-ts)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `targetId` | `String` | Sí | — | uuid | Barrio APROBADO de la misma localidad |
| `reason` | `String` | No | — | 1–300 caracteres; texto |  |

<a id="dto-messagedto-auth-dto-auth-responses-dto-ts"></a>

#### MessageDto

`src/auth/dto/auth-responses.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `message` | `String` | — | — | — |  |

<a id="dto-messagedto-chat-dto-chat-dto-ts"></a>

#### MessageDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `conversationId` | `String` | — | — | — |  |
| `senderType` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, SYSTEM |  |
| `senderId` | `String` | — | Sí | — |  |
| `body` | `String` | — | — | — | Vacío si se eliminó |
| `edited` | `Boolean` | — | — | — |  |
| `deleted` | `Boolean` | — | — | — |  |
| `serviceRequestId` | `String` | — | Sí | — |  |
| `attachments` | [`AttachmentDto`](BACKEND_ENDPOINTS.md#dto-attachmentdto)[] | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-messagesquerydto"></a>

#### MessagesQueryDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `before` | `String` | No | — | fecha ISO | Mensajes anteriores a esta fecha (paginación hacia atrás) |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 30 |  |

<a id="dto-metricsbucketdto"></a>

#### MetricsBucketDto

`src/metrics/dto/metrics.dto.ts` · extiende [`MetricsValuesDto`](BACKEND_ENDPOINTS.md#dto-metricsvaluesdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `profileViewers` | `Number` | — | — | — | Personas distintas que abrieron el perfil (por día, sumadas) |
| `searchAppearances` | `Number` | — | — | — | Personas distintas que lo vieron en resultados (por día, sumadas) |
| `firstPlace` | `Number` | — | — | — | Veces que estuvo primero en la primera página (personas por día) |
| `requests` | `Number` | — | — | — | Pedidos que le llegaron |
| `completed` | `Number` | — | — | — | Trabajos terminados |
| `ratingCount` | `Number` | — | — | — | Reseñas recibidas |
| `ratingAverage` | `Number` | — | Sí | — | Promedio de esas reseñas (1 a 5) |
| `start` | `String` | — | — | — | Comienzo del período |

<a id="dto-metricspreviousdto"></a>

#### MetricsPreviousDto

`src/metrics/dto/metrics.dto.ts` · extiende [`MetricsValuesDto`](BACKEND_ENDPOINTS.md#dto-metricsvaluesdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `profileViewers` | `Number` | — | — | — | Personas distintas que abrieron el perfil (por día, sumadas) |
| `searchAppearances` | `Number` | — | — | — | Personas distintas que lo vieron en resultados (por día, sumadas) |
| `firstPlace` | `Number` | — | — | — | Veces que estuvo primero en la primera página (personas por día) |
| `requests` | `Number` | — | — | — | Pedidos que le llegaron |
| `completed` | `Number` | — | — | — | Trabajos terminados |
| `ratingCount` | `Number` | — | — | — | Reseñas recibidas |
| `ratingAverage` | `Number` | — | Sí | — | Promedio de esas reseñas (1 a 5) |
| `from` | `String` | — | — | — |  |
| `to` | `String` | — | — | — |  |

<a id="dto-metricsquerydto"></a>

#### MetricsQueryDto

`src/metrics/dto/metrics.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido). Defecto: día 1 del mes |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido). Defecto: hoy |
| `groupBy` | `string` | No | — | uno de: day, week, month; defecto: "day" |  |

<a id="dto-metricsvaluesdto"></a>

#### MetricsValuesDto

`src/metrics/dto/metrics.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `profileViewers` | `Number` | — | — | — | Personas distintas que abrieron el perfil (por día, sumadas) |
| `searchAppearances` | `Number` | — | — | — | Personas distintas que lo vieron en resultados (por día, sumadas) |
| `firstPlace` | `Number` | — | — | — | Veces que estuvo primero en la primera página (personas por día) |
| `requests` | `Number` | — | — | — | Pedidos que le llegaron |
| `completed` | `Number` | — | — | — | Trabajos terminados |
| `ratingCount` | `Number` | — | — | — | Reseñas recibidas |
| `ratingAverage` | `Number` | — | Sí | — | Promedio de esas reseñas (1 a 5) |

<a id="dto-mfaverifydto"></a>

#### MfaVerifyDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `code` | `String` | No | — | formato `/^\d{6}$/`; condicional |  |
| `recoveryCode` | `String` | No | — | 10–11 caracteres; texto |  |

<a id="dto-moderationreasondto-locations-dto-neighborhood-admin-dto-ts"></a>

#### ModerationReasonDto

`src/locations/dto/neighborhood-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | No | — | 1–300 caracteres; texto |  |

<a id="dto-moderationreasondto-moderation-dto-moderation-dto-ts"></a>

#### ModerationReasonDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | Sí | — | 5–500 caracteres; texto |  |

<a id="dto-mymoderationdto"></a>

#### MyModerationDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `sanctions` | [`SanctionDto`](BACKEND_ENDPOINTS.md#dto-sanctiondto)[] | — | — | — |  |
| `strikes` | [`StrikeDto`](BACKEND_ENDPOINTS.md#dto-strikedto)[] | — | — | — |  |
| `appeals` | [`AppealDto`](BACKEND_ENDPOINTS.md#dto-appealdto)[] | — | — | — |  |

<a id="dto-myreportdto"></a>

#### MyReportDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `targetType` | `string` | — | — | uno de: PROFILE, MESSAGE, FORUM_POST, FORUM_REPLY, REVIEW |  |
| `targetId` | `String` | — | — | — |  |
| `reason` | `string` | — | — | uno de: DISCRIMINATION, DISRESPECT, HARASSMENT, NO_SHOW, NOT_AS_AGREED, FRAUD, THREATS, OFFENSIVE_CONTENT, SPAM, OTHER |  |
| `status` | `string` | — | — | uno de: SUBMITTED, UNDER_REVIEW, VALID, REJECTED |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-namedrefdto"></a>

#### NamedRefDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `name` | `String` | — | — | — |  |

<a id="dto-neighborhoodinputdto"></a>

#### NeighborhoodInputDto

`src/auth/dto/register.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `localityId` | `String` | Sí | — | uuid |  |
| `name` | `String` | Sí | — | 2–60 caracteres; texto | Nombre existente o uno nuevo |

<a id="dto-neighborhoodsearchquerydto"></a>

#### NeighborhoodSearchQueryDto

`src/locations/dto/location-queries.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `localityId` | `String` | Sí | — | uuid |  |
| `search` | `String` | Sí | — | máx. 60 caracteres; mín. 2 caracteres; texto |  |

<a id="dto-neighborhoodusagedto"></a>

#### NeighborhoodUsageDto

`src/locations/dto/neighborhood-admin.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `residents` | `Number` | — | — | — | Clientes que viven ahí |
| `serviceAreas` | `Number` | — | — | — | Zonas de trabajo de profesionales |

<a id="dto-notificationpreferencedto"></a>

#### NotificationPreferenceDto

`src/notifications/dto/push.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `category` | `string` | Sí | — | uno de: MESSAGES, REQUESTS, ACCOUNT, COMMUNITY, FAVORITES, ANNOUNCEMENTS, ADMIN_ALERTS |  |
| `push` | `Boolean` | Sí | — | booleano | Avisos por push de esta categoría |

<a id="dto-notificationsquerydto"></a>

#### NotificationsQueryDto

`src/notifications/notifications.controller.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 20 |  |

<a id="dto-omitregisterdtoemailpassword"></a>

#### OmitRegisterDtoEmailPassword

`src/null`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `role` | `string` | Sí | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `firstName` | `String` | Sí | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `lastName` | `String` | Sí | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `phone` | `String` | Sí | — | formato `/^\+?\d{8,15}$/`; texto |  |
| `neighborhood` | [`NeighborhoodInputDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodinputdto) | No | — | objeto validado; condicional | Obligatorio para clientes |
| `professionId` | `String` | No | — | uuid; condicional | Obligatoria para profesionales |
| `serviceAreas` | [`ServiceAreaInputDto`](BACKEND_ENDPOINTS.md#dto-serviceareainputdto)[] | No | — | objeto validado (cada uno); máx. 100 elementos; mín. 1 elementos; lista; condicional | Profesionales: 1 a 20 zonas |
| `captchaToken` | `String` | No | — | máx. 2048 caracteres; texto | Turnstile: obligatorio cuando el CAPTCHA está activado |

<a id="dto-openconversationdto"></a>

#### OpenConversationDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `professionalId` | `String` | Sí | — | uuid | Usuario del profesional (visible en el catálogo) |

<a id="dto-overallratingdto"></a>

#### OverallRatingDto

`src/metrics/dto/metrics.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `count` | `Number` | — | — | — |  |
| `average` | `Number` | — | Sí | — |  |

<a id="dto-ownreviewdto"></a>

#### OwnReviewDto

`src/reviews/dto/reviews.dto.ts` · extiende [`PublicReviewDto`](BACKEND_ENDPOINTS.md#dto-publicreviewdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `rating` | `Number` | — | — | — |  |
| `comment` | `String` | — | Sí | — |  |
| `author` | [`ReviewAuthorDto`](BACKEND_ENDPOINTS.md#dto-reviewauthordto) | — | — | — |  |
| `reply` | [`ReviewReplyViewDto`](BACKEND_ENDPOINTS.md#dto-reviewreplyviewdto) | — | Sí | — |  |
| `edited` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `contractId` | `String` | — | — | — |  |
| `professionalId` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: VISIBLE, HIDDEN_BY_ADMIN |  |
| `hiddenReason` | `String` | — | Sí | — |  |
| `editableUntil` | `Date` | — | — | — | Hasta cuándo se puede editar (30 días desde que terminó) |

<a id="dto-pagedto"></a>

#### PageDto

`src/null` · extiende [`RevenueFiltersDto`](BACKEND_ENDPOINTS.md#dto-revenuefiltersdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido), hora de Córdoba |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido), hora de Córdoba |
| `planId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid | Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí |

<a id="dto-pagedto-moderation-dto-moderation-dto-ts"></a>

#### PageDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-pagequerydto-reviews-dto-reviews-dto-ts"></a>

#### PageQueryDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 50; ≥ 1; entero; defecto: 20 |  |

<a id="dto-pagequerydto-support-dto-support-dto-ts"></a>

#### PageQueryDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-paginationmetadto"></a>

#### PaginationMetaDto

`src/identity-verification/dto/identity-verification.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |
| `totalPages` | `Number` | — | — | — |  |

<a id="dto-paymentitemdto"></a>

#### PaymentItemDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `planCode` | `String` | — | — | — |  |
| `purpose` | `string` | — | — | uno de: SUBSCRIPTION, UPGRADE_DIFFERENCE |  |
| `amount` | `String` | — | — | — |  |
| `currency` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: CREATED, PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK |  |
| `applied` | `Boolean` | — | — | — |  |
| `reverted` | `Boolean` | — | — | — |  |
| `grantedFrom` | `Date` | — | Sí | — |  |
| `grantedUntil` | `Date` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-personaldatadto"></a>

#### PersonalDataDto

`src/users/dto/personal-data.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — | Nombre vigente (el que se ve en público) |
| `lastName` | `String` | — | — | — |  |
| `pendingFirstName` | `String` | — | Sí | — | Nombre en revisión (ADR 0021) |
| `pendingLastName` | `String` | — | Sí | — |  |
| `phone` | `String` | — | — | — |  |
| `neighborhoodId` | `String` | — | Sí | — |  |
| `neighborhoodName` | `String` | — | Sí | — |  |

<a id="dto-planlimitsdto"></a>

#### PlanLimitsDto

`src/subscriptions/dto/subscription.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `code` | `String` | — | — | — |  |
| `name` | `String` | — | — | — |  |
| `maxProfessions` | `Number` | — | — | — |  |
| `maxImages` | `Number` | — | — | — |  |
| `maxVideos` | `Number` | — | — | — |  |
| `maxVideoSeconds` | `Number` | — | — | — |  |
| `maxImageBytes` | `Number` | — | — | — |  |
| `maxVideoBytes` | `Number` | — | — | — |  |
| `themeLevel` | `string` | — | — | uno de: NONE, STANDARD, EXTENDED |  |

<a id="dto-planoptiondto"></a>

#### PlanOptionDto

`src/payments/dto/payments.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `code` | `String` | — | — | — |  |
| `name` | `String` | — | — | — |  |
| `price` | `String` | — | — | — |  |
| `currency` | `String` | — | — | — |  |
| `current` | `Boolean` | — | — | — |  |
| `available` | `Boolean` | — | — | — | Si hoy se puede pagar este plan |
| `purpose` | `string` | — | — | uno de: SUBSCRIPTION, UPGRADE_DIFFERENCE |  |
| `amount` | `String` | — | — | — | Lo que se pagaría hoy (mes o diferencia) |
| `reason` | `string` | — | — | uno de: RENEWAL_NOT_YET, UPGRADE_WINDOW_CLOSED, FREE_PLAN |  |

<a id="dto-platformreviewdto"></a>

#### PlatformReviewDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `rating` | `Number` | — | — | — |  |
| `comment` | `String` | — | Sí | — |  |
| `author` | [`ReviewAuthorDto`](BACKEND_ENDPOINTS.md#dto-reviewauthordto) | — | — | — |  |
| `published` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-platformreviewinputdto"></a>

#### PlatformReviewInputDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `rating` | `Number` | Sí | — | ≤ 5; ≥ 1; entero |  |
| `comment` | `Object` | No | Sí | 1–1000 caracteres; texto; condicional |  |

<a id="dto-platformreviewpagedto"></a>

#### PlatformReviewPageDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`PlatformReviewDto`](BACKEND_ENDPOINTS.md#dto-platformreviewdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-professionalmedto"></a>

#### ProfessionalMeDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `slug` | `String` | — | — | — |  |
| `businessName` | `String` | — | Sí | — |  |
| `bio` | `String` | — | Sí | — |  |
| `yearsExperience` | `Number` | — | Sí | — |  |
| `worksWithTeam` | `Boolean` | — | — | — |  |
| `hasMobility` | `Boolean` | — | — | — |  |
| `referenceRate` | `String` | — | Sí | — | Decimal como texto |
| `rateMode` | `string` | — | Sí | uno de: PER_VISIT, PER_HOUR, PER_JOB |  |
| `freeQuote` | `Boolean` | — | — | — |  |
| `theme` | [`ProfileThemeDto`](BACKEND_ENDPOINTS.md#dto-profilethemedto) | — | — | — |  |
| `attention` | [`AttentionDto`](BACKEND_ENDPOINTS.md#dto-attentiondto) | — | — | — |  |
| `professions` | [`ProfessionItemDto`](BACKEND_ENDPOINTS.md#dto-professionitemdto)[] | — | — | — |  |
| `serviceAreas` | [`ServiceAreaItemDto`](BACKEND_ENDPOINTS.md#dto-serviceareaitemdto)[] | — | — | — |  |
| `media` | [`MediaItemDto`](BACKEND_ENDPOINTS.md#dto-mediaitemdto)[] | — | — | — |  |
| `certifications` | [`CertificationItemDto`](BACKEND_ENDPOINTS.md#dto-certificationitemdto)[] | — | — | — |  |
| `socialLinks` | [`SocialLinkDto`](BACKEND_ENDPOINTS.md#dto-sociallinkdto)[] | — | — | — |  |
| `availability` | [`AvailabilityDto`](BACKEND_ENDPOINTS.md#dto-availabilitydto) | — | — | — |  |

<a id="dto-professionalmetricsdto"></a>

#### ProfessionalMetricsDto

`src/metrics/dto/metrics.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `from` | `String` | — | — | — |  |
| `to` | `String` | — | — | — |  |
| `groupBy` | `string` | — | — | uno de: day, week, month |  |
| `buckets` | [`MetricsBucketDto`](BACKEND_ENDPOINTS.md#dto-metricsbucketdto)[] | — | — | — |  |
| `total` | [`MetricsValuesDto`](BACKEND_ENDPOINTS.md#dto-metricsvaluesdto) | — | — | — |  |
| `previous` | [`MetricsPreviousDto`](BACKEND_ENDPOINTS.md#dto-metricspreviousdto) | — | — | — | Mismo tramo, un período antes |
| `overallRating` | [`OverallRatingDto`](BACKEND_ENDPOINTS.md#dto-overallratingdto) | — | — | — | Todas sus reseñas visibles |

<a id="dto-professionitemdto"></a>

#### ProfessionItemDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `name` | `String` | — | — | — |  |
| `isPrimary` | `Boolean` | — | — | — |  |
| `status` | `string` | — | — | uno de: ACTIVE, HIDDEN_BY_PLAN |  |

<a id="dto-profilethemedto"></a>

#### ProfileThemeDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `color` | `string` | No | — | uno de: azul, celeste, turquesa, verde, lima, amarillo, naranja, rojo, rosa, violeta, gris, grafito |  |
| `gradient` | [`ThemeGradientDto`](BACKEND_ENDPOINTS.md#dto-themegradientdto) | No | — | objeto validado |  |
| `font` | `string` | No | — | uno de: moderna, clasica, redondeada, manuscrita |  |
| `headline` | `String` | No | — | 1–80 caracteres; texto |  |
| `animation` | `string` | No | — | uno de: aparecer, deslizar, zoom, rebote | Solo Premium |

<a id="dto-publicareadto"></a>

#### PublicAreaDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `localityId` | `String` | — | — | — |  |
| `localityName` | `String` | — | — | — |  |
| `neighborhoodId` | `String` | — | Sí | — | null = toda la localidad |
| `neighborhoodName` | `String` | — | Sí | — |  |

<a id="dto-publicavailabilitydto"></a>

#### PublicAvailabilityDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `slots` | `Array` | — | — | — | 1 = lunes … 7 = domingo; hora de Córdoba |
| `exceptions` | `Array` | — | — | — | Próximos días sin atención |

<a id="dto-publiccertificationdto"></a>

#### PublicCertificationDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `title` | `String` | — | — | — |  |
| `institution` | `String` | — | Sí | — |  |
| `issuedYear` | `Number` | — | Sí | — |  |
| `kind` | `string` | — | — | uno de: IMAGE, DOCUMENT |  |
| `url` | `String` | — | — | — |  |
| `verified` | `Boolean` | — | — | — | Siempre false: "certificado cargado por el profesional" (ADR 0020) |

<a id="dto-publicmediadto"></a>

#### PublicMediaDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `purpose` | `string` | — | — | uno de: PRESENTATION, WORK, CATALOG_VIDEO, PROFILE_VIDEO, BANNER |  |
| `kind` | `string` | — | — | uno de: IMAGE, VIDEO |  |
| `url` | `String` | — | — | — |  |

<a id="dto-publicprofessiondto"></a>

#### PublicProfessionDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `name` | `String` | — | — | — |  |
| `isPrimary` | `Boolean` | — | — | — |  |

<a id="dto-publicprofiledto"></a>

#### PublicProfileDto

`src/catalog/dto/catalog.dto.ts` · extiende [`CatalogItemDto`](BACKEND_ENDPOINTS.md#dto-catalogitemdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `slug` | `String` | — | — | — |  |
| `professionalUserId` | `String` | — | — | — | Id de usuario del profesional: el que piden chat, favoritos, solicitudes y reportes de perfil |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `businessName` | `String` | — | Sí | — |  |
| `avatarUrl` | `String` | — | Sí | — |  |
| `bio` | `String` | — | Sí | — |  |
| `yearsExperience` | `Number` | — | Sí | — |  |
| `referenceRate` | `String` | — | Sí | — |  |
| `rateMode` | `string` | — | Sí | uno de: PER_VISIT, PER_HOUR, PER_JOB |  |
| `freeQuote` | `Boolean` | — | — | — |  |
| `attentionStatus` | `string` | — | — | uno de: AVAILABLE, WORKING, RESTING | Estado que se muestra ahora |
| `identityVerified` | `Boolean` | — | — | — | Siempre true: el catálogo solo muestra identidades aprobadas |
| `professions` | [`PublicProfessionDto`](BACKEND_ENDPOINTS.md#dto-publicprofessiondto)[] | — | — | — |  |
| `serviceAreas` | [`PublicAreaDto`](BACKEND_ENDPOINTS.md#dto-publicareadto)[] | — | — | — |  |
| `coverImageUrl` | `String` | — | Sí | — | Primera imagen de presentación |
| `catalogVideoUrl` | `String` | — | Sí | — | Video de presentación en catálogo |
| `ratingAverage` | `Number` | — | Sí | — | Promedio de estrellas (un decimal) |
| `ratingCount` | `Number` | — | — | — | Cantidad de reseñas visibles |
| `worksWithTeam` | `Boolean` | — | — | — |  |
| `hasMobility` | `Boolean` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `phone` | `String` | — | — | — |  |
| `theme` | [`ProfileThemeDto`](BACKEND_ENDPOINTS.md#dto-profilethemedto) | — | — | — | Solo lo que admite su plan actual |
| `banner` | [`PublicMediaDto`](BACKEND_ENDPOINTS.md#dto-publicmediadto) | — | Sí | — |  |
| `media` | [`PublicMediaDto`](BACKEND_ENDPOINTS.md#dto-publicmediadto)[] | — | — | — |  |
| `certifications` | [`PublicCertificationDto`](BACKEND_ENDPOINTS.md#dto-publiccertificationdto)[] | — | — | — |  |
| `socialLinks` | [`PublicSocialLinkDto`](BACKEND_ENDPOINTS.md#dto-publicsociallinkdto)[] | — | — | — |  |
| `availability` | [`PublicAvailabilityDto`](BACKEND_ENDPOINTS.md#dto-publicavailabilitydto) | — | — | — |  |

<a id="dto-publicreviewdto"></a>

#### PublicReviewDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `rating` | `Number` | — | — | — |  |
| `comment` | `String` | — | Sí | — |  |
| `author` | [`ReviewAuthorDto`](BACKEND_ENDPOINTS.md#dto-reviewauthordto) | — | — | — |  |
| `reply` | [`ReviewReplyViewDto`](BACKEND_ENDPOINTS.md#dto-reviewreplyviewdto) | — | Sí | — |  |
| `edited` | `Boolean` | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-publicsociallinkdto"></a>

#### PublicSocialLinkDto

`src/catalog/dto/catalog.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `network` | `string` | — | — | uno de: INSTAGRAM, FACEBOOK, TIKTOK, LINKEDIN, YOUTUBE, WEBSITE |  |
| `url` | `String` | — | — | — |  |

<a id="dto-pushkeydto"></a>

#### PushKeyDto

`src/notifications/dto/push.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `enabled` | `Boolean` | — | — | — | false: el push no está configurado (no ofrecerlo) |
| `publicKey` | `String` | — | Sí | — | applicationServerKey (base64url) |

<a id="dto-pushkeysdto"></a>

#### PushKeysDto

`src/notifications/dto/push.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `p256dh` | `String` | Sí | — | formato `/^[A-Za-z0-9_-]{87}$/`; texto | Clave pública P-256 del navegador (65 bytes, base64url) |
| `auth` | `String` | Sí | — | formato `/^[A-Za-z0-9_-]{22}$/`; texto | Secreto de autenticación (16 bytes, base64url) |

<a id="dto-pushsubscribedto"></a>

#### PushSubscribeDto

`src/notifications/dto/push.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `endpoint` | `String` | Sí | — | máx. 1000 caracteres; texto |  |
| `keys` | [`PushKeysDto`](BACKEND_ENDPOINTS.md#dto-pushkeysdto) | Sí | — | objeto validado |  |

<a id="dto-pushunsubscribedto"></a>

#### PushUnsubscribeDto

`src/notifications/dto/push.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `endpoint` | `String` | Sí | — | máx. 1000 caracteres; texto |  |

<a id="dto-quotedto"></a>

#### QuoteDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `amount` | `String` | — | — | — |  |
| `currency` | `String` | — | — | — |  |
| `description` | `String` | — | Sí | — |  |
| `proposedDate` | `Date` | — | Sí | — |  |
| `status` | `string` | — | — | uno de: SENT, SUPERSEDED, WITHDRAWN, ACCEPTED, REJECTED |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-reasondto"></a>

#### ReasonDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `reason` | `String` | No | — | 1–300 caracteres; texto |  |

<a id="dto-registerdto"></a>

#### RegisterDto

`src/auth/dto/register.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `role` | `string` | Sí | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `email` | `String` | Sí | — | máx. 254 caracteres; email |  |
| `password` | `String` | Sí | — | máx. 128 caracteres; mín. 8 caracteres; texto |  |
| `firstName` | `String` | Sí | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `lastName` | `String` | Sí | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `phone` | `String` | Sí | — | formato `/^\+?\d{8,15}$/`; texto |  |
| `neighborhood` | [`NeighborhoodInputDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodinputdto) | No | — | objeto validado; condicional | Obligatorio para clientes |
| `professionId` | `String` | No | — | uuid; condicional | Obligatoria para profesionales |
| `serviceAreas` | [`ServiceAreaInputDto`](BACKEND_ENDPOINTS.md#dto-serviceareainputdto)[] | No | — | objeto validado (cada uno); máx. 100 elementos; mín. 1 elementos; lista; condicional | Profesionales: 1 a 20 zonas |
| `captchaToken` | `String` | No | — | máx. 2048 caracteres; texto | Turnstile: obligatorio cuando el CAPTCHA está activado |

<a id="dto-renameneighborhooddto"></a>

#### RenameNeighborhoodDto

`src/locations/dto/neighborhood-admin.dto.ts` · extiende [`ModerationReasonDto`](BACKEND_ENDPOINTS.md#dto-moderationreasondto-locations-dto-neighborhood-admin-dto-ts)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `name` | `String` | Sí | — | máx. 120 caracteres; texto | Nombre tal como se va a mostrar (se respetan las mayúsculas) |
| `reason` | `String` | No | — | 1–300 caracteres; texto |  |

<a id="dto-reordermediadto"></a>

#### ReorderMediaDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `ids` | `String[]` | Sí | — | uuid (cada uno); sin repetidos; máx. 50 elementos; lista | Todos los ids de medios, en el orden nuevo |

<a id="dto-replaceavailabilitydto"></a>

#### ReplaceAvailabilityDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `slots` | [`AvailabilitySlotInputDto`](BACKEND_ENDPOINTS.md#dto-availabilityslotinputdto)[] | Sí | — | objeto validado (cada uno); máx. 28 elementos; lista | Hora de Córdoba |

<a id="dto-replaceprofessionsdto"></a>

#### ReplaceProfessionsDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `professionIds` | `String[]` | Sí | — | uuid (cada uno); sin repetidos; máx. 10 elementos; mín. 1 elementos; lista | Entre 1 y lo que permita el plan |
| `primaryId` | `String` | Sí | — | uuid | Profesión principal (una de las anteriores) |

<a id="dto-replaceserviceareasdto"></a>

#### ReplaceServiceAreasDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `serviceAreas` | [`ServiceAreaInputDto`](BACKEND_ENDPOINTS.md#dto-serviceareainputdto)[] | Sí | — | objeto validado (cada uno); máx. 100 elementos; mín. 1 elementos; lista |  |

<a id="dto-replacesociallinksdto"></a>

#### ReplaceSocialLinksDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `links` | [`SocialLinkInputDto`](BACKEND_ENDPOINTS.md#dto-sociallinkinputdto)[] | Sí | — | objeto validado (cada uno); máx. 6 elementos; lista | Una por red; lista vacía = ninguna |

<a id="dto-reportconversationdto"></a>

#### ReportConversationDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `conversationId` | `String` | — | — | — |  |
| `messages` | [`ConversationMessageDto`](BACKEND_ENDPOINTS.md#dto-conversationmessagedto)[] | — | — | — |  |

<a id="dto-requestdto"></a>

#### RequestDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `customerId` | `String` | — | — | — |  |
| `professionId` | `String` | — | — | — |  |
| `description` | `String` | — | — | — |  |
| `urgency` | `string` | — | — | uno de: CAN_WAIT, IMPATIENT, URGENT |  |
| `status` | `string` | — | — | uno de: OPEN, SELECTED, CANCELLED |  |
| `targets` | [`TargetDto`](BACKEND_ENDPOINTS.md#dto-targetdto)[] | — | — | — | El profesional solo ve el suyo |
| `contractId` | `String` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-resetpassworddto"></a>

#### ResetPasswordDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `token` | `String` | Sí | — | 20–100 caracteres; texto |  |
| `newPassword` | `String` | Sí | — | máx. 128 caracteres; mín. 8 caracteres; texto |  |

<a id="dto-resolvereportdto"></a>

#### ResolveReportDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `valid` | `Boolean` | Sí | — | booleano | true = válido; false = rechazado (sin consecuencias) |
| `note` | `String` | Sí | — | 5–500 caracteres; texto |  |

<a id="dto-revenueamountsdto"></a>

#### RevenueAmountsDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `gross` | `String` | — | — | — | Cobrado (por fecha de aprobación) |
| `refunds` | `String` | — | — | — | Reembolsos (por fecha de devolución) |
| `chargebacks` | `String` | — | — | — |  |
| `net` | `String` | — | — | — |  |
| `payments` | `Number` | — | — | — | Cantidad de cobros |
| `returns` | `Number` | — | — | — | Cantidad de reembolsos y contracargos |

<a id="dto-revenuebucketdto"></a>

#### RevenueBucketDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`RevenueTotalsDto`](BACKEND_ENDPOINTS.md#dto-revenuetotalsdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `gross` | `String` | — | — | — | Cobrado (por fecha de aprobación) |
| `refunds` | `String` | — | — | — | Reembolsos (por fecha de devolución) |
| `chargebacks` | `String` | — | — | — |  |
| `net` | `String` | — | — | — |  |
| `payments` | `Number` | — | — | — | Cantidad de cobros |
| `returns` | `Number` | — | — | — | Cantidad de reembolsos y contracargos |
| `byPlan` | [`RevenuePlanAmountsDto`](BACKEND_ENDPOINTS.md#dto-revenueplanamountsdto)[] | — | — | — |  |
| `start` | `String` | — | — | — | Comienzo del período |

<a id="dto-revenuechangedto"></a>

#### RevenueChangeDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `net` | `String` | — | — | — | Neto actual menos el anterior |
| `netPercent` | `Number` | — | Sí | — | Null si el anterior fue 0 |

<a id="dto-revenueexportdto"></a>

#### RevenueExportDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`RevenueFiltersDto`](BACKEND_ENDPOINTS.md#dto-revenuefiltersdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `report` | `string` | Sí | — | uno de: PAYMENTS, REGISTRATIONS, SUMMARY |  |
| `status` | `string` | No | — | uno de: CREATED, PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK |  |
| `kind` | `string` | No | — | uno de: NEW, RENEWAL, REACTIVATION, UPGRADE |  |
| `role` | `string` | No | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `hasPaid` | `Boolean` | No | — | booleano |  |
| `groupBy` | `string` | No | — | uno de: day, week, month, year; defecto: "month" |  |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido), hora de Córdoba |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido), hora de Córdoba |
| `planId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid | Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí |

<a id="dto-revenuefiltersdto"></a>

#### RevenueFiltersDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido), hora de Córdoba |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido), hora de Córdoba |
| `planId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid | Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí |

<a id="dto-revenuepaymentitemdto"></a>

#### RevenuePaymentItemDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `date` | `Date` | — | — | — | Aprobación; si nunca se aprobó, creación |
| `user` | [`RevenuePersonDto`](BACKEND_ENDPOINTS.md#dto-revenuepersondto) | — | — | — |  |
| `planCode` | `String` | — | — | — |  |
| `planName` | `String` | — | — | — |  |
| `previousPlanCode` | `String` | — | Sí | — | Si el pago cambió el plan |
| `kind` | `string` | — | Sí | uno de: NEW, RENEWAL, REACTIVATION, UPGRADE | Null: sin aplicar |
| `status` | `string` | — | — | uno de: CREATED, PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK |  |
| `amount` | `String` | — | — | — |  |
| `currency` | `String` | — | — | — |  |
| `moneyReturnedAt` | `Date` | — | Sí | — |  |

<a id="dto-revenuepaymentlistdto"></a>

#### RevenuePaymentListDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`RevenuePaymentItemDto`](BACKEND_ENDPOINTS.md#dto-revenuepaymentitemdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-revenuepaymentsquerydto"></a>

#### RevenuePaymentsQueryDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`PageDto`](BACKEND_ENDPOINTS.md#dto-pagedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | No | — | uno de: CREATED, PENDING, APPROVED, REJECTED, CANCELLED, REFUNDED, CHARGED_BACK | Sin estado: aprobados, reembolsados y contracargos (los que movieron plata) |
| `kind` | `string` | No | — | uno de: NEW, RENEWAL, REACTIVATION, UPGRADE |  |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido), hora de Córdoba |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido), hora de Córdoba |
| `planId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid | Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-revenuepersondto"></a>

#### RevenuePersonDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `name` | `String` | — | — | — | "Usuario eliminado" si la cuenta se anonimizó |
| `email` | `String` | — | Sí | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `deleted` | `Boolean` | — | — | — |  |
| `localities` | `String[]` | — | — | — | Donde trabaja (profesional) o vive (cliente), hoy |

<a id="dto-revenueplanamountsdto"></a>

#### RevenuePlanAmountsDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`RevenueAmountsDto`](BACKEND_ENDPOINTS.md#dto-revenueamountsdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `gross` | `String` | — | — | — | Cobrado (por fecha de aprobación) |
| `refunds` | `String` | — | — | — | Reembolsos (por fecha de devolución) |
| `chargebacks` | `String` | — | — | — |  |
| `net` | `String` | — | — | — |  |
| `payments` | `Number` | — | — | — | Cantidad de cobros |
| `returns` | `Number` | — | — | — | Cantidad de reembolsos y contracargos |
| `planCode` | `String` | — | — | — |  |

<a id="dto-revenuepreviousdto"></a>

#### RevenuePreviousDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`RevenueTotalsDto`](BACKEND_ENDPOINTS.md#dto-revenuetotalsdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `gross` | `String` | — | — | — | Cobrado (por fecha de aprobación) |
| `refunds` | `String` | — | — | — | Reembolsos (por fecha de devolución) |
| `chargebacks` | `String` | — | — | — |  |
| `net` | `String` | — | — | — |  |
| `payments` | `Number` | — | — | — | Cantidad de cobros |
| `returns` | `Number` | — | — | — | Cantidad de reembolsos y contracargos |
| `byPlan` | [`RevenuePlanAmountsDto`](BACKEND_ENDPOINTS.md#dto-revenueplanamountsdto)[] | — | — | — |  |
| `from` | `String` | — | — | — |  |
| `to` | `String` | — | — | — |  |

<a id="dto-revenueregistrationitemdto"></a>

#### RevenueRegistrationItemDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `user` | [`RevenuePersonDto`](BACKEND_ENDPOINTS.md#dto-revenuepersondto) | — | — | — |  |
| `registeredAt` | `Date` | — | — | — |  |
| `currentPlanCode` | `String` | — | Sí | — | Plan de la última suscripción |
| `hasPaid` | `Boolean` | — | Sí | — | Tiene algún cobro que no se devolvió. Null: cliente que nunca pagó |

<a id="dto-revenueregistrationlistdto"></a>

#### RevenueRegistrationListDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`RevenueRegistrationItemDto`](BACKEND_ENDPOINTS.md#dto-revenueregistrationitemdto)[] | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |
| `total` | `Number` | — | — | — |  |

<a id="dto-revenueregistrationsquerydto"></a>

#### RevenueRegistrationsQueryDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`PageDto`](BACKEND_ENDPOINTS.md#dto-pagedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `role` | `string` | No | — | uno de: CUSTOMER, PROFESSIONAL |  |
| `hasPaid` | `Boolean` | No | — | booleano | Tiene algún cobro que no se devolvió |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido), hora de Córdoba |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido), hora de Córdoba |
| `planId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid | Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí |
| `page` | `Number` | No | — | ≥ 1; entero; defecto: 1 |  |
| `limit` | `Number` | No | — | ≤ 100; ≥ 1; entero; defecto: 20 |  |

<a id="dto-revenuesummarydto"></a>

#### RevenueSummaryDto

`src/admin/revenue/dto/revenue.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `from` | `String` | — | — | — |  |
| `to` | `String` | — | — | — |  |
| `groupBy` | `string` | — | — | uno de: day, week, month, year |  |
| `currency` | `String` | — | — | — |  |
| `buckets` | [`RevenueBucketDto`](BACKEND_ENDPOINTS.md#dto-revenuebucketdto)[] | — | — | — |  |
| `total` | [`RevenueTotalsDto`](BACKEND_ENDPOINTS.md#dto-revenuetotalsdto) | — | — | — |  |
| `previous` | [`RevenuePreviousDto`](BACKEND_ENDPOINTS.md#dto-revenuepreviousdto) | — | — | — |  |
| `change` | [`RevenueChangeDto`](BACKEND_ENDPOINTS.md#dto-revenuechangedto) | — | — | — |  |
| `localityMayOverlap` | `Boolean` | — | — | — | Con filtro de localidad, un profesional que trabaja en varias suma en cada una |

<a id="dto-revenuesummaryquerydto"></a>

#### RevenueSummaryQueryDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`RevenueFiltersDto`](BACKEND_ENDPOINTS.md#dto-revenuefiltersdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `groupBy` | `string` | No | — | uno de: day, week, month, year; defecto: "month" |  |
| `from` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Desde (incluido), hora de Córdoba |
| `to` | `String` | No | — | fecha ISO 8601; formato `/^\d{4}-\d{2}-\d{2}$/` | Hasta (incluido), hora de Córdoba |
| `planId` | `String` | No | — | uuid |  |
| `localityId` | `String` | No | — | uuid | Profesionales que trabajan en esa localidad (pueden estar en varias) o clientes que viven ahí |

<a id="dto-revenuetotalsdto"></a>

#### RevenueTotalsDto

`src/admin/revenue/dto/revenue.dto.ts` · extiende [`RevenueAmountsDto`](BACKEND_ENDPOINTS.md#dto-revenueamountsdto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `gross` | `String` | — | — | — | Cobrado (por fecha de aprobación) |
| `refunds` | `String` | — | — | — | Reembolsos (por fecha de devolución) |
| `chargebacks` | `String` | — | — | — |  |
| `net` | `String` | — | — | — |  |
| `payments` | `Number` | — | — | — | Cantidad de cobros |
| `returns` | `Number` | — | — | — | Cantidad de reembolsos y contracargos |
| `byPlan` | [`RevenuePlanAmountsDto`](BACKEND_ENDPOINTS.md#dto-revenueplanamountsdto)[] | — | — | — |  |

<a id="dto-reviewauthordto"></a>

#### ReviewAuthorDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `displayName` | `String` | — | — | — | Nombre e inicial del apellido, o "Usuario eliminado" |

<a id="dto-reviewpagedto"></a>

#### ReviewPageDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `data` | [`PublicReviewDto`](BACKEND_ENDPOINTS.md#dto-publicreviewdto)[] | — | — | — |  |
| `average` | `Number` | — | Sí | — | Promedio de 1 a 5, un decimal |
| `count` | `Number` | — | — | — |  |
| `page` | `Number` | — | — | — |  |
| `limit` | `Number` | — | — | — |  |

<a id="dto-reviewreplydto"></a>

#### ReviewReplyDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | Sí | — | 1–1000 caracteres; texto |  |

<a id="dto-reviewreplyviewdto"></a>

#### ReviewReplyViewDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | — | — | — |  |
| `repliedAt` | `Date` | — | — | — |  |

<a id="dto-sanctiondto"></a>

#### SanctionDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `type` | `string` | — | — | uno de: WARNING, SUSPENSION, BAN, PROFILE_HIDDEN |  |
| `reason` | `String` | — | — | — |  |
| `startsAt` | `Date` | — | — | — |  |
| `endsAt` | `Date` | — | Sí | — |  |
| `active` | `Boolean` | — | — | — |  |
| `liftedAt` | `Date` | — | Sí | — |  |

<a id="dto-savefavoritedto"></a>

#### SaveFavoriteDto

`src/favorites/dto/favorites.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `availabilityAlerts` | `Boolean` | No | — | booleano | Aviso cuando se pone "Disponible" (planes Medium y Premium) |

<a id="dto-scheduledto"></a>

#### ScheduleDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `scheduledAt` | `String` | Sí | — | fecha ISO | Fecha y hora acordadas |

<a id="dto-selecttargetdto"></a>

#### SelectTargetDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `quoteId` | `String` | No | — | uuid | Presupuesto vigente que acepta (opcional) |

<a id="dto-sendmessagedto"></a>

#### SendMessageDto

`src/chat/dto/chat.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | No | — | máx. 2000 caracteres; texto |  |
| `attachmentIds` | `String[]` | No | — | uuid (cada uno); sin repetidos; máx. 5 elementos; lista | Archivos CHAT_ATTACHMENT propios y confirmados (hasta 5) |

<a id="dto-sendquotedto"></a>

#### SendQuoteDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `amount` | `Number` | Sí | — | ≤ 9999999999; ≥ 0; número (máx. 2 decimales) | Importe en ARS |
| `description` | `String` | No | — | 1–1000 caracteres; texto |  |
| `proposedDate` | `String` | No | — | fecha ISO | Fecha propuesta para el trabajo |

<a id="dto-serviceareainputdto"></a>

#### ServiceAreaInputDto

`src/auth/dto/register.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `localityId` | `String` | Sí | — | uuid |  |
| `neighborhoodName` | `String` | No | — | 2–60 caracteres; texto | Si se omite, cubre toda la localidad |

<a id="dto-serviceareaitemdto"></a>

#### ServiceAreaItemDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `localityId` | `String` | — | — | — |  |
| `localityName` | `String` | — | — | — |  |
| `neighborhoodId` | `String` | — | Sí | — | null = toda la localidad |
| `neighborhoodName` | `String` | — | Sí | — |  |

<a id="dto-sessioncloseddto"></a>

#### SessionClosedDto

`src/auth/dto/auth-responses.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `closed` | `Boolean` | — | — | — | false si esa sesión ya estaba cerrada |

<a id="dto-sessionresponsedto"></a>

#### SessionResponseDto

`src/auth/dto/auth-responses.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `user` | [`CurrentUserDto`](BACKEND_ENDPOINTS.md#dto-currentuserdto) | — | — | — |  |
| `csrfToken` | `String` | — | — | — |  |

<a id="dto-sessionsummarydto"></a>

#### SessionSummaryDto

`src/auth/dto/auth-responses.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — | Id del dispositivo (familia de sesión) |
| `current` | `Boolean` | — | — | — |  |
| `userAgent` | `String` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `lastUsedAt` | `Date` | — | Sí | — |  |

<a id="dto-setavatardto"></a>

#### SetAvatarDto

`src/uploads/dto/uploads.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `fileId` | `String` | Sí | — | uuid | Archivo AVATAR propio, ya confirmado (READY) |

<a id="dto-setpassworddto"></a>

#### SetPasswordDto

`src/auth/google/google-auth.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `newPassword` | `String` | Sí | — | 8–128 caracteres; texto |  |

<a id="dto-sociallinkdto"></a>

#### SocialLinkDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `network` | `string` | — | — | uno de: INSTAGRAM, FACEBOOK, TIKTOK, LINKEDIN, YOUTUBE, WEBSITE |  |
| `url` | `String` | — | — | — |  |

<a id="dto-sociallinkinputdto"></a>

#### SocialLinkInputDto

`src/null`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `network` | `string` | Sí | — | uno de: INSTAGRAM, FACEBOOK, TIKTOK, LINKEDIN, YOUTUBE, WEBSITE |  |
| `url` | `String` | Sí | — | máx. 300 caracteres; texto | https y del dominio de esa red |

<a id="dto-startverificationresponsedto"></a>

#### StartVerificationResponseDto

`src/identity-verification/dto/identity-verification.dto.ts` · extiende [`VerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-verificationresponsedto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | Sí | — |  |
| `kind` | `string` | — | Sí | uno de: IDENTITY, PROFILE_CHANGE | IDENTITY o PROFILE_CHANGE (revisión de foto o nombre nuevos, ADR 0019 y 0021) |
| `status` | `string` | — | — | uno de: NOT_STARTED, PENDING, REQUIRES_REVIEW, APPROVED, REJECTED, REVOKED |  |
| `provider` | `String` | — | Sí | — |  |
| `attemptNumber` | `Number` | — | — | — |  |
| `submittedAt` | `String` | — | Sí | — |  |
| `decidedAt` | `String` | — | Sí | — |  |
| `reasonCode` | `String` | — | Sí | — |  |
| `alreadyInProgress` | `Boolean` | — | — | — | true si ya había un intento abierto y se devolvió ese |
| `redirectUrl` | `String` | — | Sí | — |  |
| `clientToken` | `String` | — | Sí | — |  |
| `manualReview` | `Boolean` | — | — | — | true en modo manual: el admin se va a contactar con el usuario |

<a id="dto-strikedto"></a>

#### StrikeDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `weight` | `Number` | — | — | — |  |
| `reason` | `String` | — | — | — |  |
| `voided` | `Boolean` | — | — | — |  |
| `voidReason` | `String` | — | Sí | — |  |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-subscriptionsummarydto"></a>

#### SubscriptionSummaryDto

`src/subscriptions/dto/subscription.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `status` | `string` | — | Sí | uno de: TRIAL, ACTIVE, EXPIRED |  |
| `live` | `Boolean` | — | — | — | true si la prueba o el plan están vigentes |
| `plan` | [`PlanLimitsDto`](BACKEND_ENDPOINTS.md#dto-planlimitsdto) | — | Sí | — |  |
| `trialEndsAt` | `Date` | — | Sí | — |  |
| `trialDaysLeft` | `Number` | — | Sí | — | Contador de la prueba (ADR 0017): 30 al registrarse, 1 el último día |
| `currentPeriodEnd` | `Date` | — | Sí | — | Hasta cuándo está pago (incluye los meses pagados por adelantado) |
| `periodDaysLeft` | `Number` | — | Sí | — | Días que quedan del período pago |

<a id="dto-suspendaccountdto"></a>

#### SuspendAccountDto

`src/users/dto/account-admin.dto.ts` · extiende [`AccountActionDto`](BACKEND_ENDPOINTS.md#dto-accountactiondto)

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `endsAt` | `String` | No | — | fecha ISO | Fecha de fin: la suspensión se levanta sola |
| `reportId` | `String` | No | — | uuid | Reporte que la originó |
| `reason` | `String` | Sí | — | 10–500 caracteres; texto |  |

<a id="dto-targetdto"></a>

#### TargetDto

`src/requests/dto/requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `requestId` | `String` | — | — | — |  |
| `professionalId` | `String` | — | — | — |  |
| `conversationId` | `String` | — | — | — |  |
| `status` | `string` | — | — | uno de: PENDING, IN_DISCUSSION, QUOTED, SELECTED, NOT_SELECTED, DECLINED, CANCELLED |  |
| `currentQuote` | [`QuoteDto`](BACKEND_ENDPOINTS.md#dto-quotedto) | — | Sí | — | Presupuesto vigente |

<a id="dto-themegradientdto"></a>

#### ThemeGradientDto

`src/null`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `from` | `string` | Sí | — | uno de: azul, celeste, turquesa, verde, lima, amarillo, naranja, rojo, rosa, violeta, gris, grafito |  |
| `to` | `string` | Sí | — | uno de: azul, celeste, turquesa, verde, lima, amarillo, naranja, rojo, rosa, violeta, gris, grafito |  |

<a id="dto-ticketdto"></a>

#### TicketDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `category` | `string` | — | — | uno de: SUGGESTION, BUG, INCIDENT, COMPLAINT, OTHER |  |
| `status` | `string` | — | — | uno de: OPEN, ANSWERED, CLOSED |  |
| `messages` | [`TicketMessageDto`](BACKEND_ENDPOINTS.md#dto-ticketmessagedto)[] | — | — | — |  |
| `createdAt` | `Date` | — | — | — |  |
| `updatedAt` | `Date` | — | — | — |  |

<a id="dto-ticketmessagedto"></a>

#### TicketMessageDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `fromStaff` | `Boolean` | — | — | — |  |
| `body` | `String` | — | — | — |  |
| `fileId` | `String` | — | Sí | — | Ver con GET /evidence/:fileId |
| `createdAt` | `Date` | — | — | — |  |

<a id="dto-ticketmessageinputdto"></a>

#### TicketMessageInputDto

`src/support/dto/support.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | Sí | — | 1–2000 caracteres; texto |  |
| `fileId` | `String` | No | — | uuid |  |

<a id="dto-tokendto"></a>

#### TokenDto

`src/auth/dto/auth-requests.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `token` | `String` | Sí | — | 20–100 caracteres; texto |  |

<a id="dto-updatecustomerprofiledto"></a>

#### UpdateCustomerProfileDto

`src/users/customers.controller.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `extraInfo` | `Object` | No | Sí | máx. 300 caracteres; texto; condicional | Datos útiles para el profesional |

<a id="dto-updateforumpostdto"></a>

#### UpdateForumPostDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | No | — | 5–2000 caracteres; texto |  |
| `professionIds` | `String[]` | No | — | uuid (cada uno); sin repetidos; máx. 4 elementos; lista |  |
| `localityId` | `Object` | No | Sí | uuid; condicional |  |
| `neighborhoodId` | `Object` | No | Sí | uuid; condicional |  |
| `budgetEstimate` | `Object` | No | Sí | ≤ 9999999999; ≥ 1; número (máx. 2 decimales); condicional |  |
| `deadline` | `Object` | No | Sí | fecha ISO; condicional |  |

<a id="dto-updateforumreplydto"></a>

#### UpdateForumReplyDto

`src/forum/dto/forum.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `body` | `String` | No | — | 1–1000 caracteres; texto |  |
| `proposedPrice` | `Object` | No | Sí | ≤ 9999999999; ≥ 1; número (máx. 2 decimales); condicional |  |

<a id="dto-updatepersonaldatadto"></a>

#### UpdatePersonalDataDto

`src/users/dto/personal-data.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `firstName` | `String` | No | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto | Con la identidad aprobada queda en revisión del admin (ADR 0021) |
| `lastName` | `String` | No | — | formato `/^\p{L}[\p{L} '.-]*$/u`; 1–60 caracteres; texto |  |
| `phone` | `String` | No | — | formato `/^\+?\d{8,15}$/`; texto |  |
| `neighborhood` | [`NeighborhoodInputDto`](BACKEND_ENDPOINTS.md#dto-neighborhoodinputdto) | No | — | objeto validado | Solo clientes: barrio donde vive |

<a id="dto-updatepreferencesdto"></a>

#### UpdatePreferencesDto

`src/notifications/dto/push.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `preferences` | [`NotificationPreferenceDto`](BACKEND_ENDPOINTS.md#dto-notificationpreferencedto)[] | Sí | — | objeto validado (cada uno); máx. 7 elementos; mín. 1 elementos; lista |  |

<a id="dto-updateprofessionalprofiledto"></a>

#### UpdateProfessionalProfileDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `businessName` | `Object` | No | Sí | 2–80 caracteres; texto; condicional |  |
| `bio` | `Object` | No | Sí | 1–200 caracteres; texto; condicional | Descripción (FI §7.1) |
| `yearsExperience` | `Object` | No | Sí | ≤ 70; ≥ 0; entero; condicional |  |
| `worksWithTeam` | `Boolean` | No | — | booleano |  |
| `hasMobility` | `Boolean` | No | — | booleano |  |
| `freeQuote` | `Boolean` | No | — | booleano |  |
| `autoStatusFromSchedule` | `Boolean` | No | — | booleano |  |
| `referenceRate` | `Object` | No | Sí | ≤ 99999999; ≥ 0; número (máx. 2 decimales); condicional | Tarifa de referencia en ARS. Va junto con rateMode (los dos o ninguno). |
| `rateMode` | `string` | No | Sí | uno de: PER_VISIT, PER_HOUR, PER_JOB; condicional |  |

<a id="dto-updatereviewdto"></a>

#### UpdateReviewDto

`src/reviews/dto/reviews.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `rating` | `Number` | No | — | ≤ 5; ≥ 1; entero |  |
| `comment` | `Object` | No | Sí | 1–1000 caracteres; texto; condicional | null lo borra |

<a id="dto-uploadticketdto"></a>

#### UploadTicketDto

`src/uploads/dto/uploads.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `method` | `string` | — | — | uno de: POST, PUT |  |
| `url` | `String` | — | — | — | Destino de la subida (Cloudinary o, en desarrollo, la propia API) |
| `fields` | `object` | — | — | — | Campos multipart que acompañan al archivo (campo `file`). No modificarlos. |
| `maxBytes` | `Number` | — | — | — |  |
| `expiresAt` | `Date` | — | — | — |  |

<a id="dto-userrefdto"></a>

#### UserRefDto

`src/moderation/dto/moderation.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `role` | `String` | — | — | — |  |
| `status` | `String` | — | — | — |  |

<a id="dto-verificationresponsedto"></a>

#### VerificationResponseDto

`src/identity-verification/dto/identity-verification.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | Sí | — |  |
| `kind` | `string` | — | Sí | uno de: IDENTITY, PROFILE_CHANGE | IDENTITY o PROFILE_CHANGE (revisión de foto o nombre nuevos, ADR 0019 y 0021) |
| `status` | `string` | — | — | uno de: NOT_STARTED, PENDING, REQUIRES_REVIEW, APPROVED, REJECTED, REVOKED |  |
| `provider` | `String` | — | Sí | — |  |
| `attemptNumber` | `Number` | — | — | — |  |
| `submittedAt` | `String` | — | Sí | — |  |
| `decidedAt` | `String` | — | Sí | — |  |
| `reasonCode` | `String` | — | Sí | — |  |

<a id="dto-verificationsubjectdto"></a>

#### VerificationSubjectDto

`src/identity-verification/dto/identity-verification.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `id` | `String` | — | — | — |  |
| `role` | `string` | — | — | uno de: CUSTOMER, PROFESSIONAL, ADMIN |  |
| `firstName` | `String` | — | — | — |  |
| `lastName` | `String` | — | — | — |  |
| `email` | `String` | — | — | — |  |
| `phone` | `String` | — | — | — |  |
| `avatarUrl` | `String` | — | Sí | — |  |
| `pendingFirstName` | `String` | — | Sí | — | Nombre nuevo en revisión (ADR 0021) |
| `pendingLastName` | `String` | — | Sí | — |  |
| `pendingAvatarUrl` | `String` | — | Sí | — | Foto nueva en revisión (ADR 0019) |

<a id="dto-visiblemediadto"></a>

#### VisibleMediaDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `ids` | `String[]` | Sí | — | uuid (cada uno); sin repetidos; máx. 50 elementos; lista | Ids de las imágenes y videos a mostrar |

<a id="dto-visibleprofessionsdto"></a>

#### VisibleProfessionsDto

`src/professionals/dto/professional-profile.dto.ts`

| Campo | Tipo | Obligatorio | Null | Validación y valores | Descripción |
| --- | --- | --- | --- | --- | --- |
| `professionIds` | `String[]` | Sí | — | uuid (cada uno); sin repetidos; máx. 20 elementos; mín. 1 elementos; lista | Ids de las profesiones a mostrar (con la principal) |

## Anexo B · Catálogo de códigos de error

Códigos con los que responde la API (campo `code`). Los de validación, sesión y permisos los agregan los guards globales a cualquier ruta. Los marcados como "redirección de Google" llegan como `?codigo=` en `/ingresar/google`, no como respuesta JSON.

| Código | HTTP | Mensaje | Dónde |
| --- | --- | --- | --- |
| `VALIDATION_FAILED` | 400 | Los datos enviados no son válidos. | `src/common/pipes/create-validation-pipe.ts` (global) |
| `UNAUTHORIZED` | 401 | Iniciá sesión. | `src/common/guards/jwt-auth.guard.ts` (global) |
| `ACCESS_TOKEN_EXPIRED` | 401 | La sesión expiró. Renovala. | `src/common/guards/jwt-auth.guard.ts` (global) |
| `FORBIDDEN` | 403 | No tenés permiso. | `src/common/guards/roles.guard.ts` (global) |
| `ACCOUNT_STATE_NOT_ALLOWED` | 403 | Tu cuenta no puede realizar esta acción en su estado actual. | `src/common/guards/account-state.guard.ts` (global) |
| `ORIGIN_NOT_ALLOWED` | 403 | Origen no permitido. | `src/common/guards/origin.guard.ts` (global) |
| `MISSING_REQUESTED_WITH` | 403 | Falta el header X-Requested-With. | `src/common/guards/origin.guard.ts` (global) |
| `CSRF_INVALID` | 403 | Token CSRF inválido. | `src/auth/services/csrf.service.ts` (global) |
| `TOO_MANY_REQUESTS` | 429 | (límite de pedidos de @nestjs/throttler) | `src/app.module.ts` (global) |
| `CONFLICT` | 409 | Ya existe un registro con esos datos. / La operación entra en conflicto con datos relacionados. | `src/common/filters/all-exceptions.filter.ts` (global) |
| `INTERNAL_ERROR` | 500 | Ocurrió un error inesperado. Intentá de nuevo más tarde. | `src/common/filters/all-exceptions.filter.ts` (global) |
| `ACCOUNT_UNAVAILABLE` | redirección de Google |  | `src/auth/google/google-auth.service.ts:309`<br>`src/auth/google/google-auth.service.ts:322` |
| `ADMIN_CANNOT_SELF_DELETE` | 403 | La cuenta del admin no se puede dar de baja desde la API. | `src/users/accounts.service.ts:269` |
| `ALREADY_VERIFIED` | 409 | La identidad ya está verificada. | `src/identity-verification/identity-verification.service.ts:86` |
| `APPEAL_ALREADY_OPEN` | 409 | Ya hay una apelación en revisión. | `src/moderation/sanctions.service.ts:346` |
| `APPEAL_TARGET_NOT_FOUND` | 404 | No hay un strike o una sanción vigente para apelar. | `src/moderation/sanctions.service.ts:336` |
| `CANCELLED` | redirección de Google |  | `src/auth/google/google-auth.service.ts:279` |
| `CANNOT_MODIFY_ADMIN` | 409 | Esta acción no se puede aplicar a una cuenta de administrador. | `src/moderation/sanctions.service.ts:559`<br>`src/users/accounts.service.ts:441`<br>`src/users/personal-data.service.ts:74` |
| `CAPTCHA_REQUIRED` | 400 | Completá la verificación para seguir. | `src/integrations/abuse/captcha.service.ts:10` |
| `CERTIFICATION_LIMIT_REACHED` | 409 | Podés cargar hasta ${MAX_CERTIFICATIONS} certificados. | `src/professionals/profile.service.ts:459` |
| `CONTRACT_NOT_COMPLETED` | 409 | Podés reseñar cuando el profesional marque el trabajo como terminado. | `src/reviews/reviews.service.ts:71` |
| `CONTRACT_NOT_FOUND` | 404 | La contratación no existe. | `src/requests/requests.service.ts:432`<br>`src/requests/requests.service.ts:551`<br>`src/reviews/reviews.service.ts:65` |
| `CONVERSATION_NOT_FOUND` | 404 | La conversación no existe. | `src/chat/chat.service.ts:46` |
| `DELETION_ALREADY_SCHEDULED` | 409 | La cuenta ya tiene una baja en curso. | `src/users/accounts.service.ts:408` |
| `EDIT_WINDOW_EXPIRED` | 409 | Los mensajes se pueden editar durante 15 minutos. | `src/chat/chat.service.ts:227` |
| `EMAIL_NOT_VERIFIED` | redirección de Google |  | `src/auth/google/google-auth.service.ts:300` |
| `EMPTY_MESSAGE` | 400 | Escribí un mensaje o adjuntá un archivo. | `src/chat/chat.service.ts:148`<br>`src/chat/chat.service.ts:223` |
| `END_DATE_NOT_ALLOWED` | 400 | Solo la suspensión y el perfil oculto tienen fecha de fin. | `src/moderation/sanctions.service.ts:154` |
| `EXPORT_TOO_LARGE` | 422 | Son más de ${MAX_EXPORT_ROWS} filas: acotá las fechas. | `src/admin/revenue/revenue.service.ts:365` |
| `FIELD_NOT_ALLOWED` | 400 | Ese dato es solo de clientes. | `src/users/personal-data.service.ts:159` |
| `FILE_IN_USE` | 409 | Ese archivo ya está cargado. | `src/professionals/profile.service.ts:839`<br>`src/support/support.service.ts:212` |
| `FILE_KIND_NOT_IN_PLAN` | 403 | Tu plan no incluye este tipo de archivo. | `src/uploads/uploads.service.ts:93` |
| `FILE_NOT_FOUND` | 404 | El archivo no existe. | `src/uploads/uploads.service.ts:40` |
| `FILE_NOT_PENDING` | 409 | Ese archivo ya no admite subidas. Empezá una nueva. | `src/uploads/uploads.service.ts:449` |
| `FILE_NOT_READY` | 409 | Confirmá la subida antes de usar el archivo. | `src/uploads/uploads.service.ts:202` |
| `FILE_PURPOSE_NOT_ALLOWED` | 403 | Tu cuenta no puede subir este tipo de archivo. | `src/uploads/uploads.service.ts:80` |
| `FILE_REQUIRED` | 400 | Falta el archivo. | `src/uploads/uploads.controller.ts:91` |
| `FILE_TOO_LARGE` | ? | El archivo puede pesar hasta ${mb} MB. | `src/uploads/uploads.service.ts:441` |
| `FORUM_MEDIA_LIMIT` | 400 | Podés adjuntar hasta ${MAX_POST_IMAGES} imágenes y ${MAX_POST_VIDEOS} video. | `src/forum/forum.service.ts:166` |
| `FORUM_POST_NOT_FOUND` | 404 | La publicación no existe. | `src/forum/forum.service.ts:53` |
| `FORUM_POST_RESOLVED` | 409 | La publicación ya está resuelta. | `src/forum/forum.service.ts:249`<br>`src/forum/forum.service.ts:271` |
| `FORUM_REPLY_NOT_FOUND` | 404 | La respuesta no existe. | `src/forum/forum.service.ts:55` |
| `GOOGLE_ACCOUNT_EXISTS` | 409 | Ese email o esa cuenta de Google ya están registrados. Iniciá sesión. | `src/auth/google/google-auth.service.ts:221` |
| `GOOGLE_ALREADY_LINKED` | 409 | Esa cuenta de Google o esta cuenta ya tienen una vinculación. | `src/auth/google/google-auth.service.ts:406` |
| `GOOGLE_FAILED` | redirección de Google |  | `src/auth/google/google-auth.service.ts:129`<br>`src/auth/google/google-auth.service.ts:297` |
| `GOOGLE_LOGIN_DISABLED` | 404 | El login con Google no está disponible. | `src/auth/google/google-auth.service.ts:62` |
| `GOOGLE_NOT_ALLOWED` | redirección de Google |  | `src/auth/google/google-auth.service.ts:320` |
| `GOOGLE_PENDING_EXPIRED` | 401 | El ingreso con Google venció. Volvé a empezar. | `src/auth/google/google-auth.service.ts:68` |
| `INVALID_APPEAL_TARGET` | 400 | Apelá un strike o una sanción. | `src/moderation/sanctions.service.ts:317` |
| `INVALID_AVAILABILITY` | 400 | Cada franja tiene que empezar antes de terminar y no pisarse con otra del mismo día. | `src/professionals/profile.service.ts:550` |
| `INVALID_CATEGORY` | 400 | La categoría ${invalid.category} no corresponde a tu cuenta. | `src/notifications/push.service.ts:118` |
| `INVALID_CREDENTIALS` | 401 | La contraseña no es correcta. | `src/auth/google/google-auth.service.ts:157`<br>`src/auth/services/auth.service.ts:35` |
| `INVALID_CURRENT_PASSWORD` | 400 | La contraseña actual no es correcta. | `src/auth/services/auth.service.ts:274`<br>`src/users/accounts.service.ts:283` |
| `INVALID_DATE` | 400 | La fecha propuesta tiene que ser en el futuro. | `src/requests/requests.service.ts:219`<br>`src/requests/requests.service.ts:415` |
| `INVALID_END_DATE` | 400 | La fecha de fin tiene que ser en el futuro. | `src/moderation/sanctions.service.ts:144`<br>`src/users/accounts.service.ts:72` |
| `INVALID_EXCEPTION_DATES` | 400 | Las fechas tienen que ser válidas, en orden y dentro del próximo año. | `src/professionals/profile.service.ts:589` |
| `INVALID_FILE_KIND` | 400 | Para ${dto.purpose} solo se admite: ${policy.kinds.join(', ')}. | `src/uploads/uploads.service.ts:86` |
| `INVALID_LOCALITY` | 400 | La localidad no existe. | `src/locations/neighborhoods.service.ts:82` |
| `INVALID_MEDIA` | 400 | Elegí entre tus imágenes y videos (sin el banner ni lo ocultado por soporte). | `src/professionals/profile.service.ts:730` |
| `INVALID_MEDIA_ORDER` | 400 | Mandá todos tus medios, cada uno una vez. | `src/professionals/profile.service.ts:424` |
| `INVALID_MEDIA_PURPOSE` | 400 | Ese uso no corresponde a un${kind === 'VIDEO' ? ' video' : 'a imagen'}. | `src/professionals/profile.service.ts:362` |
| `INVALID_MERGE` | 400 | Un barrio no se puede fusionar consigo mismo. | `src/locations/neighborhood-moderation.service.ts:129`<br>`src/locations/neighborhood-moderation.service.ts:145` |
| `INVALID_MFA` | 401 | El código no es válido o el paso de verificación venció. | `src/auth/auth.controller.ts:123`<br>`src/auth/services/auth.service.ts:430` |
| `INVALID_NEIGHBORHOOD` | 400 | El barrio no existe o todavía no está aprobado. | `src/catalog/catalog.service.ts:160`<br>`src/locations/neighborhood-moderation.service.ts:91`<br>`src/locations/neighborhoods.service.ts:52` |
| `INVALID_PLACE` | 400 | El barrio va con su localidad. | `src/forum/forum.service.ts:427`<br>`src/forum/forum.service.ts:433`<br>`src/forum/forum.service.ts:442` |
| `INVALID_PRIMARY_PROFESSION` | 400 | La profesión principal tiene que estar en la lista. | `src/professionals/profile.service.ts:292` |
| `INVALID_PROFESSION` | 400 | Alguna de las profesiones no existe. | `src/forum/forum.service.ts:454`<br>`src/professionals/professionals.service.ts:42`<br>`src/professionals/profile.service.ts:307`<br>`src/requests/requests.service.ts:94` |
| `INVALID_PROFESSIONS` | 400 | Elegí entre tus profesiones, incluida la principal. | `src/professionals/profile.service.ts:763` |
| `INVALID_PUSH_ENDPOINT` | 400 | La suscripción no es de un servicio de notificaciones conocido. | `src/notifications/push.service.ts:70` |
| `INVALID_QUOTE` | 400 | Ese presupuesto no está vigente. | `src/requests/requests.service.ts:328` |
| `INVALID_RANGE` | 400 | La fecha "desde" tiene que ser anterior o igual a "hasta". | `src/admin/revenue/revenue.service.ts:516`<br>`src/metrics/metrics.service.ts:117` |
| `INVALID_REPORT` | 400 | El reporte no existe o no es sobre esa persona. | `src/moderation/sanctions.service.ts:572` |
| `INVALID_SERVICE_AREAS` | 400 | Elegí entre 1 y ${this.config.maxServiceAreas} zonas de trabajo. | `src/professionals/professionals.service.ts:115` |
| `INVALID_SOCIAL_LINKS` | 400 | Revisá las redes sociales. | `src/professionals/profile.service.ts:519` |
| `INVALID_STATE` | redirección de Google |  | `src/auth/google/google-auth.service.ts:282` |
| `INVALID_STATE_TRANSITION` | 409 | No se puede pasar de ${current.status} a ${target}. | `src/common/moderate-content.ts:38`<br>`src/identity-verification/identity-verification.service.ts:242`<br>`src/moderation/reports.service.ts:177`<br>`src/moderation/reports.service.ts:197` |
| `INVALID_TOKEN` | 401 | El enlace no es válido o venció. | `src/auth/google/google-auth.service.ts:194`<br>`src/auth/services/auth.service.ts:41`<br>`src/auth/services/sessions.service.ts:259` |
| `INVALID_UNTIL` | 400 | El vencimiento tiene que ser en el futuro y dentro de los próximos 7 días. | `src/professionals/profile.service.ts:267` |
| `MESSAGE_NOT_FOUND` | 404 | El mensaje no existe. | `src/chat/chat.service.ts:383` |
| `NEIGHBORHOOD_ALREADY_APPROVED` | 409 | El barrio ya está aprobado. | `src/locations/neighborhood-moderation.service.ts:69` |
| `NEIGHBORHOOD_MERGED` | 409 | Ese barrio ya se fusionó con otro. | `src/locations/neighborhood-moderation.service.ts:20` |
| `NEIGHBORHOOD_NAME_TAKEN` | 409 | Ya existe "${clash.name}" en esa localidad. Fusioná los barrios en lugar de renombrar. | `src/locations/neighborhood-moderation.service.ts:103` |
| `NEIGHBORHOOD_NOT_FOUND` | 404 | El barrio no existe. | `src/locations/neighborhood-moderation.service.ts:200` |
| `NEIGHBORHOOD_REQUIRED` | 400 | Para pasar a cliente hace falta el barrio donde vive. | `src/users/accounts.service.ts:375` |
| `NO_PASSWORD_SET` | 409 | Tu cuenta todavía no tiene contraseña: creala primero. | `src/auth/services/auth.service.ts:268` |
| `NO_SUBSCRIPTION` | 409 | Tu cuenta no tiene una suscripción de profesional. | `src/payments/payments.service.ts:136` |
| `NOT_A_MESSAGE_REPORT` | 400 | Solo se puede ver el chat desde un reporte de mensaje. | `src/moderation/reports.service.ts:242` |
| `NOT_A_PROFESSIONAL` | 400 | Solo se puede ocultar el perfil de un profesional. | `src/moderation/sanctions.service.ts:172` |
| `OTHER_GOOGLE_ACCOUNT` | redirección de Google |  | `src/auth/google/google-auth.service.ts:327` |
| `PASSWORD_ALREADY_SET` | 409 | Tu cuenta ya tiene contraseña: usá el cambio de contraseña. | `src/auth/services/auth.service.ts:309` |
| `PASSWORD_REQUIRED` | 409 | Creá una contraseña antes de desvincular Google, para no quedarte sin acceso. | `src/auth/google/google-auth.service.ts:247` |
| `PAYMENT_PROVIDER_ERROR` | 502 | Mercado Pago no está respondiendo. Probá de nuevo en unos minutos. | `src/payments/payments.service.ts:181` |
| `PAYMENTS_UNAVAILABLE` | 503 | Los pagos todavía no están habilitados. | `src/payments/payments.service.ts:623` |
| `PLAN_FEATURE_REQUIRED` | 403 | Las métricas están incluidas en el plan Premium. | `src/metrics/metrics.service.ts:87` |
| `PLAN_LIMIT_REACHED` | ? |  | `src/professionals/profile.service.ts:76` |
| `PLAN_NOT_FOUND` | 404 | Ese plan no existe. | `src/payments/payments.service.ts:132`<br>`src/payments/payments.service.ts:547` |
| `PRICE_NOT_ALLOWED` | 400 | El presupuesto lo proponen los profesionales en "Solicito profesional". | `src/forum/forum.service.ts:414` |
| `PROFESSION_NOT_OFFERED` | 400 | Alguno de los profesionales no ofrece ese oficio. | `src/requests/requests.service.ts:620` |
| `PROFESSIONAL_DATA_REQUIRED` | 400 | Para pasar a profesional hacen falta la profesión y las zonas de trabajo. | `src/users/accounts.service.ts:393` |
| `PROFESSIONAL_NOT_AVAILABLE` | 404 | Ese profesional no está disponible. | `src/chat/chat.service.ts:95`<br>`src/favorites/favorites.service.ts:77` |
| `PROFESSIONAL_UNAVAILABLE` | 409 | El profesional no está disponible por ahora. Podés leer la conversación. | `src/chat/chat.service.ts:373`<br>`src/requests/requests.service.ts:635` |
| `PROFILE_INCOMPLETE` | 422 | Completá tu perfil antes de verificar la identidad. | `src/identity-verification/identity-verification.service.ts:511` |
| `PROFILE_NOT_FOUND` | 404 | El perfil no existe. | `src/catalog/catalog.service.ts:236`<br>`src/metrics/metrics.service.ts:106`<br>`src/professionals/profile.service.ts:807`<br>`src/reviews/reviews.service.ts:183` |
| `PUSH_DISABLED` | 503 | Las notificaciones push no están disponibles. | `src/notifications/push.service.ts:64` |
| `RANGE_TOO_LONG` | 400 | Son más de ${MAX_BUCKETS} períodos: agrupá por semana, mes o año, o acortá las fechas. | `src/admin/revenue/revenue.service.ts:219`<br>`src/admin/revenue/revenue.service.ts:522`<br>`src/metrics/metrics.service.ts:124` |
| `RATE_INCOMPLETE` | 400 | La tarifa de referencia va con su modalidad (por visita, hora o trabajo). | `src/professionals/profile.service.ts:202` |
| `REAUTH_REQUIRED` | 403 | Por seguridad, volvé a iniciar sesión y repetí la acción. | `src/auth/services/sessions.service.ts:296` |
| `REPORT_ALREADY_OPEN` | 409 | Ya reportaste esto y lo estamos revisando. | `src/moderation/reports.service.ts:95` |
| `REPORT_NOT_FOUND` | 404 | El reporte no existe. | `src/moderation/reports.service.ts:59` |
| `REPORT_TARGET_NOT_FOUND` | 404 | Lo que querés reportar no existe o no lo podés reportar. | `src/moderation/reports.service.ts:53` |
| `REQUEST_NOT_FOUND` | 404 | La solicitud no existe. | `src/requests/requests.service.ts:67` |
| `REVIEW_EXISTS` | 409 | Ya reseñaste esta contratación. Podés editar tu reseña. | `src/reviews/reviews.service.ts:79` |
| `REVIEW_NOT_FOUND` | 404 | La reseña no existe. | `src/reviews/reviews.service.ts:40` |
| `REVIEW_WINDOW_CLOSED` | 409 | Pasaron más de 30 días desde que terminó el trabajo. Solo podés borrar la reseña. | `src/reviews/reviews.service.ts:230` |
| `SAME_PLAN` | 409 | Ya tiene ese plan. | `src/payments/payments.service.ts:557` |
| `SAME_ROLE` | 409 | La cuenta ya es ${dto.role}. | `src/users/accounts.service.ts:193` |
| `SUBSCRIPTION_NOT_LIVE` | 409 | El profesional no tiene una prueba ni un período vigente. | `src/payments/payments.service.ts:551` |
| `SUBSCRIPTION_REQUIRED` | 403 | Necesitás una prueba o un plan vigente para cargar contenido. | `src/uploads/uploads.service.ts:57` |
| `TARGET_NOT_APPROVED` | 409 | Solo se puede fusionar en un barrio aprobado. | `src/locations/neighborhood-moderation.service.ts:139` |
| `THEME_NOT_IN_PLAN` | 403 | Tu plan no incluye esa personalización. | `src/professionals/profile.service.ts:249` |
| `TICKET_NOT_FOUND` | 404 | La consulta no existe. | `src/support/support.service.ts:27` |
| `TOO_MANY_EXCEPTIONS` | 409 | Podés cargar hasta ${MAX_FUTURE_EXCEPTIONS} días sin atención a futuro. | `src/professionals/profile.service.ts:602` |
| `TOO_MANY_PENDING_UPLOADS` | 429 | Tenés demasiadas subidas sin terminar. Probá de nuevo más tarde. | `src/uploads/uploads.service.ts:105`<br>`src/uploads/uploads.service.ts:107` |
| `UNSUPPORTED_FILE_TYPE` | ? |  | `src/uploads/uploads.service.ts:418` |
| `UPLOAD_NOT_RECEIVED` | 409 | Todavía no recibimos el archivo. Subilo y volvé a confirmar. | `src/uploads/uploads.service.ts:147` |
| `VERIFICATION_ATTEMPTS_EXCEEDED` | 422 | Alcanzaste el máximo de intentos. Contactá a soporte. | `src/identity-verification/identity-verification.service.ts:100` |
| `VIDEO_TOO_LONG` | 422 | El video puede durar hasta 15 segundos. | `src/uploads/uploads.service.ts:432` |
| `WRONG_FILE_PURPOSE` | 400 | Ese archivo se subió para otro uso. | `src/uploads/uploads.service.ts:196` |
