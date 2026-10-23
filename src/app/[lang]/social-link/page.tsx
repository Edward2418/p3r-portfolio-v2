import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScreenFrame } from "../../../components/scene/ScreenFrame.tsx";
import { CharactersSection } from "../../../components/sections/CharactersSection.tsx";
import { isLang } from "../../../lib/i18n/config.ts";
import { screenTitle } from "../../../lib/scene/titles.ts";

export async function generateMetadata({ params }: PageProps<"/[lang]/social-link">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: screenTitle("social-link", lang) } : {};
}

export default async function Page({ params }: PageProps<"/[lang]/social-link">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <ScreenFrame lang={lang} sceneId="social-link">
      <CharactersSection lang={lang} />
    </ScreenFrame>
  );
}
