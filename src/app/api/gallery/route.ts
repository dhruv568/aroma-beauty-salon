import { NextResponse } from "next/server";
import { getGallery, addGalleryItem } from "@/lib/dataService";

export async function GET() {
  try {
    const gallery = await getGallery();
    return NextResponse.json({ success: true, gallery });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, category, isBeforeAfter, afterImageUrl } = body;

    if (!imageUrl || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newItem = await addGalleryItem({
      imageUrl,
      category,
      isBeforeAfter: !!isBeforeAfter,
      afterImageUrl: afterImageUrl || undefined
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
