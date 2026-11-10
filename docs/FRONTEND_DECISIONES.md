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
| Foro: lectura pública; publicar, responder, "me gusta", editar, borrar y resolver con cuenta activa (5.3) | Sin sesión se invita a ingresar; no se muestran botones que no se pueden usar |
| Respuestas eliminadas u ocultas se muestran como "Respuesta eliminada" solo si el backend las devuelve (cuando tienen respuestas) | Igual que el backend: se conserva el hilo sin mostrar el contenido |
| Contacto público con las mismas reglas que `ContactDto`, CAPTCHA si hay clave y aviso específico ante el límite de 3 por hora | El backend responde `{ received: true }`; el plazo que se comunica es de 48 a 72 horas hábiles |
| `robots.txt` permite todo; las páginas privadas no se bloquean ahí | Llevan `noindex`: un buscador bloqueado por robots no lo ve y podría listar la URL igual |
| `sitemap.xml` con páginas fijas, perfiles (hasta 1000) y foro (hasta 500), en caché de una hora | Cada página de la lista es un pedido al backend; si la API no responde, quedan las páginas fijas |
| La aparición al hacer scroll se dispara cuando asoman 40 px | Con un umbral en porcentaje, un bloque alto en el borde inferior quedaba como una franja vacía |

## Panel: cuenta, identidad y seguridad

| Decisión | Motivo |
| --- | --- |
| Secciones del panel según rol y estado: suspendida, bloqueada o admin ven solo Inicio y Seguridad | Es lo que el backend les permite; ocultarlo es solo experiencia, el backend autoriza cada pedido |
| Archivos en tres pasos (`POST /uploads` → subida → `POST /uploads/:id/complete`) | Contrato §8. A Cloudinary va un multipart con los campos firmados tal cual y **sin cookies ni token CSRF** (`credentials: "omit"`): es otro sitio. En desarrollo (almacenamiento local) el `PUT` va por el cliente de la API con la sesión |
| Tipo y peso de la foto se controlan antes de subir | Evita subidas inútiles; el backend vuelve a revisar el archivo real al confirmar |
| Datos personales: se envía solo lo que cambió | Con la identidad aprobada, mandar el nombre sin cambios lo volvería a poner en revisión |
| Solo "desvincular Google", no "vincular" desde el panel | El ingreso con Google decide por el email de Google: con uno distinto, el backend crearía otra cuenta (ADR 0015/0023) |
| El token CSRF se borra en la baja y en "cerrar en todos" **solo si salieron bien** | Con la contraseña incorrecta la sesión sigue: borrar el token antes rompía el segundo intento |
| La grilla del panel usa `minmax(0, 1fr)` | Con la columna automática, el menú horizontal del celular la estiraba a 514 px en pantallas de 412: el navegador agrandaba toda la página y el diálogo de baja quedaba con el botón fuera de la pantalla (encontrado en las pruebas) |
| Las pruebas de "sin scroll horizontal" comparan con el ancho configurado de la pantalla | En modo celular, si algo desborda, el navegador agranda el área y `scrollWidth - clientWidth` da 0: la prueba anterior nunca podía fallar en celular |
| El aviso "Transition was aborted… Document hidden" en desarrollo no se corrige | Lo produce el navegador cuando la pestaña queda oculta en medio de una transición entre páginas: se pierde la animación, no la navegación. El código solo usa `<ViewTransition>` de React |

## Panel del cliente: mensajes, pedidos y trabajos (5.1)

