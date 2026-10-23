import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoundToggle } from "../../../components/audio/SoundToggle.tsx";
import { ScreenFrame } from "../../../components/scene/ScreenFrame.tsx";
import { ContactSection } from "../../../components/sections/ContactSection.tsx";
import { isLang } from "../../../lib/i18n/config.ts";
import { t } from "../../../lib/i18n/t.ts";
import { screenTitle } from "../../../lib/scene/titles.ts";

export async function generateMetadata({ params }: PageProps<"/[lang]/system">): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? { title: screenTitle("system", lang) } : {};
}

export default async function Page({ params }: PageProps<"/[lang]/system">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <ScreenFrame lang={lang} sceneId="system">
      <ContactSection lang={lang} />
      <SoundToggle
        label={t("soundToggleLabel", lang)}
        onText={t("soundOn", lang)}
        offText={t("soundOff", lang)}
        hint={t("soundHint", lang)}
      />
    </ScreenFrame>
  );
}
