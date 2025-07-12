import axios from "axios"

interface BrandRecognitionResult {
  brands: string[]
  error?: string
}

/**
 * Recognizes brands in an image using RapidAPI brand recognition API
 * @param imageUrl URL of the image to analyze
 * @returns Object with array of recognized brands and optional error
 */
export async function recognizeBrandsInImage(
  imageUrl: string
): Promise<BrandRecognitionResult> {
  try {
    // RapidAPI endpoint for brand recognition
    const API_URL = "https://brand-recognition.p.rapidapi.com/v2/results"

    // Make request to the brand recognition API using URL parameter
    const response = await axios.post(
      API_URL,
      `url=${encodeURIComponent(imageUrl)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": "brand-recognition.p.rapidapi.com",
          "x-rapidapi-key":
            "a77dfc9fe3msh2780dca01aaac20p10f67fjsn87b8b98f6e1c",
        },
      }
    )

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
