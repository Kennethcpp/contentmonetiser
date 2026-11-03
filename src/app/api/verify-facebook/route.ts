import { NextRequest, NextResponse } from "next/server";
import { verifyFacebookPage } from "@/lib/facebook";

export async function POST(req: NextRequest) {
  try {
    const { pageInput } = await req.json();
    if (!pageInput) {
      return NextResponse.json(
        { error: "Facebook page name or URL is required." },
        { status: 400 }
      );
    }

    const result = await verifyFacebookPage(pageInput);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
