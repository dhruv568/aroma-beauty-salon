import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "anju@aroma";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "aroma_admin_session",
        value: "authenticated_token_2026",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/"
      });

      return NextResponse.json({ success: true, message: "Logged in successfully" });
    } else {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
