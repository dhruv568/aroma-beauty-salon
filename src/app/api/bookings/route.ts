import { NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/dataService";
import { notifyBookingCreated } from "@/lib/notifier";

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      staffId,
      date,
      startTime,
      services,
      notes,
      paymentMethod,
      totalAmount,
      discountAmount,
      offerCode
    } = body;

    if (!customerName || !customerPhone || !date || !startTime || !services || services.length === 0 || !paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required booking details" }, { status: 400 });
    }

    const newBooking = await createBooking({
      customerName,
      customerPhone,
      staffId,
      date,
      startTime,
      services,
      notes,
      paymentMethod,
      totalAmount: Number(totalAmount),
      discountAmount: Number(discountAmount),
      offerCode
    });

    // Trigger SMS and WhatsApp notifications
    try {
      await notifyBookingCreated({
        bookingId: newBooking.bookingId,
        customerName: newBooking.customerName,
        customerPhone: newBooking.customerPhone,
        staffName: newBooking.staffName,
        date: newBooking.date,
        startTime: newBooking.startTime,
        totalAmount: newBooking.totalAmount,
        paymentMethod: newBooking.paymentMethod,
        services: newBooking.services
      });
    } catch (e) {
      console.error("SMS notification trigger failed:", e);
    }

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
