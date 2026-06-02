/** basePath-aware link helper for the static export. */
const BP = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BP}${path}`;
}

export function asset(path: string): string {
  return withBase(path);
}
