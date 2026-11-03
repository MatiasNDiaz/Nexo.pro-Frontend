// Portada provisoria de la etapa 0: solo comprueba que la base compila y se sirve.
// El diseño real (sistema de diseño, navegación y secciones) llega en las etapas 1 y 3.
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Repara Ya</h1>
      <p className="text-lg">Profesionales de oficios de confianza, cerca tuyo.</p>
    </main>
  );
}
