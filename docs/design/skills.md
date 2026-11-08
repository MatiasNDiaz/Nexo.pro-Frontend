# Skills de diseño y herramientas del rediseño

> Estado de las skills e integraciones que pide `interfacesserias.md` (§1 y §2). Verificadas el 2026-11-08 contra sus repositorios oficiales, sin agregadores.

## Instaladas

Ubicación: `.claude/skills/` del frontend (a nivel proyecto, fuera de git). Se instalaron **solo los archivos de instrucciones** (`SKILL.md`, referencias y licencia): ningún script, binario ni hook.

| Skill | Fuente (commit) | Licencia | Qué se instaló |
| --- | --- | --- | --- |
| Emil Kowalski: `emil-design-eng`, `animate`, `choreograph`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `animation-performance`, `animation-vocabulary`, `apple-design`, `break-ui`, `mobile-native`, `prototype`, `gestures` | [emilkowalski/skills](https://github.com/emilkowalski/skills) (`5206a95`) | MIT | Las 14 skills web, completas (son solo texto) |
| Impeccable (`impeccable`) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (`924bbd1`, skill v4.8.1) | Apache-2.0 | `SKILL.md` y `reference/*.md` |

No se instalaron, de Emil: `write-swift` y `animate-expo` (Swift y React Native), `ask-sonner` (el proyecto no usa Sonner) y `pick-ui-library` (propone librerías: cada dependencia nueva la aprueba el fundador).

## Lo que se dejó afuera y por qué

**Impeccable completo.** La instalación oficial (`npx impeccable install` o el plugin) agrega:
- un binario que se descarga en `~/.impeccable/bin/` en el primer uso, y que los hooks pueden ejecutar aunque se nieguen los comandos;
- un hook que corre su detector después de cada edición de UI;
- consultas al catálogo de `impeccable.style` en cada diseño nuevo, y telemetría;
- el **modo en vivo**, que puede ejecutar `claude` o `codex` **con los permisos y el sandbox desactivados** (`--permission-mode bypassPermissions` / `--dangerously-bypass-approvals-and-sandbox`).

Por eso no se copió `scripts/`, y se excluyeron las referencias `live.md`, `live-setup.md`, `generate.md`, `hooks.md`, `doctor.md` y `degraded/manual-edit-applier.md`. La skill tiene previsto el caso: si su lanzador no está, lee el contexto del proyecto y sigue. Se pierden el detector automático y las variantes en vivo; queda todo su criterio (comandos `shape`, `critique`, `audit`, `polish`, `layout`, `typeset`, `colorize`, `animate`, `harden`, etc.).

**Taste (`Leonxlnx/taste-skill`, MIT, v2.5.1).** Se verificó la fuente original, pero **no se instaló como skill activa**:
- Trae en su propio encabezado un hook `Stop` que ejecuta `node gate.mjs` al terminar cada turno.
- Está hecha para construir páginas de empresa desde cero con su kit (copia `assets/` a `public/`, `starter.html`, `system.css`) y **sortea** paleta, tipografía, héroe y navegación con scripts ("deal, never choose by taste"). Eso choca con la identidad fija de Repara Ya y con Tailwind.
- Algunas de sus reglas contradicen decisiones del fundador: prohíbe las animaciones al hacer scroll (pedidas por él), exige teléfonos en formato no real (el footer lleva el teléfono real de contacto) y descarta reveal por secciones.
- Se activaría sola en este proyecto ("Next.js… redesign") y empujaría a romper esas decisiones.

Su criterio sí se usa como capa de revisión (§ "Criterios tomados de Taste", abajo).

**Para instalarla completa igual**, el fundador puede correr dentro de Claude Code: `/plugin marketplace add Leonxlnx/taste-skill` y después `/plugin install taste-skill@taste-skill`. Requiere Node 22+ y Chrome. Instala el hook.

## Integraciones

| Integración | Estado | Qué hace falta |
| --- | --- | --- |
| Figma (MCP oficial) | **No conectada.** No hay ningún servidor de Figma disponible en esta sesión | Conectar el MCP de Figma en Claude Code (`claude mcp add` con el servidor oficial de Figma, o el conector de Figma en la configuración de claude.ai) y compartir los archivos o frames de referencia. Mientras tanto no se usa Figma ni se simula haberlo consultado |
| GSAP | Disponible en npm (sin instalar todavía) | Se instala en la fase de animaciones (§5 de `interfacesserias.md` lo autoriza) |
| Playwright | Instalado y en uso (pruebas e2e y verificaciones en navegador real) | — |

## Criterios tomados de Taste (como revisión, sin su kit)

- Bordes izquierdo y derecho iguales; nada fuera de la grilla.
- Cada visual se ve a 1440, 1024, 768 y 390 px; nada vacío.
- Microinteracciones en hover: tarjeta enlazada que sube 2 px, foto que escala 1,02 a 1,03 dentro de su marco, botones que responden al presionar. Sin inclinaciones ni carruseles.
- Un solo sistema: un par de botones, un estilo de tarjeta, una escala de radios, un estilo de enlace; como mucho dos cajas anidadas.
- Áreas táctiles de 44 px fuera del texto corrido; nada fuera de la pantalla a 320 px.
- Sin violeta ni lavanda; sin fotos de stock presentadas como propias; sin reseñas, cifras ni clientes inventados.
- Bajo `prefers-reduced-motion` todo queda quieto y nada queda oculto.
