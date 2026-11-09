# Auditoría del backend de Repara Ya / Nexo PRO

> Estado real del backend (`Nexo.pro-Backend`) como fuente de verdad para construir el frontend. Se separan los **hechos comprobados en el código** de las **hipótesis** y las **recomendaciones**. Esta auditoría no modificó el backend, no ejecutó migraciones ni tocó la base de datos.

## 1. Alcance y método

- **Código auditado:**
  - commit `2fd5b64`, de la rama `checklist-produccion`;
  - ese commit solo agrega documentación sobre `main` (`42fc565`): el código es idéntico al de `main`.
- **Cómo se obtuvo el inventario:**
  - **Rutas, guards, DTO, entidades e índices:** se leyeron los metadatos que NestJS, class-validator, Swagger y TypeORM registran al cargar el código compilado (`dist`), sin levantar el servidor ni conectar a la base.
  - **Control cruzado:** las 199 rutas coinciden una a una con `docs/endpoints.md` del backend.
  - **Errores por ruta:** análisis estático de los servicios que llama cada controlador, siguiendo las llamadas a otros servicios y funciones auxiliares.
  - **Reglas de negocio, propiedad de recursos y estados:** lectura directa del código, con archivo y línea como evidencia.
- **Qué no se hizo:**
  - **Pruebas:** no se ejecutaron (ni unitarias ni e2e) ni se llamó a la API en vivo. Los hallazgos de comportamiento salen de la lectura del código.
  - **Producción:** no se verificaron la configuración real ni las credenciales de los servicios externos. Solo se documentan nombres de variables, nunca valores.
- **Clasificación de hallazgos:**
  - **Confirmado:** se ve en el código, con evidencia.
  - **Probable:** el código lo sugiere con fuerza, pero depende de datos o del entorno.
  - **Requiere verificación:** no se pudo establecer solo leyendo.
  - **Recomendación preventiva:** no es un defecto; es una mejora sugerida.

## 2. Arquitectura

| Aspecto | Realidad comprobada |
| --- | --- |
| Tipo | Monolito modular en NestJS 12.3, API REST versionada por URI (`/api/v1`) más Socket.IO para avisos |
| Lenguaje y entorno | TypeScript compilado a CommonJS, Node 26 |
| Base de datos | PostgreSQL 17 con TypeORM 1.1. Esquema por migraciones (26), sin `synchronize`. Usuario de runtime con permisos mínimos y otro para migraciones |
| Autenticación | JWT HS256 de corta duración en cookie `HttpOnly` más refresh rotativo con detección de reutilización. CSRF firmado por dispositivo. Admin con TOTP obligatorio. Contraseñas con argon2 |
| Autorización | Guards globales en orden: límite de pedidos → origen → autenticación → CSRF → estado de cuenta → rol. Deniega por defecto. La propiedad de cada recurso se valida en los servicios |
| Validación | `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted` |
| Errores | Formato único `{ statusCode, code, message, details, requestId, timestamp }`. Los 5xx no exponen detalles |
| Integraciones | Interfaz más adaptador real y simulado, elegidos por variable de entorno; los simulados están prohibidos en producción |
| Tareas programadas | 8 con `@Cron`: 7 usan un bloqueo de PostgreSQL (`pg_try_advisory_lock`) para no ejecutarse dos veces; la de alertas de seguridad (`monitoring.jobs.ts`) no lo usa. Además, las métricas se guardan cada minuto desde la memoria del proceso |
| Observabilidad | Logs JSON con pino (secretos redactados), `X-Request-Id`, Sentry opcional, `/health` |
| Despliegue previsto | Railway (API y base), Cloudinary, Mercado Pago, Cloudflare delante |

### Inventario

