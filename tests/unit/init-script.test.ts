import { test } from "node:test";
import assert from "node:assert/strict";
import { INIT_SCRIPT } from "../../src/lib/motion/init-script.ts";

interface Environment {
  systemReduced?: boolean;
  local?: Record<string, string>;
  session?: Record<string, string>;
  pathname?: string;
  storageThrows?: boolean;
}

/** Ejecuta el script con globales simulados y devuelve los atributos de <html> y el almacenamiento. */
function run(environment: Environment = {}) {
  const attributes: Record<string, string> = {};
  const local = { ...(environment.local ?? {}) };
  const session = { ...(environment.session ?? {}) };
  const storage = (data: Record<string, string>) => ({
    getItem(key: string) {
      if (environment.storageThrows) throw new Error("bloqueado");
      return data[key] ?? null;
    },
    setItem(key: string, value: string) {
      if (environment.storageThrows) throw new Error("bloqueado");
      data[key] = value;
    },
  });
  const fake = {
    document: { documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } },
    window: { matchMedia: () => ({ matches: environment.systemReduced ?? false }) },
    localStorage: storage(local),
    sessionStorage: storage(session),
    location: { pathname: environment.pathname ?? "/es" },
  };
  new Function("document", "window", "localStorage", "sessionStorage", "location", INIT_SCRIPT)(
    fake.document,
    fake.window,
    fake.localStorage,
    fake.sessionStorage,
    fake.location,
  );
  return { attributes, session };
}

test("pone data-motion reducido cuando el sistema lo pide", () => {
  assert.equal(run({ systemReduced: true }).attributes["data-motion"], "reduced", "el sistema pide reducido");
});

test("pone data-motion reducido cuando el sitio lo guardó", () => {
  assert.equal(run({ local: { motion: "reduced" } }).attributes["data-motion"], "reduced", "el sitio pide reducido");
});

test("no pone data-motion cuando nadie pide movimiento reducido", () => {
  assert.equal(run().attributes["data-motion"], undefined, "sin preferencia no hay atributo");
});

test("pone data-splash visto cuando la sesión ya lo vio", () => {
  assert.equal(run({ session: { "splash-seen": "1" } }).attributes["data-splash"], "seen", "ya visto");
});

test("en la raíz sin sesión previa no marca el splash como visto", () => {
  const { attributes, session } = run({ pathname: "/es" });
  assert.equal(attributes["data-splash"], undefined, "la raíz debe mostrar el splash");
  assert.equal(session["splash-seen"], undefined, "no debe guardar nada en la raíz");
  assert.equal(run({ pathname: "/en/" }).attributes["data-splash"], undefined, "la raíz en inglés con barra final también");
});

test("cualquier primera carga que no es la raíz cuenta como visita y marca el splash", () => {
  const { attributes, session } = run({ pathname: "/es/projects" });
  assert.equal(attributes["data-splash"], "seen", "no debe mostrar el splash en una pantalla");
  assert.equal(session["splash-seen"], "1", "debe guardar la marca de visto en la sesión");
});

test("no lanza si el almacenamiento está bloqueado", () => {
  assert.doesNotThrow(() => run({ storageThrows: true }), "con almacenamiento bloqueado no debe fallar");
  assert.equal(
    run({ storageThrows: true, systemReduced: true }).attributes["data-motion"],
    "reduced",
    "la preferencia del sistema sigue funcionando",
  );
  assert.equal(
    run({ storageThrows: true, pathname: "/es/stack" }).attributes["data-splash"],
    "seen",
    "una pantalla sigue sin mostrar el splash aunque no se pueda guardar",
  );
});
