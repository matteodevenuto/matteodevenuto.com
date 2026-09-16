import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getPath } from "@/utils/getPath";

export const prerender = false;

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });

const views: APIRoute = async ({ params, request }) => {
  const slug = params.slug?.replace(/^\/+|\/+$/g, "");

  if (!slug || slug.length > 240 || slug.includes("..")) {
    return json({ error: "Invalid blog post" }, 400);
  }

  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const exists = posts.some(
    (post) => getPath(post.id, post.filePath, false).replace(/^\//, "") === slug
  );

  if (!exists) return json({ error: "Blog post not found" }, 404);

  const credentials = [
    [import.meta.env.UPSTASH_REDIS_REST_URL, import.meta.env.UPSTASH_REDIS_REST_TOKEN],
    [import.meta.env.KV_REST_API_URL, import.meta.env.KV_REST_API_TOKEN],
  ].find(([url, token]) => url && token);

  if (!credentials) return json({ error: "View counter is not configured" }, 503);

  const [url, token] = credentials;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([request.method === "POST" ? "INCR" : "GET", `blog:views:${slug}`]),
    });
    const data = await response.json();
    const count = data.result === null ? 0 : Number(data.result);

    if (!response.ok || !Number.isInteger(count) || count < 0) {
      return json({ error: "View counter failed" }, 502);
    }

    return json({ views: count }, 200);
  } catch {
    return json({ error: "View counter failed" }, 502);
  }
};

export const GET = views;
export const POST = views;
