import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { runFetchPipeline } from "@/lib/pipeline";
import { handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const result = await runFetchPipeline("manual");
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
