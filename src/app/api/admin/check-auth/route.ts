import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("aroma_admin_session");

    if (session && session.value === "authenticated_token_2026") {
      return NextResponse.json({ authenticated: true });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
