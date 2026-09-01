/**
 * API base URL for the generated client.
 *
 * Vite statically replaces `import.meta.env.*` at build time. This value lives
 * in its own module (instead of inline in `http.ts`) because orval bundles the
 * mutator file with an ES2015 esbuild target, which does not support
 * `import.meta` and would otherwise log an `empty-import-meta` warning on every
 * `pnpm generate:api-client` run.
 */
export const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'
