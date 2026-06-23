import { NextResponse } from "next/server";
import { getHolidays, addHoliday, removeHoliday } from "@/lib/dataService";

export async function GET() {
  try {
    const holidays = await getHolidays();
    return NextResponse.json({ success: true, holidays });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: "Missing required date" }, { status: 400 });
    }

    const success = await addHoliday(date, reason);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ success: false, error: "Missing required date" }, { status: 400 });
    }

    const success = await removeHoliday(date);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
