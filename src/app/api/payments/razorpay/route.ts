import { NextResponse } from "next/server";
import { getSettings } from "@/lib/dataService";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ success: false, error: "Amount is required" }, { status: 400 });
    }

    const settings = await getSettings();

    // If Razorpay keys are configured
    if (settings.razorpayKeyId && settings.razorpayKeySecret) {
      const razorpay = new Razorpay({
        key_id: settings.razorpayKeyId,
        key_secret: settings.razorpayKeySecret
      });

      const options = {
        amount: Math.round(Number(amount) * 100), // convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      };

      const order = await razorpay.orders.create(options);
      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        keyId: settings.razorpayKeyId
      });
    } else {
      // Mock mode fallback
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      return NextResponse.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(Number(amount) * 100),
        keyId: "rzp_test_mockKey123456",
        isMock: true
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
