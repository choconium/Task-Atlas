function createWorkerFetch(apiHandler) {
  const apiFetch =
    typeof apiHandler === "function"
      ? apiHandler
      : typeof apiHandler?.fetch === "function"
        ? apiHandler.fetch.bind(apiHandler)
        : null;
  if (!apiFetch)
    throw new TypeError("apiHandler must be a function or expose fetch()");

  // Static GET and HEAD go to the Assets binding; everything else (API paths,
  // OPTIONS preflight, writes) goes through the Node adapter, which answers
  // 204 for OPTIONS and 405 for unsupported methods.
  return async function fetch(request, env, context) {
    const pathname = new URL(request.url).pathname;
    const isStaticRead = request.method === "GET" || request.method === "HEAD";
    if (pathname === "/api" || pathname.startsWith("/api/") || !isStaticRead)
      return apiFetch(request, env, context);
    return env.ASSETS.fetch(request);
  };
}

module.exports = { createWorkerFetch };
