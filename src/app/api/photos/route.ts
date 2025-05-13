import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("telegram-bot")
    const collection = db.collection("photos")

    // Fetch the photos, sort by timestamp in descending order (newest first)
    const photos = await collection.find({}).sort({ timestamp: -1 }).toArray()

    return NextResponse.json(photos)
  } catch (error) {
    console.error("Error fetching photos from MongoDB:", error)
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    )
  }
}
