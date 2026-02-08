import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const markdownContent = `# Matteo De Venuto (@matteodevenuto)

Trader and Ambassador at Falcon FX | Passionate about markets, programming, technology and much more.

## Navigation

- [About](/about.md)
- [Recent Posts](/blog.md)
- [Archives](/archives.md)
- [RSS Feed](/rss.xml)

## Links

- Twitter: [@matteodevenuto](https://twitter.com/matteodevenuto)
- GitHub: [@matteodevenuto](https://github.com/matteodevenuto)
- Email: matteodevenuto@gmail.com

---

*This is the markdown-only version of matteodevenuto.me. Visit [matteodevenuto.me](https://matteodevenuto.me) for the full experience.*`;

  return new Response(markdownContent, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
