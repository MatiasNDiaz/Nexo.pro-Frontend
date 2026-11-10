/*
 * Service worker de Repara Ya: SOLO avisos push (no guarda páginas en caché ni intercepta pedidos).
 * El backend manda { title, body, tag, targetType, targetId } (notifications/push.service.ts).
 * Al tocar el aviso se abre la pantalla correspondiente (misma lógica que notificationHref en
 * src/features/notifications/api.ts) o, si ya hay una pestaña abierta, se usa esa.
 */

function hrefFor(data) {
  var id = data && data.targetId;
  switch (data && data.targetType) {
    case "CONVERSATION":
      return id ? "/panel/mensajes/" + id : "/panel/mensajes";
    case "REQUEST":
      return id ? "/panel/pedidos/" + id : "/panel/pedidos";
    case "CONTRACT":
      return id ? "/panel/trabajos/" + id : "/panel/trabajos";
    case "FORUM_POST":
      return id ? "/foro/" + id : "/foro";
    case "PROFESSIONAL":
      return "/panel/favoritos";
    case "REVIEW":
      return "/panel/resenas";
    case "ANNOUNCEMENT":
      return id ? "/panel/novedades/" + id : "/panel/notificaciones";
    case "SUPPORT_TICKET":
      return id ? "/panel/soporte/" + id : "/panel/soporte";
    case "REPORT":
      return "/panel/reportes";
    case "SANCTION":
    case "STRIKE":
    case "APPEAL":
      return "/panel/moderacion";
    default:
      return "/panel/notificaciones";
  }
}

self.addEventListener("push", function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // Aviso sin JSON válido: se muestra el genérico.
    data = {};
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Repara Ya", {
      body: data.body || "",
      tag: data.tag,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: hrefFor(data) },
    }),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = new URL((event.notification.data && event.notification.data.url) || "/panel/notificaciones", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windows) {
      for (var i = 0; i < windows.length; i++) {
        if ("focus" in windows[i] && "navigate" in windows[i]) {
          return windows[i].navigate(url).then(function (client) {
            return client && client.focus();
          });
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
