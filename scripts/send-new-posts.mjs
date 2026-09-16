import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const sha = process.env.GIT_SHA;
const apiKey = process.env.RESEND_API_KEY;
const segmentId = process.env.RESEND_SEGMENT_ID;
const from = process.env.RESEND_FROM;
const replyTo = "matteo@matteodevenuto.com";
const requestedFile = process.env.POST_FILE;
const dryRun = process.argv.includes("--dry-run");
const emailTemplate = readFileSync(new URL("../emails/new-post.html", import.meta.url), "utf8");
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });

if (!sha || (!dryRun && (!apiKey || !segmentId || !from))) {
  throw new Error("GIT_SHA, RESEND_API_KEY, RESEND_SEGMENT_ID, and RESEND_FROM are required");
}

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const show = (revision, file) => {
  try {
    return git("show", `${revision}:${file}`);
  } catch {
    return null;
  }
};
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
const isPublished = (data) => data.draft !== true && data.unlisted !== true;
const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s/g, "-")
    .replace(/[^\w-]/g, "");
const absoluteUrl = (value, base) => {
  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
};
const renderPost = (content, postUrl) =>
  sanitizeHtml(markdown.render(content), {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "em",
      "h2",
      "h3",
      "h4",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "strong",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "title", "style"],
      blockquote: ["style"],
      code: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      hr: ["style"],
      img: ["src", "alt", "title", "style"],
      li: ["style"],
      ol: ["style"],
      p: ["style"],
      pre: ["style"],
      ul: ["style"],
    },
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          href: absoluteUrl(attributes.href, postUrl),
          style: "color:#5181fb;text-decoration:underline;text-underline-offset:2px",
        },
      }),
      blockquote: (_tagName, attributes) => ({
        tagName: "blockquote",
        attribs: {
          ...attributes,
          style: "margin:24px 0;padding:4px 0 4px 20px;border-left:3px solid #5181fb;color:#56545a",
        },
      }),
      code: (_tagName, attributes) => ({
        tagName: "code",
        attribs: {
          ...attributes,
          style:
            "font-family:SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;color:#d63384;background:#f1f1f1;padding:2px 5px;border-radius:4px",
        },
      }),
      h2: (_tagName, attributes) => ({
        tagName: "h2",
        attribs: {
          ...attributes,
          style:
            "margin:42px 0 16px;padding:0 0 10px;border-bottom:1px solid #e6e6e6;color:#282728;font-size:25px;line-height:1.3",
        },
      }),
      h3: (_tagName, attributes) => ({
        tagName: "h3",
        attribs: {
          ...attributes,
          style: "margin:34px 0 14px;color:#282728;font-size:21px;line-height:1.35",
        },
      }),
      h4: (_tagName, attributes) => ({
        tagName: "h4",
        attribs: {
          ...attributes,
          style: "margin:28px 0 12px;color:#282728;font-size:18px;line-height:1.4",
        },
      }),
      hr: (_tagName, attributes) => ({
        tagName: "hr",
        attribs: { ...attributes, style: "margin:36px 0;border:0;border-top:1px dashed #5181fb" },
      }),
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: {
          ...attributes,
          src: absoluteUrl(attributes.src, postUrl),
          style:
            "display:block;width:100%;max-width:100%;height:auto;margin:28px 0;border-radius:6px",
        },
      }),
      li: (_tagName, attributes) => ({
        tagName: "li",
        attribs: { ...attributes, style: "margin:0 0 8px" },
      }),
      ol: (_tagName, attributes) => ({
        tagName: "ol",
        attribs: { ...attributes, style: "margin:18px 0 24px;padding-left:26px" },
      }),
      p: (_tagName, attributes) => ({
        tagName: "p",
        attribs: { ...attributes, style: "margin:0 0 22px" },
      }),
      pre: (_tagName, attributes) => ({
        tagName: "pre",
        attribs: {
          ...attributes,
          style:
            "margin:24px 0;padding:18px;overflow:auto;border:1px solid #e6e6e6;border-radius:6px;background:#f8f9fa;color:#282728;font-family:SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;line-height:1.55;white-space:pre-wrap",
        },
      }),
      ul: (_tagName, attributes) => ({
        tagName: "ul",
        attribs: { ...attributes, style: "margin:18px 0 24px;padding-left:26px" },
      }),
    },
  });

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "User-Agent": "matteodevenuto.com",
};
const changedFiles = requestedFile
  ? [requestedFile]
  : git("diff", "--name-only", "--diff-filter=AMR", `${sha}^`, sha, "--", "src/content/blog")
      .split("\n")
      .filter((file) => /\.mdx?$/.test(file));

let existingNames = new Set();
if (!dryRun) {
  const broadcastsResponse = await fetch("https://api.resend.com/broadcasts", { headers });
  if (!broadcastsResponse.ok) throw new Error(await broadcastsResponse.text());
  const broadcasts = await broadcastsResponse.json();
  existingNames = new Set(broadcasts.data.map((broadcast) => broadcast.name));
}

for (const file of changedFiles) {
  const currentSource = show(sha, file);
  if (!currentSource) continue;

  const parsed = matter(currentSource);
  const current = parsed.data;
  const previousSource = show(`${sha}^`, file);
  const previous = previousSource ? matter(previousSource).data : null;
  if (!isPublished(current) || (!requestedFile && previous && isPublished(previous))) continue;

  const path = file
    .replace(/^src\/content\/blog\//, "")
    .replace(/\.mdx?$/, "")
    .split("/")
    .map(slugify)
    .join("/");
  const url = `https://matteodevenuto.com/blog/${path}`;
  const broadcastName = `blog:${sha.slice(0, 12)}:${path}`;
  if (existingNames.has(broadcastName)) continue;

  const publishedAt = new Date(current.pubDatetime);
  if (Number.isNaN(publishedAt.getTime())) throw new Error(`${file}: invalid pubDatetime`);

  const title = escapeHtml(current.title);
  const description = escapeHtml(current.description);
  const hero = current.heroImage
    ? `<img src="${escapeHtml(absoluteUrl(current.heroImage, url))}" alt="" style="display:block;width:100%;height:auto;margin:0 0 32px;border-radius:6px">`
    : "";
  const html = emailTemplate
    .replaceAll("{{POST_TITLE}}", title)
    .replaceAll("{{POST_DESCRIPTION}}", description)
    .replaceAll("{{POST_URL}}", url)
    .replaceAll("{{POST_HERO}}", hero)
    .replaceAll("{{POST_CONTENT}}", renderPost(parsed.content, url));

  const scheduled = publishedAt > new Date();
  if (dryRun) {
    console.log(`Would ${scheduled ? "schedule" : "send"}: ${current.title} (${url})`);
    continue;
  }

  const response = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      segment_id: segmentId,
      from,
      reply_to: [replyTo],
      name: broadcastName,
      subject: current.title,
      preview_text: current.description,
      html,
      send: true,
      ...(scheduled && { scheduled_at: publishedAt.toISOString() }),
    }),
  });

  if (!response.ok) throw new Error(`${file}: ${await response.text()}`);
  console.log(`${scheduled ? "Scheduled" : "Sent"}: ${current.title}`);
}