| Decisión | Motivo |
| --- | --- |
| Tiempo real con un solo socket (`features/chat/realtime.tsx`), conectado solo con cuenta activa de cliente o profesional | Contrato §10. La librería se carga con `import()`: no pesa en las páginas públicas |
| Los avisos se aplican a la caché; la lista de chats se actualiza en el navegador en vez de volver a pedirla | Armar la lista es caro en el backend (varias consultas por conversación). Solo se vuelve a pedir si llega un mensaje de un chat desconocido |
| Al reconectar se vuelve a pedir todo lo del chat; ante `UNAUTHORIZED` se renueva la sesión y se reintenta, como mucho 2 veces seguidas | Contrato §10: los avisos perdidos no se reenvían. El tope evita un bucle si la sesión ya no sirve |
| Los mensajes de sistema invalidan pedidos y trabajos | Cada cambio de un pedido o una contratación genera uno (flujos §7) |
| La lectura se confirma solo con la pestaña visible y cuando llega algo nuevo de la otra parte | No se avisa "visto" por tener el chat abierto en otra pestaña, ni se hace un pedido inútil al abrir un chat ya leído |
| Nombres en pedidos y trabajos tomados de la lista de chats (por `conversationId`) | H-05: `RequestDto` y `ContractDto` traen ids, no nombres |
| Adjuntos del chat dentro de la conversación con `<img>`/`<video>` nativos (al tocar la foto se abre entera) | Desde H-14 (backend `77c5582`) la API los sirve con `Cross-Origin-Resource-Policy: same-site`. No pasan por `next/image`: su optimizador los pediría desde el servidor, sin la sesión de la persona |
| Al elegir un profesional se va directo al trabajo | `POST /requests/targets/:id/select` devuelve la contratación (no el pedido) |
| Pedido desde el perfil a un solo profesional | El backend acepta hasta 10; elegir varios desde el catálogo queda para el rediseño |
| Los diálogos se cierran al desmontar su efecto (`components/ui/dialog.tsx`) | Con Cache Components, Next conserva oculta la página anterior y React desmonta sus efectos: un modal abierto (p. ej. "Pedir presupuesto" al enviar) dejaba la página nueva inerte, sin clics ni scroll (encontrado en la prueba real) |
| `PanelShell` envuelve `RequireSession` en `Suspense` | Lee la URL, que en las rutas con `[id]` recién existe al pedirlas (el build lo exige) |

## Panel del cliente: favoritos, reseñas y notificaciones (5.2)

| Decisión | Motivo |
| --- | --- |
| Favoritos solo para el cliente activo; el corazón cambia al instante y se deshace si el backend lo rechaza | El backend los permite solo a `CUSTOMER`. Las tres acciones responden 204 sin cuerpo: la lista se vuelve a pedir |
| El corazón de la tarjeta del catálogo va por encima del enlace de la tarjeta (`z-10`), no adentro | Un botón dentro de un enlace es un elemento interactivo anidado (inválido y confuso para lectores de pantalla) |
| La reseña se deja desde el detalle del trabajo terminado; "Mis reseñas" lista y avisa cuáles faltan | Una por contratación y dentro de los 30 días desde que terminó (ADR 0028). El nombre del profesional sale del chat del trabajo (H-05) |
| Notificaciones: la forma de la lista se tipa a mano (`features/notifications/api.ts`) | El OpenAPI no la declara; se tomó de `notifications.service.ts` (`toDto`) |
| La campana y el contador se vuelven a pedir con cada `notification:new` del tiempo real y, por las dudas, cada minuto | Con la cuenta por verificar no hay tiempo real, y una conexión cortada pierde avisos |
| Avisos push con un service worker propio y mínimo (`public/sw.js`): solo muestra avisos | No guarda páginas ni intercepta pedidos: no puede servir contenido viejo ni interferir con la sesión. Sin clave VAPID en el backend (`enabled: false`), la página lo explica en vez de ofrecer el botón |

## Comunidad y ayuda (5.3)

| Decisión | Motivo |
| --- | --- |
| La publicación del foro se arma en el servidor (caché, buscadores) y la interactividad corre en el navegador sobre esos datos (`ForumThread`) | Después de cada cambio se vuelve a pedir desde el navegador, fresca: la caché del servidor (minutos) no hace esperar a quien participa |
| Fotos de reportes, soporte y foro se suben al elegirlas (`ui/media-picker.tsx`) y el envío espera a que terminen | Los formularios mandan solo ids de archivos listos; así no se envía nada a medias |
| En soporte solo se enlazan las fotos propias | `GET /evidence/:fileId` las sirve solo a quien las subió (o al admin): las del equipo darían 403 |
| "Reportar" en perfiles, mensajes de la otra persona, foro y reseñas públicas; el motivo se elige entre los que tienen sentido para cada cosa | El backend acepta cualquier motivo; mostrar "No se presentó" para una reseña confundiría |
| Las sanciones se ven también con la cuenta suspendida, bloqueada o por verificar | El backend permite consultar y apelar en esos estados (para poder defenderse) |
| Las opiniones sobre la plataforma solo aparecen en el inicio si el equipo publicó alguna | Nunca se muestran opiniones inventadas |

## Perfil del profesional (etapa 6, primera parte)

