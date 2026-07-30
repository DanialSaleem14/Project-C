import "server-only";
import { z } from "zod";
import { CATEGORIES } from "@/types/article";
import type { RssItem } from "@/lib/rss";

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const geminiArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  excerpt: z.string().min(1).max(400),
  markdown: z.string().min(1),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).max(10),
  seoTitle: z.string().min(1).max(70),
  metaDescription: z.string().min(1).max(160),
});

export type GeminiArticle = z.infer<typeof geminiArticleSchema>;

function buildPrompt(item: RssItem): string {
  return `You are a professional technology journalist writing for an AI news website.

Source headline: "${item.title}"
Source publication: ${item.sourceName}
Source summary/snippet (for context only - do NOT copy any phrasing from it):
"""
${item.summary}
"""

Write a completely ORIGINAL news article of 600-900 words about this development. Requirements:
- Never copy sentences or distinctive phrasing from the source summary; rewrite entirely in your own words.
- Add context and analysis beyond what the snippet says: background on the company/technology, how it fits into the broader AI landscape, and informed speculation about implications.
- Include a section with the heading "## Why it matters" that explains the significance for readers.
- Use clear, factual, neutral journalistic tone. Do not fabricate specific quotes, statistics, or facts not implied by the source headline/summary.
- Suggest the single most fitting category from exactly these options: ${CATEGORIES.join(", ")}.
- Produce an SEO title under 70 characters and a meta description under 160 characters.
- Produce a URL slug: lowercase, hyphen-separated, no punctuation, derived from the title.

Respond with ONLY a JSON object with exactly these fields: title, slug, excerpt (1-2 sentence summary), markdown (the full article body in Markdown, using ## for section headings), category, tags (array of up to 6 lowercase topical keywords), seoTitle, metaDescription.`;
}

export class GeminiGenerationError extends Error {}

export async function generateArticleFromSource(item: RssItem): Promise<GeminiArticle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiGenerationError("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(item) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new GeminiGenerationError(`Gemini API error ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new GeminiGenerationError("Gemini response contained no text");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiGenerationError("Gemini response was not valid JSON");
  }

  const result = geminiArticleSchema.safeParse(parsed);
  if (!result.success) {
    throw new GeminiGenerationError(`Gemini response failed schema validation: ${result.error.message}`);
  }

  return result.data;
}
