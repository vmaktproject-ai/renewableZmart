import { useState } from 'react'

interface MediaCarouselProps {
  mainImage: string
  images?: string[]
  videos?: string[]
  title: string
}

export default function MediaCarousel({ mainImage, images = [], videos = [], title }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Combine all media items (main image + additional images + videos)
  const allMedia = [
    mainImage,
    ...images.slice(0, 5),
    ...(videos || [])
  ].filter(Boolean)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const getMediaUrl = (media: string) => {
    if (!media) return '';
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'
    return media.startsWith('http') ? media : `${API_BASE_URL}${media}`
  }

  const currentMedia = allMedia[currentIndex] ? getMediaUrl(allMedia[currentIndex]) : ''
  const isVideo = allMedia[currentIndex]?.includes('.mp4') || allMedia[currentIndex]?.includes('.webm')

  if (allMedia.length === 0) {
    return <div className="w-full h-[350px] bg-gray-200 rounded flex items-center justify-center">No media available</div>
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Main Display */}
      <div className="relative bg-gray-50 rounded overflow-hidden mb-3" style={{ height: '350px' }}>
        {isVideo ? (
          <video
            src={currentMedia}
            controls
            className="w-full h-full object-contain"
            poster={mainImage}
          />
        ) : (
          <img
            src={currentMedia}
            alt={title}
            className="w-full h-full object-contain"
          />
        )}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition"
              aria-label="Previous media"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition"
              aria-label="Next media"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              {currentIndex + 1} / {allMedia.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {allMedia.length > 1 && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-min">
            {allMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 relative rounded transition ${
                  currentIndex === index
                    ? 'border-2 border-orange-500'
                    : 'border-2 border-gray-200 hover:border-orange-300'
                }`}
              >
                {media.includes('.mp4') || media.includes('.webm') ? (
                  <div className="w-16 h-16 bg-gray-800 flex items-center justify-center rounded">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={getMediaUrl(media)}
                    alt={`${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
