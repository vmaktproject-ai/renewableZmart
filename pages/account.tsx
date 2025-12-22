import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Head from 'next/head'
import Script from 'next/script'
import { useCurrency } from '../context/CurrencyContext'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function Account() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [applications, setApplications] = useState<any[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('renewablezmart_current_user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    setLoading(false)

    // Get tab from URL query
    const tab = router.query.tab as string
    if (tab) {
      setActiveTab(tab)
    }
  }, [router.query])

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications()
    }
  }, [activeTab])

  async function fetchApplications() {
    setLoadingApplications(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/installments/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setApplications(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  async function handlePayInstallment(application: any) {
    alert('Payment feature coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>My Account - RenewableZmart</title>
      </Head>
      <Script 
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 px-4 font-semibold ${activeTab === 'profile' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600'}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-3 px-4 font-semibold ${activeTab === 'applications' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600'}`}
            >
              My Applications
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">First Name</label>
                    <p className="font-semibold">{user?.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Last Name</label>
                    <p className="font-semibold">{user?.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Account Type</label>
                    <p className="font-semibold capitalize">{user?.role}</p>
                  </div>
                  {user?.country && (
                    <div>
                      <label className="text-sm text-gray-600">Country</label>
                      <p className="font-semibold">{user?.country}</p>
                    </div>
                  )}
                  {user?.city && (
                    <div>
                      <label className="text-sm text-gray-600">City</label>
                      <p className="font-semibold">{user?.city}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-bold text-lg mb-2">📦 My Orders</h3>
                  <p className="text-gray-600 mb-4">View your order history</p>
                  <button
                    onClick={() => router.push('/orders')}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 w-full"
                  >
                    View Orders
                  </button>
                </div>

                {user?.role === 'vendor' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-2">🏪 My Store</h3>
                    <p className="text-gray-600 mb-4">Manage your products</p>
                    <button
                      onClick={() => router.push('/stores')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
                    >
                      Go to Store
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">My Installment Applications</h2>
              
              {loadingApplications ? (
                <div className="text-center py-8">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any Pay Small Small applications</p>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Application #{app.id.substring(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        app.status === 'approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        app.status === 'payment_completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status === 'approved' ? '✓ Approved' :
                         app.status === 'rejected' ? '✗ Rejected' :
                         app.status === 'payment_completed' ? '✓ Paid' :
                         '⏳ Pending'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm text-gray-600">Total Amount</label>
                        <p className="font-bold text-lg">{formatPrice(app.totalAmount)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">First Payment (50%)</label>
                        <p className="font-bold text-lg text-orange-500">{formatPrice(app.firstPayment)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Monthly Payment</label>
                        <p className="font-semibold">{formatPrice(app.monthlyPayment)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Duration</label>
                        <p className="font-semibold">{app.months} months</p>
                      </div>
                    </div>

                    {app.adminNotes && (
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <p className="text-sm font-semibold text-gray-700">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{app.adminNotes}</p>
                      </div>
                    )}

                    {app.status === 'approved' && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-green-600 mb-3">
                          ✓ Your application has been approved! Click below to make your 50% down payment.
                        </p>
                        <button
                          onClick={() => handlePayInstallment(app)}
                          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600"
                        >
                          Pay {formatPrice(app.firstPayment)} Now
                        </button>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">
                          ⏳ Your application is being reviewed. You'll receive an email notification once it's approved.
                        </p>
                      </div>
                    )}

                    {app.status === 'rejected' && app.adminNotes && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-red-600">
                          ✗ Application was not approved. You can still purchase items using regular payment.
                        </p>
                      </div>
                    )}

                    {app.status === 'payment_completed' && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-blue-600">
                          ✓ First payment completed! Your order is being processed.
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
