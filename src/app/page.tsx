"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface PhotoData {
  _id: string
  username: string
  photoUrl: string
  timestamp: Date
  chatId: number
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

  return (
    <main className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">User Photos</h1>

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
                <p className="font-semibold">@{photo.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(photo.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
