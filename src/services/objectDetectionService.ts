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
 * Detects objects in an image using RapidAPI general detection API
 * @param imageUrl URL of the image to analyze
 * @returns Object with array of detected objects and optional error
 */
export async function detectObjectsInImage(
  imageUrl: string
): Promise<ObjectDetectionResult> {
  try {
    // RapidAPI endpoint for general object detection
    const API_URL = "https://general-detection.p.rapidapi.com/v1/results"

    // Make request to the object detection API using the URL parameter
    const response = await axios.post(
      `${API_URL}?algo=algo1`,
      `url=${encodeURIComponent(imageUrl)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": "general-detection.p.rapidapi.com",
          "x-rapidapi-key":
            "a77dfc9fe3msh2780dca01aaac20p10f67fjsn87b8b98f6e1c",
        },
      }
    )

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