| Decisión | Motivo |
| --- | --- |
| La personalización del plan se traduce en el frontend (`features/catalog/profile-theme.ts`): 12 colores con contraste ≥ 4,5:1 sobre blanco, 4 tipografías y 4 animaciones | El backend guarda solo nombres de listas cerradas (FI §6.3), nunca CSS del usuario. La tipografía "manuscrita" (Caveat) se descarga solo en las páginas que la usan |
| Sin portada propia, la cabecera usa una foto ilustrativa de su oficio teñida con su color | Una cabecera vacía se veía pobre; la foto es del sitio (Pexels), no se presenta como del profesional |
| El editor guarda cada sección por separado y deja en la caché el perfil que devuelve el backend | Casi todos los endpoints responden el perfil completo: no hace falta volver a pedirlo |
| Lo que el plan no incluye se muestra bloqueado con su explicación (portada, estilo, animación) | El backend igual lo rechaza (`PLAN_LIMIT_REACHED`, `THEME_NOT_IN_PLAN`); así nadie llena un formulario que va a fallar |
| Las páginas del panel declaran `instant = false` | Se arman en el navegador detrás de la sesión: Next 16 avisaba en desarrollo que no podía validarlas como navegación instantánea |
| Los bloques con `data-reveal` visibles al cargar llevan `suppressHydrationWarning` | El sistema de aparición puede marcarlos (`data-revealed`) antes de que React hidrate; la diferencia es intencional |

## Trabajo del profesional (etapa 6, segunda parte)

| Decisión | Motivo |
| --- | --- |
| Pedidos recibidos con el filtro "Para responder" por defecto y lo sin responder primero | Responder rápido es lo que más pesa para que lo elijan; el resto queda en "Todos" |
| El formulario de presupuesto viene precargado con el vigente | Cambiar un presupuesto es corregirlo, no escribirlo de nuevo; el backend reemplaza el anterior |
| La pantalla del trabajo es una sola para los dos roles (`statusFor` según el rol) | El profesional agenda, empieza y termina (con confirmación); la reseña solo la ve el cliente |
| Al pagar se redirige a Mercado Pago; `/suscripcion/resultado` consulta el estado y no aplica nada | El plan lo aplica el aviso firmado de Mercado Pago (ADR 0017/0026), nunca la vuelta del navegador, que se puede falsear |
| En la prueba gratis, pagar el plan propio dice "Pagar", no "Renovar", y se aclara que no se pierden días | Pagando durante la prueba, el mes empieza cuando la prueba termina (ADR 0026) |
| Las tarjetas de planes del panel van sobre fondo noche, como en el inicio | La tarjeta Basic es translúcida y sobre el fondo claro del panel no se leía |
| Métricas: un gráfico de barras de una serie a elección, con tooltip por barra, etiqueta solo en el máximo y vista de tabla | Una sola escala por gráfico (sin doble eje); la tabla cubre lectores de pantalla y a quien prefiere números |
| Sin Premium, métricas muestra qué incluye el plan en vez del error | El backend responde `PLAN_FEATURE_REQUIRED`; el pedido no se reintenta |
| En el celular, la fila del menú del panel se desplaza sola hasta la sección actual | Se mueve solo la fila (`scrollLeft`), nunca la página |

## Panel del admin: resumen y usuarios (7.1)

