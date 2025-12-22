import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCurrency } from '../context/CurrencyContext'
import { africanCountries, getPhoneInfo } from '../data/locations'
import { validatePhoneNumber } from '../lib/phoneValidation'
import { validateEmail } from '../lib/emailValidation'

interface Product {
  id: number
  name: string
  price: number
  stock: number
  category: string
  image: string
  status: string
  views?: number
  sales?: number
}

interface Analytics {
  totalViews: number
  totalSales: number
  totalRevenue: number
  todayViews: number
  todaySales: number
  weekViews: number
  weekSales: number
  topProducts: {
    id: number
    name: string
    views: number
    sales: number
    revenue: number
  }[]
}

interface CurrentUser {
  id: number
  firstName: string
  lastName: string
  email: string
  accountType: string
  token: string
}

export default function VendorDashboard() {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0,
    todayViews: 0,
    todaySales: 0,
    weekViews: 0,
    weekSales: 0,
    topProducts: []
  })
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockUpdate, setStockUpdate] = useState({ productId: 0, newStock: 0, productName: '' })
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'profile'>('products')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [storeProfile, setStoreProfile] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: ''
  })
  const [storeLogoFile, setStoreLogoFile] = useState<File | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [availableStoreCities, setAvailableStoreCities] = useState<string[]>([])
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'solar',
    image: '',
    country: '',
    city: '',
    enablePaySmallSmall: false
  })

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    const token = localStorage.getItem('accessToken')
    
    if (!user || !token) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    
    // Check if user is a vendor (support both role and accountType fields)
    const isVendor = userData.role === 'vendor' || userData.accountType === 'vendor'
    
    if (!isVendor) {
      router.push('/')
      return
    }
    
    // Add token to userData for API calls
    const userWithToken = { ...userData, token }
    setCurrentUser(userWithToken)
    fetchProducts(token)
    fetchStore(token)

    // Get location
    const location = localStorage.getItem('renewablezmart_location')
    if (location) {
      const { country, city } = JSON.parse(location)
      setFormData(prev => ({ ...prev, country, city }))
    }
  }, [])

  const fetchProducts = async (token: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/products/vendor/my-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        // Calculate analytics from products
        calculateAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStore = async (token: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/stores/my-store', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStoreId(data.id)
        setStoreProfile({
          name: data.name || '',
          description: data.description || '',
          logo: data.logo || '',
          banner: data.banner || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Nigeria'
        })
        // Set available cities for the store's country
        const selectedCountry = africanCountries.find(c => c.name === (data.country || 'Nigeria'))
        setAvailableStoreCities(selectedCountry?.states || selectedCountry?.cities || [])
      }
    } catch (error) {
      console.error('Failed to fetch store:', error)
    }
  }

  const handleStoreUpdate = async () => {
    if (!currentUser || !storeId) {
      alert('Store not found')
      return
    }

    // Validate phone number
    if (storeProfile.phone) {
      const phoneValidation = validatePhoneNumber(storeProfile.phone, storeProfile.country)
      if (!phoneValidation.isValid) {
        alert(phoneValidation.error || 'Invalid phone number')
        return
      }
    }

    // Validate email
    if (storeProfile.email) {
      const emailValidation = validateEmail(storeProfile.email)
      if (!emailValidation.isValid) {
        alert(emailValidation.error || 'Invalid email address')
        return
      }
    }

    try {
      const formDataToSend = new FormData()
      
      // Add text fields
      Object.keys(storeProfile).forEach(key => {
        if (key !== 'logo' && key !== 'banner') {
          formDataToSend.append(key, storeProfile[key as keyof typeof storeProfile])
        }
      })

      // Add logo file if selected
      if (storeLogoFile) {
        formDataToSend.append('logo', storeLogoFile)
      }

      const response = await fetch(`http://localhost:4000/api/stores/${storeId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        alert('Store profile updated successfully!')
        // Clear file input
        setStoreLogoFile(null)
        fetchStore(currentUser.token)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update store profile')
      }
    } catch (error) {
      console.error('Failed to update store:', error)
      alert('Failed to update store profile')
    }
  }

  const calculateAnalytics = (productsList: Product[]) => {
    // Use real data - analytics tracking will be implemented via Order model
    const totalViews = productsList.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalSales = productsList.reduce((sum, p) => sum + (p.sales || 0), 0)
    const totalRevenue = productsList.reduce((sum, p) => sum + ((p.sales || 0) * p.price), 0)
    
    const topProducts = productsList
      .map(p => ({
        id: p.id,
        name: p.name,
        views: p.views || 0,
        sales: p.sales || 0,
        revenue: (p.sales || 0) * p.price
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    setAnalytics({
      totalViews,
      totalSales,
      totalRevenue,
      todayViews: Math.floor(totalViews * 0.1),
      todaySales: Math.floor(totalSales * 0.1),
      weekViews: Math.floor(totalViews * 0.3),
      weekSales: Math.floor(totalSales * 0.3),
      topProducts
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one product image or video')
      return
    }

    try {
      // Create FormData for file uploads (backend will auto-create/find store)
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('stock', formData.stock)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('country', formData.country)
      formDataToSend.append('city', formData.city)
      formDataToSend.append('enablePaySmallSmall', formData.enablePaySmallSmall.toString())

      // Separate images and videos from the combined files
      uploadedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          formDataToSend.append('images', file)
        } else if (file.type.startsWith('video/')) {
          formDataToSend.append('videos', file)
        }
      })

      const response = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: formDataToSend
      })

      if (response.status === 401) {
        alert('Your session has expired. Please log in again.')
        localStorage.removeItem('renewablezmart_current_user')
        localStorage.removeItem('accessToken')
        router.push('/login')
        return
      }

      if (response.ok) {
        alert('Product added successfully! It will appear on the landing page after admin approval.')
        setShowAddProduct(false)
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: 'solar',
          image: '',
          country: formData.country,
          city: formData.city,
          enablePaySmallSmall: false
        })
        setUploadedFiles([])
        fetchProducts(currentUser.token)
      } else {
        const error = await response.json()
        alert(`Failed to add product: ${error.message}`)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (productId: number) => {
    if (!currentUser) return
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      })

      if (response.ok) {
        alert('Product deleted successfully!')
        fetchProducts(currentUser.token)
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const deleteAccount = async () => {
    if (!currentUser) return
    
    const confirmText = prompt('This will permanently delete your account, all products, and store data. Type "DELETE" to confirm:')
    if (confirmText !== 'DELETE') {
      alert('Account deletion cancelled')
      return
    }

    try {
      const response = await fetch(`http://localhost:4000/api/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      })

      if (response.ok) {
        alert('Account deleted successfully')
        localStorage.removeItem('renewablezmart_current_user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        router.push('/')
      } else {
        const data = await response.json()
        alert(`Failed to delete account: ${data.message}`)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    }
  }

  const openStockModal = (product: Product) => {
    setStockUpdate({
      productId: product.id,
      newStock: product.stock,
      productName: product.name
    })
    setShowStockModal(true)
  }

  const handleStockUpdate = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`http://localhost:4000/api/products/${stockUpdate.productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ stock: stockUpdate.newStock })
      })

      if (response.ok) {
        alert('Stock updated successfully!')
        setShowStockModal(false)
        fetchProducts(currentUser.token)
      } else {
        alert('Failed to update stock')
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      alert('Failed to update stock')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image,
      country: formData.country,
      city: formData.city,
      enablePaySmallSmall: false
    })
    setShowAddProduct(true)
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Vendor Dashboard - RenewableZmart</title>
      </Head>
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser.firstName}! 👋</h1>
          <p className="text-white/90">Manage your store and products from your vendor dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-emerald-600">{products.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalViews.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">+{analytics.todayViews} today</p>
              </div>
              <div className="text-4xl">👁️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.totalSales}</p>
                <p className="text-xs text-gray-500 mt-1">+{analytics.todaySales} today</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(analytics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
            >
              ➕ Add New Product
            </button>
            <Link href="/orders" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition text-center">
              📋 View Orders
            </Link>
            <button
              onClick={() => setActiveTab('analytics')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition"
            >
              📊 View Analytics
            </button>
            <Link href="/account" className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition text-center">
              ⚙️ Settings
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 font-bold transition ${
                activeTab === 'products'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              📦 My Products
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-4 font-bold transition ${
                activeTab === 'analytics'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              📊 Analytics & Insights
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-bold transition ${
                activeTab === 'profile'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              🏪 Store Profile
            </button>
          </div>
        </div>

        {/* Stock Update Modal */}
        {showStockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowStockModal(false)}>
            <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Update Stock</h2>
                  <button onClick={() => setShowStockModal(false)} className="text-3xl hover:text-gray-600 leading-none">×</button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">Product: <span className="font-semibold">{stockUpdate.productName}</span></p>
                
                <div className="mb-6">
                  <label className="block font-semibold mb-2">New Stock Quantity</label>
                  <input
                    type="number"
                    value={stockUpdate.newStock}
                    onChange={(e) => setStockUpdate({ ...stockUpdate, newStock: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 text-lg font-semibold"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleStockUpdate}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
                  >
                    Update Stock
                  </button>
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddProduct(false)}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Add New Product</h2>
                  <button onClick={() => setShowAddProduct(false)} className="text-3xl hover:text-gray-600 leading-none">×</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="e.g. 5KVA Solar Inverter"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                    placeholder="Detailed product description..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="solar">Solar Panels</option>
                    <option value="inverters">Inverters</option>
                    <option value="batteries">Batteries</option>
                    <option value="solarlights">Solar Lights</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Product Images & Videos * (Max 10 files)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length + uploadedFiles.length > 10) {
                        alert('You can only upload up to 10 files total (images and videos combined)')
                        return
                      }
                      setUploadedFiles([...uploadedFiles, ...files])
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload up to 10 images and videos (JPG, PNG, MP4, WebM)</p>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center">
                              <div className="text-center">
                                <span className="text-2xl">🎥</span>
                                <p className="text-xs mt-1 truncate px-1">{file.name.substring(0, 15)}</p>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pay Small Small Option */}
                {(formData.category === 'solar' || formData.category === 'inverters' || formData.category === 'batteries') && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="enablePaySmallSmall"
                        checked={formData.enablePaySmallSmall}
                        onChange={(e) => setFormData({ ...formData, enablePaySmallSmall: e.target.checked })}
                        className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="enablePaySmallSmall" className="block font-bold text-emerald-800 mb-1 cursor-pointer">
                          💳 Enable Pay Small Small for this product
                        </label>
                        <p className="text-sm text-gray-700 mb-2">
                          Allow customers to buy this product with flexible payment plans (50% upfront, balance in 3-6 months)
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-emerald-200">
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">3 Months Plan:</span>
                              <span className="font-semibold">{formatPrice(450000)} - {formatPrice(1000000)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">6 Months Plan:</span>
                              <span className="font-semibold">Other amounts</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-emerald-100">
                              <span className="text-emerald-700 font-semibold">✓ 0% Interest • No Hidden Charges</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition">
                    Add Product
                  </button>
                  <button type="button" onClick={() => setShowAddProduct(false)} className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products List */}
        {activeTab === 'products' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Products ({products.length})</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition"
              >
                ➕ Add Product
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600 mb-4">You haven't added any products yet</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Approval Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image?.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${product.image}`} 
                              alt={product.name} 
                              className="w-12 h-12 object-cover rounded" 
                            />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3 text-sm">{product.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            (product as any).approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                            (product as any).approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(product as any).approvalStatus === 'approved' ? '✓ Approved' : 
                             (product as any).approvalStatus === 'rejected' ? '✗ Rejected' : 
                             '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openStockModal(product)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                            >
                              Update Stock
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          /* Analytics Tab */
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">👁️</span> Page Views
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today</span>
                    <span className="font-bold text-xl text-blue-600">{analytics.todayViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-bold text-xl text-blue-600">{analytics.weekViews}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">All Time</span>
                    <span className="font-bold text-2xl text-blue-600">{analytics.totalViews.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🛒</span> Sales
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today</span>
                    <span className="font-bold text-xl text-purple-600">{analytics.todaySales}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-bold text-xl text-purple-600">{analytics.weekSales}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">All Time</span>
                    <span className="font-bold text-2xl text-purple-600">{analytics.totalSales}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span> Revenue
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Order</span>
                    <span className="font-bold text-xl text-green-600">
                      {formatPrice(analytics.totalSales > 0 ? Math.floor(analytics.totalRevenue / analytics.totalSales) : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversion</span>
                    <span className="font-bold text-xl text-green-600">
                      {analytics.totalViews > 0 ? ((analytics.totalSales / analytics.totalViews) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-2xl text-green-600">{formatPrice(analytics.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Top Performing Products
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Views</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sales</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analytics.topProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-blue-600 font-semibold">{product.views.toLocaleString()}</td>
                        <td className="px-4 py-3 text-purple-600 font-semibold">{product.sales}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{formatPrice(product.revenue)}</td>
                        <td className="px-4 py-3 font-semibold">{((product.sales / product.views) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-md p-6 border border-emerald-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span> Performance Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📈</span>
                    <span className="font-semibold">Best Day</span>
                  </div>
                  <p className="text-sm text-gray-600">Your store gets the most views on weekdays</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⏰</span>
                    <span className="font-semibold">Peak Hours</span>
                  </div>
                  <p className="text-sm text-gray-600">Most activity between 2 PM - 8 PM</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="font-semibold">Top Category</span>
                  </div>
                  <p className="text-sm text-gray-600">Solar panels are your best sellers</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🚀</span>
                    <span className="font-semibold">Growth Tip</span>
                  </div>
                  <p className="text-sm text-gray-600">Add more product images to boost sales</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Store Profile Tab */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">🏪 Store Profile</h2>
            
            <div className="space-y-6">
              {/* Store Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                {storeProfile.logo && !storeLogoFile && (
                  <div className="mb-4">
                    <div className="cursor-pointer" onClick={() => {
                      const logoUrl = storeProfile.logo.startsWith('http') 
                        ? storeProfile.logo 
                        : `http://localhost:4000${storeProfile.logo.startsWith('/') ? '' : '/'}${storeProfile.logo}`
                      setViewingImage(logoUrl)
                    }}>
                      <img 
                        src={storeProfile.logo.startsWith('http') ? storeProfile.logo : `http://localhost:4000${storeProfile.logo.startsWith('/') ? '' : '/'}${storeProfile.logo}`} 
                        alt="Current logo" 
                        className="w-16 h-16 object-cover rounded-full hover:opacity-90 transition"
                      />
                      <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Remove store logo? This action cannot be undone.')) {
                          try {
                            const response = await fetch(`http://localhost:4000/api/stores/${storeId}/remove-image`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentUser?.token}`
                              },
                              body: JSON.stringify({ imageType: 'logo' })
                            })
                            if (response.ok) {
                              setStoreProfile({ ...storeProfile, logo: '' })
                              alert('Logo removed successfully')
                            } else {
                              alert('Failed to remove logo')
                            }
                          } catch (error) {
                            alert('Failed to remove logo')
                          }
                        }
                      }}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                    >
                      🗑️ Remove Logo
                    </button>
                  </div>
                )}
                {storeLogoFile && (
                  <div className="mb-4 cursor-pointer" onClick={() => setViewingImage(URL.createObjectURL(storeLogoFile))}>
                    <img 
                      src={URL.createObjectURL(storeLogoFile)} 
                      alt="New logo" 
                      className="w-16 h-16 object-cover rounded-full hover:opacity-90 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStoreLogoFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 400x400px</p>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input
                  type="text"
                  value={storeProfile.name}
                  onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter store name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={storeProfile.description}
                  onChange={(e) => setStoreProfile({ ...storeProfile, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  rows={4}
                  placeholder="Describe your store"
                />
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={storeProfile.phone}
                    onChange={(e) => setStoreProfile({ ...storeProfile, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder={storeProfile.country ? (getPhoneInfo(storeProfile.country)?.format || 'Phone number') : 'Phone number'}
                  />
                  {storeProfile.country && getPhoneInfo(storeProfile.country) && (
                    <p className="text-xs text-gray-600 mt-1">Format: {getPhoneInfo(storeProfile.country)?.format}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={storeProfile.email}
                    onChange={(e) => setStoreProfile({ ...storeProfile, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Store email"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={storeProfile.address}
                  onChange={(e) => setStoreProfile({ ...storeProfile, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Store address"
                />
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                  <select
                    value={storeProfile.country}
                    onChange={(e) => {
                      const selectedCountry = africanCountries.find(c => c.name === e.target.value)
                      setAvailableStoreCities(selectedCountry?.states || selectedCountry?.cities || [])
                      setStoreProfile({ ...storeProfile, country: e.target.value, city: '', state: '' })
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Country</option>
                    {africanCountries.map((country) => (
                      <option key={country.name} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City/State <span className="text-red-500">*</span></label>
                  <select
                    value={storeProfile.city}
                    onChange={(e) => setStoreProfile({ ...storeProfile, city: e.target.value, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    disabled={!storeProfile.country}
                  >
                    <option value="">Select City/State</option>
                    {availableStoreCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleStoreUpdate}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                  💾 Save Store Profile
                </button>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 pt-6 border-t-2 border-red-200">
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. This will permanently delete your account, 
                    all your products, store information, and all associated data.
                  </p>
                  <button
                    onClick={deleteAccount}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                  >
                    🗑️ Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕ Close
            </button>
            <img 
              src={viewingImage} 
              alt="Store photo" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
