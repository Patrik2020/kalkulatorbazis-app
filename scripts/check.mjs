import assert from "node:assert/strict";
import { calculators } from "../src/domain/calculators/catalog.js";
import { localEngines } from "../src/domain/calculators/local-engines.js";
import { createCalculatorService } from "../src/services/calculator-service.js";

assert.equal(calculators.length, 9, "A jelenlegi app 9 katalogizált kalkulátort vár.");
assert.equal(new Set(calculators.map((item) => item.id)).size, calculators.length, "Duplikált kalkulátor-ID.");
for (const calculator of calculators) {
  assert.equal(typeof localEngines[calculator.id], "function", `Hiányzó helyi motor: ${calculator.id}`);
  assert.ok(Array.isArray(calculator.fields) && calculator.fields.length > 0, `Hiányzó mezők: ${calculator.id}`);
}

const localService = createCalculatorService({ mode: "local", api: null, engines: localEngines });
const percent = await localService.calculate(calculators.find((item) => item.id === "percent"), { base: 250, percent: 20 });
assert.equal(percent.main, "50");
assert.equal(percent.meta.source, "device");

const bmi = await localService.calculate(calculators.find((item) => item.id === "bmi"), { weight: 75, height: 175 });
assert.equal(bmi.main, "24,5");

const loan = await localService.calculate(calculators.find((item) => item.id === "loan"), { amount: 1200000, rate: 0, years: 1 });
assert.match(loan.main, /100[\s ]?000 Ft \/ hó/);

const fakeCalculator = { ...calculators[0], api: { path: "/api/v1/calculators/percent/calculate" } };
const hybridService = createCalculatorService({
  mode: "hybrid",
  api: { calculate: async () => { throw new Error("teszt API hiba"); } },
  engines: localEngines
});
const fallback = await hybridService.calculate(fakeCalculator, { base: 100, percent: 10 });
assert.equal(fallback.meta.source, "device-fallback");
assert.equal(fallback.main, "10");

const apiService = createCalculatorService({
  mode: "api",
  api: { calculate: async () => ({ main: "API OK", sub: "", meta: { ruleset: "test" } }) },
  engines: localEngines
});
const remote = await apiService.calculate(fakeCalculator, { base: 100, percent: 10 });
assert.equal(remote.main, "API OK");
assert.equal(remote.meta.source, "api");

console.log("App architecture audit OK: 9/9 local engine + local/hybrid/API routing.");
