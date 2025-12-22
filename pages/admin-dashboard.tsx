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

export default function AdminDashboard() {
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
      
      // Fetch all data in parallel
      const [usersRes, ordersRes, productsRes, storesRes, pendingRes] = await Promise.all([
        fetch('http://localhost:4000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:4000/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:4000/api/admin/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:4000/api/admin/stores', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:4000/api/admin/products/pending', {
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
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
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
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:4000/api/admin/orders/${orderId}/status`, {
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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - RenewableZmart</title>
      </Head>

      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your entire platform from here</p>
            </div>
            <Link href="/admin-profile" className="bg-teal-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center gap-2 text-sm sm:text-base">
              <span>👤</span>
              <span>Admin Profile</span>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-teal-600">{stats.totalUsers}</p>
              </div>
              <div className="bg-teal-100 rounded-full p-3">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.totalVendors} vendors • {stats.totalInstallers} installers • {stats.totalCustomers} customers
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Products & Stores</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.totalStores} active stores</p>
          </div>
        </div>

        {/* Pending Products Alert */}
        {stats.pendingProducts > 0 && (
          <Link href="/admin-product-approval">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 sm:p-6 mb-4 sm:mb-8 cursor-pointer hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-yellow-500 text-white rounded-full p-3 sm:p-4 animate-pulse">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1">
                      {stats.pendingProducts} Product{stats.pendingProducts > 1 ? 's' : ''} Pending Approval
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      Review and approve vendor products to display in the marketplace
                    </p>
                  </div>
                </div>
                <span className="text-yellow-700 font-bold text-sm sm:text-base whitespace-nowrap">Review →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Link href="/admin-post-product" className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Post Product</h3>
                <p className="text-xs text-teal-100">Add to vendor stores</p>
              </div>
            </div>
          </Link>

          <Link href="/admin-vendor-verification" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Verify Vendors</h3>
                <p className="text-xs text-purple-100">Approve registrations</p>
              </div>
            </div>
          </Link>

          <Link href="/admin-product-approval" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Approve Products</h3>
                <p className="text-xs text-orange-100">Review vendor posts</p>
              </div>
            </div>
          </Link>

          <Link href="/admin-installment-approval" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💳</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Installment Apps</h3>
                <p className="text-xs text-blue-100">Pay Small Small</p>
              </div>
            </div>
          </Link>

          <Link href="/admin-profile" className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Admin Settings</h3>
                <p className="text-xs text-gray-100">Manage account</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex -mb-px min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({stats.totalUsers})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders ({stats.totalOrders})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({stats.totalProducts})
              </button>
              <button
                onClick={() => setActiveTab('stores')}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'stores'
                    ? 'border-b-2 border-teal-500 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stores ({stats.totalStores})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="border rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Recent Orders</h3>
                    <div className="space-y-2">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-gray-600 truncate">{order.customerName}</span>
                          <span className="font-medium ml-2">{formatPrice(order.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Recent Users</h3>
                    <div className="space-y-2">
                      {users.slice(0, 5).map(user => (
                        <div key={user.id} className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-gray-600 truncate">{user.firstName} {user.lastName}</span>
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded ml-2">{user.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">All Users</h2>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id}>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                            {user.city}, {user.country}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm">
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
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
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-gray-900">{user.firstName} {user.lastName}</h3>
                          <p className="text-xs text-gray-500 break-all">{user.email}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 ml-2">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">{user.city}, {user.country}</span>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">All Orders</h2>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3 sm:p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-gray-500">{order.customerName} • {formatPrice(order.total)}</p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs sm:text-sm border rounded px-2 py-1 flex-1 sm:flex-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                              {expandedOrder === order.id ? 'Hide Items' : 'View Items'}
                            </button>
                          </div>
                        </div>
                        
                        {expandedOrder === order.id && order.items && order.items.length > 0 && (
                          <div className="p-3 sm:p-4 space-y-3">
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Order Items:</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                                <img 
                                  src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                                  alt={item.name}
                                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = 'https://via.placeholder.com/80x80?text=No+Image'
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                  <p className="text-xs sm:text-sm font-semibold text-teal-600">{formatPrice(item.price)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs sm:text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
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
                <h2 className="text-lg sm:text-xl font-semibold mb-4">All Products</h2>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map(product => (
                        <tr key={product.id}>
                          <td className="px-4 sm:px-6 py-4">
                            <img 
                              src={product.image || 'https://via.placeholder.com/60x60?text=No+Image'} 
                              alt={product.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                              }}
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{product.name}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{product.category}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{formatPrice(product.price)}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{product.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex gap-3 mb-2">
                        <img 
                          src={product.image || 'https://via.placeholder.com/60x60?text=No+Image'} 
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                          }}
                        />
                        <h3 className="font-semibold text-sm text-gray-900 flex-1">{product.name}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-1 font-medium">{product.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1 font-medium">{formatPrice(product.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="ml-1 font-medium">{product.stock}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-1 font-medium">{product.country}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stores' && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">All Stores</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {stores.map(store => (
                    <div key={store.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                      <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {store.city}, {store.country}
                      </p>
                      <p className="text-xs text-gray-500">Store ID: {store.id}</p>
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
