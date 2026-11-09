/**
 * Script en línea del <head> (layout raíz), antes de que hidrate el router de Next. Hace dos cosas:
 *
 * 1. Registra un listener de `popstate` ANTES que el de Next. Si una página dejó un manejador en
 *    `window.__reparaPopstate` y devuelve true, el evento no llega a Next y la página se encarga.
 * 2. Envuelve `document.startViewTransition`: si hay un paso pendiente en `window.__reparaVtUpdate`,
 *    lo corre una vez, después de que el navegador captura la página vieja y antes de que React
 *    aplique y mida la nueva.
 *
 * Lo usa el perfil del profesional (components/catalog/catalog-return.tsx): el "atrás" hacia el
 * catálogo se vuelve una navegación común que React anima, y el scroll del catálogo se repone en el
 * paso pendiente, así la tarjeta ya está en su lugar cuando React decide qué fotos vuelan.
 * Cuando la CSP lleve nonces, este script tiene que llevar el nonce.
 */
export const POPSTATE_GATE = `(function(){
addEventListener("popstate",function(e){var h=window.__reparaPopstate;if(typeof h==="function"&&h(e)===true)e.stopImmediatePropagation()});
var d=document,o=d.startViewTransition;if(typeof o!=="function")return;
d.startViewTransition=function(a){var h=window.__reparaVtUpdate;window.__reparaVtUpdate=void 0;
if(typeof h!=="function")return o.call(d,a);
var w=function(f){return function(){h();return typeof f==="function"?f.apply(this,arguments):void 0}};
return o.call(d,typeof a==="function"?w(a):Object.assign({},a,{update:w(a&&a.update)}))};
})();`;

declare global {
  interface Window {
    __reparaPopstate?: (event: PopStateEvent) => boolean;
    __reparaVtUpdate?: () => void;
  }
}
