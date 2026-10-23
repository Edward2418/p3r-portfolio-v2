import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTimeline, parseCssTime, staggerDelays, staggerPlan } from "../../src/lib/motion/timeline.ts";

test("parseCssTime acepta milisegundos y segundos", () => {
  assert.equal(parseCssTime("150ms"), 150, "150ms son 150");
  assert.equal(parseCssTime("0.15s"), 150, "0.15s son 150 ms");
  assert.equal(parseCssTime(" 170ms "), 170, "ignora los espacios");
  assert.equal(parseCssTime("1.5s"), 1500, "1.5s son 1500 ms");
  assert.equal(parseCssTime(".17s"), 170, "el minificador de CSS escribe 170ms como .17s");
  assert.equal(parseCssTime(".035s"), 35, "sin error de coma flotante");
  assert.equal(parseCssTime("0ms"), 0, "cero es válido");
});

test("parseCssTime rechaza valores que no son tiempos", () => {
  assert.throws(() => parseCssTime("rápido"), /tiempo/, "texto no válido");
  assert.throws(() => parseCssTime("150"), /tiempo/, "sin unidad");
  assert.throws(() => parseCssTime(""), /tiempo/, "vacío");
});

test("buildTimeline devuelve los tramos en orden y la duración total", () => {
  const timeline = buildTimeline({ wipeOut: 170, staggerIn: 260, hold: 70, circle: 200 });
  assert.deepEqual(
    timeline.segments.map((segment) => segment.name),
    ["wipe-out", "enter", "hold", "circle"],
    "orden: salida, entrada, pausa y cierre",
  );
  assert.deepEqual(
    timeline.segments.map((segment) => segment.start),
    [0, 170, 430, 500],
    "cada tramo empieza donde termina el anterior",
  );
  assert.equal(timeline.total, 700, "la suma de los tramos es el total");
});

test("buildTimeline rechaza tramos negativos o no numéricos", () => {
  assert.throws(() => buildTimeline({ wipeOut: -1, staggerIn: 260, hold: 70, circle: 200 }), /tramo/, "negativo");
  assert.throws(() => buildTimeline({ wipeOut: 170, staggerIn: Number.NaN, hold: 70, circle: 200 }), /tramo/, "NaN");
});

test("staggerDelays devuelve 0, paso, 2·paso…", () => {
  assert.deepEqual(staggerDelays(4, 35), [0, 35, 70, 105], "cuatro fichas con paso de 35 ms");
  assert.deepEqual(staggerDelays(0, 35), [], "sin fichas no hay retrasos");
  assert.deepEqual(staggerDelays(1, 35), [0], "una ficha no se retrasa");
});

test("staggerPlan ajusta el paso para que el escalonado quepa en el tramo", () => {
  const few = staggerPlan(4, 35, 260, 100);
  assert.deepEqual(few.delays, [0, 35, 70, 105], "pocas fichas conservan el paso");
  assert.equal(few.duration, 155, "cada ficha dura lo que queda del tramo tras el último retraso");

  const many = staggerPlan(9, 35, 260, 100);
  assert.equal(many.duration, 100, "con muchas fichas se respeta la duración mínima");
  assert.ok(many.delays[8] + many.duration <= 260, "la última ficha termina dentro del tramo");
  assert.ok(many.delays[1] - many.delays[0] <= 35, "el paso nunca supera el configurado");

  assert.deepEqual(staggerPlan(1, 35, 260, 100), { delays: [0], duration: 260 }, "una ficha usa todo el tramo");
  assert.deepEqual(staggerPlan(0, 35, 260, 100), { delays: [], duration: 260 }, "sin fichas no hay retrasos");
});
