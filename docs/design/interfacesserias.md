# Interfaces serias: rediseño integral de Repara Ya

> **Documento de referencia principal del rediseño.** Contiene, sin resumir ni recortar, las instrucciones del fundador para la etapa de rediseño (recibidas el 2026-11-08). Lo que sigue a la línea horizontal es el texto original.
>
> **Orden de trabajo pedido por el fundador:**
> 1. Terminar primero lo pendiente (en ese momento, la etapa 5.1 del frontend: mensajes, pedidos y trabajos), sin abandonarlo ni reemplazar lo existente sin necesidad, y verificar que compile y funcione. El rediseño visual no empieza antes.
> 2. Documentar estas instrucciones en este archivo.
> 3. Confirmar el estado: que el archivo existe y está completo, dónde quedó, qué tareas anteriores se terminaron, y los bloqueos o dependencias externas.
> 4. Ejecutar el rediseño por fases, con este documento como referencia principal, sin esperar otra instrucción. Si una integración o skill necesita una autorización, conexión o acción manual del fundador, explicar exactamente qué hace falta y seguir con lo que sí esté disponible. Al terminar, entregar un informe final con los cambios realizados y las pruebas ejecutadas.
>
> La prioridad sigue siendo terminar lo pendiente: el rediseño es la etapa siguiente, no un reemplazo del trabajo actual.
>
> Las decisiones técnicas ya tomadas siguen vigentes (`docs/FRONTEND_DECISIONES.md`), igual que el contrato con el backend (`docs/BACKEND_FRONTEND_CONTRACT.md`).

---

# REPARA YA — REDISEÑO INTEGRAL DE INTERFAZ, DESIGN ENGINEERING Y EXPERIENCIA DE USUARIO

## ROL Y OBJETIVO

Actuá como un equipo multidisciplinario compuesto por:

- Senior Product Designer.
- Senior UI/UX Designer.
- Design Engineer.
- Senior Frontend Developer especializado en Next.js y React.
- Especialista en animaciones web con GSAP.
- Especialista en accesibilidad, rendimiento y optimización web.

Tu objetivo es transformar la interfaz de Repara Ya en un producto digital de calidad comercial, con identidad visual propia, personalidad, excelente acabado y una experiencia de usuario memorable.

Actualmente la aplicación cuenta con desarrollo funcional y una arquitectura de frontend/backend que debe respetarse. Sin embargo, la interfaz necesita una evolución estética y de experiencia considerable.

No quiero una plantilla genérica de SaaS o marketplace.

Quiero una plataforma que parezca diseñada por un equipo profesional de producto digital.

**La prioridad es mejorar la experiencia visual y funcional de todos los usuarios: clientes, profesionales, administradores y visitantes.**

---

# 1. SKILLS OBLIGATORIAS

Antes de comenzar el rediseño, investigá e integrá las siguientes skills en Claude Code:

### A. Emil Kowalski — Design Engineering Skills

Repositorio de referencia:
https://github.com/emilkowalski

Identificá y verificá las skills de diseño e ingeniería de interfaces disponibles en sus fuentes oficiales.

Objetivos:

- Mejorar el criterio de diseño.
- Crear interfaces con personalidad.
- Mejorar transiciones y microinteracciones.
- Aplicar principios de design engineering.
- Mejorar la calidad visual del producto.
- Evitar soluciones visuales genéricas.

No inventes nombres de skills ni supongas que una skill existe. Verificá su repositorio, documentación e instrucciones de instalación.

### B. Impeccable

Repositorio:
https://github.com/pbakaus/impeccable

Integrá sus skills y utilizalas como referencia de diseño.

Quiero que incorpores especialmente su vocabulario y criterio profesional de diseño:

- Layout y composición.
- Maquetación.
- Jerarquía visual.
- Tipografía.
- Ritmo y espaciado.
- Contraste.
- Densidad visual.
- Alineación.
- Proporciones.
- Acabado visual.
- Estados interactivos.
- Consistencia entre componentes.

