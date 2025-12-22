import Head from 'next/head'
import { useState } from 'react'
import Header from '../components/Header'
import Link from 'next/link'

export default function HelpCenter() {
  const [showLiveChat, setShowLiveChat] = useState(false)

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Help Center - RenewableZmart</title>
        <meta name="description" content="Get help with your orders and account" />
      </Head>
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">❓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Help Center</h1>
            </div>
            <p className="text-gray-600">How can we help you today?</p>
          </div>

          {/* Help Topics Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Place an Order */}
            <Link href="/help#place-order">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Place an Order</h3>
                    <p className="text-sm text-gray-600">Learn how to browse products and complete your purchase</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Payment Options */}
            <Link href="/help#payment">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💳</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Payment Options</h3>
                    <p className="text-sm text-gray-600">View available payment methods and Pay Small Small plans</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Track an Order */}
            <Link href="/orders">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🚚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Track an Order</h3>
                    <p className="text-sm text-gray-600">Check the status of your order and delivery</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Cancel an Order */}
            <Link href="/help#cancel-order">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">❌</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Cancel an Order</h3>
                    <p className="text-sm text-gray-600">Learn how to cancel or modify your order</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Returns & Refunds */}
            <Link href="/help#returns">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Returns & Refunds</h3>
                    <p className="text-sm text-gray-600">Information about our return policy and refund process</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Live Chat */}
            <div 
              onClick={() => setShowLiveChat(true)}
              className="bg-orange-500 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer text-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                  <p className="text-sm opacity-90">Chat with our support team now</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Content Sections */}
          <div className="space-y-6">
            {/* Place an Order */}
            <div id="place-order" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">📦 How to Place an Order</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">1. Browse Products</h3>
                  <p className="text-sm">Navigate through our categories or use the search bar to find the renewable energy products you need.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Add to Cart</h3>
                  <p className="text-sm">Click "Add to Cart" on any product. Review your cart by clicking the cart icon in the header.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Checkout</h3>
                  <p className="text-sm">Click "Proceed to Checkout", fill in your delivery details, and choose your payment method.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Complete Payment</h3>
                  <p className="text-sm">Select from our payment options including Pay Small Small for flexible installments.</p>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div id="payment" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">💳 Payment Options</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Full Payment</h3>
                  <p className="text-sm">Pay the complete amount using credit/debit cards, bank transfer, or mobile money.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Pay Small Small (Installments)</h3>
                  <p className="text-sm">Flexible payment plans:</p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>₦450,000 - ₦1,000,000: Pay 50% upfront, balance in 3 months</li>
                    <li>Above ₦1,000,000: Pay 50% upfront, balance in 6 months</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Supported Payment Methods</h3>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>Paystack (Cards, Bank Transfer)</li>
                    <li>Bank Deposit</li>
                    <li>Mobile Money</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Track an Order */}
            <div id="track" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">📍 Track an Order</h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm">Track your order status and delivery progress in real-time.</p>
                <div>
                  <h3 className="font-semibold mb-2">How to Track:</h3>
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Visit the <Link href="/track-order" className="text-blue-600 hover:underline">Track Order</Link> page</li>
                    <li>Enter your Order ID (found in your confirmation email)</li>
                    <li>Click "Track Order" to see real-time status</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Status Meanings:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Pending:</strong> Order received, awaiting processing</li>
                    <li><strong>Processing:</strong> Order is being prepared for shipment</li>
                    <li><strong>Shipped:</strong> Order has left our warehouse</li>
                    <li><strong>In Transit:</strong> Order is on the way to you</li>
                    <li><strong>Out for Delivery:</strong> Order will arrive today</li>
                    <li><strong>Delivered:</strong> Order has been delivered</li>
                  </ul>
                </div>
                <p className="text-sm bg-green-50 border-l-4 border-green-400 p-3">
                  <strong>Tip:</strong> You'll receive email and SMS notifications at each stage of delivery.
                </p>
              </div>
            </div>

            {/* Cancel an Order */}
            <div id="cancel-order" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">❌ Cancel an Order</h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-sm">Orders can be cancelled within 24 hours of placement if they haven't been shipped.</p>
                <div>
                  <h3 className="font-semibold mb-2">How to Cancel:</h3>
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Go to <Link href="/orders" className="text-blue-600 hover:underline">My Orders</Link></li>
                    <li>Find the order you want to cancel</li>
                    <li>Click "Cancel Order" button</li>
                    <li>Provide a reason for cancellation</li>
                    <li>Confirm cancellation</li>
                  </ol>
                </div>
                <p className="text-sm bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <strong>Note:</strong> Orders that have been shipped cannot be cancelled. Please see Returns & Refunds for shipped orders.
                </p>
              </div>
            </div>

            {/* Returns & Refunds */}
            <div id="returns" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">🔄 Returns & Refunds</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Return Policy</h3>
                  <p className="text-sm">We offer a 14-day return policy for unused products in original packaging.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Eligible for Return:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Product defects or damage</li>
                    <li>Wrong product delivered</li>
                    <li>Product doesn't match description</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Refund Process:</h3>
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>Contact support with your order number</li>
                    <li>Return the product (shipping covered by us for defective items)</li>
                    <li>Inspection takes 3-5 business days</li>
                    <li>Refund processed to original payment method</li>
                  </ol>
                </div>
                <p className="text-sm bg-blue-50 border-l-4 border-blue-400 p-3">
                  <strong>Refund Timeline:</strong> 7-14 business days after approval
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div id="contact" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">📞 Contact Us</h2>
              <div className="space-y-3 text-gray-700">
                <p className="text-sm">
                  <strong>Email:</strong> <a href="mailto:support@renewablezmart.com" className="text-blue-600 hover:underline">support@renewablezmart.com</a>
                </p>
                <p className="text-sm">
                  <strong>Phone:</strong> <a href="tel:+2349022298109" className="text-blue-600 hover:underline">+234 902 229 8109</a>
                </p>
                <p className="text-sm">
                  <strong>Hours:</strong> Monday - Friday: 9:00 AM - 6:00 PM (WAT)
                </p>
                <p className="text-sm">
                  <strong>WhatsApp:</strong> <a href="https://wa.me/2349022298109" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+234 902 229 8109</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-orange-500 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <h3 className="font-bold text-lg">Live Chat</h3>
              </div>
              <button 
                onClick={() => setShowLiveChat(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Our customer support team is here to help!</p>
              <div className="space-y-3">
                <a 
                  href="https://wa.me/2348012345678" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition text-center"
                >
                  💬 Chat on WhatsApp
                </a>
                <a 
                  href="mailto:support@renewablezmart.com"
                  className="block w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition text-center"
                >
                  📧 Send Email
                </a>
                <button
                  onClick={() => setShowLiveChat(false)}
                  className="block w-full bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
