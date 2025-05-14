import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { savePhotoData } from "../../../../services/photoService"
import { checkImageForNSFW } from "../../../../services/nsfwCheckService"
import { detectObjectsInImage } from "../../../../services/objectDetectionService"
import { recognizeBrandsInImage } from "../../../../services/brandRecognitionService"

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

        // Check if the image contains NSFW content
        const nsfwCheckResult = await checkImageForNSFW(photoUrl)

        if (nsfwCheckResult.isNSFW) {
          // Reject the photo if it contains NSFW content
          await sendTelegramMessage(
            chatId,
            "Sorry, we cannot accept this image as it appears to contain inappropriate content."
          )

          console.log(
            `Rejected NSFW image from ${username}, score: ${nsfwCheckResult.score}`
          )

          return NextResponse.json({
            status: "rejected",
            message: "Image contains NSFW content",
          })
        }

        // Extract SFW score from the NSFW check result
        // If the API result had an 'sfw' class, use that, otherwise calculate it as 1 - nsfw score
        const sfwScore =
          nsfwCheckResult.sfwScore !== undefined
            ? nsfwCheckResult.sfwScore
            : nsfwCheckResult.score !== undefined
            ? 1 - nsfwCheckResult.score
            : undefined

        // Run object detection and brand recognition in parallel to save time
        const [objectDetectionResult, brandRecognitionResult] =
          await Promise.all([
            detectObjectsInImage(photoUrl),
            recognizeBrandsInImage(photoUrl),
          ])

        // Get list of detected objects
        const detectedObjects = objectDetectionResult.objects

        // Get list of recognized brands
        const recognizedBrands = brandRecognitionResult.brands

        // Log detected objects and brands
        if (detectedObjects.length > 0) {
          console.log(
            `Detected ${detectedObjects.length} objects in image from ${username}`
          )
        }

        if (recognizedBrands.length > 0) {
          console.log(
            `Recognized ${
              recognizedBrands.length
            } brands in image from ${username}: ${recognizedBrands.join(", ")}`
          )
        }

        // Store the photo if it passes the NSFW check
        await savePhotoData({
          username,
          photoUrl,
          chatId,
          timestamp: new Date(),
          sfwScore,
          detectedObjects,
          recognizedBrands,
        })

        // Acknowledge receipt with info about detected objects and brands
        let responseMessage = `Thank you for your donation photo! It's been approved and added to our gallery.`

        // Add information about detected objects if any were found
        if (detectedObjects.length > 0) {
          const objectsList = detectedObjects
            .slice(0, 3) // Limit to top 3 objects to avoid very long messages
            .map((obj) => `${obj.name} (${Math.round(obj.confidence * 100)}%)`)
            .join(", ")

          responseMessage += `\n\nObjects detected: ${objectsList}`

          // If there are more objects than we listed
          if (detectedObjects.length > 3) {
            responseMessage += ` and ${detectedObjects.length - 3} more`
          }
        }

        // Add information about recognized brands if any were found
        if (recognizedBrands.length > 0) {
          responseMessage += `\n\nBrands recognized: ${recognizedBrands
            .slice(0, 3)
            .join(", ")}`

          // If there are more brands than we listed
          if (recognizedBrands.length > 3) {
            responseMessage += ` and ${recognizedBrands.length - 3} more`
          }
        }

        await sendTelegramMessage(chatId, responseMessage)

        return NextResponse.json({
          status: "success",
          message: "Photo received, checked, and processed",
          objectsDetected: detectedObjects.length,
          brandsRecognized: recognizedBrands.length,
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
