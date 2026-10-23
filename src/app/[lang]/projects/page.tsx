import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScreenFrame } from "../../../components/scene/ScreenFrame.tsx";
import { ProjectsSection } from "../../../components/sections/ProjectsSection.tsx";
import { isLang } from "../../../lib/i18n/config.ts";
import { screenTitle } from "../../../lib/scene/titles.ts";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: screenTitle("projects", lang) } : {};
}

export default async function Page({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <ScreenFrame lang={lang} sceneId="projects">
      <ProjectsSection lang={lang} />
    </ScreenFrame>
  );
}
