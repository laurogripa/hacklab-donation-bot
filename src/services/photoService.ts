import clientPromise from "../lib/mongodb"

interface PhotoData {
  username: string
  photoUrl: string
  timestamp: Date
  chatId: number
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
    })

    return result
  } catch (error) {
    console.error("Error saving photo data to MongoDB:", error)
    throw error
  }
}