Prestá especial atención a los errores frecuentes del diseño generado por IA:

- Diseños excesivamente simétricos.
- Tarjetas repetidas en todas las secciones.
- Gradientes utilizados sin intención.
- Sombras genéricas.
- Tipografías sin personalidad.
- Espaciados inconsistentes.
- Iconografía decorativa sin propósito.
- Hero sections que parecen plantillas.
- Botones repetidos sin jerarquía.
- Exceso de elementos redondeados.
- Diseños que se ven bien individualmente, pero no forman un sistema coherente.

Quiero que identifiques estos problemas y los corrijas.

### C. Taste Skill

Buscá e integrá la skill Taste desde su fuente original y verificá su procedencia.

Utilizala como una capa adicional de criterio estético.

Objetivos:

- Mejorar la sensibilidad visual.
- Tomar decisiones de diseño con intención.
- Evitar interfaces previsibles.
- Mejorar composición y proporciones.
- Conseguir una identidad visual reconocible.
- Priorizar calidad visual sobre cantidad de componentes.

No inventes la procedencia de la skill ni instales paquetes de terceros sin verificar.

### Reglas de instalación

1. Verificá cada repositorio y su documentación.
2. Confirmá que las skills sean compatibles con la versión actual de Claude Code.
3. Instalalas utilizando sus instrucciones oficiales.
4. No sobrescribas configuraciones existentes.
5. No elimines skills ya instaladas.
6. Documentá qué skills quedaron instaladas y dónde.
7. Si alguna no está disponible, documentá el motivo y continuá con las restantes.

---

# 2. FIGMA — REFERENCIAS VISUALES E INSPIRACIÓN

Quiero incorporar Figma al proceso de diseño.

Utilizá la integración oficial disponible, como Figma MCP, si está configurada y accesible.

Investigá interfaces y referencias visuales de:

- Marketplaces de servicios.
- Plataformas de contratación.
- SaaS modernos.
- Dashboards profesionales.
- Sistemas de mensajería.
- Landing pages de productos tecnológicos.
- Experiencias de onboarding.
- Interfaces con animaciones y transiciones sofisticadas.

Prestá especial atención a:

- Composición de hero sections.
- Navegación.
- Tarjetas de profesionales.
- Perfiles.
- Formularios.
- Dashboards.
- Estados vacíos.
- Microinteracciones.
- Transiciones de entrada y salida.
- Sistemas de diseño.

No copies diseños de otras marcas.

Utilizá las referencias para desarrollar una identidad original para Repara Ya.

Si Figma no está conectado, indicá qué integración hace falta. No simules haber accedido a archivos o diseños que no podés visualizar.

---

# 3. IDENTIDAD VISUAL DE REPARA YA

Mantené como punto de partida la identidad visual definida:

- Azul profesional: #123B7A
- Azul profundo: #0B1F3A
- Azul eléctrico: #3B82F6
- Ámbar: #F4A340
- Fondo claro: #F5F8FC
- Blanco: #FFFFFF
- Texto principal: #10213D
- Texto secundario: #64748B
- Bordes: #DCE5F2

No introduzcas turquesas ni verdes azulados.

La identidad debe transmitir:

- Confianza.
- Profesionalismo.
- Cercanía.
- Seguridad.
- Innovación.
- Rapidez.
- Calidad de servicio.

No quiero que todas las páginas sean idénticas. Debe existir un lenguaje visual compartido, pero cada sección necesita una composición adecuada a su función.

---

# 4. REDISEÑO DE TODA LA EXPERIENCIA

No te limites a la landing page.

Revisá y mejorá todas las rutas existentes.

## Visitantes y clientes

Priorizá:

- Landing page.
- Navegación pública.
- Catálogo de profesionales.
- Categorías.
- Filtros y búsqueda.
- Perfiles individuales.
- Registro y autenticación.
- Publicación de solicitudes.
- Mensajería.
- Notificaciones.
- Dashboard de clientes.
- Historial y seguimiento de actividad.

