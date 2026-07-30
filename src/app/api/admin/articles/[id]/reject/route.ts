import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { setArticleStatus } from "@/lib/admin-articles";
import { handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const article = await setArticleStatus(id, "rejected");
    return NextResponse.json({ article });
  } catch (error) {
    return handleApiError(error);
  }
}