| Elemento | Cantidad |
| --- | --- |
| Módulos (`*.module.ts`, incluido `AppModule`) | 34 |
| Controladores | 44 |
| Rutas HTTP | 199 (GET 69, POST 86, PUT 17, PATCH 11, DELETE 16) |
| DTO | 223 |
| Entidades / tablas | 57 |
| Migraciones | 26 |
| Índices y restricciones extraídos | 125 |
| Decisiones de arquitectura (ADR) | 35 archivos en `docs/decisions/` |
| Pruebas | 32 archivos unitarios (`*.spec.ts`), 27 e2e (`test/*.e2e-spec.ts`) |

### Acceso a las rutas

| Acceso | Rutas |
| --- | --- |
| Públicas (sin sesión) | 33 |
| Cualquier usuario con sesión | 17 |
| Cliente y profesional | 45 |
| Solo cliente | 15 |
| Solo profesional | 32 |
| Cliente, profesional y admin | 1 |
| Solo admin | 56 |

### Módulos

| Área | Módulos | Rutas |
| --- | --- | --- |
| Cuentas y sesión | `auth` (contraseña, segundo factor, Google, sesiones), `users`, `audit` | `auth` 25, `users` 4, `customers` 2 |
| Profesionales | `professionals`, `professions`, `locations`, `catalog`, `metrics` | `professionals` 18, `catalog` 3, `locations` 3, `professions` 1 |
| Verificación | `identity-verification` | 2 (+ admin) |
| Archivos | `uploads`, `integrations/storage` | 4 |
| Contacto y trabajo | `chat`, `realtime`, `requests` (pedidos, presupuestos, contrataciones) | `chat` 9, `requests` 9, `contracts` 6 |
| Reputación y comunidad | `reviews` (incluye opiniones sobre la plataforma), `forum`, `favorites` | 7 + 4, 14, 4 |
| Plan y cobro | `subscriptions`, `payments`, `integrations/payments` | 4 + webhook |
| Moderación | `moderation` (reportes, strikes, sanciones, apelaciones, evidencias) | `reports` 2, `moderation` 2, `evidence` 1 (+ admin) |
| Comunicación | `notifications` (incluye push), `support` (incluye novedades) | 9, 5, `announcements` 1 |
| Administración | `admin` (panel, ingresos) | 56 rutas `/admin/*` en total entre módulos |
| Plataforma | `health`, `monitoring`, `database`, `integrations/*` (mail, identity, oauth, abuse, geo, push) | `health` 2, `webhooks` 2 |

## 3. Estado de implementación

### Completo en el backend

- **Registro y login:**
  - registro de cliente y profesional, verificación de email, login con bloqueo progresivo y CAPTCHA opcional;
  - renovación con rotación, cierre de sesión por dispositivo o de todos, aviso de dispositivo nuevo con cierre por enlace;
  - segundo factor del admin;
  - login, registro y vinculación con Google (ADR 0015 y 0023).
- **Cuenta:** estados, suspensión, baneo y restauración, baja con 30 días de gracia y anonimización.
- **Verificación de identidad:** manual, con revisión del admin y revisión de cambios de foto y nombre.
- **Perfil profesional:**
  - oficios, zonas, horarios, excepciones, estado de atención;
  - medios y certificados con límites por plan, temas y redes.
- **Catálogo:** búsqueda pública con filtros y perfil público.
- **Archivos:** subida directa en tres pasos con inspección real del contenido; adjuntos privados con enlaces firmados.
- **Chat:** REST más avisos en tiempo real, edición por 15 minutos, borrado, mensajes de sistema y regla C-12.
- **Trabajo:** solicitudes a varios profesionales, presupuestos, selección, contrataciones con historial.
- **Comunidad:** reseñas con respuesta, ventana de 30 días y moderación; opiniones sobre la plataforma; foro con "me gusta", resuelto y moderación; favoritos con aviso de disponibilidad.
- **Plan y cobro:** prueba de 30 días, checkout manual mensual, mejora con diferencia, renovación anticipada, vencimientos, reembolsos y contracargos, validación del aviso.
- **Moderación:** reportes con evidencia, strikes, sanciones manuales, apelaciones, barrios pendientes, aprobados y fusionados.
- **Comunicación:** soporte con formulario público, novedades segmentadas, notificaciones en la app con preferencias y push web.
- **Panel del admin:** usuarios, verificaciones, moderación, ingresos, métricas, alertas de seguridad.

