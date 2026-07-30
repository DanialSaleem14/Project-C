import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { setArticleStatus } from "@/lib/admin-articles";
import { pingIndexNow } from "@/lib/indexnow";
import { handleApiError } from "@/lib/api-response";
import { siteConfig } from "@/config/site";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const article = await setArticleStatus(id, "published");

    revalidatePath("/");
    revalidatePath(`/category/${article.category}`);
    revalidatePath(`/news/${article.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");

    await pingIndexNow([`${siteConfig.url}/news/${article.slug}`]);

    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}
