import { notFound } from "next/navigation";
import { Footer } from "../../components/Footer.tsx";
import { CharactersSection } from "../../components/sections/CharactersSection.tsx";
import { ContactSection } from "../../components/sections/ContactSection.tsx";
import { ProfileSection } from "../../components/sections/ProfileSection.tsx";
import { ProjectsSection } from "../../components/sections/ProjectsSection.tsx";
import { StackSection } from "../../components/sections/StackSection.tsx";
import { isLang } from "../../lib/i18n/config.ts";

// Página inicial de verificación: muestra todos los datos sin diseño P3R ni animaciones.
export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <>
      <main id="content" className="mx-auto w-full max-w-3xl flex-1 space-y-12 px-4 py-10">
        <ProfileSection lang={lang} />
        <StackSection lang={lang} />
        <ProjectsSection lang={lang} />
        <CharactersSection lang={lang} />
        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
