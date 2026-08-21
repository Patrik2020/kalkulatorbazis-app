const namespace = "kb-app:v2";
const legacyKeys = {
  favorites: "kb-favorites",
  recent: "kb-recent"
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(`${namespace}:${key}`);
    if (value !== null) return JSON.parse(value);

    const legacy = legacyKeys[key] ? localStorage.getItem(legacyKeys[key]) : null;
    if (legacy !== null) {
      const parsed = JSON.parse(legacy);
      localStorage.setItem(`${namespace}:${key}`, JSON.stringify(parsed));
      return parsed;
    }
  } catch {
    // Sérült vagy tiltott localStorage esetén az app használható marad.
  }
  return fallback;
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(`${namespace}:${key}`, JSON.stringify(value));
  } catch {
    // A kedvencek elvesztése nem akadályozhatja a számolást.
  }
};

export const appStorage = {
  getFavorites: () => readJson("favorites", []),
  setFavorites: (value) => writeJson("favorites", value),
  getRecent: () => readJson("recent", []),
  setRecent: (value) => writeJson("recent", value),
  clearRecent: () => {
    try {
      localStorage.removeItem(`${namespace}:recent`);
      localStorage.removeItem(legacyKeys.recent);
    } catch {
      // no-op
    }
  }
};
