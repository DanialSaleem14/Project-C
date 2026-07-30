import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listArticles, createArticle } from "@/lib/admin-articles";
import { articleInputSchema } from "@/lib/article-schema";
import { handleApiError } from "@/lib/api-response";
import type { ArticleStatus } from "@/types/article";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const status = request.nextUrl.searchParams.get("status") as ArticleStatus | null;
    const articles = await listArticles(status ?? undefined);
    return NextResponse.json({ articles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const input = articleInputSchema.parse(body);
    const article = await createArticle(input);
    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
