import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import matter from "gray-matter";

const sha = process.env.GIT_SHA;
const apiKey = process.env.RESEND_API_KEY;
const segmentId = process.env.RESEND_SEGMENT_ID;
const from = process.env.RESEND_FROM;
const dryRun = process.argv.includes("--dry-run");
const emailTemplate = readFileSync(new URL("../emails/new-post.html", import.meta.url), "utf8");

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

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "User-Agent": "matteodevenuto.com",
};
const changedFiles = git(
  "diff",
  "--name-only",
  "--diff-filter=AMR",
  `${sha}^`,
  sha,
  "--",
  "src/content/blog"
)
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

  const current = matter(currentSource).data;
  const previousSource = show(`${sha}^`, file);
  const previous = previousSource ? matter(previousSource).data : null;
  if (!isPublished(current) || (previous && isPublished(previous))) continue;

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
  const html = emailTemplate
    .replaceAll("{{POST_TITLE}}", title)
    .replaceAll("{{POST_DESCRIPTION}}", description)
    .replaceAll("{{POST_URL}}", url);

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
      name: broadcastName,
      subject: current.title,
      html,
      send: true,
      ...(scheduled && { scheduled_at: publishedAt.toISOString() }),
    }),
  });

  if (!response.ok) throw new Error(`${file}: ${await response.text()}`);
  console.log(`${scheduled ? "Scheduled" : "Sent"}: ${current.title}`);
}
