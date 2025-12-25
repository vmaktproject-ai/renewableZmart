import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCurrency } from '../context/CurrencyContext'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  role: string
  accountType: string
  createdAt: string
}

interface Order {
  id: string
  userId: string
  customerName: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  items: OrderItem[]
}

interface OrderItem {
  id: string
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  storeId: number
  country: string
  image?: string
}

interface Store {
  id: number
  name: string
  ownerId: string
  country: string
  city: string
  slug: string
}

interface Stats {
  totalUsers: number
  totalVendors: number
  totalInstallers: number
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalStores: number
  pendingProducts: number
}

function AdminDashboard() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'products' | 'stores'>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalVendors: 0,
    totalInstallers: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalStores: 0,
    pendingProducts: 0
  })
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    const token = localStorage.getItem('accessToken')
    
    if (!user || !token) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    
    // Check if user is admin
    if (userData.role !== 'admin' && userData.accountType !== 'admin') {
      router.push('/')
      return
    }
    
    setCurrentUser(userData)
    fetchDashboardData(token)
  }, [])

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      
      // Fetch all data in parallel
      const [usersRes, ordersRes, productsRes, storesRes, pendingRes] = await Promise.all([
        fetch(`${baseUrl}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/admin/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/admin/stores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/admin/products/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
        
        // Calculate user stats
        const vendors = usersData.filter((u: User) => u.role === 'vendor' || u.accountType === 'vendor')
        const installers = usersData.filter((u: User) => u.role === 'installer' || u.accountType === 'installer')
        const customers = usersData.filter((u: User) => u.role === 'customer' || u.accountType === 'customer')
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          totalVendors: vendors.length,
          totalInstallers: installers.length,
          totalCustomers: customers.length
        }))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
        
        const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + order.total, 0)
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.length,
          totalRevenue
        }))
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
        setStats(prev => ({ ...prev, totalProducts: productsData.length }))
      }

      if (storesRes.ok) {
        const storesData = await storesRes.json()
        setStores(storesData)
        setStats(prev => ({ ...prev, totalStores: storesData.length }))
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setStats(prev => ({ ...prev, pendingProducts: pendingData.length }))
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${baseUrl}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
        alert('Order status updated')
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Head>
        <title>Admin Dashboard - RenewableZmart</title>
      </Head>

      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-teal-50 text-sm sm:text-base">Platform Overview & Management Center</p>
            </div>
            <Link href="/admin-profile" className="bg-white text-teal-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2 text-sm sm:text-base whitespace-nowrap shadow-lg">
              <span>👤</span>
              <span>Admin Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10">
        {/* Stats Overview */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-teal-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">Total Users</p>
                <p className="text-3xl sm:text-4xl font-bold text-teal-600">{stats.totalUsers}</p>
                <div className="flex gap-3 mt-3 text-xs">
                  <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded">🏪 {stats.totalVendors}</span>
                  <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded">🔧 {stats.totalInstallers}</span>
                  <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded">🛒 {stats.totalCustomers}</span>
                </div>
              </div>
              <div className="bg-teal-100 rounded-full p-4 ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">Total Orders</p>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-2">Active orders and completed</p>
              </div>
              <div className="bg-blue-100 rounded-full p-4 ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-green-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">Total Revenue</p>
                <p className="text-3xl sm:text-4xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-2">From all transactions</p>
              </div>
              <div className="bg-green-100 rounded-full p-4 ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition border-l-4 border-purple-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-2">Products & Stores</p>
                <p className="text-3xl sm:text-4xl font-bold text-purple-600">{stats.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.totalStores} active stores</p>
              </div>
              <div className="bg-purple-100 rounded-full p-4 ml-4 flex-shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Pending Alert */}
        {stats.pendingProducts > 0 && (
          <Link href="/admin-product-approval">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-xl p-6 sm:p-8 cursor-pointer hover:shadow-xl transition shadow-lg mb-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6 flex-1">
                  <div className="bg-white/20 backdrop-blur text-white rounded-full p-4 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1">
                      ⚠️ {stats.pendingProducts} Product{stats.pendingProducts > 1 ? 's' : ''} Pending Approval
                    </h3>
                    <p className="text-sm sm:text-base text-orange-50">
                      Review and approve vendor products to display them in the marketplace
                    </p>
                  </div>
                </div>
                <span className="text-white font-bold text-lg whitespace-nowrap flex-shrink-0">Review →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/admin-post-product" className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6 hover:shadow-xl transition shadow-md transform hover:scale-105 duration-200">
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-3">📦</span>
                <h3 className="font-bold text-base leading-tight">Post Product</h3>
                <p className="text-xs text-teal-100 mt-2">Add to vendor stores</p>
              </div>
            </Link>

            <Link href="/admin-vendor-verification" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-xl transition shadow-md transform hover:scale-105 duration-200">
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-3">✓</span>
                <h3 className="font-bold text-base leading-tight">Verify Vendors</h3>
                <p className="text-xs text-purple-100 mt-2">Approve registrations</p>
              </div>
            </Link>

            <Link href="/admin-product-approval" className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:shadow-xl transition shadow-md transform hover:scale-105 duration-200">
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-3">🔍</span>
                <h3 className="font-bold text-base leading-tight">Approve Products</h3>
                <p className="text-xs text-orange-100 mt-2">Review vendor posts</p>
              </div>
            </Link>

            <Link href="/admin-installment-approval" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-xl transition shadow-md transform hover:scale-105 duration-200">
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-3">💳</span>
                <h3 className="font-bold text-base leading-tight">Installment Apps</h3>
                <p className="text-xs text-blue-100 mt-2">Pay Small Small</p>
              </div>
            </Link>

            <Link href="/admin-profile" className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-xl p-6 hover:shadow-xl transition shadow-md transform hover:scale-105 duration-200">
              <div className="flex flex-col items-center text-center">
                <span className="text-5xl mb-3">⚙️</span>
                <h3 className="font-bold text-base leading-tight">Admin Settings</h3>
                <p className="text-xs text-gray-200 mt-2">Manage account</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex flex-wrap -mb-px px-4 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-1 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-1 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'users'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 Users ({stats.totalUsers})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-1 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                🛒 Orders ({stats.totalOrders})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-1 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'products'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📦 Products ({stats.totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('stores')}
                className={`px-1 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'stores'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                🏪 Stores ({stats.totalStores})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-8">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">📋</span>
                      <h3 className="font-bold text-lg text-blue-900">Recent Orders</h3>
                    </div>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{order.customerName}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <p className="font-bold text-blue-600">{formatPrice(order.total)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">👥</span>
                      <h3 className="font-bold text-lg text-green-900">Recent Users</h3>
                    </div>
                    <div className="space-y-3">
                      {users.slice(0, 5).map(user => (
                        <div key={user.id} className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            user.role === 'vendor' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'installer' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{user.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {users.map((user, idx) => (
                        <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </div>
                              <div className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                              user.role === 'vendor' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'installer' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.city}, {user.country}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-800 font-semibold hover:bg-red-50 px-3 py-1 rounded transition"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-gray-900">{user.firstName} {user.lastName}</h3>
                            <p className="text-xs text-gray-600 break-all">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 flex-shrink-0 ${
                          user.role === 'vendor' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'installer' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs gap-2">
                        <span className="text-gray-600">{user.city}, {user.country}</span>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 font-bold bg-red-50 px-3 py-1 rounded transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 text-lg">📭 No orders yet</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">📦 Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-600 mt-1">{order.customerName} • {formatPrice(order.total)}</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs sm:text-sm border border-gray-300 rounded-lg px-3 py-2 font-semibold flex-1 sm:flex-none hover:border-teal-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="processing">⚙️ Processing</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">✅ Delivered</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="text-teal-600 hover:text-teal-800 text-xs sm:text-sm font-bold whitespace-nowrap"
                            >
                              {expandedOrder === order.id ? '▼ Hide' : '▶ Items'}
                            </button>
                          </div>
                        </div>
                        
                        {expandedOrder === order.id && order.items && order.items.length > 0 && (
                          <div className="p-4 sm:p-6 space-y-3 bg-gray-50">
                            <h4 className="font-bold text-sm text-gray-900 mb-4">📋 Order Items:</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-200 transition">
                                <img 
                                  src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                                  alt={item.name}
                                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-gray-300 flex-shrink-0"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = 'https://via.placeholder.com/80x80?text=No+Image'
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-600 mt-1">Qty: <span className="font-bold">{item.quantity}</span></p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-gray-600">{formatPrice(item.price)}</p>
                                  <p className="text-sm sm:text-base font-bold text-teal-600">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                            <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                              <p className="font-bold text-gray-900">Total:</p>
                              <p className="text-lg font-bold text-teal-600">{formatPrice(order.total)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h2>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold">Image</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {products.map((product, idx) => (
                        <tr key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                          <td className="px-6 py-4">
                            <img 
                              src={product.image || 'https://via.placeholder.com/60x60?text=No+Image'} 
                              alt={product.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-300 shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-sm text-gray-900">{product.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600">{formatPrice(product.price)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              product.stock > 10 ? 'bg-green-100 text-green-800' :
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                      <div className="flex gap-4 mb-3">
                        <img 
                          src={product.image || 'https://via.placeholder.com/60x60?text=No+Image'} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-purple-300 flex-shrink-0 shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-gray-900">{product.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{product.category}</p>
                          <p className="text-sm font-bold text-green-600 mt-1">{formatPrice(product.price)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs gap-2">
                        <span className={`px-2 py-1 font-bold rounded-full flex-shrink-0 ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Stock: {product.stock}
                        </span>
                        <span className="text-gray-600">{product.country}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stores' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Management</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.map(store => (
                    <div key={store.id} className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 hover:shadow-xl transition shadow-md transform hover:scale-105">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-4xl">🏪</span>
                        <h3 className="font-bold text-lg text-gray-900">{store.name}</h3>
                      </div>
                      <div className="space-y-2 text-xs mb-4">
                        <p className="flex items-center gap-2"><span className="font-bold">📍</span> {store.city}, {store.country}</p>
                        <p className="text-gray-600">Store ID: {store.id}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 mt-4">
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <p className="text-sm font-bold text-emerald-600">✅ Active</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

