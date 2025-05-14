import axios from "axios"

interface BrandRecognitionResult {
  brands: string[]
  error?: string
}

/**
 * Recognizes brands in an image using API4AI brand recognition API
 * @param imageUrl URL of the image to analyze
 * @returns Object with array of recognized brands and optional error
 */
export async function recognizeBrandsInImage(
  imageUrl: string
): Promise<BrandRecognitionResult> {
  try {
    // API4AI demo API endpoint for brand recognition
    const API_URL = "https://demo.api4ai.cloud/brand-det/v2/results"

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

    // Make request to the brand recognition API
    const response = await axios.post(API_URL, formData, {
      headers: {
        "A4A-CLIENT-APP-ID": "sample",
        "Content-Type": "multipart/form-data",
      },
    })

    // Parse the response
    if (response.data && response.data.results) {
      // Extract recognized brands from the response
      const brands = response.data.results[0].entities[0].strings || []

      console.log("Brand recognition result:", brands)

      return {
        brands,
      }
    }

    return {
      brands: [],
      error: "Could not properly parse API response",
    }
  } catch (error) {
    console.error("Error recognizing brands in image:", error)

    return {
      brands: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
