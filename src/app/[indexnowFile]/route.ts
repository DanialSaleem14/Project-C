import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ indexnowFile: string }>;
}

/**
 * Serves the IndexNow key-verification file at /{INDEXNOW_KEY}.txt, as
 * required by the IndexNow protocol. Next.js resolves any other static
 * top-level route (/about, /admin, /category, etc.) before falling
 * back to this dynamic catch-all, so it only ever responds to the
 * exact key filename and 404s on anything else.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { indexnowFile } = await params;
  const key = process.env.INDEXNOW_KEY;

  if (!key || indexnowFile !== `${key}.txt`) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(key, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
