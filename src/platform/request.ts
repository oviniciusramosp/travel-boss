/** Editing is available only with the local Vite file APIs. Builds are read-only. */
export const canEdit = import.meta.env?.DEV || import.meta.env?.VITE_TB_PRIVATE_SERVER === true;

/** The published app runs without an application server; dev keeps Markdown file editing. */
export async function appRequest(path: string, options?: RequestInit): Promise<Response> {
  if (canEdit) return fetch(path, options);
  const { publishedRequest } = await import('./published-api');
  return publishedRequest(path, options);
}
