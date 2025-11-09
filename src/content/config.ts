import { defineCollection, z } from "astro:content";

// Unified tag system - no more than 10 core tags
export const UNIFIED_TAGS = [
  "AI & ML",
  "Architecture",
  "Data & Databases",
  "Development",
  "Performance",
  "Real-time",
  "Serverless",
  "Web Development",
  "Offline-first",
  "Programming Languages",
  "Computational Psychiatry",
  "Decipad",
  "Career",
  "TimeClout",
] as const;

export type UnifiedTag = (typeof UNIFIED_TAGS)[number];

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string(),
    tags: z.array(z.enum(UNIFIED_TAGS)).optional(),
    image: z.string().optional(),
  }),
});

const assets = defineCollection({
  type: "data",
});

export const collections = {
  blog,
  assets,
};
