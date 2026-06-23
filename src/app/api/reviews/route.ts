import { NextResponse } from "next/server";
import { getReviews, addReview, replyToReview } from "@/lib/dataService";

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, rating, comment } = body;

    if (!customerName || !rating || !comment) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newReview = await addReview({
      customerName,
      rating: Number(rating),
      comment,
      isVerified: true
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, reply } = body;

    if (!id || !reply) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const success = await replyToReview(id, reply);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