### Parcial

| Función | Qué falta | Evidencia |
| --- | --- | --- |
| Email | No hay adaptador para un proveedor real: solo `console` y `memory` | `src/integrations/mail/`, `env.validation.ts:461` |
| Verificación de identidad | Solo manual; no hay proveedor KYC | `IDENTITY_PROVIDERS = ['manual', 'fake']` |
| Aviso de disponibilidad de favoritos | Solo cuando el profesional se pone "Disponible" a mano; el cambio por horario no avisa | `favorites.service.ts`, ADR del módulo |
| Panel del admin sobre solicitudes y contrataciones | No hay rutas de admin para listarlas o verlas | Inventario de rutas `/admin/*` |
| Registro de auditoría | Se escribe (`audit_logs`) pero no hay ruta para consultarlo | Inventario de rutas |

### Pendiente (no existe en el código)

- **Integraciones y canales:** facturación electrónica (AFIP), WhatsApp, chatbot de turnos, proveedor real de email, proveedor de KYC.
- **Cuenta:** "olvidé mi contraseña" autoservicio (existe, pero está apagado por decisión: ADR 0002).
- **Cobro:** débito automático, multas, intereses y sanciones automáticas; requieren aprobación expresa del fundador y no están implementados.
- **Datos:** descarga de datos de clientes; ubicación en tiempo real persistida.

## 4. Hallazgos

