import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getArticleCounts } from "@/lib/admin-articles";
import { handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const counts = await getArticleCounts();
    return NextResponse.json(counts);
  } catch (error) {
    return handleApiError(error);
  }
}
