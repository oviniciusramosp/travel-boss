/** The published app runs without an application server; dev keeps Markdown file editing. */
export async function appRequest(path: string, options?: RequestInit): Promise<Response> {
  if (import.meta.env.DEV) return fetch(path, options);
  const { publishedRequest } = await import('./published-api');
  return publishedRequest(path, options);
}
