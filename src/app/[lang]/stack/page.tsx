import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScreenFrame } from "../../../components/scene/ScreenFrame.tsx";
import { StackSection } from "../../../components/sections/StackSection.tsx";
import { isLang } from "../../../lib/i18n/config.ts";
import { screenTitle } from "../../../lib/scene/titles.ts";

export async function generateMetadata({ params }: PageProps<"/[lang]/stack">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: screenTitle("stack", lang) } : {};
}

export default async function Page({ params }: PageProps<"/[lang]/stack">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <ScreenFrame lang={lang} sceneId="stack">
      <StackSection lang={lang} />
    </ScreenFrame>
  );
}
