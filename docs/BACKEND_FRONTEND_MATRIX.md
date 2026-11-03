# Backend ↔ frontend: matriz de funcionalidades

> Una fila por endpoint (199), agrupadas por módulo. Generada desde el código del backend (commit `2fd5b64`) y completada con la revisión manual. "Datos accesibles" es el contrato de respuesta (detalle en `BACKEND_ENDPOINTS.md`). "Interfaz futura" es una propuesta de pantalla o componente, no algo que exista.

Estados: **Implementado** · **Parcial** (funciona pero no se puede usar completo desde el frontend) · **Problemático** (riesgo de error comprobado en el código) · **Apagado** · **Solo desarrollo** · **Solo backend** / **Solo infraestructura** (no los consume el frontend) · **Requiere credenciales**.


## `admin/announcements`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista las novedades publicadas, con la cantidad de destinatarios de cada una. | [`/api/v1/admin/announcements`](BACKEND_ENDPOINTS.md#e-001) | GET | ADMIN | Array de [`AdminAnnouncementDto`](BACKEND_ENDPOINTS.md#dto-adminannouncementdto) | Implementado | Admin: soporte y novedades |
| Crea y publica: una notificación por cada cuenta activa que cumple el segmento. | [`/api/v1/admin/announcements`](BACKEND_ENDPOINTS.md#e-002) | POST | ADMIN | [`AdminAnnouncementDto`](BACKEND_ENDPOINTS.md#dto-adminannouncementdto) | Implementado | Admin: soporte y novedades |

## `admin/appeals`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista paginada de apelaciones (filtrable por estado), con los datos de la cuenta que apeló. | [`/api/v1/admin/appeals`](BACKEND_ENDPOINTS.md#e-003) | GET | ADMIN | `{ data: AdminAppealDto[], page, limit, total }` (`sanctions.service.ts` `adminAppeals`) | Implementado | Admin: moderación |
| Aceptar anula el strike o levanta la sanción; rechazar la deja como está. Auditado. | [`/api/v1/admin/appeals/:id/decide`](BACKEND_ENDPOINTS.md#e-004) | POST | ADMIN | [`AppealDto`](BACKEND_ENDPOINTS.md#dto-appealdto) | Implementado | Admin: moderación |

## `admin/dashboard`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Cifras generales del panel: usuarios por rol y estado, suscripciones, planes vigentes y colas pendientes. | [`/api/v1/admin/dashboard`](BACKEND_ENDPOINTS.md#e-005) | GET | ADMIN | [`DashboardDto`](BACKEND_ENDPOINTS.md#dto-dashboarddto) | Implementado | Admin: inicio |

## `admin/forum`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Oculta una publicación del foro, con motivo. Auditado. | [`/api/v1/admin/forum/posts/:id/hide`](BACKEND_ENDPOINTS.md#e-006) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |
| Restaura una publicación del foro oculta, con motivo. Auditado. | [`/api/v1/admin/forum/posts/:id/restore`](BACKEND_ENDPOINTS.md#e-007) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |
| Oculta una respuesta del foro, con motivo. Auditado. | [`/api/v1/admin/forum/replies/:id/hide`](BACKEND_ENDPOINTS.md#e-008) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |
| Restaura una respuesta del foro oculta, con motivo. Auditado. | [`/api/v1/admin/forum/replies/:id/restore`](BACKEND_ENDPOINTS.md#e-009) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |

## `admin/identity-verifications`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Cola de revisión del admin: las más viejas primero, con los datos para reconocer a la persona. | [`/api/v1/admin/identity-verifications`](BACKEND_ENDPOINTS.md#e-010) | GET | ADMIN | [`AdminVerificationListDto`](BACKEND_ENDPOINTS.md#dto-adminverificationlistdto) | Implementado | Admin: verificaciones de identidad |
| Decisión manual del admin. Motivo obligatorio y auditoría en la misma transacción. | [`/api/v1/admin/identity-verifications/:id/decision`](BACKEND_ENDPOINTS.md#e-011) | POST | ADMIN | [`AdminVerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-adminverificationresponsedto) | Implementado | Admin: verificaciones de identidad |

## `admin/neighborhoods`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Por defecto, los pendientes (los más viejos primero) con cuánto se usan. | [`/api/v1/admin/neighborhoods`](BACKEND_ENDPOINTS.md#e-012) | GET | ADMIN | [`AdminNeighborhoodListDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhoodlistdto) | Implementado | Admin: barrios |
| Corrige el nombre que se muestra. Si el nombre nuevo ya existe en la localidad (como barrio o alias), responde 409: lo que corresponde es fusionarlos. | [`/api/v1/admin/neighborhoods/:id`](BACKEND_ENDPOINTS.md#e-013) | PATCH | ADMIN | [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto) | Implementado | Admin: barrios |
| PENDING → APPROVED: desde ahora aparece en el autocompletado y en los filtros públicos. | [`/api/v1/admin/neighborhoods/:id/approve`](BACKEND_ENDPOINTS.md#e-014) | POST | ADMIN | [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto) | Implementado | Admin: barrios |
| Fusiona `id` en `targetId` (aprobado, misma localidad): mueve a los clientes y las zonas de trabajo (sin duplicar zonas de un mismo profesional) y deja `id` como alias del destino, así quien vuelva a escribir ese nombre cae en el barrio correcto. | [`/api/v1/admin/neighborhoods/:id/merge`](BACKEND_ENDPOINTS.md#e-015) | POST | ADMIN | [`AdminNeighborhoodDto`](BACKEND_ENDPOINTS.md#dto-adminneighborhooddto) | Implementado | Admin: barrios |

## `admin/payments`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista paginada de pagos (filtrable por usuario y estado), con la marca de los que hay que revisar. | [`/api/v1/admin/payments`](BACKEND_ENDPOINTS.md#e-016) | GET | ADMIN | [`AdminPaymentListDto`](BACKEND_ENDPOINTS.md#dto-adminpaymentlistdto) | Implementado | Admin: pagos |

## `admin/platform-reviews`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista de opiniones sobre la plataforma (publicadas o no) para moderar. | [`/api/v1/admin/platform-reviews`](BACKEND_ENDPOINTS.md#e-017) | GET | ADMIN | [`PlatformReviewPageDto`](BACKEND_ENDPOINTS.md#dto-platformreviewpagedto) | Implementado | Admin: moderación de reseñas y foro |
| Publica una opinión sobre la plataforma. Auditado. | [`/api/v1/admin/platform-reviews/:id/publish`](BACKEND_ENDPOINTS.md#e-018) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |
| Despublica una opinión sobre la plataforma. Auditado. | [`/api/v1/admin/platform-reviews/:id/unpublish`](BACKEND_ENDPOINTS.md#e-019) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |

## `admin/professionals`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Edita los datos del perfil de un profesional (ADR 0021), con motivo y auditoría. | [`/api/v1/admin/professionals/:userId/profile`](BACKEND_ENDPOINTS.md#e-020) | PATCH | ADMIN | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Admin: contenido de perfiles |
| Oculta un certificado de un profesional (pasa a privado en el almacenamiento). Con motivo y auditado. | [`/api/v1/admin/professionals/certifications/:id/hide`](BACKEND_ENDPOINTS.md#e-021) | POST | ADMIN | Sin cuerpo | Implementado | Admin: contenido de perfiles |
| Restaura un certificado oculto. Con motivo y auditado. | [`/api/v1/admin/professionals/certifications/:id/restore`](BACKEND_ENDPOINTS.md#e-022) | POST | ADMIN | Sin cuerpo | Implementado | Admin: contenido de perfiles |
| Oculta una imagen o video del perfil de un profesional. Con motivo y auditado. | [`/api/v1/admin/professionals/media/:id/hide`](BACKEND_ENDPOINTS.md#e-023) | POST | ADMIN | Sin cuerpo | Implementado | Admin: contenido de perfiles |
| Restaura un medio oculto. Con motivo y auditado. | [`/api/v1/admin/professionals/media/:id/restore`](BACKEND_ENDPOINTS.md#e-024) | POST | ADMIN | Sin cuerpo | Implementado | Admin: contenido de perfiles |

## `admin/reports`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista paginada de reportes, filtrable por estado y tipo de contenido. | [`/api/v1/admin/reports`](BACKEND_ENDPOINTS.md#e-025) | GET | ADMIN | [`AdminReportListDto`](BACKEND_ENDPOINTS.md#dto-adminreportlistdto) | Implementado | Admin: moderación |
| Detalle de un reporte con el contenido reportado, el denunciante, el denunciado y la evidencia. | [`/api/v1/admin/reports/:id`](BACKEND_ENDPOINTS.md#e-026) | GET | ADMIN | [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto) | Implementado | Admin: moderación |
| C-32: solo desde un reporte de mensaje; cada acceso queda auditado. | [`/api/v1/admin/reports/:id/conversation`](BACKEND_ENDPOINTS.md#e-027) | GET | ADMIN | [`ReportConversationDto`](BACKEND_ENDPOINTS.md#dto-reportconversationdto) | Implementado | Admin: moderación |
| Válido o rechazado (ADR 0029). Al denunciante se le avisa que se revisó; al denunciado, solo si es válido y sin decir quién lo reportó. Un rechazo no tiene consecuencias para nadie. | [`/api/v1/admin/reports/:id/resolve`](BACKEND_ENDPOINTS.md#e-028) | POST | ADMIN | [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto) | Implementado | Admin: moderación |
| Enviado → en revisión (el denunciante lo ve en su lista). | [`/api/v1/admin/reports/:id/review`](BACKEND_ENDPOINTS.md#e-029) | POST | ADMIN | [`AdminReportDto`](BACKEND_ENDPOINTS.md#dto-adminreportdto) | Implementado | Admin: moderación |

## `admin/revenue`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| POST y no GET: deja un registro de auditoría, así que exige CSRF y Origin como toda escritura (otro sitio no puede hacer que el navegador del admin genere una exportación). | [`/api/v1/admin/revenue/exports`](BACKEND_ENDPOINTS.md#e-030) | POST | ADMIN | Archivo CSV (`text/csv; charset=utf-8`, `Content-Disposition: attachment`): UTF-8 con BOM, separador `;`, coma decimal | Implementado | Admin: panel de ingresos |
| Panel de ingresos: lista de pagos con quién pagó, plan, tipo, estado y fecha (ADR 0030). | [`/api/v1/admin/revenue/payments`](BACKEND_ENDPOINTS.md#e-031) | GET | ADMIN | [`RevenuePaymentListDto`](BACKEND_ENDPOINTS.md#dto-revenuepaymentlistdto) | Implementado | Admin: panel de ingresos |
| Panel de ingresos: registros con rol, localidad, plan actual y si pagó alguna vez. | [`/api/v1/admin/revenue/registrations`](BACKEND_ENDPOINTS.md#e-032) | GET | ADMIN | [`RevenueRegistrationListDto`](BACKEND_ENDPOINTS.md#dto-revenueregistrationlistdto) | Implementado | Admin: panel de ingresos |
| Panel de ingresos: cobrado, reembolsos, contracargos y neto por período y plan, con el período anterior. | [`/api/v1/admin/revenue/summary`](BACKEND_ENDPOINTS.md#e-033) | GET | ADMIN | [`RevenueSummaryDto`](BACKEND_ENDPOINTS.md#dto-revenuesummarydto) | Implementado | Admin: panel de ingresos |

## `admin/reviews`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Oculta una reseña, con motivo. Auditado. | [`/api/v1/admin/reviews/:id/hide`](BACKEND_ENDPOINTS.md#e-034) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |
| Restaura una reseña oculta, con motivo. Auditado. | [`/api/v1/admin/reviews/:id/restore`](BACKEND_ENDPOINTS.md#e-035) | POST | ADMIN | Sin cuerpo | Implementado | Admin: moderación de reseñas y foro |

## `admin/sanctions`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Levanta una sanción. Suspensión y baneo: la cuenta vuelve a su estado (restore). | [`/api/v1/admin/sanctions/:id/lift`](BACKEND_ENDPOINTS.md#e-036) | POST | ADMIN | [`SanctionDto`](BACKEND_ENDPOINTS.md#dto-sanctiondto) | Implementado | Admin: moderación |

## `admin/strikes`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Anula un strike, con motivo. Auditado. | [`/api/v1/admin/strikes/:id/void`](BACKEND_ENDPOINTS.md#e-037) | POST | ADMIN | [`StrikeDto`](BACKEND_ENDPOINTS.md#dto-strikedto) | Implementado | Admin: moderación |

## `admin/subscriptions`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Cambio de plan de común acuerdo (FI §6.4): con motivo, historial y auditoría. | [`/api/v1/admin/subscriptions/:userId/plan`](BACKEND_ENDPOINTS.md#e-038) | POST | ADMIN | Sin cuerpo | Implementado | Admin: usuarios y ficha |

## `admin/support`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista paginada de consultas de soporte (filtrable por estado), las más viejas primero. | [`/api/v1/admin/support/tickets`](BACKEND_ENDPOINTS.md#e-039) | GET | ADMIN | `{ data: AdminTicketDto[], page, limit, total }` (`support.service.ts` `adminList`) | Implementado | Admin: soporte y novedades |
| Detalle de una consulta de soporte con todos sus mensajes. | [`/api/v1/admin/support/tickets/:id`](BACKEND_ENDPOINTS.md#e-040) | GET | ADMIN | [`AdminTicketDto`](BACKEND_ENDPOINTS.md#dto-adminticketdto) | Implementado | Admin: soporte y novedades |
| Cierra una consulta de soporte. Auditado. | [`/api/v1/admin/support/tickets/:id/close`](BACKEND_ENDPOINTS.md#e-041) | POST | ADMIN | [`AdminTicketDto`](BACKEND_ENDPOINTS.md#dto-adminticketdto) | Implementado | Admin: soporte y novedades |
| Respuesta del admin: en la plataforma (si tiene cuenta) y por email. | [`/api/v1/admin/support/tickets/:id/messages`](BACKEND_ENDPOINTS.md#e-042) | POST | ADMIN | [`AdminTicketDto`](BACKEND_ENDPOINTS.md#dto-adminticketdto) | Implementado | Admin: soporte y novedades |

## `admin/users`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Búsqueda por nombre o email, rol y estado (las cuentas anonimizadas no aparecen). | [`/api/v1/admin/users`](BACKEND_ENDPOINTS.md#e-043) | GET | ADMIN | [`AdminUserListDto`](BACKEND_ENDPOINTS.md#dto-adminuserlistdto) | Implementado | Admin: usuarios y ficha |
| Baja (ADR 0013 y 0016): restaurable con `restore` durante el período de gracia. | [`/api/v1/admin/users/:id`](BACKEND_ENDPOINTS.md#e-044) | DELETE | ADMIN | Sin cuerpo | Implementado | Admin: usuarios y ficha |
| Ficha completa: datos, suscripción, sanciones, strikes, reportes y pagos (FI §19). | [`/api/v1/admin/users/:id`](BACKEND_ENDPOINTS.md#e-045) | GET | ADMIN | [`AdminUserDetailDto`](BACKEND_ENDPOINTS.md#dto-adminuserdetaildto) | Implementado | Admin: usuarios y ficha |
| Edita datos de un cliente o profesional (ADR 0021): se aplican directo, con motivo. | [`/api/v1/admin/users/:id`](BACKEND_ENDPOINTS.md#e-046) | PATCH | ADMIN | [`PersonalDataDto`](BACKEND_ENDPOINTS.md#dto-personaldatadto) | Implementado | Admin: usuarios y ficha |
| Baneo: dura hasta que el admin lo levante; reemplaza a una suspensión en curso. | [`/api/v1/admin/users/:id/ban`](BACKEND_ENDPOINTS.md#e-047) | POST | ADMIN | [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) | Implementado | Admin: usuarios y ficha |
| Cambio de rol (ADR 0012): el perfil anterior queda inactivo (no se borra) y las sesiones se revocan para que el nuevo rol rija desde el próximo login. | [`/api/v1/admin/users/:id/change-role`](BACKEND_ENDPOINTS.md#e-048) | POST | ADMIN | [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) | Implementado | Admin: usuarios y ficha |
| Mensaje del admin a un usuario (FI §19): una notificación, auditada. | [`/api/v1/admin/users/:id/message`](BACKEND_ENDPOINTS.md#e-049) | POST | ADMIN | Sin cuerpo | Implementado | Admin: usuarios y ficha |
| Para el admin (solo lectura) o el propio profesional ya autorizado. | [`/api/v1/admin/users/:id/metrics`](BACKEND_ENDPOINTS.md#e-050) | GET | ADMIN | [`ProfessionalMetricsDto`](BACKEND_ENDPOINTS.md#dto-professionalmetricsdto) | Implementado | Admin: ficha del usuario (métricas) |
| Envía al email registrado del usuario un enlace de un solo uso (30 min) para elegir una contraseña nueva. El admin nunca ve ni define la contraseña. Motivo obligatorio y auditado. | [`/api/v1/admin/users/:id/password-reset`](BACKEND_ENDPOINTS.md#e-051) | POST | ADMIN | [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | Implementado | Admin: usuarios y ficha |
| Levanta una suspensión, un baneo o una baja todavía en período de gracia (ADR 0016). Vuelve a ACTIVE solo si la identidad está aprobada; si no, a PENDING_VERIFICATION. | [`/api/v1/admin/users/:id/restore`](BACKEND_ENDPOINTS.md#e-052) | POST | ADMIN | [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) | Implementado | Admin: usuarios y ficha |
| Cuenta comprometida (ADR 0014): cierra todos sus dispositivos. | [`/api/v1/admin/users/:id/revoke-sessions`](BACKEND_ENDPOINTS.md#e-053) | POST | ADMIN | Sin cuerpo | Implementado | Admin: usuarios y ficha |
| Aplica una sanción (advertencia, suspensión, baneo o perfil oculto). Con motivo, notificada y auditada. | [`/api/v1/admin/users/:id/sanctions`](BACKEND_ENDPOINTS.md#e-054) | POST | ADMIN | [`SanctionDto`](BACKEND_ENDPOINTS.md#dto-sanctiondto) | Implementado | Admin: usuarios y ficha |
| Agrega un strike (peso 1 a 3) a una cuenta, opcionalmente ligado a un reporte. Notificado y auditado. | [`/api/v1/admin/users/:id/strikes`](BACKEND_ENDPOINTS.md#e-055) | POST | ADMIN | [`StrikeDto`](BACKEND_ENDPOINTS.md#dto-strikedto) | Implementado | Admin: usuarios y ficha |
| Suspensión (ADR 0029): con fecha de fin se levanta sola al llegar (tarea horaria); sin fecha, hasta que el admin la levante. Queda en el historial de sanciones. | [`/api/v1/admin/users/:id/suspend`](BACKEND_ENDPOINTS.md#e-056) | POST | ADMIN | [`AccountSummaryDto`](BACKEND_ENDPOINTS.md#dto-accountsummarydto) | Implementado | Admin: usuarios y ficha |

## `announcements`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Texto completo, solo para quien la recibió. | [`/api/v1/announcements/:id`](BACKEND_ENDPOINTS.md#e-057) | GET | CUSTOMER, PROFESSIONAL | [`AnnouncementDto`](BACKEND_ENDPOINTS.md#dto-announcementdto) | Implementado | Ayuda: soporte, contacto y novedades |

## `auth`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Token CSRF para un frontend recién recargado (lo tenía solo en memoria). Funciona con la cookie de refresh, así sirve aunque el access haya vencido. CORS impide que otro sitio lea la respuesta. | [`/api/v1/auth/csrf`](BACKEND_ENDPOINTS.md#e-058) | GET | Público | [`CsrfTokenDto`](BACKEND_ENDPOINTS.md#dto-csrftokendto) | Implementado | Cliente HTTP (renovación de sesión y token CSRF) |
| Reenvía el email de verificación a la cuenta en sesión. | [`/api/v1/auth/email/resend`](BACKEND_ENDPOINTS.md#e-059) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Verificar email (/verificar-email) y aviso de reenvío |
| Verifica el email con el token del enlace recibido. | [`/api/v1/auth/email/verify`](BACKEND_ENDPOINTS.md#e-060) | POST | Público | Sin cuerpo | Implementado | Verificar email (/verificar-email) y aviso de reenvío |
| El botón "Entrar con Google" navega acá; redirige a Google. | [`/api/v1/auth/google`](BACKEND_ENDPOINTS.md#e-061) | GET | Público | 302 a Google | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Vuelta de Google. Redirige al frontend: `/ingresar/google?resultado=session\|link\|signup\|error` (con `codigo` si hubo error). Con `session`, las cookies de sesión ya quedaron puestas. | [`/api/v1/auth/google/callback`](BACKEND_ENDPOINTS.md#e-062) | GET | Público | 302 a `<FRONTEND_URL>/ingresar/google?resultado=session\|link\|signup\|error[&codigo=…]` | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Desvincular Google: solo si la cuenta tiene contraseña. | [`/api/v1/auth/google/link`](BACKEND_ENDPOINTS.md#e-063) | DELETE | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Vincular probando la contraseña de la cuenta existente. | [`/api/v1/auth/google/link`](BACKEND_ENDPOINTS.md#e-064) | POST | Público | [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Confirma con el enlace del email (puede abrirse en otro navegador): vincula e inicia sesión. | [`/api/v1/auth/google/link/confirm`](BACKEND_ENDPOINTS.md#e-065) | POST | Público | [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Vincular con un enlace al email de la cuenta existente. | [`/api/v1/auth/google/link/email`](BACKEND_ENDPOINTS.md#e-066) | POST | Público | Sin cuerpo | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Datos de la vinculación o del registro pendiente (cookie de 30 minutos). | [`/api/v1/auth/google/pending`](BACKEND_ENDPOINTS.md#e-067) | GET | Público | [`GooglePendingDto`](BACKEND_ENDPOINTS.md#dto-googlependingdto) | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Registro con Google: completa los datos obligatorios y queda en PENDING_VERIFICATION. | [`/api/v1/auth/google/register`](BACKEND_ENDPOINTS.md#e-068) | POST | Público | [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) | Implementado (requiere credenciales) | Ingresar / registrarse con Google |
| Login con contraseña. Se auditan los intentos (SEG §20.2) con la IP seudonimizada; un email que no existe queda sin usuario asociado (no se guarda el email). | [`/api/v1/auth/login`](BACKEND_ENDPOINTS.md#e-069) | POST | Público | `SessionResponseDto` (`{ user, csrfToken }`) o, para el admin, `MfaRequiredDto` (`{ mfaRequired: true }`) + cookie `nx_mfa` | Implementado | Ingresar (y segundo factor del admin) |
| Tolerante: borra las cookies aunque la sesión ya no exista. Si existe, exige CSRF. | [`/api/v1/auth/logout`](BACKEND_ENDPOINTS.md#e-070) | POST | Público | Sin cuerpo | Implementado | Mi cuenta: dispositivos y cerrar sesión |
| Cierra todas las sesiones de la cuenta (todos los dispositivos) y borra las cookies. | [`/api/v1/auth/logout-all`](BACKEND_ENDPOINTS.md#e-071) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED) | Sin cuerpo | Implementado | Mi cuenta: dispositivos y cerrar sesión |
| Usuario en sesión: datos, estado, verificación, fotos y métodos de acceso (contraseña, Google). | [`/api/v1/auth/me`](BACKEND_ENDPOINTS.md#e-072) | GET | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED) | [`MeDto`](BACKEND_ENDPOINTS.md#dto-medto) | Implementado | Sesión actual (layout, guardas de rutas) |
| Devuelve el id del usuario o null si el desafío es inválido o venció. | [`/api/v1/auth/mfa/verify`](BACKEND_ENDPOINTS.md#e-073) | POST | Público | [`SessionResponseDto`](BACKEND_ENDPOINTS.md#dto-sessionresponsedto) | Implementado | Ingresar (y segundo factor del admin) |
| Cambio con la contraseña actual: cierra los demás dispositivos y conserva el actual. | [`/api/v1/auth/password/change`](BACKEND_ENDPOINTS.md#e-074) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |
| Apagado por defecto (ADR 0002): responde 404 mientras PASSWORD_SELF_RESET_ENABLED=false. | [`/api/v1/auth/password/forgot`](BACKEND_ENDPOINTS.md#e-075) | POST | Público | [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | Apagado | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |
| Usa el enlace del email (lo dispara el admin, ADR 0002). Cierra todas las sesiones. | [`/api/v1/auth/password/reset`](BACKEND_ENDPOINTS.md#e-076) | POST | Público | Sin cuerpo | Implementado | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |
| Cuentas solo Google: crear la primera contraseña, con un login reciente (ADR 0023). | [`/api/v1/auth/password/set`](BACKEND_ENDPOINTS.md#e-077) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Contraseña: cambiar, crear (cuentas Google) y restablecer (/restablecer-contrasena) |
| Rota el refresh y renueva el access. Exige el token CSRF del dispositivo (se valida acá porque el access puede estar vencido). Reutilizar un refresh ya rotado revoca toda la familia. | [`/api/v1/auth/refresh`](BACKEND_ENDPOINTS.md#e-078) | POST | Público | [`CsrfTokenDto`](BACKEND_ENDPOINTS.md#dto-csrftokendto) | Implementado | Cliente HTTP (renovación de sesión y token CSRF) |
| Registro de cliente o profesional. Responde siempre 202 con un mensaje genérico (exista o no el email). | [`/api/v1/auth/register`](BACKEND_ENDPOINTS.md#e-079) | POST | Público | [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | Implementado | Registro (cliente o profesional) |
| Dispositivos activos del usuario: la fila vigente de cada familia. | [`/api/v1/auth/sessions`](BACKEND_ENDPOINTS.md#e-080) | GET | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED) | Array de [`SessionSummaryDto`](BACKEND_ENDPOINTS.md#dto-sessionsummarydto) | Implementado | Mi cuenta: dispositivos y cerrar sesión |
| Cierra un dispositivo propio. 404 si no existe o no es del usuario (no confirma existencia). | [`/api/v1/auth/sessions/:id`](BACKEND_ENDPOINTS.md#e-081) | DELETE | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED) | Sin cuerpo | Implementado | Mi cuenta: dispositivos y cerrar sesión |
| "No fui yo" del email de dispositivo nuevo (ADR 0031): cierra esa sesión sin estar logueado. Es POST (los servicios de email abren los enlaces para revisarlos): el enlace lleva a una página del frontend con un botón. | [`/api/v1/auth/sessions/close-by-link`](BACKEND_ENDPOINTS.md#e-082) | POST | Público | [`SessionClosedDto`](BACKEND_ENDPOINTS.md#dto-sessioncloseddto) | Implementado | Página /cerrar-sesion (enlace del email de dispositivo nuevo) |

## `catalog`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Orden (ADR 0022): plan, disponibles ahora, perfil más completo. | [`/api/v1/catalog/professionals`](BACKEND_ENDPOINTS.md#e-083) | GET | Público | [`CatalogPageDto`](BACKEND_ENDPOINTS.md#dto-catalogpagedto) | Implementado | Catálogo de profesionales (búsqueda y filtros) |
| Detalle con email y teléfono: límite más estricto contra la recolección de contactos (C-19). | [`/api/v1/catalog/professionals/:slug`](BACKEND_ENDPOINTS.md#e-084) | GET | Público | [`PublicProfileDto`](BACKEND_ENDPOINTS.md#dto-publicprofiledto) | Implementado | Perfil público del profesional |
| Reseñas públicas de un profesional del catálogo, las más recientes primero. | [`/api/v1/catalog/professionals/:slug/reviews`](BACKEND_ENDPOINTS.md#e-085) | GET | Público | [`ReviewPageDto`](BACKEND_ENDPOINTS.md#dto-reviewpagedto) | Implementado | Perfil público: reseñas |

## `chat`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Adjunto privado: enlace firmado de 5 minutos (Cloudinary) o el contenido (local). | [`/api/v1/chat/attachments/:fileId`](BACKEND_ENDPOINTS.md#e-086) | GET | CUSTOMER, PROFESSIONAL | 302 a un enlace firmado de 5 minutos (Cloudinary) o el binario con `Cache-Control: private, no-store` (local) | Implementado | Mensajes (lista de chats y conversación) |
| Mis conversaciones, las más recientes primero (hasta 100). | [`/api/v1/chat/conversations`](BACKEND_ENDPOINTS.md#e-087) | GET | CUSTOMER, PROFESSIONAL | Array de [`ConversationDto`](BACKEND_ENDPOINTS.md#dto-conversationdto) | Problemático | Mensajes (lista de chats y conversación) |
| Solo el cliente abre un chat, y solo con un profesional visible en el catálogo. | [`/api/v1/chat/conversations`](BACKEND_ENDPOINTS.md#e-088) | POST | CUSTOMER | [`ConversationDto`](BACKEND_ENDPOINTS.md#dto-conversationdto) | Parcial | Mensajes (lista de chats y conversación) |
| Una conversación propia: contraparte, último mensaje, no leídos y si puedo escribir. | [`/api/v1/chat/conversations/:id`](BACKEND_ENDPOINTS.md#e-089) | GET | CUSTOMER, PROFESSIONAL | [`ConversationDto`](BACKEND_ENDPOINTS.md#dto-conversationdto) | Problemático | Mensajes (lista de chats y conversación) |
| Mensajes de una conversación propia, paginados hacia atrás con `before`. | [`/api/v1/chat/conversations/:id/messages`](BACKEND_ENDPOINTS.md#e-090) | GET | CUSTOMER, PROFESSIONAL | Array de [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | Implementado | Mensajes (lista de chats y conversación) |
| Envía un mensaje (texto y/o hasta 5 adjuntos CHAT_ATTACHMENT). Avisa en tiempo real y notifica. | [`/api/v1/chat/conversations/:id/messages`](BACKEND_ENDPOINTS.md#e-091) | POST | CUSTOMER, PROFESSIONAL | [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | Implementado | Mensajes (lista de chats y conversación) |
| Confirmación de lectura: avisa al otro hasta dónde leyó. | [`/api/v1/chat/conversations/:id/read`](BACKEND_ENDPOINTS.md#e-092) | POST | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Mensajes (lista de chats y conversación) |
| Eliminar: siempre; se oculta para los dos. Guarda la versión original (ADR 0024). | [`/api/v1/chat/messages/:id`](BACKEND_ENDPOINTS.md#e-093) | DELETE | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Mensajes (lista de chats y conversación) |
| Solo durante los 15 minutos siguientes al envío. | [`/api/v1/chat/messages/:id`](BACKEND_ENDPOINTS.md#e-094) | PATCH | CUSTOMER, PROFESSIONAL | [`MessageDto`](BACKEND_ENDPOINTS.md#dto-messagedto-auth-dto-auth-responses-dto-ts) | Implementado | Mensajes (lista de chats y conversación) |

## `contracts`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Sin plan vigente, el profesional ve solo las contrataciones en curso (C-12, ADR 0027). | [`/api/v1/contracts`](BACKEND_ENDPOINTS.md#e-095) | GET | CUSTOMER, PROFESSIONAL | Array de [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Trabajos (contrataciones) |
| Una contratación propia (como cliente o profesional). | [`/api/v1/contracts/:id`](BACKEND_ENDPOINTS.md#e-096) | GET | CUSTOMER, PROFESSIONAL | [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Trabajos (contrataciones) |
| Avance o cancelación de la contratación (tabla de transiciones, ADR 0025). No exige plan: solo se mueven contrataciones en curso, y el profesional sin plan puede llevarlas hasta el cierre (C-12, ADR 0027). | [`/api/v1/contracts/:id/cancel`](BACKEND_ENDPOINTS.md#e-097) | POST | CUSTOMER, PROFESSIONAL | [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Trabajos (contrataciones) |
| Terminar: no hace falta que el cliente confirme (FI §11.4). | [`/api/v1/contracts/:id/complete`](BACKEND_ENDPOINTS.md#e-098) | POST | PROFESSIONAL | [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Trabajos (contrataciones) |
| Avance o cancelación de la contratación (tabla de transiciones, ADR 0025). No exige plan: solo se mueven contrataciones en curso, y el profesional sin plan puede llevarlas hasta el cierre (C-12, ADR 0027). | [`/api/v1/contracts/:id/schedule`](BACKEND_ENDPOINTS.md#e-099) | POST | PROFESSIONAL | [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Trabajos (contrataciones) |
| Empezar: la respuesta sugiere ponerse en "Trabajando" (C-30). | [`/api/v1/contracts/:id/start`](BACKEND_ENDPOINTS.md#e-100) | POST | PROFESSIONAL | [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Trabajos (contrataciones) |

## `customers`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Datos extra del cliente que ve el profesional (texto libre). | [`/api/v1/customers/me`](BACKEND_ENDPOINTS.md#e-101) | GET | CUSTOMER (PENDING_VERIFICATION, ACTIVE) | [`CustomerProfileDto`](BACKEND_ENDPOINTS.md#dto-customerprofiledto) | Implementado | Mi cuenta (cliente): datos para el profesional |
| Actualiza los datos extra del cliente (null o texto vacío los borra). | [`/api/v1/customers/me`](BACKEND_ENDPOINTS.md#e-102) | PATCH | CUSTOMER (PENDING_VERIFICATION, ACTIVE) | [`CustomerProfileDto`](BACKEND_ENDPOINTS.md#dto-customerprofiledto) | Implementado | Mi cuenta (cliente): datos para el profesional |

## `evidence`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Entrega un archivo privado ya autorizado por el llamador (adjuntos del chat): un enlace firmado de 5 minutos (Cloudinary) o el contenido (adaptador local). | [`/api/v1/evidence/:fileId`](BACKEND_ENDPOINTS.md#e-103) | GET | CUSTOMER, PROFESSIONAL, ADMIN | 302 a un enlace firmado (Cloudinary) o el binario (local) | Implementado | Reportar contenido / mis reportes |

## `favorites`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Mis favoritos; los que ya no aparecen en el catálogo vienen sin datos personales (`listed: false`). | [`/api/v1/favorites`](BACKEND_ENDPOINTS.md#e-104) | GET | CUSTOMER | Array de [`FavoriteDto`](BACKEND_ENDPOINTS.md#dto-favoritedto) | Implementado | Favoritos (cliente) |
| Quita un favorito. | [`/api/v1/favorites/:professionalId`](BACKEND_ENDPOINTS.md#e-105) | DELETE | CUSTOMER | Sin cuerpo | Implementado | Favoritos (cliente) |
| Activa o desactiva el aviso de disponibilidad de un favorito. | [`/api/v1/favorites/:professionalId`](BACKEND_ENDPOINTS.md#e-106) | PATCH | CUSTOMER | Sin cuerpo | Implementado | Favoritos (cliente) |
| Guarda (o actualiza) un favorito. Solo profesionales que aparecen en el catálogo. | [`/api/v1/favorites/:professionalId`](BACKEND_ENDPOINTS.md#e-107) | PUT | CUSTOMER | Sin cuerpo | Parcial | Favoritos (cliente) |

## `forum`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Lista pública y paginada de publicaciones del foro, con filtros. | [`/api/v1/forum/posts`](BACKEND_ENDPOINTS.md#e-108) | GET | Público | [`ForumPageDto`](BACKEND_ENDPOINTS.md#dto-forumpagedto) | Implementado | Foro |
| Crea una publicación del foro (clientes activos; profesionales con plan vigente). | [`/api/v1/forum/posts`](BACKEND_ENDPOINTS.md#e-109) | POST | CUSTOMER, PROFESSIONAL | [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) | Implementado | Foro |
| Borrar la publicación oculta también sus respuestas; las fotos se borran del almacenamiento. | [`/api/v1/forum/posts/:id`](BACKEND_ENDPOINTS.md#e-110) | DELETE | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Foro |
| Detalle público de una publicación con sus respuestas. | [`/api/v1/forum/posts/:id`](BACKEND_ENDPOINTS.md#e-111) | GET | Público | [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) | Implementado | Foro |
| Edita una publicación propia. | [`/api/v1/forum/posts/:id`](BACKEND_ENDPOINTS.md#e-112) | PATCH | CUSTOMER, PROFESSIONAL | [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) | Implementado | Foro |
| Quita el "me gusta" de una publicación. | [`/api/v1/forum/posts/:id/like`](BACKEND_ENDPOINTS.md#e-113) | DELETE | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Foro |
| Da "me gusta" a una publicación. | [`/api/v1/forum/posts/:id/like`](BACKEND_ENDPOINTS.md#e-114) | PUT | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Foro |
| Qué marcó con "me gusta" el usuario en una publicación (la lectura pública no sabe quién es). | [`/api/v1/forum/posts/:id/my-likes`](BACKEND_ENDPOINTS.md#e-115) | GET | CUSTOMER, PROFESSIONAL | [`ForumLikesDto`](BACKEND_ENDPOINTS.md#dto-forumlikesdto) | Implementado | Foro |
| Responde una publicación (o a otra respuesta) del foro. | [`/api/v1/forum/posts/:id/replies`](BACKEND_ENDPOINTS.md#e-116) | POST | CUSTOMER, PROFESSIONAL | [`ForumReplyDto`](BACKEND_ENDPOINTS.md#dto-forumreplydto) | Implementado | Foro |
| Resuelta: deja de admitir respuestas y sigue visible. | [`/api/v1/forum/posts/:id/resolve`](BACKEND_ENDPOINTS.md#e-117) | POST | CUSTOMER, PROFESSIONAL | [`ForumPostDetailDto`](BACKEND_ENDPOINTS.md#dto-forumpostdetaildto) | Implementado | Foro |
| Borra una respuesta propia. | [`/api/v1/forum/replies/:id`](BACKEND_ENDPOINTS.md#e-118) | DELETE | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Foro |
| Edita una respuesta propia. | [`/api/v1/forum/replies/:id`](BACKEND_ENDPOINTS.md#e-119) | PATCH | CUSTOMER, PROFESSIONAL | [`ForumReplyDto`](BACKEND_ENDPOINTS.md#dto-forumreplydto) | Implementado | Foro |
| Quita el "me gusta" de una respuesta. | [`/api/v1/forum/replies/:id/like`](BACKEND_ENDPOINTS.md#e-120) | DELETE | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Foro |
| Da "me gusta" a una respuesta. | [`/api/v1/forum/replies/:id/like`](BACKEND_ENDPOINTS.md#e-121) | PUT | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Foro |

## `health`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Liveness: el proceso responde. | [`/api/v1/health/live`](BACKEND_ENDPOINTS.md#e-122) | GET | Público | `{ status: "ok" }` | Solo infraestructura | Ninguna (monitoreo) |
| Readiness: además, la base de datos responde a tiempo. | [`/api/v1/health/ready`](BACKEND_ENDPOINTS.md#e-123) | GET | Público | `{ status: "ok" }` o 503 | Solo infraestructura | Ninguna (monitoreo) |

## `identity-verification`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| El usuario (cliente o profesional) inicia la verificación. Idempotente si ya hay un intento abierto. | [`/api/v1/identity-verification`](BACKEND_ENDPOINTS.md#e-124) | POST | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`StartVerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-startverificationresponsedto) | Implementado (proveedor manual) | Verificación de identidad |
| Último intento de verificación de identidad propio y su estado. | [`/api/v1/identity-verification/me`](BACKEND_ENDPOINTS.md#e-125) | GET | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`VerificationResponseDto`](BACKEND_ENDPOINTS.md#dto-verificationresponsedto) | Implementado | Verificación de identidad |

## `locations`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Localidades activas de una provincia (para registro y filtros). | [`/api/v1/locations/localities`](BACKEND_ENDPOINTS.md#e-126) | GET | Público | `Array<{ id, name }>` | Implementado | Selectores de provincia, localidad, barrio y oficio |
| Autocompletado de barrios: solo los aprobados por el admin (ADR 0010). | [`/api/v1/locations/neighborhoods`](BACKEND_ENDPOINTS.md#e-127) | GET | Público | `Array<{ id, name }>` (solo barrios aprobados) | Implementado | Selectores de provincia, localidad, barrio y oficio |
| Provincias activas. | [`/api/v1/locations/provinces`](BACKEND_ENDPOINTS.md#e-128) | GET | Público | `Array<{ id, name }>` | Implementado | Selectores de provincia, localidad, barrio y oficio |

## `moderation`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Apelación de un strike vigente o de una sanción vigente (una abierta por cada uno). | [`/api/v1/moderation/appeals`](BACKEND_ENDPOINTS.md#e-129) | POST | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED) | [`AppealDto`](BACKEND_ENDPOINTS.md#dto-appealdto) | Implementado | Estado de la cuenta, sanciones y apelaciones |
| Mis sanciones, strikes y apelaciones. Disponible también con la cuenta suspendida o baneada. | [`/api/v1/moderation/me`](BACKEND_ENDPOINTS.md#e-130) | GET | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED) | [`MyModerationDto`](BACKEND_ENDPOINTS.md#dto-mymoderationdto) | Implementado | Estado de la cuenta, sanciones y apelaciones |

## `notifications`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Mis notificaciones paginadas, con el total de no leídas. | [`/api/v1/notifications`](BACKEND_ENDPOINTS.md#e-131) | GET | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | `{ data: NotificationDto[], page, limit, total, unread }` (`notifications.service.ts` `list`) | Implementado | Campana / centro de notificaciones |
| Marca una notificación propia como leída. | [`/api/v1/notifications/:id/read`](BACKEND_ENDPOINTS.md#e-132) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Campana / centro de notificaciones |
| Mis preferencias de push por categoría (sin cambios, todas activadas). | [`/api/v1/notifications/preferences`](BACKEND_ENDPOINTS.md#e-133) | GET | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Array de [`NotificationPreferenceDto`](BACKEND_ENDPOINTS.md#dto-notificationpreferencedto) | Implementado | Ajustes de notificaciones y push |
| Actualiza las preferencias de push por categoría. | [`/api/v1/notifications/preferences`](BACKEND_ENDPOINTS.md#e-134) | PUT | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Array de [`NotificationPreferenceDto`](BACKEND_ENDPOINTS.md#dto-notificationpreferencedto) | Implementado | Ajustes de notificaciones y push |
| Clave pública VAPID para `pushManager.subscribe` (o `enabled: false` si no hay push). | [`/api/v1/notifications/push/key`](BACKEND_ENDPOINTS.md#e-135) | GET | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | [`PushKeyDto`](BACKEND_ENDPOINTS.md#dto-pushkeydto) | Implementado | Ajustes de notificaciones y push |
| Este navegador quiere avisos push (después de que la persona dio permiso). | [`/api/v1/notifications/push/subscriptions`](BACKEND_ENDPOINTS.md#e-136) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Ajustes de notificaciones y push |
| Este navegador ya no quiere avisos push. | [`/api/v1/notifications/push/subscriptions/remove`](BACKEND_ENDPOINTS.md#e-137) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Ajustes de notificaciones y push |
| Marca todas mis notificaciones como leídas. | [`/api/v1/notifications/read-all`](BACKEND_ENDPOINTS.md#e-138) | POST | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Campana / centro de notificaciones |
| Cantidad de notificaciones sin leer. | [`/api/v1/notifications/unread-count`](BACKEND_ENDPOINTS.md#e-139) | GET | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | `{ unread: number }` | Implementado | Campana / centro de notificaciones |

## `platform-reviews`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Públicas: solo las publicadas, de cuentas que siguen existiendo. | [`/api/v1/platform-reviews`](BACKEND_ENDPOINTS.md#e-140) | GET | Público | [`PlatformReviewPageDto`](BACKEND_ENDPOINTS.md#dto-platformreviewpagedto) | Implementado | Opiniones sobre la plataforma (home y Mi cuenta) |
| Borra mi opinión sobre la plataforma. | [`/api/v1/platform-reviews/me`](BACKEND_ENDPOINTS.md#e-141) | DELETE | CUSTOMER, PROFESSIONAL | Sin cuerpo | Implementado | Opiniones sobre la plataforma (home y Mi cuenta) |
| Mi opinión sobre la plataforma, si existe. | [`/api/v1/platform-reviews/me`](BACKEND_ENDPOINTS.md#e-142) | GET | CUSTOMER, PROFESSIONAL | [`PlatformReviewDto`](BACKEND_ENDPOINTS.md#dto-platformreviewdto) | Implementado | Opiniones sobre la plataforma (home y Mi cuenta) |
| Crea o reemplaza mi opinión sobre la plataforma (queda sin publicar hasta que la publique el admin). | [`/api/v1/platform-reviews/me`](BACKEND_ENDPOINTS.md#e-143) | PUT | CUSTOMER, PROFESSIONAL | [`PlatformReviewDto`](BACKEND_ENDPOINTS.md#dto-platformreviewdto) | Implementado | Opiniones sobre la plataforma (home y Mi cuenta) |

## `professionals`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Mi perfil profesional completo (incluye lo oculto por el plan o por el admin, con su estado). | [`/api/v1/professionals/me`](BACKEND_ENDPOINTS.md#e-144) | GET | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Datos del perfil. El admin también puede editarlos, con motivo y auditoría (ADR 0021). | [`/api/v1/professionals/me`](BACKEND_ENDPOINTS.md#e-145) | PATCH | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Cambia el estado de atención (disponible, trabajando, etc.). | [`/api/v1/professionals/me/attention-status`](BACKEND_ENDPOINTS.md#e-146) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Horario semanal completo (hora de Córdoba), sin franjas superpuestas en un mismo día. | [`/api/v1/professionals/me/availability`](BACKEND_ENDPOINTS.md#e-147) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Agrega una excepción de disponibilidad (días sin atención). | [`/api/v1/professionals/me/availability/exceptions`](BACKEND_ENDPOINTS.md#e-148) | POST | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Borra una excepción de disponibilidad propia. | [`/api/v1/professionals/me/availability/exceptions/:id`](BACKEND_ENDPOINTS.md#e-149) | DELETE | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Panel profesional: mi perfil |
| ADR 0020: se publica en el momento, como "certificado cargado por el profesional". | [`/api/v1/professionals/me/certifications`](BACKEND_ENDPOINTS.md#e-150) | POST | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`CertificationItemDto`](BACKEND_ENDPOINTS.md#dto-certificationitemdto) | Implementado | Panel profesional: mi perfil |
| Borra un certificado propio (y el archivo). | [`/api/v1/professionals/me/certifications/:id`](BACKEND_ENDPOINTS.md#e-151) | DELETE | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Panel profesional: mi perfil |
| Suma una imagen o un video (FI §6.3). Cuenta solo el total del plan (no el reparto presentación/trabajos, aprobado el 02/11/2026). El banner no cuenta; uno nuevo reemplaza al anterior. Imagen de banner: Medium o más; video de banner: Premium. | [`/api/v1/professionals/me/media`](BACKEND_ENDPOINTS.md#e-152) | POST | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`MediaItemDto`](BACKEND_ENDPOINTS.md#dto-mediaitemdto) | Implementado | Panel profesional: mi perfil |
| Borra un medio propio (y el archivo). | [`/api/v1/professionals/me/media/:id`](BACKEND_ENDPOINTS.md#e-153) | DELETE | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Panel profesional: mi perfil |
| Nuevo orden: hay que mandar todos los medios del profesional. | [`/api/v1/professionals/me/media/order`](BACKEND_ENDPOINTS.md#e-154) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Al bajar de plan: qué imágenes y videos mostrar dentro del límite (ADR 0026). | [`/api/v1/professionals/me/media/visible`](BACKEND_ENDPOINTS.md#e-155) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Las del propio profesional: solo con un plan vigente que las incluya. | [`/api/v1/professionals/me/metrics`](BACKEND_ENDPOINTS.md#e-156) | GET | PROFESSIONAL | [`ProfessionalMetricsDto`](BACKEND_ENDPOINTS.md#dto-professionalmetricsdto) | Implementado | Panel profesional: métricas (Premium) |
| Profesiones: entre 1 y las que permita el plan, con una principal (FI §6.3 y §7.1). | [`/api/v1/professionals/me/professions`](BACKEND_ENDPOINTS.md#e-157) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Lo mismo con las profesiones: la principal tiene que quedar visible. | [`/api/v1/professionals/me/professions/visible`](BACKEND_ENDPOINTS.md#e-158) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Zonas de trabajo (ADR 0010). Los barrios nuevos quedan PENDING y a nombre del profesional. | [`/api/v1/professionals/me/service-areas`](BACKEND_ENDPOINTS.md#e-159) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Reemplaza las redes sociales del perfil (solo enlaces https de cada red). | [`/api/v1/professionals/me/social-links`](BACKEND_ENDPOINTS.md#e-160) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |
| Reemplaza la personalización. Solo lo que admite el plan vigente (FI §6.3). | [`/api/v1/professionals/me/theme`](BACKEND_ENDPOINTS.md#e-161) | PUT | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`ProfessionalMeDto`](BACKEND_ENDPOINTS.md#dto-professionalmedto) | Implementado | Panel profesional: mi perfil |

## `professions`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Oficios activos. | [`/api/v1/professions`](BACKEND_ENDPOINTS.md#e-162) | GET | Público | `Array<{ id, name, slug }>` | Implementado | Selectores de provincia, localidad, barrio y oficio |

## `reports`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Reporta un perfil, mensaje, publicación, respuesta del foro o reseña, con motivo, descripción y hasta 3 fotos. | [`/api/v1/reports`](BACKEND_ENDPOINTS.md#e-163) | POST | CUSTOMER, PROFESSIONAL | [`MyReportDto`](BACKEND_ENDPOINTS.md#dto-myreportdto) | Parcial | Reportar contenido / mis reportes |
| Mis reportes y su estado. | [`/api/v1/reports/mine`](BACKEND_ENDPOINTS.md#e-164) | GET | CUSTOMER, PROFESSIONAL | Array de [`MyReportDto`](BACKEND_ENDPOINTS.md#dto-myreportdto) | Implementado | Reportar contenido / mis reportes |

## `requests`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Mis solicitudes (cliente), las más recientes primero (hasta 100). | [`/api/v1/requests`](BACKEND_ENDPOINTS.md#e-165) | GET | CUSTOMER | Array de [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| El cliente envía un pedido a uno o varios profesionales (cada uno en su chat). | [`/api/v1/requests`](BACKEND_ENDPOINTS.md#e-166) | POST | CUSTOMER | [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Parcial | Solicitudes y presupuestos |
| El cliente ve todo su pedido; cada profesional, solo su negociación. | [`/api/v1/requests/:id`](BACKEND_ENDPOINTS.md#e-167) | GET | CUSTOMER, PROFESSIONAL | [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| El cliente cancela el pedido (antes de elegir). | [`/api/v1/requests/:id/cancel`](BACKEND_ENDPOINTS.md#e-168) | POST | CUSTOMER | [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| El profesional retira su presupuesto vigente. | [`/api/v1/requests/quotes/:quoteId/withdraw`](BACKEND_ENDPOINTS.md#e-169) | POST | PROFESSIONAL | [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| Pedidos recibidos por el profesional (solo su negociación). | [`/api/v1/requests/received`](BACKEND_ENDPOINTS.md#e-170) | GET | PROFESSIONAL | Array de [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| El profesional no toma el pedido. | [`/api/v1/requests/targets/:targetId/decline`](BACKEND_ENDPOINTS.md#e-171) | POST | PROFESSIONAL | [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| Presupuesto: reemplaza al vigente si había uno. | [`/api/v1/requests/targets/:targetId/quotes`](BACKEND_ENDPOINTS.md#e-172) | POST | PROFESSIONAL | [`RequestDto`](BACKEND_ENDPOINTS.md#dto-requestdto) | Implementado | Solicitudes y presupuestos |
| El cliente elige al profesional: nace la contratación. | [`/api/v1/requests/targets/:targetId/select`](BACKEND_ENDPOINTS.md#e-173) | POST | CUSTOMER | [`ContractDto`](BACKEND_ENDPOINTS.md#dto-contractdto) | Implementado | Solicitudes y presupuestos |

## `reviews`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Reseña de una contratación terminada propia, dentro de los 30 días. | [`/api/v1/reviews`](BACKEND_ENDPOINTS.md#e-174) | POST | CUSTOMER | [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) | Implementado | Reseñas (mis reseñas / recibidas) |
| Borrar se puede siempre (ADR 0028). Queda la fila para moderación, fuera de la vista. | [`/api/v1/reviews/:id`](BACKEND_ENDPOINTS.md#e-175) | DELETE | CUSTOMER | Sin cuerpo | Implementado | Reseñas (mis reseñas / recibidas) |
| Dentro de los 30 días desde que terminó el trabajo. | [`/api/v1/reviews/:id`](BACKEND_ENDPOINTS.md#e-176) | PATCH | CUSTOMER | [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) | Implementado | Reseñas (mis reseñas / recibidas) |
| Respuesta pública del profesional (una; mandarla de nuevo la reemplaza). | [`/api/v1/reviews/:id/reply`](BACKEND_ENDPOINTS.md#e-177) | DELETE | PROFESSIONAL | [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) | Implementado | Reseñas (mis reseñas / recibidas) |
| Respuesta pública del profesional (una; mandarla de nuevo la reemplaza). | [`/api/v1/reviews/:id/reply`](BACKEND_ENDPOINTS.md#e-178) | PUT | PROFESSIONAL | [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) | Implementado | Reseñas (mis reseñas / recibidas) |
| Reseñas que escribí (cliente). | [`/api/v1/reviews/mine`](BACKEND_ENDPOINTS.md#e-179) | GET | CUSTOMER | Array de [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) | Implementado | Reseñas (mis reseñas / recibidas) |
| Reseñas que recibí (profesional). | [`/api/v1/reviews/received`](BACKEND_ENDPOINTS.md#e-180) | GET | PROFESSIONAL | Array de [`OwnReviewDto`](BACKEND_ENDPOINTS.md#dto-ownreviewdto) | Implementado | Reseñas (mis reseñas / recibidas) |

## `subscriptions`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Crea el pago y devuelve el enlace al checkout de Mercado Pago. | [`/api/v1/subscriptions/checkout`](BACKEND_ENDPOINTS.md#e-181) | POST | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`CheckoutResponseDto`](BACKEND_ENDPOINTS.md#dto-checkoutresponsedto) | Implementado (requiere credenciales) | Panel profesional: plan, prueba y pagos |
| Plan, límites y contador de días de la prueba (ADR 0017). | [`/api/v1/subscriptions/me`](BACKEND_ENDPOINTS.md#e-182) | GET | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`SubscriptionSummaryDto`](BACKEND_ENDPOINTS.md#dto-subscriptionsummarydto) | Implementado | Panel profesional: plan, prueba y pagos |
| Mis pagos de planes. | [`/api/v1/subscriptions/me/payments`](BACKEND_ENDPOINTS.md#e-183) | GET | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Array de [`PaymentItemDto`](BACKEND_ENDPOINTS.md#dto-paymentitemdto) | Implementado | Panel profesional: plan, prueba y pagos |
| Planes con lo que costaría hoy cada uno: el mes, la diferencia o por qué todavía no. | [`/api/v1/subscriptions/plans`](BACKEND_ENDPOINTS.md#e-184) | GET | PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Array de [`PlanOptionDto`](BACKEND_ENDPOINTS.md#dto-planoptiondto) | Implementado | Panel profesional: plan, prueba y pagos |

## `support`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Formulario de contacto público (FI §2.4): 3 por hora por IP. | [`/api/v1/support/contact`](BACKEND_ENDPOINTS.md#e-185) | POST | Público | — | Implementado | Ayuda: soporte, contacto y novedades |
| Mis consultas de soporte (hasta 50). | [`/api/v1/support/tickets`](BACKEND_ENDPOINTS.md#e-186) | GET | CUSTOMER, PROFESSIONAL | Array de [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) | Implementado | Ayuda: soporte, contacto y novedades |
| Crea una consulta de soporte con categoría, texto y una foto opcional. | [`/api/v1/support/tickets`](BACKEND_ENDPOINTS.md#e-187) | POST | CUSTOMER, PROFESSIONAL | [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) | Implementado | Ayuda: soporte, contacto y novedades |
| Una consulta de soporte propia con sus mensajes. | [`/api/v1/support/tickets/:id`](BACKEND_ENDPOINTS.md#e-188) | GET | CUSTOMER, PROFESSIONAL | [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) | Implementado | Ayuda: soporte, contacto y novedades |
| El usuario sigue la conversación; una consulta cerrada se reabre. | [`/api/v1/support/tickets/:id/messages`](BACKEND_ENDPOINTS.md#e-189) | POST | CUSTOMER, PROFESSIONAL | [`TicketDto`](BACKEND_ENDPOINTS.md#dto-ticketdto) | Implementado | Ayuda: soporte, contacto y novedades |

## `uploads`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Paso 1 de la subida: registra el archivo y devuelve el ticket para subirlo directo al almacenamiento. | [`/api/v1/uploads`](BACKEND_ENDPOINTS.md#e-190) | POST | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`CreateUploadResponseDto`](BACKEND_ENDPOINTS.md#dto-createuploadresponsedto) | Implementado | Componente de subida de archivos |
| Confirma la subida. Idempotente: un archivo ya READY se devuelve tal cual. | [`/api/v1/uploads/:id/complete`](BACKEND_ENDPOINTS.md#e-191) | POST | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`FileResponseDto`](BACKEND_ENDPOINTS.md#dto-fileresponsedto) | Implementado | Componente de subida de archivos |
| Contenido de un archivo público del adaptador local (solo desarrollo y tests). | [`/api/v1/uploads/:id/content`](BACKEND_ENDPOINTS.md#e-192) | GET | Público | Binario del archivo (solo almacenamiento local) | Solo desarrollo | Componente de subida de archivos |
| Destino del ticket con el adaptador local (desarrollo y tests). Con Cloudinary responde 404: el navegador sube directo a Cloudinary. | [`/api/v1/uploads/:id/content`](BACKEND_ENDPOINTS.md#e-193) | PUT | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Solo desarrollo | Componente de subida de archivos |

## `users`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Baja de la propia cuenta (ADR 0013 y 0016): exige la contraseña y cierra todas las sesiones. La cuenta queda desactivada durante el período de gracia y después se anonimiza. No disponible para cuentas suspendidas o baneadas (ADR 0007). | [`/api/v1/users/me`](BACKEND_ENDPOINTS.md#e-194) | DELETE | Cualquier rol autenticado (PENDING_VERIFICATION, ACTIVE) | Sin cuerpo | Implementado | Mi cuenta: datos personales y baja |
| Mis datos personales (incluye el nombre en revisión si lo hay). | [`/api/v1/users/me`](BACKEND_ENDPOINTS.md#e-195) | GET | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`PersonalDataDto`](BACKEND_ENDPOINTS.md#dto-personaldatadto) | Implementado | Mi cuenta: datos personales y baja |
| Datos personales (ADR 0021). Teléfono y barrio: inmediato. Nombre y apellido con la identidad aprobada: quedan en revisión del admin y en público se ve el anterior ( ameUnderReview). | [`/api/v1/users/me`](BACKEND_ENDPOINTS.md#e-196) | PATCH | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`PersonalDataDto`](BACKEND_ENDPOINTS.md#dto-personaldatadto) | Implementado | Mi cuenta: datos personales y baja |
| Foto de perfil (paso 2 del registro, ADR 0006): un archivo AVATAR propio ya confirmado. Con la identidad aprobada, la foto nueva queda en revisión del admin y se sigue viendo la anterior (ADR 0019). | [`/api/v1/users/me/avatar`](BACKEND_ENDPOINTS.md#e-197) | PUT | CUSTOMER, PROFESSIONAL (PENDING_VERIFICATION, ACTIVE) | [`AvatarResponseDto`](BACKEND_ENDPOINTS.md#dto-avatarresponsedto) | Implementado | Registro paso 2 / Mi cuenta: foto de perfil |

## `webhooks`

| Funcionalidad | Endpoint | Método | Roles | Datos accesibles | Estado backend | Interfaz futura |
| --- | --- | --- | --- | --- | --- | --- |
| Procesa un aviso del proveedor. La firma se valida en el adaptador; el resultado se consulta al proveedor (no se confía en el cuerpo). Idempotente por (provider, eventId). | [`/api/v1/webhooks/identity`](BACKEND_ENDPOINTS.md#e-198) | POST | Público | `{ received: true, outcome }` | Solo backend | Ninguna (servidor a servidor) |
| Aviso de Mercado Pago. Se valida la firma, se guarda una sola vez por id de aviso y se consulta el estado real del pago. Si el proveedor no responde, se responde error para que reintente. | [`/api/v1/webhooks/payments`](BACKEND_ENDPOINTS.md#e-199) | POST | Público | `{ received: true, outcome }` | Solo backend | Ninguna (servidor a servidor) |
