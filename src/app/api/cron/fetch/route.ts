import { NextRequest, NextResponse } from "next/server";
import { runFetchPipeline } from "@/lib/pipeline";
import { handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runFetchPipeline("cron");
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
