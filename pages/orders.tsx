import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Head from 'next/head'
import { useCurrency } from '../context/CurrencyContext'

export default function Orders() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('http://localhost:4000/api/orders/my-orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('accessToken')
            router.push('/login')
          }
          return Promise.reject(new Error(`HTTP error! status: ${res.status}`))
        }
        return res.json()
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err)
        setOrders([])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>My Orders - RenewableZmart</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => router.push('/')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold">Order #{order.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatPrice(order.total)}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_transit' || order.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                  <button
                    onClick={() => router.push(`/track-order?order=${order.id}`)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                  >
                    📦 Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
