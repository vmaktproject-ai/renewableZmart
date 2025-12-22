import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import ProductCard from '../../components/ProductCard'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Store {
  id: string
  name: string
  description: string
  logo?: string
  banner?: string
  rating?: number
  totalReviews?: number
  totalSales?: number
  categories?: string[]
  isVerified?: boolean
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    tiktok?: string
    whatsapp?: string
  }
  owner?: {
    firstName: string
    lastName: string
  }
  products?: any[]
}

interface Review {
  id: number
  userName: string
  rating: number
  comment: string
  date: string
}

export default function StorePage() {
  const router = useRouter()
  const { slug } = router.query
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    if (slug) {
      fetchStore()
      fetchReviews()
    }
  }, [slug])

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/slug/${slug}`)
      const data = await response.json()
      console.log('Store data received:', { name: data.name, productsCount: data.products?.length })
      setStore(data)
    } catch (error) {
      console.error('Failed to fetch store:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/reviews/stores/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      alert('Please login to leave a review')
      router.push('/login')
      return
    }

    console.log('Submitting store review:', reviewForm)

    try {
      const token = localStorage.getItem('accessToken')
      console.log('Token:', token ? 'exists' : 'missing')
      
      const response = await fetch(`http://localhost:4000/api/reviews/stores/${slug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        alert('Review submitted successfully!')
        setShowReviewForm(false)
        setReviewForm({ rating: 5, comment: '' })
        fetchReviews()
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        alert(`Failed to submit review: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(`Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}`}
            onClick={(e) => {
              e.preventDefault()
              if (interactive && onChange) {
                onChange(star)
              }
            }}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? Number(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : typeof store?.rating === 'number'
      ? store.rating.toFixed(1)
      : '0.0'

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">Loading store...</div>
      </div>
    )
  }

  if (!store) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">Store not found</p>
          <Link href="/vendors" className="text-green-600 hover:underline">Browse all stores</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Head>
        <title>{store.name} - RenewableZmart</title>
        <meta name="description" content={store.description} />
      </Head>
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {store.logo ? (
                <div 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white cursor-pointer hover:opacity-90 transition flex-shrink-0"
                  onClick={() => {
                    const logoUrl = store.logo!.startsWith('http') 
                      ? store.logo! 
                      : `http://localhost:4000${store.logo!.startsWith('/') ? '' : '/'}${store.logo}`
                    setViewingImage(logoUrl)
                  }}
                  title="Click to view full size"
                >
                  <img
                    src={store.logo.startsWith('http') ? store.logo : `http://localhost:4000${store.logo.startsWith('/') ? '' : '/'}${store.logo}`}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{store.name}</h1>
                </div>
                
                <p className="text-gray-600 mb-4">{store.description}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(parseFloat(averageRating)))}
                      <span className="font-semibold">{averageRating}</span>
                      <span className="text-gray-600">({reviews.length} reviews)</span>
                    </div>
                  )}
                  <div className="text-gray-600">
                    <span className="font-semibold">{store.totalSales || 0}</span> products sold
                  </div>
                  {store.city && store.country && (
                    <div className="text-gray-600">
                      📍 {store.city}, {store.country}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-4 font-semibold ${activeTab === 'products' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              >
                Products ({store.products?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-4 font-semibold ${activeTab === 'about' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'products' ? (
            <div>
              {store.products && store.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                  {store.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No products available yet</p>
                </div>
              )}
            </div>
          ) : activeTab === 'about' ? (
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">About {store.name}</h2>
              <p className="text-gray-700 mb-6">{store.description}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                  {store.email && <p className="text-gray-600 mb-2">📧 {store.email}</p>}
                  {store.phone && <p className="text-gray-600 mb-2">📞 {store.phone}</p>}
                  {store.address && <p className="text-gray-600">📍 {store.address}</p>}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.categories?.map((cat, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Customer Reviews</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center">
                      {renderStars(Math.round(parseFloat(averageRating)))}
                    </div>
                    <span className="text-xl font-semibold">{averageRating}</span>
                    <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                  </div>
                </div>
                {currentUser && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-semibold"
                  >
                    {showReviewForm ? 'Cancel' : '✍️ Write Review'}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-lg mb-4">Share Your Experience</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    {renderStars(reviewForm.rating, true, (rating) => setReviewForm(prev => ({ ...prev, rating })))}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                      required
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Tell us about your experience with this store..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-semibold"
                  >
                    Submit Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No reviews yet</p>
                    <p className="text-sm">Be the first to review this store!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕ Close
            </button>
            <img 
              src={viewingImage} 
              alt="Store logo" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>RenewableZmart - Sustainable Energy Solutions. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">Powered by Vemakt Technology</p>
        </div>
      </footer>
    </div>
  )
}
