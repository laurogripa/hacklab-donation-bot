import clientPromise from "../lib/mongodb"

interface DetectedObject {
  name: string
  confidence: number
}

interface PhotoData {
  username: string
  photoUrl: string
  timestamp: Date
  chatId: number
  sfwScore?: number | undefined
  detectedObjects?: DetectedObject[]
  recognizedBrands?: string[]
}

export async function savePhotoData(data: PhotoData) {
  try {
    const client = await clientPromise
    const db = client.db("telegram-bot")
    const collection = db.collection("photos")

    const result = await collection.insertOne({
      username: data.username,
      photoUrl: data.photoUrl,
      chatId: data.chatId,
      timestamp: data.timestamp,
      sfwScore: data.sfwScore ?? null,
      detectedObjects: data.detectedObjects || [],
      recognizedBrands: data.recognizedBrands || [],
    })

    return result
  } catch (error) {
    console.error("Error saving photo data to MongoDB:", error)
    throw error
  }
}
