# Backend: roles, permisos y datos visibles

> Cómo decide el backend (`Nexo.pro-Backend`) quién puede hacer qué. Todo lo de este documento sale del código: los guards globales, los decoradores de cada ruta y los controles de propiedad dentro de cada servicio (con archivo y línea). Donde algo no se pudo verificar, lo dice.

## 1. Roles reales

| Rol | Valor en el código | Cómo se obtiene | Notas |
| --- | --- | --- | --- |
| Visitante | (sin sesión) | — | Solo rutas `@Public()`: catálogo, perfil público, reseñas públicas, foro (lectura), opiniones publicadas, ubicaciones, oficios, registro, login, Google, contacto. |
| Cliente | `CUSTOMER` | Registro (`POST /auth/register` o Google) | `src/users/user.enums.ts:2`. |
| Profesional | `PROFESSIONAL` | Registro | Tiene perfil profesional y suscripción (prueba de 30 días al registrarse). |
| Administrador | `ADMIN` | **Solo por consola** (`npm run admin:create`), nunca por la API | Login con contraseña + TOTP obligatorio (`src/auth/services/auth.service.ts:96`). Sesión más corta (5 min de access, 12 h de inactividad, 7 días máximo). |

No hay otros roles, ni permisos finos por acción: la autorización combina **rol**, **estado de la cuenta**, **plan vigente** (solo profesionales) y **propiedad del recurso**. El rol se cambia solo por el admin (`POST /admin/users/:id/change-role`, entre CUSTOMER y PROFESSIONAL).

## 2. Cómo se aplica (orden de los guards globales)

Definidos en `src/app.module.ts`, en este orden, para **todas** las rutas:

1. **`ThrottlerGuard`:** límite por IP. Global: 100 pedidos por minuto; muchas rutas tienen uno propio. Responde `429`.
2. **`OriginGuard`** (`src/common/guards/origin.guard.ts`): en POST, PUT, PATCH y DELETE exige `Origin` (o `Referer`) de la lista `FRONTEND_ORIGINS` y `X-Requested-With: XMLHttpRequest`. No aplica a los webhooks. Responde `403 ORIGIN_NOT_ALLOWED` o `MISSING_REQUESTED_WITH`.
3. **`JwtAuthGuard`** (`src/common/guards/jwt-auth.guard.ts`): toda ruta es privada salvo `@Public()`.
   - Lee el access token **solo de la cookie** (`nx_at`), nunca del header `Authorization`.
   - Después de la firma, confirma en la base que la sesión siga viva y carga rol y estado reales (`src/auth/strategies/jwt.strategy.ts:63`).
   - Responde `401 UNAUTHORIZED`, o `401 ACCESS_TOKEN_EXPIRED` cuando hay que renovar.
   - **En rutas públicas no carga al usuario aunque haya cookie.**
4. **`CsrfGuard`** (`src/common/guards/csrf.guard.ts`): en escrituras con sesión exige `X-CSRF-Token`, ligado al dispositivo. Responde `403 CSRF_INVALID`.
5. **`AccountStateGuard`** (`src/common/guards/account-state.guard.ts`): por defecto **solo cuentas `ACTIVE`**; cada ruta declara si admite otros estados. Responde `403 ACCOUNT_STATE_NOT_ALLOWED`.
6. **`RolesGuard`** (`src/common/guards/roles.guard.ts`): `@Roles(...)` con el rol cargado desde la base. Sin `@Roles`, la ruta acepta cualquier rol autenticado. Responde `403 FORBIDDEN`.

Después, **cada servicio** controla la propiedad del recurso y las reglas de negocio (plan, estado del objeto, plazos). La CI verifica cuatro invariantes:

- toda ruta `/admin` exige ADMIN activo;
- toda escritura con sesión exige CSRF y Origin;
- solo una lista revisada de rutas no declara rol;
- solo 6 rutas admiten cuentas suspendidas o baneadas.

Ver `test/endpoint-inventory.e2e-spec.ts` en el backend.

## 3. Estados de la cuenta y qué pueden hacer

`AccountStatus` (`src/users/user.enums.ts:7`):

