import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Head from 'next/head'

interface Application {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
  employmentStatus: string
  monthlyIncome: string
  organization?: string
  bvn: string
  totalAmount: number
  firstPayment: number
  monthlyPayment: number
  months: number
  status: 'pending' | 'approved' | 'rejected' | 'payment_completed'
  adminNotes?: string
  createdAt: string
  cartItems: any[]
}

export default function AdminInstallmentApproval() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    if (!user) {
      router.push('/login')
      return
    }
    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/')
      return
    }
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/installments/all`, {
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
      alert('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (appId: string) => {
    if (!confirm('Are you sure you want to approve this application?')) return

    setProcessing(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/installments/${appId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes })
      })

      const data = await response.json()
      if (data.success) {
        alert('✅ Application approved! Customer has been notified.')
        setSelectedApp(null)
        setAdminNotes('')
        fetchApplications()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      alert('Failed to approve: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (appId: string) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    if (!confirm('Are you sure you want to reject this application?')) return

    setProcessing(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/installments/${appId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes })
      })

      const data = await response.json()
      if (data.success) {
        alert('Application rejected. Customer has been notified.')
        setSelectedApp(null)
        setAdminNotes('')
        fetchApplications()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      alert('Failed to reject: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Installment Applications - Admin</title>
      </Head>
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pay Small Small Applications</h1>
          <button
            onClick={() => router.push('/admin-dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-2">No Applications</h2>
            <p className="text-gray-600">No {filter !== 'all' ? filter : ''} applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map(app => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{app.fullName}</h3>
                    <p className="text-gray-600">{app.email} • {app.phone}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    app.status === 'payment_completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded">
                  <div>
                    <label className="text-sm text-gray-600">Total Amount</label>
                    <p className="font-bold text-lg">₦{app.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">First Payment</label>
                    <p className="font-bold text-orange-500">₦{app.firstPayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Monthly Payment</label>
                    <p className="font-semibold">₦{app.monthlyPayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Duration</label>
                    <p className="font-semibold">{app.months} months</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600">Employment</label>
                    <p className="font-semibold">{app.employmentStatus}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Monthly Income</label>
                    <p className="font-semibold">{app.monthlyIncome}</p>
                  </div>
                  {app.organization && (
                    <div>
                      <label className="text-sm text-gray-600">Organization</label>
                      <p className="font-semibold">{app.organization}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-600">Address</label>
                  <p className="font-semibold">{app.address}</p>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-600">BVN</label>
                  <p className="font-mono">{app.bvn}</p>
                </div>

                {app.cartItems && app.cartItems.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 font-semibold">Cart Items:</label>
                    <div className="mt-2 space-y-1">
                      {app.cartItems.map((item: any, idx: number) => (
                        <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                          {item.name} - Qty: {item.quantity} - ₦{item.price.toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {app.adminNotes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <label className="text-sm font-semibold text-blue-700">Admin Notes:</label>
                    <p className="text-sm text-blue-900">{app.adminNotes}</p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => {
                        setSelectedApp(app)
                        setAdminNotes('')
                      }}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-semibold"
                    >
                      Review Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Review Application</h2>
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setAdminNotes('')
                }}
                className="text-3xl hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-lg mb-2">{selectedApp.fullName}</h3>
              <p className="text-gray-600">{selectedApp.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Total</label>
                  <p className="font-bold">₦{selectedApp.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">First Payment</label>
                  <p className="font-bold text-orange-500">₦{selectedApp.firstPayment.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Monthly</label>
                  <p className="font-semibold">₦{selectedApp.monthlyPayment.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Duration</label>
                  <p className="font-semibold">{selectedApp.months} months</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Admin Notes (Optional for approval, Required for rejection)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border rounded-lg p-3 h-24"
                placeholder="Add notes about this decision..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedApp.id)}
                disabled={processing}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                {processing ? 'Processing...' : '✓ Approve Application'}
              </button>
              <button
                onClick={() => handleReject(selectedApp.id)}
                disabled={processing || !adminNotes.trim()}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400"
              >
                {processing ? 'Processing...' : '✗ Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