| # | Clasificación | Severidad para el frontend | Hallazgo | Evidencia |
| --- | --- | --- | --- | --- |
| H-01 | **Resuelto** (backend `0997e21`, 2026-11-04: `professionalUserId` en `CatalogItemDto` y `PublicProfileDto`, con e2e) | Alta | *Texto original:* `CatalogItemDto` y `PublicProfileDto` no incluyen el id de usuario del profesional ni el id del perfil. Sin embargo, `POST /chat/conversations` (`professionalId` = id de usuario), `PUT /favorites/:professionalId`, `POST /requests` (`professionalIds`) y `POST /reports` con `PROFILE` lo piden. **Desde el catálogo y el perfil público no se pueden iniciar esas acciones.** (El foro sí expone `userId` del autor; conversaciones y favoritos exponen ids.) | `src/catalog/catalog.service.ts` (armado del perfil cerca de la línea 296; `hydrate` cerca de la 374) |
| H-02 | **Resuelto** (backend `4e4f810`, 2026-11-04: reproducido con e2e antes del arreglo; la otra parte se lee con `withDeleted` y se muestra como «Cuenta eliminada»; `CounterpartDto.deactivated`; el profesional recibe `409 CUSTOMER_UNAVAILABLE` si el cliente dio de baja su cuenta) | **Alta** | *Texto original:* `toConversation` busca a la otra parte con `findOneByOrFail` sin `withDeleted`. La anonimización marca al usuario como borrado (`deletedAt`) y no toca las conversaciones; `EntityNotFoundError` no está mapeado en el filtro de errores, así que sería un **500**. Afecta a `GET /chat/conversations` (falla la lista entera), `GET /chat/conversations/:id` y `POST /chat/conversations` para quien chateó con una cuenta eliminada. Las reseñas tenían el mismo problema y ya se corrigieron con `withDeleted` | `src/chat/chat.service.ts:441`, `:121`; `src/users/account-anonymizer.ts:39`; `src/common/filters/all-exceptions.filter.ts:74` |
| H-03 | Confirmado | **Crítica para producción** | No hay proveedor real de email, y la validación del entorno rechaza `console` y `memory` en producción: **el backend no arranca con `NODE_ENV=production`**. Sin email tampoco hay verificación de cuenta, enlaces de Google ni avisos de seguridad | `src/config/env.validation.ts:34`, `:461` |
| H-04 | Confirmado | Baja | `GET /platform-reviews/me` responde `200` con cuerpo vacío (no `null` en JSON) cuando no hay opinión | Controlador de opiniones de la plataforma |
| H-05 | Confirmado | Media | `RequestDto` y `ContractDto` devuelven ids de cliente y profesional, sin nombres ni foto. Para mostrarlos hay que cruzar con la conversación | `src/requests/dto/*` |
| H-06 | Confirmado | Baja | `GET /requests/:id` no exige plan vigente al profesional, mientras que `GET /requests/received` sí. Puede ser intencional (ver un pedido ya recibido), pero no está documentado | `src/requests/requests.service.ts` |
| H-07 | Confirmado | Media | Un cliente en `PENDING_VERIFICATION` no puede abrir consultas de soporte en la app (la ruta exige `ACTIVE`); solo le queda el formulario público | Matriz de permisos |
| H-08 | Confirmado | Baja | `GET /chat/conversations` devuelve como máximo 100 conversaciones, sin paginación | `src/chat/chat.service.ts:114` |
| H-09 | Confirmado | Media (para el panel) | No hay rutas de admin para solicitudes, contrataciones ni para consultar el registro de auditoría | Inventario de rutas |
| H-10 | Confirmado | Baja (documentación) | `docs/revision-seguridad.md` del backend habla de 187 rutas (hoy son 199) y su §8.2 sigue listando como pendiente el aviso de dispositivo nuevo, que ya está implementado (ADR 0031) | `docs/revision-seguridad.md` |
| H-11 | Confirmado | Mínima | Comentario con un error de tipeo ("(\nameUnderReview)") | `src/users/users.controller.ts:36-37` |
| H-12 | Confirmado | Restricción de despliegue | Las cookies son `SameSite=Lax`: el frontend y la API tienen que estar en el mismo sitio (mismo dominio registrable) o la sesión no viaja en `fetch` | `src/auth/services/auth-cookies.service.ts:40` |
| H-13 | **Resuelto** (backend `4e4f810`, 2026-11-04: se revisaron todas. Levantar una sanción de una cuenta anonimizada respondía 500: ahora se levanta y se audita sin reactivar la cuenta. La decisión de una verificación ya respondía 404 por `lockSubject`, que excluye las cuentas borradas. Las demás leen al usuario de la sesión o a uno recién escrito) | Media | *Texto original:* Otras lecturas con `findOneByOrFail` sobre usuarios podrían fallar igual que H-02 si el usuario fue anonimizado. Por ejemplo, `sanctions.service.ts:223` al levantar una sanción. En la mayoría de los casos el usuario es el de la sesión, que no puede estar anonimizado | Búsqueda de `getRepository(User).findOneByOrFail` |
| H-14 | **Resuelto** (backend `77c5582`, 2026-11-08: `sendPrivateContent` manda `Cross-Origin-Resource-Policy: same-site` en adjuntos del chat y evidencias, también en la redirección; probado en navegador real) | Media | *Texto original:* `helmet()` manda `Cross-Origin-Resource-Policy: same-origin` en todas las respuestas, y `GET /chat/attachments/:fileId` no lo cambia (los archivos públicos locales sí mandan `cross-origin`). Con el frontend en otro origen (siempre: `app.` y `api.`, o puertos distintos en desarrollo), el navegador **bloquea** mostrar el adjunto en un `<img>` o `<video>`. Abrirlo en otra pestaña sí funciona. Posible arreglo: `same-site` en esa respuesta (y en las evidencias de reportes), que sigue bloqueando a otros sitios | `src/app.setup.ts:31`, `src/chat/chat.controller.ts:126` |

**Lo que se verificó y está bien:** la propiedad de recursos se valida en:
- chat (participación);
- solicitudes (bloqueo del destino propio, `customerId`);
- transiciones de contratación;
- reseñas, favoritos y foro;
- medios, certificados y excepciones del perfil;
- archivos (`findOwn` y bloqueo del archivo listo);
- evidencias (dueño o admin);
- soporte, notificaciones, novedades y sesiones.

