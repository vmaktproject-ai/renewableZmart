import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import MediaCarousel from '../../components/MediaCarousel'
import { useCart } from '../../context/CartContext'
import { useCurrency } from '../../context/CurrencyContext'
import type { CatalogProduct } from '../../types'
import { productService } from '@/lib/services'

interface Review {
  id: number
  userName: string
  rating: number
  comment: string
  date: string
}

export default function ProductPage() {
  const router = useRouter()
  const { id } = router.query
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchReviews()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const data = await productService.getById(String(id))
      setProduct(data as any)
    } catch (error) {
      console.error('Failed to fetch product:', error)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/reviews/products/${id}`)
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

    console.log('Submitting review:', reviewForm)

    try {
      const token = localStorage.getItem('accessToken')
      console.log('Token:', token ? 'exists' : 'missing')
      
      const response = await fetch(`http://localhost:4000/api/reviews/products/${id}`, {
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

  const renderEmptyStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-2xl" style={{ color: '#d1d5db' }}>
            ★
          </span>
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  // Calculate installment details
  const getInstallmentDetails = (price: number) => {
    const firstPayment = price * 0.5
    const balance = price - firstPayment
    
    if (price >= 450000 && price <= 1000000) {
      // 3 months for 450k - 1M
      const monthlyPayment = balance / 3
      return {
        firstPayment,
        monthlyPayment,
        months: 3,
        totalMonths: 4 // 1 upfront + 3 installments
      }
    } else {
      // 3-6 months for other amounts
      const monthlyPayment = balance / 6
      return {
        firstPayment,
        monthlyPayment,
        months: 6,
        totalMonths: 7 // 1 upfront + 6 installments
      }
    }
  }

  const installment = product ? getInstallmentDetails(product.price) : null

  // Get full image URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'
  const primaryImageUrl = product?.image?.startsWith('http') 
    ? product.image 
    : `${API_BASE_URL}${product?.image || ''}`

  if (!product) {
    return <div><Header /><main className="container mx-auto px-4 py-8"><p>Product not found</p></main></div>
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span>
          <span className="mx-2">›</span>
          <span className="hover:underline cursor-pointer">{product.category}</span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr_300px] gap-4">
          {/* Left: Image/Video Gallery with Carousel */}
          <MediaCarousel 
            mainImage={primaryImageUrl}
            images={(product as any).images || []}
            videos={(product as any).videos || []}
            title={product.title}
          />

          {/* Middle: Product Details */}
          <div className="bg-white rounded-lg p-4">
            <h1 className="text-xl font-normal mb-3 leading-snug">{product.title}</h1>
            
            {/* Rating - Only show if there are reviews */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                <div className="flex items-center">
                  {renderStars(parseFloat(averageRating))}
                </div>
                <span className="text-sm">({reviews.length} verified ratings)</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">₦{product.price.toLocaleString()}</p>
            </div>

            {/* Pay Small Small */}
            {installment && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="font-semibold text-sm mb-1">💳 Pay Small Small</p>
                <p className="text-sm">
                  <span className="font-bold">₦{installment.firstPayment.toLocaleString()}</span> upfront, 
                  then <span className="font-bold">₦{installment.monthlyPayment.toLocaleString()}/month</span> for {installment.months} months
                </p>
                <p className="text-xs text-gray-600 mt-1">0% interest • No hidden charges</p>
              </div>
            )}

            {/* Key Features */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>✓ High Quality {product.category}</li>
                <li>✓ {product.stock} units in stock</li>
                {product.eco && <li>✓ Eco-Friendly & Sustainable</li>}
                <li>✓ Fast Delivery Available</li>
                <li>✓ Official Warranty</li>
              </ul>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Product Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {(product as any).description && (product as any).description.trim().length > 0 && (product as any).description !== 'fix' 
                  ? (product as any).description 
                  : `High-quality ${product.category} designed for reliable performance. This renewable energy product offers excellent value and durability, perfect for residential and commercial applications. Comes with manufacturer warranty and technical support.`}
              </p>
            </div>
          </div>

          {/* Right: Purchase Card (3rd column) */}
          <div>
            <div className="bg-white rounded-lg p-4 mb-4 sticky top-4">
              <h3 className="font-bold mb-3">DELIVERY & RETURNS</h3>

              <div className="mb-4">
                <p className="text-sm font-semibold mb-1">🚚 Delivery</p>
                <p className="text-sm text-gray-600">Estimated delivery: 3-7 days</p>
              </div>

              <div className="mb-4 pb-4 border-b">
                <p className="text-sm font-semibold mb-1">🔧 Installation</p>
                <p className="text-sm text-gray-600">Installation within 7 working days</p>
              </div>

              <div className="space-y-2">
                <button 
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                  onClick={() => { addToCart(product); router.push('/cart') }}
                >
                  ADD TO CART
                </button>
                <button className="w-full bg-white border-2 border-orange-500 text-orange-500 py-3 rounded-lg font-bold hover:bg-orange-50 transition">
                  BUY NOW
                </button>
              </div>

              {/* Seller Info */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-600 mb-1">SOLD BY</p>
                {(product as any).store?.slug ? (
                  <button 
                    onClick={() => router.push(`/store/${(product as any).store.slug}`)}
                    className="font-semibold text-sm text-emerald-600 hover:underline cursor-pointer"
                  >
                    {(product as any).store.name}
                  </button>
                ) : (
                  <p className="font-semibold text-sm">{(product as any).store?.name || 'Business Day'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-4 bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Customer Feedback</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-sm">
                  {renderEmptyStars()}
                </div>
                <span className="font-semibold">{averageRating}/5</span>
                <span className="text-sm text-gray-600">({reviews.length} verified ratings)</span>
              </div>
            </div>
            {currentUser && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-semibold"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Rating</label>
                {renderStars(reviewForm.rating, true, (rating) => setReviewForm(prev => ({ ...prev, rating })))}
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Review</label>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 text-sm font-semibold"
              >
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List - Compact */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <p>No reviews yet. Be the first!</p>
              </div>
            ) : (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{review.userName}</p>
                        <div className="flex items-center gap-1 text-xs">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-10">{review.comment}</p>
                </div>
              ))
            )}
            {reviews.length > 5 && (
              <button className="text-orange-500 text-sm font-semibold hover:underline">
                See all {reviews.length} reviews
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>RenewableZmart - Sustainable Energy Solutions. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">Powered by Vemakt Technology</p>
        </div>
      </footer>
    </div>
  )
}
