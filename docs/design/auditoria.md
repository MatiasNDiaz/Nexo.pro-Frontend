# Rediseño · Fase 1: auditoría y dirección

> Evidencia: capturas en navegador real (Chromium, Playwright) de `/`, `/profesionales`, `/foro`, `/contacto`, `/ingresar` y `/registro` a 375, 390, 768, 1024 y 1440 px (2026-11-08), más las del panel tomadas en las pruebas reales de las etapas 4 y 5.1. Referencia: `interfacesserias.md`, `skills.md`.

## Lo que está bien y se conserva

- Sin desborde horizontal en las 30 combinaciones de página y ancho (la prueba lo vigila: `e2e/support/layout.ts`).
- Paleta fija con contraste verificado; foco visible; áreas táctiles de 44 px; reveal al hacer scroll que respeta `prefers-reduced-motion`.
- Arquitectura: Server Components en lo público, datos privados solo desde el navegador. El rediseño no la toca.

## Problemas (vocabulario de Impeccable)

| Dónde | Problema | Patrón de "diseño de IA" |
| --- | --- | --- |
| Inicio, "Cómo funciona" | Tres tarjetas iguales con ícono en un cuadrado, "Paso 1/2/3" | Simetría excesiva; tarjetas repetidas; iconografía decorativa |
| Inicio, bloque profesional | Caja oscura con cuatro mini tarjetas de ícono + texto | Tarjetas dentro de tarjetas; la misma receta otra vez |
| Inicio, cierre | Otra tarjeta blanca centrada con dos botones | Héroe y cierre de plantilla; botones repetidos sin jerarquía |
| Héroe | Etiqueta en píldora + título en dos colores + dos botones + maqueta oscura con lista | "Hero section" de plantilla SaaS; la maqueta no muestra el producto real |
| Todo el sitio | Mismo radio (2xl/3xl) en tarjetas, botones, inputs y bloques; sombra suave en todo | Exceso de redondeado; sombras genéricas; sin jerarquía de superficies |
| Encabezados de sección | Antetítulo en mayúsculas pequeñas ("CÓMO FUNCIONA", "CATÁLOGO") sobre cada título | Tic de plantilla |
| Tipografía | Plus Jakarta Sans + Inter, tamaños correctos pero sin contraste de escala ni voz | Tipografía sin personalidad |
| Catálogo vacío | Estado vacío genérico, sin camino alternativo (publicar un pedido, avisar cuando haya) | Estado vacío que no ayuda |
| Panel | Columnas de "SettingsSection" iguales en todas las pantallas; mensajes, pedidos y cuenta se ven igual | Sin composición por función (Impeccable: modo *Operate*) |
| Fondo del héroe | Cuadrícula tenue de fondo | Decoración sin intención |

## Dirección propuesta (a confirmar)

**Concepto: "oficio verificado".** Repara Ya no es un SaaS: es gente que arregla cosas, con la confianza puesta en la identidad verificada. La interfaz toma el lenguaje del taller y del comprobante, no el del dashboard genérico:

- **Tipografía con voz:** una display condensada y firme para títulos (de la familia de las rotulaciones de oficios) con Inter para el texto. Escala con contraste real (títulos grandes, cuerpo calmo).
- **Superficies con jerarquía:** radios chicos (6 a 10 px) en controles y tarjetas; los redondeados grandes, solo donde algo se toca con el dedo. Líneas (#DCE5F2) en lugar de sombras para separar; sombra solo en lo que flota.
- **Composición asimétrica en lo público:** el héroe muestra el producto real (una tarjeta de profesional y una conversación de presupuesto reales en estilo), no una lista de beneficios. "Cómo funciona" como un recorrido horizontal con un hilo, no tres cajas.
- **Ámbar con disciplina:** una sola acción principal por pantalla.
- **Panel en modo *Operate*:** densidad media, tablas y listas legibles, estados con color semántico; cada área con su composición (bandeja de mensajes de dos paneles, pedidos como comparador de presupuestos, trabajos como línea de tiempo).
- **Movimiento:** GSAP solo en la entrada del héroe y en momentos puntuales; el resto, transiciones CSS cortas (150 a 250 ms, curvas de `emil-design-eng`).

## Animación de apertura (manos y dinero): propuesta alternativa

El documento pide proponer otra dirección si el concepto no alcanza calidad profesional. Dos motivos para hacerlo:

1. **Calidad del recurso:** una mano con guante y una mano que entrega dinero, con iluminación realista o 3D, necesitan un render o una ilustración hechos a medida (Blender, un ilustrador o un banco con licencia). Desde acá no se pueden producir con esa calidad; dibujadas en SVG quedarían en el terreno del clipart que el documento descarta.
2. **Mensaje:** el billete en primer plano sugiere que Repara Ya cobra o procesa pagos dentro de la plataforma, cosa que no hace (el cliente paga el trabajo por fuera; la plataforma solo cobra la suscripción del profesional). El propio documento lo advierte.

**Alternativa recomendada: "el acuerdo".** Una apertura corta (menos de 1,8 s, se puede saltear, una vez por sesión, quieta con movimiento reducido) hecha con elementos de la marca en SVG y GSAP Timeline: una tarjeta de presupuesto que se arma (oficio, monto, fecha) y se sella con el distintivo de "identidad verificada", que se transforma en el logo y da paso al héroe. Transmite contratación, confianza y oficio sin prometer pagos, y pesa unos pocos KB.

**Si se quiere mantener las manos:** hace falta que el fundador consiga los dos recursos (PNG o WebP con transparencia o una secuencia de render, con licencia) y aclarar el texto para que no sugiera pagos dentro de la app. Con esos archivos, la animación se arma con la misma secuencia de 8 pasos del documento.

## Orden de trabajo propuesto

Las pantallas del profesional (etapa 6) y del administrador (etapa 7) todavía no existen en el frontend, y faltan 5.2 (favoritos, reseñas, notificaciones) y 5.3 (soporte, reportes). Para no diseñar dos veces:

1. Sistema de diseño (tokens, tipografía, componentes base) aplicado a todo lo que existe: público, autenticación y panel del cliente.
2. Héroe y apertura, una vez elegida la dirección.
3. Las etapas 5.2, 5.3, 6 y 7 se construyen directamente con el sistema nuevo.
