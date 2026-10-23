import { notFound } from "next/navigation";
import { CharacterSlot } from "../../components/menu/CharacterSlot.tsx";
import { MainMenu } from "../../components/menu/MainMenu.tsx";
import { Splash } from "../../components/Splash.tsx";
import { menu } from "../../content/menu.ts";
import { isLang } from "../../lib/i18n/config.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";

// Menú principal: las cinco opciones llevan a pantallas con dirección propia (/es/stack, etc.).
export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const options = menu.map((option) => ({
    id: option.id,
    name: localize(option.name, lang),
    description: localize(option.description, lang),
  }));

  return (
    <main
      id="content"
      className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 pb-32 pt-10 md:grid-cols-[1fr_1.2fr]"
    >
      <h1 className="sr-only">{t("siteTitle", lang)}</h1>
      <CharacterSlot lang={lang} />
      <MainMenu lang={lang} label={t("menuLabel", lang)} options={options} />
      <Splash lang={lang} />
    </main>
  );
}
