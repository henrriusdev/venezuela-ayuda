// Matriz de casos del dedup por confianza (>=0.95) con veto de discriminadores.
// Corre: node --test scripts/*.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { norm, parseName, jaroWinkler, nameConfidence, clusterNames } from "./dedup-lib.mjs";

const conf = (a, b) => nameConfidence(parseName(a), parseName(b));
const MERGE = 0.95;

test("norm: minúsculas, sin acentos, sin puntuación", () => {
  assert.equal(norm("Pérez, Juan"), "perez juan");
  assert.equal(norm("Edificio  Mediterráneo!"), "edificio mediterraneo");
});

test("parseName: separa tokens significativos de discriminadores de unidad", () => {
  assert.deepEqual(parseName("Parque Central Torre 1").units, ["1"]);
  assert.deepEqual(parseName("Edificio A").units, ["a"]);
  assert.deepEqual(parseName("Residencias Mediterráneo").units, []);
  assert.deepEqual(parseName("Juan A. Pérez").sig, ["juan", "perez"]); // inicial 'a' → fuera de sig
});

test("jaroWinkler: similitud char-level con bonus de prefijo", () => {
  assert.ok(jaroWinkler("eduard", "edward") > 0.9);
  assert.ok(jaroWinkler("residencias", "residencia") > 0.95);
  assert.ok(jaroWinkler("caribe", "caroni") < 0.85);
});

test("nameConfidence: VETO duro por discriminador distinto", () => {
  assert.equal(conf("Parque Central Torre 1", "Parque Central Torre 2"), 0); // torres distintas
  assert.equal(conf("Edificio A", "Edificio B"), 0);
  assert.equal(conf("Torre 1", "Torre 1"), 1); // misma unidad, idéntico
});

test("nameConfidence: fusiona variantes reales (>=0.95)", () => {
  assert.ok(conf("Residencias Mediterráneo", "residencias mediterraneo") >= MERGE);
  assert.ok(conf("Hotel Eduard", "Hotel Edward") >= MERGE);
  assert.ok(conf("Residencias Las Palmas", "Residencia Las Palmas") >= MERGE);
  assert.ok(conf("Pérez, José", "José Pérez") >= MERGE);
});

test("nameConfidence: NO fusiona lugares distintos parecidos (<0.95)", () => {
  assert.ok(conf("Residencias Caribe", "Residencias Caroní") < MERGE);
  assert.ok(conf("Edificio Punta Brisas", "Edificio Punta Brava") < MERGE);
  assert.ok(conf("María", "María González") < MERGE); // un token común no basta
});

test("clusterNames: agrupa el mismo lugar, separa torres numeradas", () => {
  const names = [
    "Residencias Mediterráneo", "residencias mediterraneo", "Res Mediterraneo grietas",
    "Parque Central Torre 1", "Parque Central Torre 2",
    "Residencias Caroní",
  ];
  const { clusters, skippedBuckets } = clusterNames(names, MERGE);
  assert.equal(skippedBuckets, 0);
  const clusterOf = (i) => clusters.find((c) => c.includes(i));
  assert.ok(clusterOf(0).includes(1));                       // los dos Mediterráneo idénticos juntos
  assert.notEqual(clusterOf(3), clusterOf(4));               // Torre 1 ≠ Torre 2
  assert.equal(clusterOf(5).length, 1);                      // Caroní solo
});
