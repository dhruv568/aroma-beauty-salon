import { NextResponse } from "next/server";
import { rescheduleBooking } from "@/lib/dataService";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, startTime } = body;

    if (!id || !date || !startTime) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const success = await rescheduleBooking(id, date, startTime);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
