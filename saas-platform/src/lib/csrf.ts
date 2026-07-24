/**
 * CSRF Protection for API routes.
 * Uses the custom header pattern: browsers won't send custom headers in cross-origin requests.
 */

const CSRF_HEADER_NAME = "x-requested-with";
const CSRF_HEADER_VALUE = "xmlhttprequest";

export function validateCSRFRequest(request: Request): boolean {
  const headerValue = request.headers.get(CSRF_HEADER_NAME);
  return headerValue === CSRF_HEADER_VALUE;
}

export function getCSRFHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
  };
}
