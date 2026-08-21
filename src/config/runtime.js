const viteEnv = import.meta.env || {};
const runtimeOverride = globalThis.__KB_APP_CONFIG__ || {};

const allowedModes = new Set(["local", "hybrid", "api"]);
const requestedMode = runtimeOverride.calculationMode || viteEnv.VITE_CALCULATION_MODE || "local";
const timeout = Number(runtimeOverride.apiTimeoutMs || viteEnv.VITE_API_TIMEOUT_MS || 8000);

export const appConfig = Object.freeze({
  appVersion: "0.2.0",
  calculationMode: allowedModes.has(requestedMode) ? requestedMode : "local",
  apiBaseUrl: String(
    runtimeOverride.apiBaseUrl || viteEnv.VITE_API_BASE_URL || "https://api.kalkulatorbazis.hu"
  ).replace(/\/+$/, ""),
  apiTimeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 8000
});
