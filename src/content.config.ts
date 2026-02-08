import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "src/content/blog";
export const PROJECTS_PATH = "src/content/projects";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.coerce.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      unlisted: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      heroImage: z.string().optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      // Additional fields from existing posts
      source: z.string().optional(),
      AIDescription: z.boolean().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${PROJECTS_PATH}` }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      image: image().or(z.string()).optional(),
      heroImage: image().or(z.string()).optional(),
      videoDemo: z.string().optional(),
      websiteUrl: z.string().optional(),
      codeUrl: z.string().optional(),
      githubUrl: z.string().optional(),
      pubDatetime: z.coerce.date().optional(),
      technologies: z.array(z.string()).optional(),
      status: z.enum(["completed", "in-progress", "planned", "ongoing"]).default("in-progress"),
    }),
});

export const collections = { blog, projects };