La evidencia por recurso está en [BACKEND_ROLES_AND_PERMISSIONS.md](BACKEND_ROLES_AND_PERMISSIONS.md). Con esta lectura no se encontraron accesos a recursos ajenos (IDOR) en las rutas revisadas, lo cual **no** equivale a afirmar que el sistema sea totalmente seguro.

## 5. Inconsistencias

- **Identificadores:** el profesional se identifica con el **id de usuario** en chat, favoritos, solicitudes y reportes, y con el **slug** en las URLs públicas. Desde H-01 (resuelto) el catálogo devuelve los dos: `slug` y `professionalUserId`.
- **Paginación:** hay tres formas (`{data, meta}`, por fecha hacia atrás y lista completa), según el módulo.
- **"Sin plan":** no hay un código único (`SUBSCRIPTION_REQUIRED`, `PLAN_FEATURE_REQUIRED`, `PROFESSIONAL_UNAVAILABLE`, `PLAN_LIMIT_REACHED`, etc.).
- **Plan en solicitudes:** `GET /requests/:id` no exige plan y `GET /requests/received` sí (H-06).
- **Respuestas vacías:** `GET /platform-reviews/me` responde vacío (H-04); otras rutas de "mi …" devuelven `null` o `404`.
- **Documentación interna:** cantidad de rutas y pendientes de seguridad (H-10).

## 6. Riesgos

| Riesgo | Tipo | Comentario |
| --- | --- | --- |
| Salir a producción sin email | Hecho (H-03) | Bloqueante: el backend no arranca |
| ~~Bandeja de chat rota tras la primera anonimización~~ | Resuelto (H-02) | Reproducido con e2e y corregido en el backend `4e4f810` |
| Despliegue en dominios distintos | Hecho (H-12) | La sesión no funcionaría |
| Tiempo real con un solo proceso | Hipótesis | Las salas viven en memoria de un proceso; con varias réplicas, los avisos no llegarían a sockets de otra réplica. No hay adaptador de Redis. Hoy no es un problema si corre una sola instancia |
| Alertas de seguridad duplicadas con varias instancias | Hipótesis | La tarea de alertas no usa bloqueo; con más de una instancia podría avisar dos veces. Con una sola instancia no ocurre |
| Métricas en memoria | Hecho (ADR 0033) | Las visitas se guardan cada minuto; un reinicio puede perder hasta 1 minuto |
| Texto de usuarios con HTML | Riesgo del frontend | El backend no sanitiza HTML; si el frontend lo interpreta, hay XSS. Mostrar siempre como texto |

## 7. Restricciones para el frontend

Resumen; el detalle está en [BACKEND_FRONTEND_CONTRACT.md](BACKEND_FRONTEND_CONTRACT.md).

- **Sesión y tokens:**
  - sesión solo en cookies `HttpOnly`;
  - `credentials: 'include'` siempre;
  - ningún token en almacenamiento del navegador, en el cuerpo de pedidos propios ni en logs.
- **Encabezados en escrituras:** `X-Requested-With: XMLHttpRequest` en toda escritura, y `X-CSRF-Token` en toda escritura con sesión.
- **Token CSRF:** solo en memoria; `GET /auth/csrf` al recargar.
- **Renovación:** solo ante `ACCESS_TOKEN_EXPIRED`, un refresh a la vez, reintentar una sola vez.
- **Mismo sitio que la API** y origen exacto en `FRONTEND_ORIGINS`.
- **Archivos:** en tres pasos; nunca mandar cookies a Cloudinary.
- **Validación:** no mandar campos que el DTO no declara (`400`).
- **Errores:** decidir por `code`, mostrar `message`.
- **Estado de cuenta y plan:** decidir las pantallas con `GET /auth/me` y `GET /subscriptions/me`.
- **Páginas obligatorias:** `/verificar-email`, `/restablecer-contrasena`, `/vincular-google`, `/cerrar-sesion`, `/ingresar/google` y `/suscripcion/resultado`.
- **Contenido de usuarios:** siempre como texto.

