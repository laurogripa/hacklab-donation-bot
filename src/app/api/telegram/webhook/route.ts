import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { savePhotoData } from "../../../../services/photoService"

// Use the bot token from environment variables
const TELEGRAM_TOKEN = process.env.BOT_TOKEN || ""
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}`

// Helper function to download photo from Telegram
async function getPhotoFromTelegram(fileId: string) {
  try {
    // First, get the file path
    const response = await axios.get(`${TELEGRAM_API}/getFile`, {
      params: { file_id: fileId },
    })

    if (response.data.ok && response.data.result.file_path) {
      const filePath = response.data.result.file_path
      // Return the URL to download the file
      return `${TELEGRAM_FILE_API}/${filePath}`
    }

    throw new Error("Failed to get file path")
  } catch (error) {
    console.error("Error getting photo:", error)
    throw error
  }
}

// Helper function to send a message back to the chat
async function sendTelegramMessage(chatId: number, text: string) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
    })
  } catch (error) {
    console.error("Error sending message:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Log the update to help with debugging
    console.log(
      "Received update from Telegram:",
      JSON.stringify(update, null, 2)
    )

    // Check if the update contains a message with a photo
    if (update.message && update.message.photo) {
      const chatId = update.message.chat.id
      const username = update.message.from.username || "anonymous"

      // Get the largest photo (last in the array)
      const photos = update.message.photo
      const largestPhoto = photos[photos.length - 1]

      try {
        // Get the photo URL
        const photoUrl = await getPhotoFromTelegram(largestPhoto.file_id)

        // Store the photo information in MongoDB
        await savePhotoData({
          username,
          photoUrl,
          chatId,
          timestamp: new Date(),
        })

        // For now, we'll just acknowledge receipt
        await sendTelegramMessage(
          chatId,
          `Received your photo! It's been saved to our database.`
        )

        return NextResponse.json({
          status: "success",
          message: "Photo received and processed",
        })
      } catch (error) {
        console.error("Error processing photo:", error)
        await sendTelegramMessage(
          chatId,
          "Sorry, I couldn't process your photo."
        )

        return NextResponse.json(
          { error: "Failed to process photo" },
          { status: 500 }
        )
      }
    }

    // If the update doesn't contain a photo
    return NextResponse.json({
      status: "success",
      message: "Update received, but no photo found",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 400 }
    )
  }
}
