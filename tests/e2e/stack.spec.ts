import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { menu, stack, stackCenterLabel, uiText } from "../../src/content/index.ts";
import { provisionalScope } from "../../src/lib/stack/layout.ts";
import { openReady } from "./helpers.ts";

// Pantalla "Stack" (specs/004-quien-soy-y-stack, historia 3 y casos límite).
const LANGS = ["es", "en"] as const;
const stackId = menu[1].id;

const circles = (page: Page) => page.locator("section[data-circle]");

/** Las esquinas de cada tecnología deben quedar dentro del trazo del círculo (elipse de su caja). */
async function expectTextInsideCircles(page: Page) {
  const outside = await page.evaluate(() => {
    const problems: string[] = [];
    for (const circle of document.querySelectorAll<HTMLElement>("section[data-circle]")) {
      const box = circle.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const rx = box.width / 2;
      const ry = box.height / 2;
      for (const item of circle.querySelectorAll<HTMLElement>("li")) {
        const rect = item.getBoundingClientRect();
        for (const [x, y] of [
          [rect.left, rect.top],
          [rect.right, rect.top],
          [rect.left, rect.bottom],
          [rect.right, rect.bottom],
        ]) {
          if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1.02) {
            problems.push(`${circle.dataset.circle}: ${item.textContent?.trim().slice(0, 24)}`);
            break;
          }
        }
      }
    }
    return problems;
  });
  expect(outside, "ninguna tecnología debe salirse del trazo de su círculo").toEqual([]);
}

/** El texto no se recorta: cada tecnología queda dentro de la caja de su círculo y de la ventana. */
async function expectTextNotClipped(page: Page) {
  const clipped = await page.evaluate(() => {
    const problems: string[] = [];
    for (const circle of document.querySelectorAll<HTMLElement>("section[data-circle]")) {
      const box = circle.getBoundingClientRect();
      for (const item of circle.querySelectorAll<HTMLElement>("li")) {
        const rect = item.getBoundingClientRect();
        if (rect.left < box.left - 1 || rect.right > box.right + 1 || rect.top < box.top - 1 || rect.bottom > box.bottom + 1) {
          problems.push(`${circle.dataset.circle}: ${item.textContent?.trim().slice(0, 24)}`);
        }
        if (rect.left < 0 || rect.right > window.innerWidth) problems.push(`fuera de la ventana: ${item.textContent?.trim().slice(0, 24)}`);
      }
    }
    return problems;
  });
  expect(clipped, "el texto no debe quedar recortado").toEqual([]);
}

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "el ancho del contenido no debe superar el de la ventana").toBeLessThanOrEqual(clientWidth);
}

const intersects = async (a: Locator, b: Locator) => {
  const [boxA, boxB] = [(await a.boundingBox())!, (await b.boundingBox())!];
  return boxA.x < boxB.x + boxB.width && boxB.x < boxA.x + boxA.width && boxA.y < boxB.y + boxB.height && boxB.y < boxA.y + boxA.height;
};

for (const lang of LANGS) {
  test.describe(`Stack en /${lang}`, () => {
    test("tiene un h2 Stack y una sección por categoría, en orden, con su h3 y su lista", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      await expect(page.getByRole("heading", { level: 2, name: uiText.sectionStack[lang] })).toBeVisible();
      await expect(circles(page)).toHaveCount(3);
      for (const [index, category] of stack.entries()) {
        const circle = circles(page).nth(index);
        await expect(circle).toHaveAttribute("data-circle", category.id);
        await expect(circle.getByRole("heading", { level: 3 })).toContainText(category.name[lang]);
        await expect(circle.locator("ul > li")).toHaveCount(category.technologies.length);
      }
    });

    test("cada tecnología muestra su nivel como texto, la leyenda de la escala y cinco puntos decorativos", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      await expect(page.locator("[data-stack-legend]")).toHaveText(uiText.stackLevelLegend[lang]);
      for (const [index, category] of stack.entries()) {
        const items = circles(page).nth(index).locator("ul > li");
        for (const [row, tech] of category.technologies.entries()) {
          const item = items.nth(row);
          await expect(item).toContainText(tech.name);
          await expect(item).toContainText(`${uiText.level[lang]}: ${tech.level}/5`);
          const pips = item.locator("[data-pip]");
          await expect(pips).toHaveCount(5);
          await expect(item.locator("[data-pips]")).toHaveAttribute("aria-hidden", "true");
          await expect(item.locator('[data-pip][data-filled="true"]')).toHaveCount(tech.level);
        }
      }
    });

    test("la marca Provisional va en el encabezado si toda la categoría es provisional y, si no, solo en las tecnologías provisionales", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      for (const [index, category] of stack.entries()) {
        const circle = circles(page).nth(index);
        const scope = provisionalScope(category);
        const heading = circle.getByRole("heading", { level: 3 });
        if (scope === "category") await expect(heading).toContainText(uiText.provisional[lang]);
        else await expect(heading).not.toContainText(uiText.provisional[lang]);
        for (const [row, tech] of category.technologies.entries()) {
          const item = circle.locator("ul > li").nth(row);
          if (scope === "technologies" && tech.provisional) await expect(item).toContainText(uiText.provisional[lang]);
          else await expect(item).not.toContainText(uiText.provisional[lang]);
        }
      }
    });

    test("cada tecnología aparece en un solo círculo", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      const names = await page.locator("[data-tech-name]").allInnerTexts();
      expect(names, "los nombres deben ser los del stack, en su orden").toEqual(
        stack.flatMap((category) => category.technologies.map((tech) => tech.name)),
      );
      expect(new Set(names).size, "ninguna tecnología debe repetirse").toBe(names.length);
    });

    test("la etiqueta Full-Stack va en el DOM antes de las categorías", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      const center = page.locator("[data-stack-center]");
      await expect(center).toHaveText(stackCenterLabel[lang]);
      const before = await page.evaluate(() => {
        const label = document.querySelector("[data-stack-center]")!;
        const first = document.querySelector("section[data-circle]")!;
        return Boolean(label.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(before, "la etiqueta debe preceder a las categorías en el orden de lectura").toBe(true);
    });

    test("los círculos se solapan, no hay desplazamiento horizontal y el texto queda dentro del trazo", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      const [a, b, c] = [circles(page).nth(0), circles(page).nth(1), circles(page).nth(2)];
      const wide = (page.viewportSize()?.width ?? 0) >= 768;
      expect(await intersects(a, b), "el primer y el segundo círculo deben solaparse").toBe(true);
      expect(await intersects(b, c), "el segundo y el tercer círculo deben solaparse").toBe(true);
      // Apilados (por debajo de 768 px) solo se solapan los círculos contiguos; solapados (desde 768 px), los tres.
      expect(await intersects(a, c), "el primer y el tercer círculo solo se solapan en el diseño ancho").toBe(wide);
      await expectNoHorizontalScroll(page);
      await expectTextInsideCircles(page);
    });
  });
}

test.describe("casos límite del stack", () => {
  test("con ocho tecnologías en una categoría el círculo crece y no se recorta el texto", async ({ page }) => {
    await openReady(page, `/es/${stackId}`);
    await page.evaluate(() => {
      const list = document.querySelector("section[data-circle] ul")!;
      const template = list.querySelector("li")!;
      while (list.children.length < 8) list.appendChild(template.cloneNode(true));
    });
    await expect(circles(page).first().locator("ul > li")).toHaveCount(8);
    await expectNoHorizontalScroll(page);
    await expectTextNotClipped(page);
  });
});
