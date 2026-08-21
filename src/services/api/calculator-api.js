const normalizeResult = (payload) => {
  const data = payload?.data ?? payload;
  const result = data?.result ?? data;

  if (!result || typeof result.main !== "string") {
    throw new Error("Az API-válasz nem felel meg az app eredménykontraktusának.");
  }

  return {
    main: result.main,
    sub: typeof result.sub === "string" ? result.sub : "",
    meta: data?.meta || {}
  };
};

export const createCalculatorApi = ({ httpClient, appVersion }) => ({
  async calculate(calculator, values) {
    if (!calculator.api?.path) throw new Error(`Nincs API-adapter: ${calculator.id}`);

    const requestBody = calculator.api.toRequest
      ? calculator.api.toRequest(values)
      : {
          calculatorId: calculator.id,
          input: values,
          client: { name: "kalkulatorbazis-app", version: appVersion }
        };

    const payload = await httpClient.request(calculator.api.path, {
      method: calculator.api.method || "POST",
      body: requestBody
    });

    const mapped = calculator.api.fromResponse
      ? calculator.api.fromResponse(payload, values)
      : normalizeResult(payload);

    if (!mapped || typeof mapped.main !== "string") {
      throw new Error(`Hibás API-adapter eredmény: ${calculator.id}`);
    }

    return mapped;
  }
});