## 8. Recomendaciones para la siguiente etapa

Ordenadas por impacto. Todas son **recomendaciones**: ninguna se implementó. Las que cambian el backend requieren tu aprobación, y las que cambian la base, mostrarte el cambio antes.

1. ~~**Exponer el id del profesional en catálogo y perfil público** (H-01).~~ Hecho el 2026-11-04 (backend `0997e21`).
2. ~~**Corregir `toConversation` con `withDeleted`** y una prueba e2e con la otra parte anonimizada (H-02). Revisar los demás `findOneByOrFail` sobre usuarios (H-13).~~ Hecho el 2026-11-04 (backend `4e4f810`).
3. **Elegir e integrar un proveedor de email** detrás de la interfaz existente (H-03). Requiere cuenta y credenciales tuyas.
4. **Definir el dominio de producción** con frontend y API en el mismo sitio (H-12).
5. **Agregar nombres y foto** a `RequestDto` y `ContractDto`, o una ruta resumen (H-05).
6. **Unificar** "sin plan" en un código común y la respuesta vacía de `GET /platform-reviews/me` (`null`). Son cambios de contrato: conviene hacerlos **antes** de que el frontend dependa del comportamiento actual.
7. **Generar los tipos del frontend desde el OpenAPI** del backend (Swagger ya describe las 199 rutas). Implica sumar una herramienta al frontend, que requiere tu aprobación.
8. **Actualizar `docs/revision-seguridad.md`** del backend (H-10) y corregir el comentario de H-11.
9. **Recomendación preventiva:** si se planea más de una instancia de la API, evaluar un adaptador compartido para Socket.IO antes de escalar.

## 9. Documentos de esta auditoría

| Documento | Contenido | Cómo se hizo |
| --- | --- | --- |
| [BACKEND_AUDIT.md](BACKEND_AUDIT.md) | Este informe: arquitectura, estado, hallazgos, riesgos y recomendaciones | A mano |
| [BACKEND_ENDPOINTS.md](BACKEND_ENDPOINTS.md) | Las 199 rutas con acceso, parámetros, cuerpo, respuesta, errores y evidencia; Anexo A (DTO) y Anexo B (catálogo de errores) | Generado de los metadatos más descripciones a mano |
| [BACKEND_ENTITIES_AND_RELATIONS.md](BACKEND_ENTITIES_AND_RELATIONS.md) | Las 57 tablas, columnas, relaciones, índices y datos sensibles | Introducción a mano más bloque generado |
| [BACKEND_ROLES_AND_PERMISSIONS.md](BACKEND_ROLES_AND_PERMISSIONS.md) | Roles, estados de cuenta, plan, propiedad de recursos, datos visibles por rol y matriz por ruta | A mano más matriz generada |
| [BACKEND_BUSINESS_FLOWS.md](BACKEND_BUSINESS_FLOWS.md) | Ciclos de vida y reglas de negocio con diagramas de estado | A mano |
| [BACKEND_INTEGRATIONS.md](BACKEND_INTEGRATIONS.md) | Servicios externos, variables (solo nombres), tiempo real y push | A mano |
| [BACKEND_FRONTEND_CONTRACT.md](BACKEND_FRONTEND_CONTRACT.md) | Reglas técnicas para consumir la API | A mano |
| [BACKEND_FRONTEND_MATRIX.md](BACKEND_FRONTEND_MATRIX.md) | Ruta → pantalla del frontend que la usa, rol y estado de implementación | Generado más reglas a mano |

**Para regenerar** los documentos generados después de cambios en el backend: compilar el backend y volver a correr los scripts de extracción (`extract.cjs`, `enrich.cjs`, `gen.cjs`). Hoy viven en la carpeta temporal de esta sesión: si se quieren conservar, hay que copiarlos a un lugar estable.
