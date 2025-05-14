"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface DetectedObject {
  name: string
  confidence: number
}

interface PhotoData {
  _id: string
  username: string
  photoUrl: string
  timestamp: Date
  chatId: number
  sfwScore?: number
  detectedObjects?: DetectedObject[]
}

export default function Home() {
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch("/api/photos")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setPhotos(data)
      } catch (err) {
        setError("Failed to load photos. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  // Function to format SFW score as percentage
  function formatSfwScore(score: number | undefined | null): string {
    if (score === undefined || score === null) return "N/A"
    return `${Math.round(score * 100)}%`
  }

  // Function to determine tag color based on SFW score
  function getSfwScoreColor(score: number | undefined | null): string {
    if (score === undefined || score === null) return "bg-gray-400"

    if (score >= 0.95) return "bg-green-500"
    if (score >= 0.85) return "bg-green-400"
    if (score >= 0.7) return "bg-yellow-400"
    if (score >= 0.5) return "bg-yellow-500"
    return "bg-orange-400"
  }

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Donation Photos</h1>

      {photos.length === 0 ? (
        <div className="text-center py-8">
          No photos have been uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="border rounded-lg overflow-hidden shadow-md"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={photo.photoUrl}
                  alt={`Photo by ${photo.username}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">@{photo.username}</p>
                  <span
                    className={`${getSfwScoreColor(
                      photo.sfwScore
                    )} text-white text-xs px-2 py-1 rounded-full`}
                  >
                    SFW: {formatSfwScore(photo.sfwScore)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(photo.timestamp).toLocaleString()}
                </p>

                {/* Display object tags if any were detected */}
                {photo.detectedObjects && photo.detectedObjects.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Detected objects:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {photo.detectedObjects.slice(0, 5).map((obj, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                          title={`Confidence: ${Math.round(
                            obj.confidence * 100
                          )}%`}
                        >
                          {obj.name}
                        </span>
                      ))}
                      {photo.detectedObjects.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{photo.detectedObjects.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
