import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { SITE } from "@/config";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";

const parser = new MarkdownIt();

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map((post) => {
      let html = parser.render(post.body || "");

      // Add hero image at the top if available
      if (post.data.heroImage) {
        const heroImageUrl = post.data.heroImage.startsWith("http")
          ? post.data.heroImage
          : `${SITE.website}${post.data.heroImage}`;

        const heroImageHtml = `<p><img src="${heroImageUrl}" alt="${post.data.title}" style="max-width: 100%; height: auto;"/></p>`;
        html = heroImageHtml + html;
      }

      // Fix relative image paths to absolute URLs
      html = html.replace(/src="\/assets\//g, `src="${SITE.website}/assets/`);
      html = html.replace(/src="\.\.\//g, `src="${SITE.website}/`);

      // Sanitize HTML for RSS safety
      const cleanHtml = sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
          img: ["src", "alt", "width", "height", "style"],
        },
      });

      return {
        link: getPath(post.id, post.filePath),
        title: post.data.title,
        description: post.data.description,
        content: cleanHtml,
        pubDate: new Date(post.data.modDatetime ?? post.data.pubDatetime),
      };
    }),
  });
}
