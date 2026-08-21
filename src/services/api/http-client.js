export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.cause = options.cause;
  }
}

export const createHttpClient = ({ baseUrl, timeoutMs = 8000 }) => ({
  async request(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    try {
      const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      let payload = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) payload = await response.json();

      if (!response.ok) {
        throw new ApiError(payload?.message || `API-hiba (${response.status})`, {
          status: response.status,
          code: payload?.code || null
        });
      }

      return payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error?.name === "AbortError") {
        throw new ApiError("Az API nem válaszolt időben.", { code: "TIMEOUT", cause: error });
      }
      throw new ApiError("Az API nem érhető el.", { code: "NETWORK", cause: error });
    } finally {
      clearTimeout(timer);
    }
  }
});