| Estado | Cuándo | Qué puede hacer |
| --- | --- | --- |
| `PENDING_VERIFICATION` | Al registrarse; también si el admin revoca la identidad | Iniciar sesión y ver su cuenta, editar sus datos y su foto, **verificar email**, **iniciar la verificación de identidad**, subir archivos, ver notificaciones y push. Un profesional además arma su perfil y ve y paga su plan. **No puede:** chatear, pedir trabajos, reseñar, usar favoritos, publicar en el foro, reportar ni abrir consultas de soporte (puede usar el formulario público de contacto). |
| `ACTIVE` | Cuando el admin **aprueba la identidad** (`src/identity-verification/identity-verification.service.ts:570`) | Todo lo de su rol. |
| `SUSPENDED` | Sanción del admin (con o sin fecha de fin) | Solo 6 rutas: `GET /auth/me`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout-all`, `GET /moderation/me` y `POST /moderation/appeals` (ADR 0007). |
| `BANNED` | Sanción del admin | Igual que `SUSPENDED`. |
| `DEACTIVATED` | Baja de la cuenta (30 días de gracia, después anonimización) | **No puede iniciar sesión.** Durante la gracia, solo el admin la restaura. |

El estado lo devuelve `GET /auth/me` (`status`, `statusReason`, `verificationStatus`, `emailVerified`). El frontend tiene que usarlo para decidir qué mostrar. Las rutas exactas de cada estado figuran en la matriz del final y en `BACKEND_ENDPOINTS.md`.

**Verificación de identidad** (`VerificationStatus`: `NOT_STARTED`, `PENDING`, `REQUIRES_REVIEW`, `APPROVED`, `REJECTED`, `REVOKED`):
- Para iniciarla hacen falta el **email verificado y la foto de perfil** (`assertProfileComplete`).
- Hay **3 intentos como máximo** (`IDENTITY_MAX_ATTEMPTS`).
- Con el proveedor actual (manual) decide el admin.
- Aprobada, la cuenta pasa a `ACTIVE` y un profesional aparece en el catálogo si además tiene plan.

## 4. Plan vigente (solo profesionales)

"Plan vigente" = una prueba no vencida o un período pago no vencido (`SubscriptionsService.livePlan`, `src/subscriptions/subscriptions.service.ts:97`). Sin plan vigente el profesional:

- **No aparece en el catálogo** ni se le puede escribir.
- **Usar el chat** (listar, leer, escribir, editar, adjuntos) le responde `403 SUBSCRIPTION_REQUIRED`, **salvo** con un cliente con el que tenga una contratación en curso, hasta que se cierre (C-12, ADR 0027).
- **Pedidos:** no ve los recibidos y no puede rechazar ni presupuestar. Sí puede llevar sus contrataciones en curso hasta el final: las transiciones no exigen plan.
- No puede publicar ni dar "me gusta" en el foro, ni responder reseñas.
- No puede cambiar profesiones, tema ni medios, ni cargar certificados.
- No puede subir archivos de perfil ni certificados (`PROFILE_MEDIA` y `CERTIFICATE` necesitan plan; la foto de perfil, no).

Además, cada plan habilita funciones concretas:
- **Métricas:** solo planes con `metricsEnabled` (hoy Premium); si no, `403 PLAN_FEATURE_REQUIRED`.
- **Avisos a favoritos:** `availabilityAlerts`, en Medium y Premium.
- **Cantidad de imágenes, videos y profesiones, y nivel de tema:** al pasarse del límite, `409 PLAN_LIMIT_REACHED`.

`GET /subscriptions/me` y `GET /subscriptions/plans` dicen qué tiene y qué puede pagar.

## 5. Propiedad de los recursos (anti-IDOR)

Verificado en el código, recurso por recurso. Regla general: **un id ajeno responde 404**, sin confirmar que existe.

| Recurso | Regla | Evidencia |
| --- | --- | --- |
| Conversación y mensajes | Solo el cliente o el profesional de la conversación; editar o borrar, solo el autor (y 15 min para editar) | `ChatService.participation` `src/chat/chat.service.ts:324`, `ownMessage` `:380` |
| Adjunto del chat | Solo los participantes y si el mensaje no se borró | `ChatService.attachment` `src/chat/chat.service.ts:266` |
| Solicitud | El cliente ve todo su pedido; cada profesional, solo su destino | `RequestsService.getRequest` `src/requests/requests.service.ts:515` |
| Destino y presupuesto | Solo el profesional de ese destino, con el pedido abierto | `lockOwnTarget` `src/requests/requests.service.ts:575` |
| Elegir profesional | Solo el cliente dueño del pedido | `RequestsService.select` `src/requests/requests.service.ts:314` |
| Contratación | Solo sus dos partes; cada acción, según la tabla de transiciones | `RequestsService.transition` `src/requests/requests.service.ts:425`, `contract-state-machine.ts` |
| Reseña | Crear: el cliente de esa contratación terminada; editar y borrar: su autor; responder: el profesional reseñado | `ReviewsService.create` `src/reviews/reviews.service.ts:60`, `authored`, `reply` `:144` |
| Favorito | Solo los del cliente | `FavoritesService` `src/favorites/favorites.service.ts:91-101` |
| Publicación y respuesta del foro | Editar, borrar y marcar resuelta: su autor | `ForumService.update` / `remove` / `resolve` `src/forum/forum.service.ts:193-245` |
| Medios, certificados y excepciones del perfil | Solo del perfil propio | `ProfileService.removeMedia` `src/professionals/profile.service.ts:441`, `removeCertification` `:493`, `removeException` `:622` |
| Archivo subido | Confirmar, subir o usar: solo el dueño | `UploadsService.findOwn` / `lockReadyFile` `src/uploads/uploads.service.ts:194, 459` |
| Foto de reporte o de soporte | El dueño o el admin (403 si no) | `EvidenceController.content` `src/moderation/moderation.controller.ts:122` |
| Consulta de soporte | Solo las propias | `SupportService.mine` / `reply` `src/support/support.service.ts:90-104` |
| Notificación | Solo las propias | `NotificationsService.markRead` `src/notifications/notifications.service.ts:122` |
| Novedad (texto completo) | Solo si le llegó como notificación | `AnnouncementsService.get` `src/support/announcements.service.ts:120` |
| Dispositivo (sesión) | Solo los propios | `SessionsService.closeOwnFamily` `src/auth/services/sessions.service.ts:234` |
| Suscripción push | La baja solo borra las propias; el alta mueve el navegador a la cuenta actual | `PushService.unsubscribe` / `subscribe` `src/notifications/push.service.ts` |
| Cerrar sesión desde el email | Enlace firmado (HMAC) para una sesión y una cuenta, que vence en 7 días | `SessionCloseLinkService.verify` `src/auth/services/session-close-link.service.ts` |

**Admin:**
- Ve y modera cualquier recurso de los demás.
- **No puede actuar sobre otro admin** (`CANNOT_MODIFY_ADMIN`, `src/users/accounts.service.ts`).
- **Solo puede leer un chat desde un reporte de mensaje**, y solo esa conversación, con cada acceso auditado (`GET /admin/reports/:id/conversation`, C-32).
- Nunca ve contraseñas ni tokens.
- No hay endpoint de auditoría.

**No verificable con el código disponible:**
- La política de visibilidad de los archivos públicos ya entregados por Cloudinary. Son URLs públicas: quien tenga la URL ve la imagen, y al ocultar contenido se pasa a privado en el proveedor.
- La protección real contra el acceso directo a Railway: es configuración de infraestructura pendiente.

## 6. Datos visibles por rol

Público = visitante y cualquier rol. "Propio" = solo el dueño.

| Recurso | Visitante | Cliente | Profesional | Admin | Campos y restricciones |
| --- | --- | --- | --- | --- | --- |
| Perfil profesional público | Consultar | Consultar | Consultar | Consultar | Solo profesionales listados: activos, identidad aprobada, plan vigente, sin perfil oculto. Nombre, foto, descripción, tarifas, oficios, zonas (solo barrios aprobados), medios dentro del plan, certificados (`verified: false`), redes, horarios, estado de atención y estrellas. **Email y teléfono solo en el detalle.** Incluye `professionalUserId` (id de usuario, el que piden chat, favoritos, pedidos y reportes; H-01 resuelto) y no el id del perfil. |
| Reseñas de un profesional | Consultar | Consultar | Consultar | Consultar y ocultar | Solo visibles y no borradas. Autor: nombre y foto, o "Usuario eliminado". Incluye la respuesta del profesional. |
| Mis datos personales | — | Propio: ver y editar | Propio: ver y editar | Ver (ficha) y editar con motivo | `PersonalDataDto`. Con la identidad aprobada, el nombre nuevo queda en revisión. Teléfono y barrio: cambio inmediato. |
| Datos del cliente para el profesional | — | Propio: ver y editar | Ve barrio y `extraInfo` de los clientes con los que chatea (C-13) | Ver (ficha) | Nunca el email ni el teléfono del cliente. |
| Mi perfil profesional | — | — | Propio: CRUD completo (incluye lo oculto) | Editar datos con motivo; ocultar o restaurar medios y certificados | `ProfessionalMeDto`. |
| Conversaciones y mensajes | — | Las propias | Las propias (con plan o con contratación en curso) | Solo desde un reporte de mensaje, con versiones originales | La contraparte se ve como `userId`, nombre y foto; para el cliente, además `slug` y nombre comercial del profesional. |
| Solicitudes y presupuestos | — | Crear, ver y cancelar las propias; elegir profesional | Ver las recibidas (solo su parte), rechazar, presupuestar, retirar | — | Solo ids: sin nombres de la contraparte. No hay endpoint admin. |
| Contrataciones | — | Ver y cancelar las propias | Ver, agendar, empezar, terminar y cancelar las propias | — | No hay endpoint admin de contrataciones. |
| Mis reseñas | — | Crear, editar (30 días) y borrar las propias | Ver las recibidas y responderlas | Ocultar o restaurar | |
| Opiniones sobre la plataforma | Ver las publicadas | Crear, editar y borrar la propia | Igual | Ver todas; publicar y despublicar | Una por usuario; sin publicar hasta que la publique el admin. |
| Favoritos | — | Propios | — | — | Los que ya no están en el catálogo vienen sin datos personales. |
| Foro | Leer | Leer, publicar, responder, "me gusta", editar y borrar lo propio | Igual, con plan vigente | Ocultar o restaurar | El autor se muestra con `userId`, nombre, foto, rol y fecha de registro. |
| Notificaciones y push | — | Propias | Propias | Propias (alertas del admin) | |
| Reportes | — | Crear y ver los propios | Igual | Ver todos, revisar, resolver, ver evidencia y el chat reportado | **El denunciado nunca ve quién lo reportó** y solo se entera si el reporte es válido. |
| Sanciones, strikes y apelaciones | — | Ver los propios y apelar (también suspendido o baneado) | Igual | Aplicar, levantar, anular y decidir | |
| Soporte | Formulario público de contacto | Consultas propias | Consultas propias | Ver, responder y cerrar todas; mandar mensajes y novedades | |
| Plan, prueba y pagos | — | — | Propios; pagar con checkout | Ver todos los pagos; cambiar el plan con motivo | |
| Verificación de identidad | — | Iniciar y ver la propia | Igual | Cola de revisión y decisión | Sin imágenes de DNI ni selfies (ADR 0003). |
| Archivos | URLs públicas | Subir; ver sus privados | Igual | Ver evidencia | Adjuntos del chat: participantes; evidencia: dueño y admin. |
| Métricas | — | — | Propias, con Premium | Ver las de cualquier profesional | Solo totales; nunca quién miró. |
| Ingresos y registros | — | — | — | Ver y exportar CSV (auditado) | El CSV de registros va sin email. |
| Dispositivos y sesiones | — | Propios | Propios | Propios; cerrar todas las sesiones de un usuario | |
| Barrios | Buscar aprobados | Proponer uno nuevo (registro, datos personales) | Proponer en sus zonas | Aprobar, renombrar, fusionar | Los pendientes no aparecen en público. |

## 7. Matriz por endpoint

Generada desde los decoradores de cada ruta. Valores de cada celda:
- **Permitido:** el rol pasa los guards.
- **Denegado (401/403):** los guards lo cortan.
- **Con restricciones:** pasa los guards pero el servicio limita (recursos propios, plan o estado).

"Restricciones verificadas" resume los estados de cuenta admitidos, el plan y la propiedad.

<!-- GENERADO:PERMISOS:INICIO -->

| Endpoint | Visitante | Cliente | Profesional | Admin | Restricciones verificadas |
| --- | --- | --- | --- | --- | --- |
| [`GET /api/v1/admin/announcements`](BACKEND_ENDPOINTS.md#e-001) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/announcements`](BACKEND_ENDPOINTS.md#e-002) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/appeals`](BACKEND_ENDPOINTS.md#e-003) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/appeals/:id/decide`](BACKEND_ENDPOINTS.md#e-004) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/dashboard`](BACKEND_ENDPOINTS.md#e-005) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/forum/posts/:id/hide`](BACKEND_ENDPOINTS.md#e-006) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/forum/posts/:id/restore`](BACKEND_ENDPOINTS.md#e-007) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/forum/replies/:id/hide`](BACKEND_ENDPOINTS.md#e-008) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/forum/replies/:id/restore`](BACKEND_ENDPOINTS.md#e-009) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/identity-verifications`](BACKEND_ENDPOINTS.md#e-010) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/identity-verifications/:id/decision`](BACKEND_ENDPOINTS.md#e-011) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/neighborhoods`](BACKEND_ENDPOINTS.md#e-012) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`PATCH /api/v1/admin/neighborhoods/:id`](BACKEND_ENDPOINTS.md#e-013) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/neighborhoods/:id/approve`](BACKEND_ENDPOINTS.md#e-014) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/neighborhoods/:id/merge`](BACKEND_ENDPOINTS.md#e-015) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/payments`](BACKEND_ENDPOINTS.md#e-016) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/platform-reviews`](BACKEND_ENDPOINTS.md#e-017) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/platform-reviews/:id/publish`](BACKEND_ENDPOINTS.md#e-018) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/platform-reviews/:id/unpublish`](BACKEND_ENDPOINTS.md#e-019) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`PATCH /api/v1/admin/professionals/:userId/profile`](BACKEND_ENDPOINTS.md#e-020) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/professionals/certifications/:id/hide`](BACKEND_ENDPOINTS.md#e-021) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/professionals/certifications/:id/restore`](BACKEND_ENDPOINTS.md#e-022) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/professionals/media/:id/hide`](BACKEND_ENDPOINTS.md#e-023) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/professionals/media/:id/restore`](BACKEND_ENDPOINTS.md#e-024) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/reports`](BACKEND_ENDPOINTS.md#e-025) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/reports/:id`](BACKEND_ENDPOINTS.md#e-026) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/reports/:id/conversation`](BACKEND_ENDPOINTS.md#e-027) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/reports/:id/resolve`](BACKEND_ENDPOINTS.md#e-028) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/reports/:id/review`](BACKEND_ENDPOINTS.md#e-029) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/revenue/exports`](BACKEND_ENDPOINTS.md#e-030) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/revenue/payments`](BACKEND_ENDPOINTS.md#e-031) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/revenue/registrations`](BACKEND_ENDPOINTS.md#e-032) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/revenue/summary`](BACKEND_ENDPOINTS.md#e-033) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/reviews/:id/hide`](BACKEND_ENDPOINTS.md#e-034) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/reviews/:id/restore`](BACKEND_ENDPOINTS.md#e-035) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/sanctions/:id/lift`](BACKEND_ENDPOINTS.md#e-036) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/strikes/:id/void`](BACKEND_ENDPOINTS.md#e-037) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/subscriptions/:userId/plan`](BACKEND_ENDPOINTS.md#e-038) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/support/tickets`](BACKEND_ENDPOINTS.md#e-039) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/support/tickets/:id`](BACKEND_ENDPOINTS.md#e-040) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/support/tickets/:id/close`](BACKEND_ENDPOINTS.md#e-041) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/support/tickets/:id/messages`](BACKEND_ENDPOINTS.md#e-042) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/users`](BACKEND_ENDPOINTS.md#e-043) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`DELETE /api/v1/admin/users/:id`](BACKEND_ENDPOINTS.md#e-044) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/users/:id`](BACKEND_ENDPOINTS.md#e-045) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`PATCH /api/v1/admin/users/:id`](BACKEND_ENDPOINTS.md#e-046) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/ban`](BACKEND_ENDPOINTS.md#e-047) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/change-role`](BACKEND_ENDPOINTS.md#e-048) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/message`](BACKEND_ENDPOINTS.md#e-049) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/admin/users/:id/metrics`](BACKEND_ENDPOINTS.md#e-050) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/password-reset`](BACKEND_ENDPOINTS.md#e-051) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/restore`](BACKEND_ENDPOINTS.md#e-052) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/revoke-sessions`](BACKEND_ENDPOINTS.md#e-053) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/sanctions`](BACKEND_ENDPOINTS.md#e-054) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/strikes`](BACKEND_ENDPOINTS.md#e-055) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`POST /api/v1/admin/users/:id/suspend`](BACKEND_ENDPOINTS.md#e-056) | Denegado (401) | Denegado (403) | Denegado (403) | Permitido | — |
| [`GET /api/v1/announcements/:id`](BACKEND_ENDPOINTS.md#e-057) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/auth/csrf`](BACKEND_ENDPOINTS.md#e-058) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/email/resend`](BACKEND_ENDPOINTS.md#e-059) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/auth/email/verify`](BACKEND_ENDPOINTS.md#e-060) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/auth/google`](BACKEND_ENDPOINTS.md#e-061) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/auth/google/callback`](BACKEND_ENDPOINTS.md#e-062) | Permitido | Permitido | Permitido | Permitido | — |
| [`DELETE /api/v1/auth/google/link`](BACKEND_ENDPOINTS.md#e-063) | Denegado (401) | Permitido | Permitido | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/auth/google/link`](BACKEND_ENDPOINTS.md#e-064) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/google/link/confirm`](BACKEND_ENDPOINTS.md#e-065) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/google/link/email`](BACKEND_ENDPOINTS.md#e-066) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/auth/google/pending`](BACKEND_ENDPOINTS.md#e-067) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/google/register`](BACKEND_ENDPOINTS.md#e-068) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/login`](BACKEND_ENDPOINTS.md#e-069) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/logout`](BACKEND_ENDPOINTS.md#e-070) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/logout-all`](BACKEND_ENDPOINTS.md#e-071) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| [`GET /api/v1/auth/me`](BACKEND_ENDPOINTS.md#e-072) | Denegado (401) | Con restricciones | Con restricciones | Permitido | estados: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| [`POST /api/v1/auth/mfa/verify`](BACKEND_ENDPOINTS.md#e-073) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/password/change`](BACKEND_ENDPOINTS.md#e-074) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/auth/password/forgot`](BACKEND_ENDPOINTS.md#e-075) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/password/reset`](BACKEND_ENDPOINTS.md#e-076) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/password/set`](BACKEND_ENDPOINTS.md#e-077) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/auth/refresh`](BACKEND_ENDPOINTS.md#e-078) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/auth/register`](BACKEND_ENDPOINTS.md#e-079) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/auth/sessions`](BACKEND_ENDPOINTS.md#e-080) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| [`DELETE /api/v1/auth/sessions/:id`](BACKEND_ENDPOINTS.md#e-081) | Denegado (401) | Con restricciones | Con restricciones | Permitido | estados: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED; solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/auth/sessions/close-by-link`](BACKEND_ENDPOINTS.md#e-082) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/catalog/professionals`](BACKEND_ENDPOINTS.md#e-083) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/catalog/professionals/:slug`](BACKEND_ENDPOINTS.md#e-084) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/catalog/professionals/:slug/reviews`](BACKEND_ENDPOINTS.md#e-085) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/chat/attachments/:fileId`](BACKEND_ENDPOINTS.md#e-086) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/chat/conversations`](BACKEND_ENDPOINTS.md#e-087) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| [`POST /api/v1/chat/conversations`](BACKEND_ENDPOINTS.md#e-088) | Denegado (401) | Permitido | Denegado (403) | Denegado (403) | — |
| [`GET /api/v1/chat/conversations/:id`](BACKEND_ENDPOINTS.md#e-089) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/chat/conversations/:id/messages`](BACKEND_ENDPOINTS.md#e-090) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/chat/conversations/:id/messages`](BACKEND_ENDPOINTS.md#e-091) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/chat/conversations/:id/read`](BACKEND_ENDPOINTS.md#e-092) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`DELETE /api/v1/chat/messages/:id`](BACKEND_ENDPOINTS.md#e-093) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`PATCH /api/v1/chat/messages/:id`](BACKEND_ENDPOINTS.md#e-094) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/contracts`](BACKEND_ENDPOINTS.md#e-095) | Denegado (401) | Permitido | Permitido | Denegado (403) | — |
| [`GET /api/v1/contracts/:id`](BACKEND_ENDPOINTS.md#e-096) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/contracts/:id/cancel`](BACKEND_ENDPOINTS.md#e-097) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/contracts/:id/complete`](BACKEND_ENDPOINTS.md#e-098) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/contracts/:id/schedule`](BACKEND_ENDPOINTS.md#e-099) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/contracts/:id/start`](BACKEND_ENDPOINTS.md#e-100) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/customers/me`](BACKEND_ENDPOINTS.md#e-101) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PATCH /api/v1/customers/me`](BACKEND_ENDPOINTS.md#e-102) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/evidence/:fileId`](BACKEND_ENDPOINTS.md#e-103) | Denegado (401) | Con restricciones | Con restricciones | Permitido | solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/favorites`](BACKEND_ENDPOINTS.md#e-104) | Denegado (401) | Permitido | Denegado (403) | Denegado (403) | — |
| [`DELETE /api/v1/favorites/:professionalId`](BACKEND_ENDPOINTS.md#e-105) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`PATCH /api/v1/favorites/:professionalId`](BACKEND_ENDPOINTS.md#e-106) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`PUT /api/v1/favorites/:professionalId`](BACKEND_ENDPOINTS.md#e-107) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/forum/posts`](BACKEND_ENDPOINTS.md#e-108) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/forum/posts`](BACKEND_ENDPOINTS.md#e-109) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| [`DELETE /api/v1/forum/posts/:id`](BACKEND_ENDPOINTS.md#e-110) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/forum/posts/:id`](BACKEND_ENDPOINTS.md#e-111) | Permitido | Permitido | Permitido | Permitido | solo recursos propios o en los que participa (404 si no) |
| [`PATCH /api/v1/forum/posts/:id`](BACKEND_ENDPOINTS.md#e-112) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`DELETE /api/v1/forum/posts/:id/like`](BACKEND_ENDPOINTS.md#e-113) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`PUT /api/v1/forum/posts/:id/like`](BACKEND_ENDPOINTS.md#e-114) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/forum/posts/:id/my-likes`](BACKEND_ENDPOINTS.md#e-115) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/forum/posts/:id/replies`](BACKEND_ENDPOINTS.md#e-116) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/forum/posts/:id/resolve`](BACKEND_ENDPOINTS.md#e-117) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`DELETE /api/v1/forum/replies/:id`](BACKEND_ENDPOINTS.md#e-118) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`PATCH /api/v1/forum/replies/:id`](BACKEND_ENDPOINTS.md#e-119) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`DELETE /api/v1/forum/replies/:id/like`](BACKEND_ENDPOINTS.md#e-120) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`PUT /api/v1/forum/replies/:id/like`](BACKEND_ENDPOINTS.md#e-121) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/health/live`](BACKEND_ENDPOINTS.md#e-122) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/health/ready`](BACKEND_ENDPOINTS.md#e-123) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/identity-verification`](BACKEND_ENDPOINTS.md#e-124) | Denegado (401) | Permitido | Permitido | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/identity-verification/me`](BACKEND_ENDPOINTS.md#e-125) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/locations/localities`](BACKEND_ENDPOINTS.md#e-126) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/locations/neighborhoods`](BACKEND_ENDPOINTS.md#e-127) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/locations/provinces`](BACKEND_ENDPOINTS.md#e-128) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/moderation/appeals`](BACKEND_ENDPOINTS.md#e-129) | Denegado (401) | Permitido | Permitido | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| [`GET /api/v1/moderation/me`](BACKEND_ENDPOINTS.md#e-130) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED |
| [`GET /api/v1/notifications`](BACKEND_ENDPOINTS.md#e-131) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/notifications/:id/read`](BACKEND_ENDPOINTS.md#e-132) | Denegado (401) | Con restricciones | Con restricciones | Permitido | estados: PENDING_VERIFICATION, ACTIVE; solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/notifications/preferences`](BACKEND_ENDPOINTS.md#e-133) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/notifications/preferences`](BACKEND_ENDPOINTS.md#e-134) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/notifications/push/key`](BACKEND_ENDPOINTS.md#e-135) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/notifications/push/subscriptions`](BACKEND_ENDPOINTS.md#e-136) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/notifications/push/subscriptions/remove`](BACKEND_ENDPOINTS.md#e-137) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/notifications/read-all`](BACKEND_ENDPOINTS.md#e-138) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/notifications/unread-count`](BACKEND_ENDPOINTS.md#e-139) | Denegado (401) | Permitido | Permitido | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/platform-reviews`](BACKEND_ENDPOINTS.md#e-140) | Permitido | Permitido | Permitido | Permitido | — |
| [`DELETE /api/v1/platform-reviews/me`](BACKEND_ENDPOINTS.md#e-141) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | — |
| [`GET /api/v1/platform-reviews/me`](BACKEND_ENDPOINTS.md#e-142) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | — |
| [`PUT /api/v1/platform-reviews/me`](BACKEND_ENDPOINTS.md#e-143) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | — |
| [`GET /api/v1/professionals/me`](BACKEND_ENDPOINTS.md#e-144) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PATCH /api/v1/professionals/me`](BACKEND_ENDPOINTS.md#e-145) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/professionals/me/attention-status`](BACKEND_ENDPOINTS.md#e-146) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/professionals/me/availability`](BACKEND_ENDPOINTS.md#e-147) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/professionals/me/availability/exceptions`](BACKEND_ENDPOINTS.md#e-148) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`DELETE /api/v1/professionals/me/availability/exceptions/:id`](BACKEND_ENDPOINTS.md#e-149) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/professionals/me/certifications`](BACKEND_ENDPOINTS.md#e-150) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| [`DELETE /api/v1/professionals/me/certifications/:id`](BACKEND_ENDPOINTS.md#e-151) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/professionals/me/media`](BACKEND_ENDPOINTS.md#e-152) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| [`DELETE /api/v1/professionals/me/media/:id`](BACKEND_ENDPOINTS.md#e-153) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; solo recursos propios o en los que participa (404 si no) |
| [`PUT /api/v1/professionals/me/media/order`](BACKEND_ENDPOINTS.md#e-154) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/professionals/me/media/visible`](BACKEND_ENDPOINTS.md#e-155) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| [`GET /api/v1/professionals/me/metrics`](BACKEND_ENDPOINTS.md#e-156) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | solo planes con la función (`PLAN_FEATURE_REQUIRED`) |
| [`PUT /api/v1/professionals/me/professions`](BACKEND_ENDPOINTS.md#e-157) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| [`PUT /api/v1/professionals/me/professions/visible`](BACKEND_ENDPOINTS.md#e-158) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); respeta los límites del plan (`PLAN_LIMIT_REACHED`) |
| [`PUT /api/v1/professionals/me/service-areas`](BACKEND_ENDPOINTS.md#e-159) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/professionals/me/social-links`](BACKEND_ENDPOINTS.md#e-160) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/professionals/me/theme`](BACKEND_ENDPOINTS.md#e-161) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| [`GET /api/v1/professions`](BACKEND_ENDPOINTS.md#e-162) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/reports`](BACKEND_ENDPOINTS.md#e-163) | Denegado (401) | Permitido | Permitido | Denegado (403) | — |
| [`GET /api/v1/reports/mine`](BACKEND_ENDPOINTS.md#e-164) | Denegado (401) | Permitido | Permitido | Denegado (403) | — |
| [`GET /api/v1/requests`](BACKEND_ENDPOINTS.md#e-165) | Denegado (401) | Permitido | Denegado (403) | Denegado (403) | — |
| [`POST /api/v1/requests`](BACKEND_ENDPOINTS.md#e-166) | Denegado (401) | Permitido | Denegado (403) | Denegado (403) | — |
| [`GET /api/v1/requests/:id`](BACKEND_ENDPOINTS.md#e-167) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/requests/:id/cancel`](BACKEND_ENDPOINTS.md#e-168) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/requests/quotes/:quoteId/withdraw`](BACKEND_ENDPOINTS.md#e-169) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/requests/received`](BACKEND_ENDPOINTS.md#e-170) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| [`POST /api/v1/requests/targets/:targetId/decline`](BACKEND_ENDPOINTS.md#e-171) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/requests/targets/:targetId/quotes`](BACKEND_ENDPOINTS.md#e-172) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/requests/targets/:targetId/select`](BACKEND_ENDPOINTS.md#e-173) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/reviews`](BACKEND_ENDPOINTS.md#e-174) | Denegado (401) | Permitido | Denegado (403) | Denegado (403) | — |
| [`DELETE /api/v1/reviews/:id`](BACKEND_ENDPOINTS.md#e-175) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`PATCH /api/v1/reviews/:id`](BACKEND_ENDPOINTS.md#e-176) | Denegado (401) | Con restricciones | Denegado (403) | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`DELETE /api/v1/reviews/:id/reply`](BACKEND_ENDPOINTS.md#e-177) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`PUT /api/v1/reviews/:id/reply`](BACKEND_ENDPOINTS.md#e-178) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/reviews/mine`](BACKEND_ENDPOINTS.md#e-179) | Denegado (401) | Permitido | Denegado (403) | Denegado (403) | — |
| [`GET /api/v1/reviews/received`](BACKEND_ENDPOINTS.md#e-180) | Denegado (401) | Denegado (403) | Permitido | Denegado (403) | — |
| [`POST /api/v1/subscriptions/checkout`](BACKEND_ENDPOINTS.md#e-181) | Denegado (401) | Denegado (403) | Permitido | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/subscriptions/me`](BACKEND_ENDPOINTS.md#e-182) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/subscriptions/me/payments`](BACKEND_ENDPOINTS.md#e-183) | Denegado (401) | Denegado (403) | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/subscriptions/plans`](BACKEND_ENDPOINTS.md#e-184) | Denegado (401) | Denegado (403) | Permitido | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/support/contact`](BACKEND_ENDPOINTS.md#e-185) | Permitido | Permitido | Permitido | Permitido | — |
| [`GET /api/v1/support/tickets`](BACKEND_ENDPOINTS.md#e-186) | Denegado (401) | Permitido | Permitido | Denegado (403) | — |
| [`POST /api/v1/support/tickets`](BACKEND_ENDPOINTS.md#e-187) | Denegado (401) | Permitido | Permitido | Denegado (403) | — |
| [`GET /api/v1/support/tickets/:id`](BACKEND_ENDPOINTS.md#e-188) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/support/tickets/:id/messages`](BACKEND_ENDPOINTS.md#e-189) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | solo recursos propios o en los que participa (404 si no) |
| [`POST /api/v1/uploads`](BACKEND_ENDPOINTS.md#e-190) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`) |
| [`POST /api/v1/uploads/:id/complete`](BACKEND_ENDPOINTS.md#e-191) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`GET /api/v1/uploads/:id/content`](BACKEND_ENDPOINTS.md#e-192) | Permitido | Permitido | Permitido | Permitido | solo recursos propios o en los que participa (404 si no) |
| [`PUT /api/v1/uploads/:id/content`](BACKEND_ENDPOINTS.md#e-193) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE; el profesional necesita prueba o plan vigente (`SUBSCRIPTION_REQUIRED`); solo recursos propios o en los que participa (404 si no) |
| [`DELETE /api/v1/users/me`](BACKEND_ENDPOINTS.md#e-194) | Denegado (401) | Con restricciones | Con restricciones | Permitido | estados: PENDING_VERIFICATION, ACTIVE |
| [`GET /api/v1/users/me`](BACKEND_ENDPOINTS.md#e-195) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PATCH /api/v1/users/me`](BACKEND_ENDPOINTS.md#e-196) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`PUT /api/v1/users/me/avatar`](BACKEND_ENDPOINTS.md#e-197) | Denegado (401) | Con restricciones | Con restricciones | Denegado (403) | estados: PENDING_VERIFICATION, ACTIVE |
| [`POST /api/v1/webhooks/identity`](BACKEND_ENDPOINTS.md#e-198) | Permitido | Permitido | Permitido | Permitido | — |
| [`POST /api/v1/webhooks/payments`](BACKEND_ENDPOINTS.md#e-199) | Permitido | Permitido | Permitido | Permitido | — |

<!-- GENERADO:PERMISOS:FIN -->
