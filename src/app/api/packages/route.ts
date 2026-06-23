import { NextResponse } from "next/server";
import { getPackages } from "@/lib/dataService";

export async function GET() {
  try {
    const packages = await getPackages();
    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
