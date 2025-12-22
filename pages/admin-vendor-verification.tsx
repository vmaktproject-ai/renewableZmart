import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Vendor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  businessName: string
  businessRegNumber: string
  verificationStatus: string
  isVerified: boolean
  verifiedAt?: string
  createdAt: string
}

export default function AdminVendorVerification() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    const token = localStorage.getItem('accessToken')
    
    if (!user || !token) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    if (userData.role !== 'admin' && userData.accountType !== 'admin') {
      router.push('/')
      return
    }

    fetchVendors()
  }, [filter])

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const endpoint = filter === 'pending' 
        ? 'http://localhost:4000/api/admin/vendors/pending'
        : 'http://localhost:4000/api/admin/vendors'
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        let data = await response.json()
        if (filter !== 'all' && filter !== 'pending') {
          data = data.filter((v: Vendor) => v.verificationStatus === filter)
        }
        setVendors(data)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (vendorId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:4000/api/admin/vendors/${vendorId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      })

      if (response.ok) {
        alert(`Vendor ${status} successfully!`)
        setSelectedVendor(null)
        setNotes('')
        fetchVendors()
      } else {
        alert('Failed to verify vendor')
      }
    } catch (error) {
      console.error('Error verifying vendor:', error)
      alert('Error verifying vendor')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading vendors...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Vendor Verification - Admin Dashboard</title>
      </Head>

      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Vendor Verification</h1>
              <p className="text-sm sm:text-base text-gray-600">Review and approve vendor registrations</p>
            </div>
            <Link href="/admin-dashboard" className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-sm sm:text-base">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${
                filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Pending ({vendors.filter(v => v.verificationStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${
                filter === 'approved' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${
                filter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap text-sm ${
                filter === 'all' ? 'bg-teal-100 text-teal-800' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Vendors
            </button>
          </div>
        </div>

        {/* Vendors List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vendors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No {filter !== 'all' && filter} vendors found
            </div>
          ) : (
            vendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{vendor.businessName}</h3>
                    <p className="text-sm text-gray-600">{vendor.firstName} {vendor.lastName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(vendor.verificationStatus)}`}>
                    {vendor.verificationStatus}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📧</span>
                    <span className="text-gray-700">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📞</span>
                    <span className="text-gray-700">{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📍</span>
                    <span className="text-gray-700">{vendor.city}, {vendor.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🏢</span>
                    <span className="text-gray-700">Reg #: {vendor.businessRegNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📅</span>
                    <span className="text-gray-700">Registered: {new Date(vendor.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {vendor.verificationStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition text-sm"
                    >
                      Review
                    </button>
                  </div>
                )}

                {vendor.verificationStatus !== 'pending' && vendor.verifiedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Verified on: {new Date(vendor.verifiedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVendor(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Review Vendor</h2>
            
            <div className="space-y-3 mb-6">
              <div><strong>Business:</strong> {selectedVendor.businessName}</div>
              <div><strong>Owner:</strong> {selectedVendor.firstName} {selectedVendor.lastName}</div>
              <div><strong>Email:</strong> {selectedVendor.email}</div>
              <div><strong>Phone:</strong> {selectedVendor.phone}</div>
              <div><strong>Location:</strong> {selectedVendor.city}, {selectedVendor.country}</div>
              <div><strong>Reg Number:</strong> {selectedVendor.businessRegNumber || 'N/A'}</div>
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2">Admin Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600"
                rows={3}
                placeholder="Add verification notes..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVerify(selectedVendor.id, 'approved')}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                ✓ Approve Vendor
              </button>
              <button
                onClick={() => handleVerify(selectedVendor.id, 'rejected')}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                ✗ Reject Vendor
              </button>
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
