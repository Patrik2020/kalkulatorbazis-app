const normalizeValues = (calculator, rawValues) => {
  const normalized = {};

  for (const field of calculator.fields) {
    const raw = rawValues[field.key];
    if (field.type === "number") {
      const value = Number(String(raw ?? "").replace(",", "."));
      if (!Number.isFinite(value)) throw new Error(`${field.label}: adj meg érvényes számot.`);
      if (field.min !== undefined && value < field.min) throw new Error(`${field.label}: a minimum ${field.min}.`);
      if (field.max !== undefined && value > field.max) throw new Error(`${field.label}: a maximum ${field.max}.`);
      normalized[field.key] = value;
    } else {
      normalized[field.key] = raw;
    }
  }

  return normalized;
};

export const createCalculatorService = ({ mode, api, engines }) => {
  const calculateLocal = (calculator, values, source = "device") => {
    const engine = engines[calculator.id];
    if (!engine) throw new Error(`Hiányzó helyi számítási motor: ${calculator.id}`);
    const result = engine(values);
    return { ...result, meta: { ...(result.meta || {}), source } };
  };

  return {
    async calculate(calculator, rawValues) {
      const values = normalizeValues(calculator, rawValues);
      const hasApi = Boolean(calculator.api?.path);

      if (mode === "local" || !hasApi) return calculateLocal(calculator, values);

      try {
        const result = await api.calculate(calculator, values);
        return { ...result, meta: { ...(result.meta || {}), source: "api" } };
      } catch (error) {
        if (mode !== "hybrid") throw error;
        const fallback = calculateLocal(calculator, values, "device-fallback");
        return {
          ...fallback,
          meta: { ...fallback.meta, apiError: error.message }
        };
      }
    }
  };
};
