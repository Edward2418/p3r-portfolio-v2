import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang as getLang } from "next/root-params";
import { Footer } from "../../components/Footer.tsx";
import { LanguageSwitcher } from "../../components/LanguageSwitcher.tsx";
import { MotionToggle } from "../../components/MotionToggle.tsx";
import { SceneBackdrop } from "../../components/scene/SceneBackdrop.tsx";
import { SceneShell } from "../../components/scene/SceneShell.tsx";
import { menu } from "../../content/menu.ts";
import { uiText } from "../../content/ui-text.ts";
import { anton, inter } from "../fonts.ts";
import { isLang, LANGS } from "../../lib/i18n/config.ts";
import { INIT_SCRIPT } from "../../lib/motion/init-script.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import "../globals.css";

// Solo existen /es y /en: cualquier otro idioma da 404 (contracts/routing-i18n.md).
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: localize(uiText.siteTitle, lang),
    description: localize(uiText.siteDescription, lang),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await getLang();
  if (!isLang(lang)) notFound();

  // Datos ya traducidos para el componente de cliente: así no viaja el diccionario completo.
  const scenes = menu.map((option) => ({
    id: option.id,
    name: localize(option.name, lang),
    description: localize(option.description, lang),
  }));
  const labels = {
    confirm: t("confirm", lang),
    back: t("back", lang),
    tabPrevious: t("tabPrevious", lang),
    tabNext: t("tabNext", lang),
    tabPreviousShort: t("tabPreviousShort", lang),
    tabNextShort: t("tabNextShort", lang),
    guideLabel: t("guideLabel", lang),
    guideScreenHint: t("guideScreenHint", lang),
  };

  return (
    <html lang={lang} className={`${anton.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Fija data-motion y data-splash antes del primer pintado (sin parpadeo). */}
        <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-40 focus:bg-bg focus:px-3 focus:py-2"
        >
          {t("skipToContent", lang)}
        </a>
        <SceneShell lang={lang} scenes={scenes} labels={labels}>
          <SceneBackdrop lang={lang} />
          <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-end gap-3 px-4 pt-4">
            <LanguageSwitcher target={lang === "es" ? "en" : "es"} label={t("switchLanguage", lang)} />
            <MotionToggle
              label={t("motionToggleLabel", lang)}
              onText={t("motionOn", lang)}
              offText={t("motionOff", lang)}
              lockedText={t("motionLockedBySystem", lang)}
            />
          </header>
          {children}
          <Footer lang={lang} />
        </SceneShell>
      </body>
    </html>
  );
}
