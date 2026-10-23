import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScreenFrame } from "../../../components/scene/ScreenFrame.tsx";
import { ProfileSheet } from "../../../components/profile/ProfileSheet.tsx";
import { isLang } from "../../../lib/i18n/config.ts";
import { screenTitle } from "../../../lib/scene/titles.ts";

export async function generateMetadata({ params }: PageProps<"/[lang]/profile">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: screenTitle("profile", lang) } : {};
}

export default async function Page({ params }: PageProps<"/[lang]/profile">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <ScreenFrame lang={lang} sceneId="profile">
      <ProfileSheet lang={lang} />
    </ScreenFrame>
  );
}