| Decisión | Motivo |
| --- | --- |
| El panel del admin vive en `/panel/admin/...` con el mismo marco y la misma sesión del panel; su "Inicio" es el resumen | Una sola forma de entrar y de cerrar sesión. `AdminOnly` arma las páginas solo para el admin: es experiencia, el backend responde 403 a cualquier otro rol |
| La etapa 7 se divide en 7.1 (resumen y usuarios), 7.2 (moderación) y 7.3 (soporte, opiniones, novedades e ingresos) | Son 56 rutas del backend: cada parte se revisa por separado |
| En el resumen, las tarjetas de lo pendiente (reportes, apelaciones, soporte, identidades y pagos) van sin enlace hasta que existan sus secciones | No llevar a una página que todavía no existe |
| Los filtros de la búsqueda viven en la URL (`q`, `rol`, `estado`, `pagina`) | Al volver de una ficha, la búsqueda queda como estaba |
| La ficha ofrece solo las acciones válidas para el estado de la cuenta (`accountActions`, mismas reglas que `accounts.service.ts`) | Evita el `409 INVALID_STATE_TRANSITION`, cuyo texto del backend nombra estados en inglés; si igual llega (la cuenta cambió en otra pestaña), se muestra un texto propio |
| Toda acción se confirma en un diálogo con motivo obligatorio (10 a 500 caracteres; 5 para levantar una sanción o anular un strike) | El backend lo exige y lo guarda en la auditoría. Al terminar se vuelve a pedir la ficha: lo que se ve siempre es lo que dice el backend |
| Suspender y bloquear se hacen desde "Sancionar" (`POST /admin/users/:id/sanctions`), no desde `/suspend` y `/ban` | Es la misma operación en el backend y así las cuatro sanciones están en un solo lugar |
| El cambio de rol se intenta primero sin datos; si el backend pide barrio u oficio y zonas, aparecen los campos del registro | Si la cuenta ya tuvo ese rol, el backend reutiliza sus datos. El intento fallido corre en una transacción y no deja nada a medias |
| Editar datos manda solo lo que cambió | El backend aplica lo que recibe; mandar todo registraría cambios que no hubo |
| Las métricas del profesional en la ficha usan el mismo tablero que ve el profesional (`MetricsBoard`) | El admin las ve aunque el profesional no tenga Premium (E-050) |

## Panel del admin: moderación y negocio (7.2 y 7.3)

| Decisión | Motivo |
| --- | --- |
| El menú del admin tiene tres grupos: Administración (resumen, usuarios), Moderación (reportes, apelaciones, identidades, barrios) y Negocio (soporte, opiniones, novedades, ingresos) | Encontrar cada cola sin buscar; el resumen enlaza a cada una con su número |
| El reporte muestra el contenido como estaba (`target`) y las acciones según lo reportado: ocultar o volver a mostrar foro y reseñas; strike o sanción al reportado | Decidir con el contenido a la vista. El texto del usuario se muestra como texto (nunca HTML) |
| "Strike o sanción" desde un reporte abre la ficha con `?reporte=` y el strike o la sanción quedan vinculados a ese reporte | El backend guarda el `reportId`; así se sabe por qué se aplicó |
| La conversación de un reporte de mensaje se abre a pedido, avisando que queda en la auditoría | C-32: cada acceso del admin al chat se audita; no se abre sin querer |
| El contenido de un profesional (fotos, videos, certificados y datos) se modera desde su ficha | Hacía falta un endpoint de lectura: `GET /admin/professionals/:userId/profile` (etapa 15 del backend), lo mismo que ve el profesional, con los ocultos y su motivo |
| Barrios: aprobar, renombrar y fusionar (eligiendo un barrio aprobado de la misma localidad) | Los barrios escritos por clientes y profesionales quedan pendientes hasta que el admin los revisa |
| Novedades: se confirma antes de publicar, diciendo a quiénes les llega | No se puede deshacer: le llega a cada cuenta activa del segmento |
| Ingresos: resumen (neto, cobrado, devoluciones y comparación), pagos, registros y pagos de Mercado Pago, con exportación a CSV | ADR 0030. El gráfico es una sola serie (neto por período) con tabla; sin movimientos, un aviso en vez de un gráfico vacío |
| Las respuestas a consultas del formulario público avisan que todavía no llegan | Van por email y falta el proveedor (H-03) |

## Diseño por sección de la página del profesional (ADR 0034 del backend)

