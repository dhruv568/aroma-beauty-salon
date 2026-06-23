import { NextResponse } from "next/server";
import { getServices, addService, updateService, deleteService } from "@/lib/dataService";

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, description, benefits, price, offerPrice, duration, imageUrl } = body;
    
    if (!name || !category || !price || !duration) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const newService = await addService({
      name,
      slug,
      category,
      description: description || "",
      benefits: benefits || [],
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      duration: Number(duration),
      imageUrl: imageUrl || "/images/default-service.jpg",
      isActive: true
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing service ID" }, { status: 400 });
    }

    const success = await updateService(id, updates);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing service ID" }, { status: 400 });
    }

    const success = await deleteService(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
