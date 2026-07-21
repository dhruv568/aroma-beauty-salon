import { NextResponse } from "next/server";
import { getOffers, addOffer, updateOffer, deleteOffer } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const offers = await getOffers(all);
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing offer ID" }, { status: 400 });
    }

    const success = await updateOffer(id, updates);
    if (!success) {
      return NextResponse.json({ success: false, error: "Offer not found or database update failed" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing offer ID" }, { status: 400 });
    }

    const success = await deleteOffer(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Offer not found or database delete failed" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
