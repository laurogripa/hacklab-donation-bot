import axios from "axios"

interface NSFWCheckResult {
  isNSFW: boolean
  score?: number
  sfwScore?: number
  error?: string
}

/**
 * Checks if an image URL contains NSFW content using API4AI demo API
 * @param imageUrl URL of the image to check
 * @returns Object with isNSFW flag and optional score/error
 */
export async function checkImageForNSFW(
  imageUrl: string
): Promise<NSFWCheckResult> {
  try {
    // API4AI demo API endpoint for NSFW detection
    const API_URL = "https://demo.api4ai.cloud/nsfw/v1/results"

    // Fetch the image from the URL
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    })
    const imageBuffer = Buffer.from(imageResponse.data, "binary")

    // Prepare form data with the image
    const formData = new FormData()
    const blob = new Blob([imageBuffer], {
      type: imageResponse.headers["content-type"],
    })
    formData.append("image", blob)

    // Make request to the NSFW detection API
    const response = await axios.post(API_URL, formData, {
      headers: {
        "A4A-CLIENT-APP-ID": "sample",
        "Content-Type": "multipart/form-data",
      },
    })

    // Parse the response
    if (response.data && response.data.results) {
      // Extract the NSFW classification from the response
      const classes = response.data.results[0].entities[0].classes

      // Get the NSFW score - in this API it's the 'nsfw' class probability
      const nsfwScore = classes.nsfw || 0
      // Get the SFW score - in this API it might be represented as 'sfw' or 'neutral'
      // If not present, calculate as 1 - nsfw
      const sfwScore = classes.sfw || classes.neutral || 1 - nsfwScore

      console.log("NSFW detection result:", classes)

      // Consider the image NSFW if the score is above 0.95 (95%)
      return {
        isNSFW: nsfwScore > 0.95,
        score: nsfwScore,
        sfwScore: sfwScore,
      }
    }

    // If we can't determine the result clearly, err on the safe side
    return {
      isNSFW: true,
      error: "Could not properly parse API response",
    }
  } catch (error) {
    console.error("Error checking image for NSFW content:", error)

    // If there's an error, we'll err on the safe side and consider it potentially NSFW
    return {
      isNSFW: true,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
