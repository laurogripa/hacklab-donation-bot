import { NextRequest, NextResponse } from "next/server"

export const GET = async () => {
  return NextResponse.json({
    message: "Hello from the API!",
    timestamp: new Date().toISOString(),
  })
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()

    return NextResponse.json({
      message: "Data received successfully",
      data: body,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to parse request body" },
      { status: 400 }
    )
  }
}
