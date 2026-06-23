import { NextResponse } from "next/server";
import { getStaff, addStaff } from "@/lib/dataService";

export async function GET() {
  try {
    const staff = await getStaff();
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, imageUrl } = body;
    
    if (!name || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newStaff = await addStaff({
      name,
      role,
      imageUrl: imageUrl || "/images/default-avatar.jpg",
      isActive: true
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
