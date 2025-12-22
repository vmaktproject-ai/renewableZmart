import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import { useCurrency } from '../../context/CurrencyContext'

export default function PaymentCallback() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const { reference } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    if (reference) {
      verifyPayment(reference as string)
    }
  }, [reference])

  const verifyPayment = async (ref: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/payments/verify/${ref}`)
      const data = await response.json()

      if (data.status && data.data.status === 'success') {
        setStatus('success')
        setPaymentData(data.data)
        // Clear cart
        localStorage.removeItem('renewablezmart_cart')
      } else {
        setStatus('failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Payment Status - RenewableZmart</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {status === 'loading' && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
              <p className="text-gray-600">Please wait while we confirm your payment</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Thank you for your purchase</p>
              
              {paymentData && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold mb-3">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium">{paymentData.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatPrice(paymentData.amount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Channel:</span>
                      <span className="font-medium capitalize">{paymentData.channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(paymentData.paidAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Link href="/orders" className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700">
                  View Orders
                </Link>
                <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">Payment Failed</h2>
              <p className="text-gray-600 mb-6">
                We couldn't verify your payment. Please try again or contact support if you were charged.
              </p>
              
              <div className="flex gap-3 justify-center">
                <Link href="/cart" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">
                  Back to Cart
                </Link>
                <Link href="/" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300">
                  Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
