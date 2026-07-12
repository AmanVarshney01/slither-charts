// Static server for the built reptile house. This file is copied into dist/
// at build time and deployed as the Prisma Compute entrypoint — it serves
// its own directory with an SPA fallback to index.html.
const ROOT = new URL("./", import.meta.url).pathname

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const { pathname } = new URL(req.url)
    const path = pathname === "/" ? "index.html" : pathname.slice(1)
    const file = Bun.file(ROOT + path)
    if (await file.exists()) {
      return new Response(file, {
        headers: path.startsWith("assets/")
          ? { "cache-control": "public, max-age=31536000, immutable" }
          : undefined,
      })
    }
    return new Response(Bun.file(ROOT + "index.html"))
  },
})

console.log(`🐍 reptile house open on :${server.port}`)