La experiencia debe facilitar encontrar un profesional o publicar una solicitud sin fricciones innecesarias.

## Profesionales

Priorizá:

- Registro profesional.
- Onboarding.
- Edición del perfil.
- Especialidades.
- Fotografías y trabajos realizados.
- Gestión de oportunidades.
- Solicitudes recibidas.
- Mensajería.
- Notificaciones.
- Dashboard.
- Suscripciones y beneficios.
- Configuración de cuenta.

El profesional debe sentir que está utilizando una herramienta que lo ayuda a desarrollar su actividad comercial.

## Administradores

Rediseñá las interfaces administrativas existentes.

Deben tener buena jerarquía, tablas legibles, filtros, indicadores y estados operativos claros.

No inventes módulos que no existan en el backend.

---

# 5. ANIMACIONES PROFESIONALES CON GSAP

Quiero utilizar GSAP para mejorar la experiencia de entrada y las transiciones importantes de la plataforma.

Documentación oficial:
https://gsap.com/docs/v3/

Instalá GSAP si todavía no está presente y utilizalo con criterio.

No quiero animaciones gratuitas por toda la aplicación.

Quiero animaciones que tengan intención, ritmo y una buena ejecución técnica.

## Animación principal de apertura — Hero / Intro

Quiero explorar una animación de bienvenida original para Repara Ya.

Concepto visual:

Dos manos aparecen desde los laterales de la pantalla.

- Desde la izquierda aparece una mano con un guante de trabajo, extendida y preparada para recibir algo.
- Desde la derecha aparece una mano femenina con manga corta, acercándose para entregar dinero.
- El intercambio representa visualmente la contratación y el pago de un servicio.

La animación debe transmitir confianza, trabajo y una relación comercial.

### Dirección de arte

No quiero que parezca una animación infantil, un clipart ni una ilustración genérica de IA.

Buscá una ejecución visual sofisticada.

Podés explorar:

- Ilustración 3D de alta calidad.
- Composición con imágenes originales.
- Elementos renderizados con iluminación realista.
- Animación de manos con estética editorial.
- Composición visual con profundidad.

Si el concepto no alcanza calidad visual suficiente, proponé una alternativa de dirección artística mejor antes de implementarlo.

No uses imágenes de stock genéricas como solución definitiva.

### Secuencia sugerida

1. Pantalla inicial limpia y elegante.
2. Aparición progresiva de la mano izquierda.
3. Entrada de la mano derecha.
4. Movimiento coordinado de ambas manos.
5. Entrega del dinero.
6. Breve pausa visual.
7. Transición hacia la landing principal.
8. Aparición del contenido del hero.

Utilizá GSAP Timeline para coordinar los movimientos.

La animación debe ser fluida, natural y profesional.

### Restricciones importantes

- No bloquear el acceso a la plataforma durante varios segundos.
- No repetir una animación extensa en cada navegación.
- Permitir omitirla.
- Respetar prefers-reduced-motion.
- Evitar cargas pesadas.
- Optimizar los recursos gráficos.
- Garantizar una experiencia correcta en móviles.
- Si la animación perjudica la conversión o el rendimiento, priorizá la experiencia funcional.

El concepto de entrega de dinero no debe hacer creer que Repara Ya procesa pagos dentro de la plataforma si esa funcionalidad no existe.

---

# 6. PLAYWRIGHT — PRUEBAS EN NAVEGADOR REAL

Quiero que Playwright sea una parte obligatoria del proceso.

Documentación:
https://playwright.dev/

Si todavía no está instalado, incorporalo correctamente y configurá su ejecución según el proyecto.

No quiero que evalúes la interfaz únicamente leyendo componentes o inspeccionando código.

Necesito que abras la aplicación en un navegador real y compruebes cómo se ve y funciona.

## Pruebas visuales

Probá al menos:

- 375 px de ancho.
- 390 px de ancho.
- 768 px de ancho.
- 1024 px de ancho.
- 1440 px de ancho.

