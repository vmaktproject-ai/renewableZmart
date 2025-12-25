import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import Link from 'next/link'
import Head from 'next/head'
import Script from 'next/script'
import { useState, useEffect } from 'react'

// Declare Paystack type
declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function Cart() {
  const { cart, removeFromCart, clearCart, updateQty } = useCart()
  const { formatPrice } = useCurrency()
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  
  // Installment payment states
  const [paymentOption, setPaymentOption] = useState<'full' | 'installment'>('full')
  const [showInstallmentForm, setShowInstallmentForm] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    employmentStatus: '',
    monthlyIncome: '',
    organization: '',
    bvn: '',
  })
  const [bvnVerifying, setBvnVerifying] = useState(false)
  const [bvnValid, setBvnValid] = useState<boolean | null>(null)
  const [bvnData, setBvnData] = useState<{
    firstName?: string
    lastName?: string
    middleName?: string
    dateOfBirth?: string
    phone?: string
    image?: string
  } | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    if (user) {
      setCurrentUser(JSON.parse(user))
    }

    console.log('Paystack Public Key:', process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);

    // Check if PaystackPop is already available
    if (typeof window !== 'undefined' && window.PaystackPop) {
      console.log('PaystackPop already loaded');
      setPaystackLoaded(true)
    }

    // Wait for Paystack script to load
    const checkPaystack = setInterval(() => {
      if (typeof window !== 'undefined' && window.PaystackPop) {
        console.log('PaystackPop loaded via interval check');
        setPaystackLoaded(true)
        clearInterval(checkPaystack)
      }
    }, 100)

    // Fallback: If Paystack script doesn't load within 5 seconds, enable button anyway
    const timeout = setTimeout(() => {
      clearInterval(checkPaystack)
      if (!paystackLoaded) {
        console.log('Paystack script timeout - enabling payment anyway')
        setPaystackLoaded(true)
      }
    }, 5000)

    return () => {
      clearInterval(checkPaystack)
      clearTimeout(timeout)
    }
  }, [])
  
  const total = cart.reduce((s, p) => s + p.price * p.qty, 0)
  const shipping = total > 50000 ? 0 : 2500
  const finalTotal = total + shipping

  const handlePayment = async () => {
    if (!currentUser) {
      alert('Please login to complete your purchase')
      window.location.href = '/login'
      return
    }

    // Check if token exists
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Session expired. Please login again.')
      localStorage.removeItem('renewablezmart_current_user')
      window.location.href = '/login'
      return
    }

    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (!paystackLoaded) {
      alert('Payment system is loading, please try again in a moment')
      return
    }

    // Validate email
    if (!currentUser.email || !currentUser.email.includes('@')) {
      alert('Invalid email address. Please update your profile.')
      return
    }

    // Validate amount
    if (finalTotal <= 0) {
      alert('Invalid cart total')
      return
    }

    setProcessingPayment(true)

    try {
      // Initialize payment with backend
      const paymentData = {
        amount: finalTotal,
        email: currentUser.email,
        orderId: `ORDER-${Date.now()}`,
        metadata: {
          cart_items: cart.map(item => ({
            productId: item.id,
            name: item.title,
            quantity: item.qty,
            price: item.price
          })),
          customer_name: currentUser.name || currentUser.email,
          shipping_amount: shipping
        }
      };

      console.log('Initializing payment with data:', paymentData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      })

      const data = await response.json()
      console.log('Backend response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired token')
      }

      if (!data.status) {
        throw new Error(data.message || 'Failed to initialize payment')
      }

      // Open Paystack popup
      if (!window.PaystackPop) {
        throw new Error('Paystack library not loaded. Please refresh the page.')
      }

      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Paystack public key not configured. Please check your environment variables.');
      }
      
      const amountInKobo = Math.round(finalTotal * 100);
      
      console.log('Paystack Configuration Check:');
      console.log('- Public Key:', publicKey);
      console.log('- Email:', currentUser.email);
      console.log('- Amount (NGN):', finalTotal);
      console.log('- Amount (Kobo):', amountInKobo);
      console.log('- Reference:', data.data.reference);

      if (!publicKey || !publicKey.startsWith('pk_')) {
        throw new Error('Invalid Paystack public key');
      }

      if (amountInKobo < 100) {
        throw new Error('Amount is too small for Paystack (minimum ₦1)');
      }

      const paystackConfig = {
        key: publicKey,
        email: currentUser.email,
        amount: amountInKobo,
        ref: data.data.reference,
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: currentUser.name || currentUser.email
            },
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: `ORDER-${Date.now()}`
            }
          ]
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        onSuccess: function(transaction: any) {
          console.log('Payment successful:', transaction)
          window.location.href = `/payment/callback?reference=${transaction.reference}&status=success`
        },
        onCancel: function() {
          console.log('Payment cancelled')
          setProcessingPayment(false)
        }
      };

      console.log('Opening Paystack with config:', paystackConfig);
      
      // Open Paystack popup directly
      try {
        const handler = window.PaystackPop.setup(paystackConfig);
        handler.openIframe();
      } catch (paystackError: any) {
        console.error('Paystack popup error:', paystackError);
        setProcessingPayment(false);
        alert('Failed to open payment window: ' + paystackError.message);
      }

    } catch (error: any) {
      console.error('Payment error:', error)
      
      // Handle specific errors
      if (error.message?.includes('Invalid or expired token')) {
        alert('Your session has expired. Please login again.')
        localStorage.removeItem('renewablezmart_current_user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      } else {
        alert(error.message || 'Failed to initialize payment. Please try again.')
      }
      
      setProcessingPayment(false)
    }
  }
  
  // Check if cart contains installment-eligible products
  const eligibleCategories = ['inverters', 'batteries', 'solar']
  const hasEligibleProducts = cart.some(item => 
    eligibleCategories.includes(item.category?.toLowerCase() || '')
  )
  
  const handlePaymentOptionChange = (option: 'full' | 'installment') => {
    setPaymentOption(option)
  }

  const verifyBVN = async (bvn: string) => {
    if (bvn.length !== 11) {
      setBvnValid(false)
      return
    }

    setBvnVerifying(true)
    setBvnValid(null)
    setBvnData(null)

    try {
      const response = await fetch('/api/verify-bvn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bvn, 
          firstName: formData.fullName.split(' ')[0],
          lastName: formData.fullName.split(' ').slice(1).join(' ')
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.verified) {
        setBvnValid(true)
        setBvnData(data.data)
        
        // Auto-fill form with verified BVN data
        if (data.data) {
          // Construct full name from BVN data
          const fullName = [
            data.data.firstName || '',
            data.data.middleName || '',
            data.data.lastName || ''
          ].filter(Boolean).join(' ').trim()
          
          // Update form with verified information
          setFormData(prev => ({
            ...prev,
            fullName: fullName || prev.fullName,
            phone: data.data.phone || prev.phone,
            // Email remains as entered (BVN doesn't provide email)
          }))
          
          // Show success message
          alert('✓ BVN Verified! Your details have been auto-filled from BVN records.')
        }
      } else {
        setBvnValid(false)
        setBvnData(null)
        alert(data.message || 'BVN verification failed. Please check your details.')
      }
    } catch (error) {
      console.error('BVN verification error:', error)
      setBvnValid(false)
      setBvnData(null)
      alert('BVN verification failed. Please try again.')
    } finally {
      setBvnVerifying(false)
    }
  }

  // Calculate installment details
  const firstPayment = finalTotal * 0.5
  const balance = finalTotal - firstPayment
  const months = (finalTotal >= 450000 && finalTotal <= 1000000) ? 3 : 6
  const monthlyPayment = balance / months

  const handleInstallmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate BVN before submission
    if (!bvnValid) {
      alert('Please verify your BVN before submitting the application.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Please login to submit application')
      window.location.href = '/login'
      return
    }

    setProcessingPayment(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/installments/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          bvnData,
          totalAmount: finalTotal,
          firstPayment,
          monthlyPayment,
          months,
          cartItems: cart.map(item => ({
            productId: item.id,
            name: item.title,
            quantity: item.qty,
            price: item.price,
            category: item.category
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application')
      }

      alert('✅ Application submitted successfully! You will receive an email notification once your application is reviewed (within 24 hours).\n\nOnce approved, you can make your 50% down payment from "My Applications" page.')
      setShowInstallmentForm(false)
      clearCart()
      
      // Redirect to applications page
      setTimeout(() => {
        window.location.href = '/account?tab=applications'
      }, 2000)

    } catch (error: any) {
      console.error('Submit application error:', error)
      alert(error.message || 'Failed to submit application. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Shopping Cart - RenewableZmart</title>
      </Head>
      <Script 
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Paystack script loaded successfully')
          setPaystackLoaded(true)
        }}
        onError={(e) => {
          console.error('Failed to load Paystack script:', e)
          setPaystackLoaded(true)
        }}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart ({cart.length} items)</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping for sustainable energy products!</p>
            <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-lg inline-block hover:bg-orange-600">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-3 lg:space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 shadow">
                  <img 
                    src={item.image?.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${item.image}`} 
                    alt={item.title} 
                    className="w-20 sm:w-24 h-20 sm:h-24 object-cover rounded flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"%3E%3Crect fill=\"%23ddd\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23999\" x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <div className="text-xl font-bold text-orange-500">{formatPrice(item.price)}</div>
                    {item.eco && <div className="text-xs text-green-600 mt-1">🌱 Eco-Friendly Product</div>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                        -
                      </button>
                      <span className="font-bold w-8 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                        +
                      </button>
                    </div>
                    <div className="font-bold mb-2">{formatPrice(item.price * item.qty)}</div>
                    <button className="text-red-500 text-sm hover:underline" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={clearCart} className="text-red-500 hover:underline">
                Clear Cart
              </button>
            </div>

            <div>
              <div className="bg-white rounded-lg p-6 shadow sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-500">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-2">Payment Option</h3>
                  <label className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition ${
                    paymentOption === 'full' 
                      ? 'border-2 border-orange-500 bg-orange-50' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="payment" checked={paymentOption === 'full'} onChange={() => setPaymentOption('full')} />
                    <div className="flex-1">
                      <div className="font-semibold">Pay Full Amount</div>
                      <div className="text-xs text-gray-600">{formatPrice(finalTotal)}</div>
                    </div>
                  </label>
                  {hasEligibleProducts ? (
                    <label className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition ${
                      paymentOption === 'installment' 
                        ? 'border-2 border-orange-500 bg-orange-50' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input type="radio" name="payment" checked={paymentOption === 'installment'} onChange={() => setPaymentOption('installment')} />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          💳 Pay Small Small
                          <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">Popular</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          50% now ({formatPrice(firstPayment)}), then {formatPrice(monthlyPayment)}/month for {months} months
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-400 flex items-center gap-2">
                            💳 Pay Small Small
                            <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded">Not Available</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Only available for Inverters, Batteries, and Solar Panels
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {paymentOption === 'full' ? (
                  <form id="paymentForm" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                    <button 
                      type="submit"
                      disabled={processingPayment || !paystackLoaded}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 mb-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {processingPayment ? 'Processing...' : !paystackLoaded ? 'Loading Payment...' : 'Proceed to Checkout'}
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setShowInstallmentForm(true)} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 mb-2">
                    Apply for Pay Small Small
                  </button>
                )}
                <Link href="/" className="block text-center text-orange-500 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {showInstallmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowInstallmentForm(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pay Small Small Application</h2>
                <button onClick={() => setShowInstallmentForm(false)} className="text-3xl hover:text-gray-600 leading-none">×</button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Complete this form to apply for installment payment</p>
            </div>

            <form onSubmit={handleInstallmentSubmit} className="p-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-2">Payment Plan Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-bold">{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First Payment (50%):</span>
                    <span className="font-bold">{formatPrice(firstPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Payment:</span>
                    <span className="font-bold">{formatPrice(monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-bold">{months} months</span>
                  </div>
                </div>
              </div>

              {bvnValid && bvnData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    ✓ BVN Verified Successfully
                  </h3>
                  <div className="flex gap-4">
                    {bvnData.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={bvnData.image} 
                          alt="BVN Photo" 
                          className="w-24 h-24 rounded-lg object-cover border-2 border-green-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Full Name:</span>
                        <p className="font-semibold">{bvnData.firstName} {bvnData.middleName} {bvnData.lastName}</p>
                      </div>
                      {bvnData.dateOfBirth && (
                        <div>
                          <span className="text-gray-600">Date of Birth:</span>
                          <p className="font-semibold">{bvnData.dateOfBirth}</p>
                        </div>
                      )}
                      {bvnData.phone && (
                        <div>
                          <span className="text-gray-600">Phone Number:</span>
                          <p className="font-semibold">{bvnData.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Full Name * 
                    {bvnValid === true && <span className="text-xs text-green-600 ml-2">✓ Verified from BVN</span>}
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                      bvnValid === true ? 'bg-green-50 border-green-300 focus:ring-green-500' : 'focus:ring-orange-500'
                    }`}
                    placeholder="John Doe"
                    readOnly={bvnValid === true}
                  />
                  {bvnValid === true && (
                    <p className="text-xs text-gray-500 mt-1">Name locked - verified from BVN records</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2">Email Address *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Phone Number *
                    {bvnValid === true && bvnData?.phone && <span className="text-xs text-green-600 ml-2">✓ Verified from BVN</span>}
                  </label>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                      bvnValid === true && bvnData?.phone ? 'bg-green-50 border-green-300 focus:ring-green-500' : 'focus:ring-orange-500'
                    }`}
                    placeholder="08012345678"
                  />
                  {bvnValid === true && bvnData?.phone && (
                    <p className="text-xs text-gray-500 mt-1">Phone verified from BVN records</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2">Delivery Address *</label>
                  <textarea required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" rows={3} placeholder="Enter your full delivery address"></textarea>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Employment Status *</label>
                  <select required value={formData.employmentStatus} onChange={(e) => setFormData({...formData, employmentStatus: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select employment status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="business-owner">Business Owner</option>
                    <option value="civil-servant">Civil Servant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Organization/Company Name *</label>
                  <input type="text" required value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="ABC Company Ltd" />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Monthly Income Range *</label>
                  <select required value={formData.monthlyIncome} onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Select income range</option>
                    <option value="50-100k">50,000 - 100,000</option>
                    <option value="100-200k">100,000 - 200,000</option>
                    <option value="200-500k">200,000 - 500,000</option>
                    <option value="500k+">500,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Bank Verification Number (BVN) *</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      value={formData.bvn} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setFormData({...formData, bvn: value})
                        if (value.length === 11) {
                          setBvnValid(null)
                        }
                      }}
                      className={`flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                        bvnValid === true ? 'border-green-500 focus:ring-green-500' : 
                        bvnValid === false ? 'border-red-500 focus:ring-red-500' : 
                        'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="22123456789" 
                      maxLength={11}
                    />
                    <button
                      type="button"
                      onClick={() => verifyBVN(formData.bvn)}
                      disabled={formData.bvn.length !== 11 || bvnVerifying}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {bvnVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                  {bvnValid === true && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      ✓ BVN verified successfully
                    </p>
                  )}
                  {bvnValid === false && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      ✗ BVN verification failed. Please check and try again.
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Enter your 11-digit BVN and click Verify</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  <p className="font-semibold mb-2">📋 Note:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Our team will review your application within 24 hours</li>
                    <li>You may be required to provide additional documentation</li>
                    <li>Approval is subject to credit assessment</li>
                    <li>First payment must be made upon approval</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowInstallmentForm(false)} className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>RenewableZmart. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">Powered by Vemakt Technology</p>
        </div>
      </footer>
    </div>
  )
}
