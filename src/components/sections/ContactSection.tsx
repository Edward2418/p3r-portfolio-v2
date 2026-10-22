import { contact } from "../../content/contact.ts";
import type { Lang } from "../../content/types.ts";
import type { UiTextKey } from "../../content/ui-text.ts";
import { t } from "../../lib/i18n/t.ts";

export function ContactSection({ lang }: { lang: Lang }) {
  // GitHub siempre aparece; los demás enlaces solo si tienen dirección (FR-009).
  const links: { key: UiTextKey; href: string }[] = [
    { key: "contactGithub", href: contact.github },
    ...(contact.email ? [{ key: "contactEmail" as const, href: `mailto:${contact.email}` }] : []),
    ...(contact.linkedin ? [{ key: "contactLinkedin" as const, href: contact.linkedin }] : []),
    ...(contact.cv ? [{ key: "contactCv" as const, href: contact.cv }] : []),
  ];

  return (
    <section aria-labelledby="contact-title" id="contact" className="space-y-4">
      <h2 id="contact-title" className="font-display text-3xl uppercase">
        {t("sectionContact", lang)}
      </h2>
      <ul className="flex flex-wrap gap-4">
        {links.map((link) => (
          <li key={link.key}>
            <a className="text-cyan underline underline-offset-4" href={link.href}>
              {t(link.key, lang)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