Verificá:

- Overflow horizontal.
- Elementos superpuestos.
- Textos cortados.
- Imágenes deformadas.
- Menús.
- Formularios.
- Modales.
- Tarjetas.
- Navegación.
- Dashboards.
- Estados de carga.
- Errores visuales.
- Animaciones.
- Accesibilidad básica.

## Pruebas funcionales

Comprobá los recorridos reales:

- Visitante.
- Cliente autenticado.
- Profesional autenticado.
- Administrador, cuando haya un entorno de pruebas autorizado.

Verificá que los enlaces funcionen, que las acciones tengan respuesta y que los permisos se respeten.

No utilices cuentas reales ni ejecutes acciones destructivas en producción.

Si necesitás usuarios de prueba, utilizá datos de testing.

## Evidencia

Guardá capturas de pantalla de las principales páginas y tamaños.

Corregí los errores detectados y repetí las pruebas.

No informes una prueba como aprobada si no se ejecutó.

---

# 7. PERFORMANCE Y CALIDAD

La estética nunca debe destruir el rendimiento.

Priorizá:

- Carga rápida.
- Server Components cuando corresponda.
- Client Components solamente donde sean necesarios.
- Lazy loading.
- Optimización de imágenes.
- Carga eficiente de fuentes.
- Animaciones con transform y opacity cuando sea posible.
- Evitar layout thrashing.
- Limpieza de timelines y contextos GSAP.
- Evitar dependencias innecesarias.
- Evitar renders excesivos.

Comprobá que la animación de entrada no perjudique las métricas de Core Web Vitals.

---

# 8. REGLAS INNEGOCIABLES

- No modificar el backend.
- No inventar endpoints.
- No alterar contratos API.
- No reemplazar funcionalidades por mocks.
- No romper autenticación.
- No romper cookies, sesiones ni permisos.
- No eliminar funcionalidades existentes.
- No introducir dependencias sin justificación.
- No hacer un rediseño parcial dejando páginas con estilos incompatibles.
- No simular integraciones externas.
- No afirmar que Playwright ejecutó pruebas que no ejecutó.
- No comprometer la accesibilidad por decisiones estéticas.

Consultá la documentación oficial de Next.js, React, Tailwind, GSAP y Playwright cuando tengas dudas técnicas.

---

# 9. METODOLOGÍA DE EJECUCIÓN

Trabajá de manera ordenada:

### Fase 1 — Auditoría
Comprendé toda la aplicación, sus rutas, componentes, funcionalidades y arquitectura.

### Fase 2 — Skills
Verificá e instalá las skills solicitadas.

### Fase 3 — Referencias
Investigá referencias de Figma y definí una dirección artística.

### Fase 4 — Design System
Construí un sistema de diseño coherente.

### Fase 5 — Rediseño
Implementá las mejoras por módulos y por tipo de usuario.

### Fase 6 — GSAP
Implementá las animaciones que aporten valor, incluyendo la propuesta de apertura si alcanza calidad profesional.

### Fase 7 — Playwright
Probá la aplicación en navegador real y corregí problemas.

### Fase 8 — Revisión
Verificá consistencia, accesibilidad, responsive, rendimiento y funcionamiento.

Al finalizar, entregá un informe con:

- Skills instaladas.
- Integraciones disponibles.
- Archivos modificados.
- Páginas rediseñadas.
- Animaciones implementadas.
- Pruebas realizadas.
- Capturas generadas.
- Problemas detectados.
- Mejoras pendientes.

## RESULTADO ESPERADO

Repara Ya debe dejar de parecer una aplicación genérica y convertirse en un producto digital con identidad propia.

Quiero una interfaz moderna, sofisticada, memorable, profesional y visualmente atractiva.

El resultado tiene que estar a la altura de un marketplace comercial que pretende competir en serio en el mercado argentino.

**Diseñá con criterio. Programá con calidad. Probá en navegador real. No des por terminado algo solamente porque compila.**
