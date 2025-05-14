import axios from "axios"

interface DetectedObject {
  name: string
  confidence: number
}

interface ObjectDetectionResult {
  objects: DetectedObject[]
  error?: string
}

/**
 * Detects objects in an image using API4AI general detection API
 * @param imageUrl URL of the image to analyze
 * @returns Object with array of detected objects and optional error
 */
export async function detectObjectsInImage(
  imageUrl: string
): Promise<ObjectDetectionResult> {
  try {
    // API4AI demo API endpoint for general object detection
    const API_URL = "https://demo.api4ai.cloud/general-det/v1/results"

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

    // Make request to the object detection API
    const response = await axios.post(API_URL, formData, {
      headers: {
        "A4A-CLIENT-APP-ID": "sample",
        "Content-Type": "multipart/form-data",
      },
    })

    // Parse the response
    if (response.data && response.data.results) {
      // Extract objects with confidence > 0.5
      const detectedObjects: DetectedObject[] = []

      // Navigate to objects array
      const objects = response.data.results[0].entities[0].objects || []

      for (const obj of objects) {
        // Get object classes with confidence scores
        const classes = obj.entities[0].classes

        // Add each detected object with confidence > 0.5
        for (const [name, confidence] of Object.entries(classes)) {
          if ((confidence as number) > 0.5) {
            detectedObjects.push({
              name,
              confidence: confidence as number,
            })
          }
        }
      }

      console.log("Object detection result:", detectedObjects)

      return {
        objects: detectedObjects,
      }
    }

    return {
      objects: [],
      error: "Could not properly parse API response",
    }
  } catch (error) {
    console.error("Error detecting objects in image:", error)

    return {
      objects: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