| Decisión | Motivo |
| --- | --- |
| La página pública vive en un componente compartido (`features/catalog/profile-view.tsx`) que usan la ruta pública y el editor (`/panel/perfil/diseno`) | El editor muestra exactamente lo que van a ver los clientes; `preview` quita las acciones reales (contactar, guardar, reportar) |
| Cada contenedor tiene un menú ⋮ con Color de fondo, Color de letra, Tamaño y Animación; lo que el plan no incluye se ve con la etiqueta Premium, deshabilitado | Pedido del fundador. Medium: fondo y letra sólidos. Premium: además degradé, tamaño (85–125 %) y 6 animaciones |
| El color de letra se aplica redefiniendo los colores del sistema dentro de la sección (`--color-ink`, grises, cajas internas) | Así el texto y las tarjetas de adentro siguen el color elegido. `brand-800` no se redefine: es la letra de las etiquetas con fondo claro propio |
| Solo se aplican colores `#rrggbb` (también en el frontend), en atributos `style` de React | Nunca CSS armado con texto del usuario, aunque el backend dejara pasar algo raro |
| El editor muestra el contraste y avisa por debajo de 4,5:1, sin impedirlo | Es la página de cada profesional; el aviso evita que quede ilegible sin querer |
| Las animaciones de sección usan la aparición al hacer scroll (`data-reveal="anim-…"`) y respetan "reducir movimiento" | Un solo sistema de aparición; con movimiento reducido el contenido se ve directo |
| "Aplicar estilos" vence la caché de la página pública con una Server Action (`refreshPublicProfile`, `updateTag`) | Sin eso, la página tardaba hasta un minuto. Es pública: solo vence caché, valida el slug y está limitada (5 s por perfil, 30 por minuto) |
| El "Estilo" del editor de perfil manda las secciones guardadas más recientes y quita lo que el plan no incluye (`themeForLevel`) | El backend reemplaza el tema entero: con datos viejos pisaba el diseño por sección |
| En el editor, la columna lateral no queda fija (`sticky`) | Más alta que la pantalla, los menús de sus últimas tarjetas quedaban fuera de alcance |

## Arreglos encontrados al probar contra el backend real (10/11/2026)

| Problema | Causa | Arreglo |
| --- | --- | --- |
| En desarrollo, todo diálogo se cerraba apenas se abría | Strict Mode monta, desmonta y vuelve a montar los efectos; el evento `close` del desmontaje llegaba cuando el diálogo ya estaba abierto otra vez | `ui/dialog.tsx` ignora el `close` si el diálogo está abierto |
| En el celular, el panel medía 1298 px con notificaciones sin leer | El texto `sr-only` del contador (position absolute) no tenía bloque contenedor dentro de la fila que se desplaza | La fila del menú es `relative` |
| Buscar y tocar un filtro enseguida perdía la búsqueda (admin) | El filtro leía la URL antes de que el router la actualizara | `users-page.tsx` recuerda el último pedido en una referencia |
| Brillo quieto en la esquina de la tarjeta Premium | En reposo, la franja inclinada asomaba arriba a la izquierda (y con movimiento reducido quedaba en el borde) | El brillo es invisible fuera de su pasada y arranca más afuera (`shine-band`, `shine-hover`) |

## Interfaz: desplegables, transiciones y scroll

| Decisión | Motivo |
| --- | --- |
| Desplegables propios (`ui/listbox.tsx`, patrón "combobox de solo selección" de WAI-ARIA) en lugar de `<select>` | El nativo no toma la estética de la página (pedido del fundador). Teclado completo, búsqueda con más de 10 opciones y `FormListbox` para react-hook-form |
| La foto del profesional vuela entre su tarjeta y su perfil (`<ViewTransition>` con el mismo nombre) | Solo en navegaciones marcadas con el tipo `navegacion` (tarjeta, menú y "atrás"): así no se repite cuando el perfil termina de cargar |
| El esqueleto del perfil muestra la foto recién tocada (`PhotoStash`) | Si el perfil no estaba precargado, Next mostraba el esqueleto sin foto y el vuelo no se formaba en el primer toque |
| Script en el `<head>` (`lib/popstate-gate.ts`) que se registra antes que el router de Next | React resuelve sincrónicamente las navegaciones del botón "atrás" y no las anima: el perfil frena ese evento y pide la misma URL como navegación común. La CSP lo permite con `'unsafe-inline'` (ver "Content-Security-Policy") |
| Filtros, pestañas y paginación cambian el contenido sin mover la pantalla (`scroll={false}`) y la zona de resultados guarda un alto mínimo | Pedido del fundador: el salto hacia arriba al filtrar era incómodo |

## Content-Security-Policy (etapa 8)

`src/config/csp.ts` arma la política y `next.config.ts` la manda en todas las páginas.

- **Sin nonce.** Con `cacheComponents`, las partes estáticas de cada página se arman al compilar y no
  pueden llevar el nonce de cada visita: la guía de CSP de Next 16 lo marca como incompatible con el
  prerender parcial. Tener nonce obligaría a apagar `cacheComponents` en todo el sitio (más lento y
  más caro). Por eso los scripts en línea de Next quedan permitidos con `'unsafe-inline'`.
