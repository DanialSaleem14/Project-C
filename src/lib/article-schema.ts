import { z } from "zod";
import { CATEGORIES } from "@/types/article";

export const articleInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  excerpt: z.string().min(1).max(400),
  markdown: z.string().min(1),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string().min(1).max(40)).max(10),
  seoTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(160),
  featuredImageUrl: z.string().url(),
  sourceUrl: z.string().url(),
  sourceName: z.string().min(1).max(100),
  status: z.enum(["draft", "reviewed", "published", "rejected"]),
});

export const articleUpdateSchema = articleInputSchema.partial();
