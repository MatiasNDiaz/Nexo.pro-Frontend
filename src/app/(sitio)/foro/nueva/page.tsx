import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WordsUp } from "@/components/motion/words-up";
import { NewPostForm } from "@/features/forum/new-post-form";

export const metadata: Metadata = {
  title: "Publicar en el foro",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <div className="container-page flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
      <Link href="/foro" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al foro
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
          <WordsUp text="Publicá en el foro" />
        </h1>
        <p className="text-lg text-muted-strong animate-fade-up [animation-delay:200ms]">
          Preguntá lo que quieras o contá qué necesitás: la comunidad y los profesionales te responden.
        </p>
      </header>
      <NewPostForm />
    </div>
  );
}
