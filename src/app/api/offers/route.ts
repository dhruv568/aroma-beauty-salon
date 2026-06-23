import { NextResponse } from "next/server";
import { getOffers, addOffer } from "@/lib/dataService";

export async function GET() {
  try {
    const offers = await getOffers();
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, code, description, discountType, discountValue, startDate, endDate } = body;
    
    if (!title || !code || !discountType || discountValue === undefined || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newOffer = await addOffer({
      title,
      code: code.toUpperCase().replace(/\s+/g, ""),
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      startDate,
      endDate,
      isActive: true
    });

    return NextResponse.json({ success: true, offer: newOffer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
