declare module 'global-jsdom' {
  export default function globalJsdom(
    html?: string,
    options?: { referrer?: string; url?: string },
  ): () => void
}