- **Todo lo demás, cerrado:**
  - `connect-src`: el sitio, la API (también `ws:`/`wss:` para el chat) y la subida a Cloudinary;
  - `img-src` y `media-src`: el sitio, Cloudinary y la API;
  - `script-src` y `frame-src`: solo Turnstile además del sitio;
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri` y `form-action` en `'self'`;
  - `upgrade-insecure-requests` solo si la API es https.

  Un script inyectado no puede mandar datos a otro servidor. La protección principal contra la
  inyección sigue siendo que React trata como texto todo lo que escriben los usuarios.
- **zod sin JIT** (`z.config({ jitless: true })` en `config/env.ts`): zod prueba `new Function` y,
  aunque sigue andando, el navegador reporta una violación de la CSP.
- **Prueba:** `e2e/smoke.spec.ts` recorre las páginas públicas y falla ante cualquier
  `securitypolicyviolation`.

## Lighthouse: avisos aceptados (etapa 8)

- **"Falta la meta description"** en el catálogo y el perfil. Las dos páginas la tienen. Next 16
  manda los metadatos de las páginas dinámicas en diferido a los navegadores y a Google, que
  ejecuta JavaScript. A los robots que solo leen HTML (Bing, Twitter, Slack, WhatsApp) se los manda
  en el `<head>`: comprobado con el User-Agent de Bingbot. Lighthouse se presenta como navegador.
- **HTTPS** en "buenas prácticas": solo en local (http); en producción el sitio va con https.

## 404

Las rutas inexistentes caen en `(sitio)/[...resto]` y muestran `(sitio)/not-found.tsx` dentro del layout del sitio. El `not-found.tsx` raíz es mínimo porque Next lo incluye en lo que manda a **todas** las páginas: con header y footer, cada página pesaba alrededor de un 25 % más.

Costo aceptado: sin JavaScript, el 404 se ve en blanco. El estado HTTP sigue siendo 404 con `noindex`, que es lo que importa para los buscadores, y el resto de la app necesita JavaScript igual.

Un perfil inexistente responde **200** con `noindex` y la pantalla de "no disponible". Es el comportamiento documentado de Next cuando `notFound()` ocurre después de empezar a enviar la página.

## Diferencias con el contrato del backend

| Tema | Detalle | Qué hace el frontend |
| --- | --- | --- |
| `PublicAvailabilityDto` | El OpenAPI declara `slots` y `exceptions` como `string[]`; el código devuelve objetos | Tipado a mano en `src/features/catalog/types.ts` según el código |
| `MfaRequiredDto` | No figura en el OpenAPI (el login declara solo la respuesta con sesión) | Tipado a mano en `src/features/session/api.ts` |
| `extraInfo` del cliente | El OpenAPI lo declara como objeto; `UpdateCustomerProfileDto` recibe y devuelve texto de hasta 300 caracteres | Tipado a mano en `src/features/account/api.ts` según el código |
## Pendientes y riesgos

| Tema | Detalle | Cuándo |
| --- | --- | --- |
| Límite del detalle de perfil desde el servidor de Next | Todos los pedidos del servidor salen de una IP: con muchos perfiles distintos sin caché podría llegar a 30 por minuto. Solución posible en el backend: reconocer al servidor del frontend con un encabezado secreto | Antes de producción |
| Avisos push en producción | El backend necesita sus claves VAPID; sin ellas la página explica que todavía no están activados | Antes de producción |
| Respuesta al formulario de contacto | El admin responde por email: sin proveedor real de email (H-03) no le llega a quien escribió | Antes de producción |
| Consentimiento de términos en el registro | El backend no registra la aceptación; los textos legales son provisorios | Con el texto legal definitivo |
| Cambio de plan y caché de la página pública | **Resuelto para el pago** (etapa 8): al confirmarse el pago en `/suscripcion/resultado`, `refreshAfterPlanChange` vence el perfil y el catálogo. Lo que cambia sin que el profesional esté mirando (vencimiento del plan, acción del admin) sigue tardando hasta un minuto; se resolvería con un aviso del backend al frontend | Aceptado |
| Aviso de React por el `<script>` del `<head>` | En desarrollo, la consola avisa "Encountered a script tag while rendering React component". Es solo un aviso: el script viene en el HTML del servidor y corre igual. Aceptado: pasarlo a `next/script` cambiaría el momento en que corre, y tiene que registrarse antes que el router | Aceptado (etapa 8) |
