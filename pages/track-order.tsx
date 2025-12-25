import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface TrackingStatus {
  orderId: string
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled'
  orderDate: string
  estimatedDelivery: string
  items: Array<{
    name: string
    quantity: number
    image: string
  }>
  timeline: Array<{
    status: string
    description: string
    date: string
    completed: boolean
  }>
  trackingNumber?: string
  carrier?: string
}

export default function TrackOrder() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [trackingData, setTrackingData] = useState<TrackingStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-load order from URL parameter
  useEffect(() => {
    if (router.query.order && typeof router.query.order === 'string') {
      setOrderId(router.query.order)
      // Auto-submit tracking
      handleTrackOrderById(router.query.order)
    }
  }, [router.query.order])

  const handleTrackOrderById = async (id: string) => {
    if (!id) return
    
    setLoading(true)
    setError('')
    setTrackingData(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      const response = await fetch(`${baseUrl}/orders/${id}/tracking`)
      
      if (!response.ok) {
        throw new Error('Order not found')
      }

      const data = await response.json()
      setTrackingData(data)
    } catch (err) {
      setError('Order not found. Please check your Order ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleTrackOrderById(orderId)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <Head>
        <title>Track Your Order - RenewableZmart</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
            <p className="text-gray-600">Enter your order ID to track your shipment</p>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleTrackOrder} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g., RZ123456789"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Tracking...' : 'Track Order'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                You can find your Order ID in the confirmation email we sent you.
              </p>
            </form>
          </div>

          {/* Error Message */}
          {error && !trackingData && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">Order Not Found</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Order Summary Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order #{trackingData.orderId}</h2>
                    <p className="text-gray-600 mt-1">Placed on {new Date(trackingData.orderDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(trackingData.status)}`}>
                    {trackingData.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {trackingData.trackingNumber && (
                  <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold text-gray-900">{trackingData.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-semibold text-gray-900">{trackingData.carrier}</p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold text-emerald-600">{new Date(trackingData.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-semibold text-gray-900">{trackingData.items.length} item(s)</p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Tracking Timeline</h3>
                <div className="space-y-6">
                  {trackingData.timeline.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}>
                          {step.completed ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        {index < trackingData.timeline.length - 1 && (
                          <div className={`w-0.5 h-16 ${step.completed ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.status}
                        </h4>
                        <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.description}
                        </p>
                        <p className={`text-xs mt-1 ${step.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                          {step.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {trackingData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
                  <p className="text-sm text-gray-600">Get live updates on your order's location and estimated delivery time.</p>
                </button>

                <Link href="/account" className="block">
                  <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer active:scale-95 h-full">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive automatic updates about your order status via email.</p>
                  </div>
                </Link>

                <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-sm text-gray-600 mb-4">Our customer support team is always ready to help with your order.</p>
                  <a href="tel:+2349022298109" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 active:scale-95 transition text-sm font-semibold">
                    📞 Call +234 902 229 8109
                  </a>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-blue-800 text-sm mb-4">
                  If you have any questions about your order, please contact our customer support.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:+2349022298109" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                    📞 Call Support
                  </a>
                  <Link href="/help" className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-semibold">
                    Help Center
                  </Link>
                  <Link href="/orders" className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition text-sm font-semibold">
                    View All Orders
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Info Section (shown when no tracking data) */}
          {!trackingData && !error && (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-emerald-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
                  <p className="text-sm text-gray-600">Get live updates on your order's location and estimated delivery time.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-blue-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive automatic updates about your order status via email.</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center border-2 border-purple-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
                  <p className="text-sm text-gray-600 mb-4">Our customer support team is always ready to help with your order.</p>
                  <a href="tel:+2349022298109" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-semibold">
                    📞 Call +234 902 229 8109
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
