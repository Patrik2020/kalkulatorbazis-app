import { appConfig } from "./config/runtime.js";
import { calculators } from "./domain/calculators/catalog.js";
import { localEngines } from "./domain/calculators/local-engines.js";
import { createHttpClient } from "./services/api/http-client.js";
import { createCalculatorApi } from "./services/api/calculator-api.js";
import { createCalculatorService } from "./services/calculator-service.js";
import { appStorage } from "./services/storage.js";

const $ = (selector) => document.querySelector(selector);
const grid = $("#calculatorGrid");
const dialog = $("#calcDialog");

const httpClient = createHttpClient({
  baseUrl: appConfig.apiBaseUrl,
  timeoutMs: appConfig.apiTimeoutMs
});
const calculatorApi = createCalculatorApi({ httpClient, appVersion: appConfig.appVersion });
const calculatorService = createCalculatorService({
  mode: appConfig.calculationMode,
  api: calculatorApi,
  engines: localEngines
});

let favorites = appStorage.getFavorites();
let recent = appStorage.getRecent();

const sourceLabel = (meta = {}) => {
  if (meta.source === "api") return "Számítás: Kalkulátor Bázis API";
  if (meta.source === "device-fallback") return "Számítás: eszközön · API-tartalék mód";
  return "Számítás: eszközön";
};

const renderField = (field) => {
  const attributes = [
    `id="${field.key}"`,
    `name="${field.key}"`,
    `type="${field.type}"`,
    `value="${field.defaultValue ?? ""}"`,
    field.type === "number" ? 'inputmode="decimal"' : "",
    field.step !== undefined ? `step="${field.step}"` : "",
    field.min !== undefined ? `min="${field.min}"` : "",
    field.max !== undefined ? `max="${field.max}"` : "",
    field.required ? "required" : ""
  ].filter(Boolean).join(" ");

  return `<div class="field"><label for="${field.key}">${field.label}</label><input ${attributes}></div>`;
};

function card(calculator) {
  const element = document.createElement("article");
  element.className = "card";
  element.tabIndex = 0;
  element.innerHTML = `<button class="fav ${favorites.includes(calculator.id) ? "active" : ""}" type="button" aria-label="Kedvenc">★</button><div class="card-icon">${calculator.icon}</div><h3>${calculator.title}</h3><p>${calculator.description}</p>`;

  const activate = (event) => {
    if (event.target?.classList?.contains("fav")) {
      toggleFavorite(calculator.id);
      return;
    }
    openCalculator(calculator);
  };

  element.addEventListener("click", activate);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCalculator(calculator);
    }
  });
  return element;
}

function renderStored() {
  const favoriteCalculators = calculators.filter((calculator) => favorites.includes(calculator.id));
  $("#favoritesSection").hidden = favoriteCalculators.length === 0;
  $("#favoritesGrid").replaceChildren(...favoriteCalculators.map(card));

  const recentCalculators = recent
    .map((id) => calculators.find((calculator) => calculator.id === id))
    .filter(Boolean);
  $("#recentSection").hidden = recentCalculators.length === 0;
  $("#recentGrid").replaceChildren(...recentCalculators.map(card));
}

function render() {
  const query = $("#searchInput").value.trim().toLocaleLowerCase("hu");
  const list = calculators.filter((calculator) =>
    `${calculator.title} ${calculator.category} ${calculator.description}`
      .toLocaleLowerCase("hu")
      .includes(query)
  );

  grid.replaceChildren(...list.map(card));
  $("#resultCount").textContent = `${list.length} eszköz`;
  $("#emptyState").hidden = list.length > 0;
  renderStored();
}

function toggleFavorite(id) {
  favorites = favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id];
  appStorage.setFavorites(favorites);
  render();
}

async function openCalculator(calculator) {
  recent = [calculator.id, ...recent.filter((id) => id !== calculator.id)].slice(0, 4);
  appStorage.setRecent(recent);

  $("#dialogCategory").textContent = calculator.category;
  $("#dialogTitle").textContent = calculator.title;
  $("#dialogBody").innerHTML = `<form class="form-grid">${calculator.fields.map(renderField).join("")}<button class="primary" type="submit">Kiszámolom</button></form><div id="calcResult"></div><p class="formula-note">A felület ugyanaz marad akkor is, ha egy kalkulátor később API-ról számol. Offline vagy helyi módban a támogatott számítások az eszközön futnak.</p>`;

  const form = $("#dialogBody form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Számolás…";

    try {
      const values = Object.fromEntries(new FormData(form).entries());
      const result = await calculatorService.calculate(calculator, values);
      $("#calcResult").innerHTML = `<div class="result"><small>Eredmény</small><strong>${result.main}</strong><small>${result.sub || ""}</small><small class="result-meta">${sourceLabel(result.meta)}</small></div>`;
    } catch (error) {
      $("#calcResult").innerHTML = `<div class="result error-result"><strong>Nem sikerült kiszámolni</strong><small>${error.message || "Ismeretlen hiba."}</small></div>`;
    } finally {
      button.disabled = false;
      button.textContent = "Kiszámolom";
    }
  });

  dialog.showModal();
  renderStored();
}

$("#closeDialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
$("#searchInput").addEventListener("input", render);
$("#clearRecent").addEventListener("click", () => {
  recent = [];
  appStorage.clearRecent();
  renderStored();
});

const runtimeNames = {
  local: "Helyi mód",
  hybrid: "Hibrid mód",
  api: "API mód"
};
$("#runtimeBadge").textContent = runtimeNames[appConfig.calculationMode] || "Helyi mód";

const updateNetworkState = () => {
  $("#offlineBanner").hidden = navigator.onLine;
};
window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
updateNetworkState();

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  $("#installBtn").hidden = false;
});
$("#installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("#installBtn").hidden = true;
});

const nativePlatform = Boolean(globalThis.Capacitor?.isNativePlatform?.());
if (!nativePlatform && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register(new URL("./sw.js", document.baseURI)));
}

render();
