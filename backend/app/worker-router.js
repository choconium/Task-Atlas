function createWorkerFetch(apiHandler) {
  const apiFetch =
    typeof apiHandler === "function"
      ? apiHandler
      : typeof apiHandler?.fetch === "function"
        ? apiHandler.fetch.bind(apiHandler)
        : null;
  if (!apiFetch)
    throw new TypeError("apiHandler must be a function or expose fetch()");

  return async function fetch(request, env, context) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/") || request.method !== "GET")
      return apiFetch(request, env, context);
    return env.ASSETS.fetch(request);
  };
}

module.exports = { createWorkerFetch };
