/*
 * Textos del inicio que el fundador puede revisar o cambiar sin tocar el diseño. Todo lo que se
 * afirma existe en el backend (docs/BACKEND_BUSINESS_FLOWS.md). "Quiénes somos" y "Nuestro
 * objetivo" son una propuesta de redacción: no agregan datos (fechas, cifras ni nombres).
 */

/**
 * Planes de los profesionales. NO hay una ruta pública que los devuelva (GET /subscriptions/plans
 * exige sesión de profesional): estos valores copian la tabla `subscription_plans` (migración del
 * backend, 2026-11-02). Si cambian ahí, hay que actualizarlos acá.
 * No se muestra el chatbot de Premium: todavía no está implementado.
 */
export const plans = [
  {
    code: "BASIC",
    name: "Basic",
    price: 10000,
    pitch: "Para empezar a recibir pedidos.",
    features: ["1 oficio", "5 fotos de tus trabajos", "Pedidos y presupuestos por chat", "Reseñas de tus clientes"],
  },
  {
    code: "MEDIUM",
    name: "Medium",
    price: 15000,
    pitch: "Más presencia en el catálogo.",
    features: [
      "Hasta 2 oficios",
      "5 fotos y 1 video",
      "Mejor posición en el catálogo",
      "Personalizá los colores de tu perfil",
      "Avisos de disponibilidad a quienes te guardaron",
    ],
  },
  {
    code: "PREMIUM",
    name: "Premium",
    price: 20000,
    pitch: "La máxima visibilidad y tus números.",
    features: [
      "Hasta 3 oficios",
      "5 fotos y 2 videos, con archivos más pesados",
      "La mejor posición en el catálogo",
      "Personalización ampliada del perfil",
      "Avisos de disponibilidad con tu mensaje",
      "Estadísticas de visitas a tu perfil",
    ],
  },
] as const;

/** Lo que gana un cliente al crear su cuenta (todo existe hoy en el panel). */
export const customerBenefits = [
  { title: "Chat directo", text: "Le escribís al profesional sin pasar tu número a nadie." },
  { title: "Presupuestos para comparar", text: "Pedís presupuesto, lo ves con detalle y elegís cuando quieras." },
  { title: "Seguimiento del trabajo", text: "Ves cuándo lo agenda, cuándo empieza y cuándo termina." },
  { title: "Tu reseña cuenta", text: "Al terminar el trabajo, contás cómo te fue y ayudás a otros." },
] as const;

export const about = {
  who: "Repara Ya es una plataforma de Córdoba que conecta a quienes necesitan un arreglo con profesionales de oficio que muestran quiénes son: con su identidad verificada, sus trabajos y las reseñas de sus clientes.",
  goal: "Que contratar un oficio sea tan confiable como pedirle a un conocido: saber quién viene a tu casa, qué hizo antes y qué te va a cobrar, antes de decidir. Y que cada profesional pueda mostrar su trabajo y conseguir clientes en su zona.",
  values: [
    { title: "Confianza", text: "Cada perfil pasa por una revisión de identidad de nuestro equipo." },
    { title: "Transparencia", text: "Las reseñas son solo de trabajos terminados, y no se compran." },
    { title: "Cercanía", text: "Profesionales de tu zona, con los que hablás directo." },
  ],
} as const;

export const faqs = [
  {
    q: "¿Cuesta algo usar Repara Ya si busco un profesional?",
    a: "No. Crear tu cuenta, escribir por el chat y pedir presupuestos es gratis para clientes.",
  },
  {
    q: "¿Cómo sé que el profesional es de confianza?",
    a: "Todos los perfiles del catálogo tienen la identidad verificada por nuestro equipo. Además, las reseñas solo las pueden dejar clientes con un trabajo terminado.",
  },
  {
    q: "¿Cómo se paga el trabajo?",
    a: "El precio y la forma de pago los acordás directamente con el profesional. Repara Ya no cobra ni procesa el pago de los trabajos.",
  },
  {
    q: "¿Puedo comparar presupuestos?",
    a: "Sí. Pedile presupuesto a cada profesional desde su perfil y compará las respuestas en “Pedidos”, dentro de tu panel. Elegís solo cuando estés seguro.",
  },
  {
    q: "¿Qué pasa si necesito cancelar?",
    a: "Podés cancelar un pedido antes de elegir a un profesional, y un trabajo mientras no terminó. El aviso le llega a la otra parte por el chat.",
  },
  {
    q: "Soy profesional: ¿cómo funciona la prueba?",
    a: "Tenés 30 días para usar Repara Ya con las funciones de Basic. Después elegís el plan que te sirva y lo pagás mes a mes.",
  },
  {
    q: "¿Por qué tengo que verificar mi identidad?",
    a: "Porque es lo que da confianza a clientes y profesionales. Se pide un email verificado y una foto de perfil, y nuestro equipo revisa los datos.",
  },
  {
    q: "¿En qué zonas funciona?",
    a: "Hoy en la provincia de Córdoba. Cada profesional elige las localidades y los barrios donde trabaja.",
  },
] as const;
