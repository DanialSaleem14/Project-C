import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getArticleById, updateArticle } from "@/lib/admin-articles";
import { articleUpdateSchema } from "@/lib/article-schema";
import { handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const input = articleUpdateSchema.parse(body);
    const article = await updateArticle(id, input);
    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}
