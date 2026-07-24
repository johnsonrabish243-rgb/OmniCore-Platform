/**
 * Secure fetch wrapper that includes CSRF protection headers.
 * Use this for all API calls that modify data (POST, PUT, DELETE, PATCH).
 */

const CSRF_HEADER_NAME = "x-requested-with";
const CSRF_HEADER_VALUE = "xmlhttprequest";

interface SecureFetchOptions extends RequestInit {
  method?: string;
}

export async function secureFetch(url: string, options: SecureFetchOptions = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";
  const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  const headers = new Headers(options.headers);

  if (isStateChanging) {
    headers.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);
  }

  if (!headers.has("Content-Type") && isStateChanging) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    method,
    headers,
  });
}
