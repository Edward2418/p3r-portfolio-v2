import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang as getLang } from "next/root-params";
import { LanguageSwitcher } from "../../components/LanguageSwitcher.tsx";
import { anton, inter } from "../fonts.ts";
import { isLang, LANGS } from "../../lib/i18n/config.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { uiText } from "../../content/ui-text.ts";
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
    alternates: { languages: { es: "/es", en: "/en" } },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await getLang();
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} className={`${anton.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-bg focus:px-3 focus:py-2"
        >
          {t("skipToContent", lang)}
        </a>
        <header className="mx-auto flex w-full max-w-3xl justify-end px-4 pt-4">
          <LanguageSwitcher target={lang === "es" ? "en" : "es"} label={t("switchLanguage", lang)} />
        </header>
        {children}
      </body>
    </html>
  );
}
