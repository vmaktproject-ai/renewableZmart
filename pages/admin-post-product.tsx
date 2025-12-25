import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { africanCountries } from '../data/locations'
import { getApiBaseUrl } from '@/lib/apiConfig'

interface Store {
  id: string
  name: string
  slug: string
  country: string
  city: string
  ownerId: string
}

export default function AdminPostProduct() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'solar',
    stock: '',
    storeId: '',
    city: '',
    countries: [] as string[]
  })

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

    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = getApiBaseUrl()
      const response = await fetch(`${apiBase}/admin/stores/verified`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = getApiBaseUrl()
      const response = await fetch(`${apiBase}/admin/products/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          countries: formData.countries.length > 0 ? formData.countries : undefined
        })
      })

      if (response.ok) {
        alert('Product posted successfully!')
        setFormData({
          name: '',
          description: '',
          price: '',
          image: '',
          category: 'solar',
          stock: '',
          storeId: '',
          city: '',
          countries: []
        })
      } else {
        const error = await response.json()
        alert(`Failed to post product: ${error.message}`)
      }
    } catch (error) {
      console.error('Error posting product:', error)
      alert('Error posting product')
    } finally {
      setLoading(false)
    }
  }

  const handleCountryToggle = (country: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Post Product - Admin Dashboard</title>
      </Head>

      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Post Product as Admin</h1>
              <p className="text-sm sm:text-base text-gray-600">Add products to verified vendor stores</p>
            </div>
            <Link href="/admin-dashboard" className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-sm sm:text-base">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Product Name */}
            <div>
              <label className="block font-semibold mb-2 text-sm sm:text-base">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                required
                placeholder="e.g., 300W Monocrystalline Solar Panel"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2 text-sm sm:text-base">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                rows={4}
                required
                placeholder="Detailed product description..."
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-sm sm:text-base">Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                  required
                  min="0"
                  step="0.01"
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm sm:text-base">Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                  required
                  min="0"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold mb-2 text-sm sm:text-base">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                required
              >
                <option value="solar">Solar Panels</option>
                <option value="inverters">Inverters</option>
                <option value="batteries">Batteries</option>
                <option value="solarlights">Solar Lights</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block font-semibold mb-2 text-sm sm:text-base">Image URL *</label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-xs sm:text-sm text-blue-900 font-semibold mb-1">📐 Image Requirements (Mandatory):</p>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1 ml-4 list-disc">
                  <li><strong>Size: EXACTLY 800x800 pixels</strong> (1:1 square ratio)</li>
                  <li>Format: JPG, PNG, or WebP</li>
                  <li>Product should be centered on white/transparent background</li>
                  <li>No watermarks or text overlays</li>
                </ul>
              </div>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                required
                placeholder="https://example.com/product-image.jpg"
              />
              {formData.image && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Image Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-40 h-40 object-contain bg-gray-50 border-2 border-gray-200 rounded-lg p-2" 
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none'
                      const error = document.createElement('div')
                      error.className = 'text-red-600 text-sm mt-2'
                      error.textContent = '⚠️ Image failed to load. Please check the URL.'
                      e.currentTarget.parentNode?.appendChild(error)
                    }} 
                  />
                </div>
              )}
            </div>

            {/* Store Selection */}
            <div>
              <label className="block font-semibold mb-2 text-sm sm:text-base">Link to Vendor Store *</label>
              <select
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                required
              >
                <option value="">Select a verified store...</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.city}, {store.country}
                  </option>
                ))}
              </select>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Only verified vendor stores are shown</p>
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold mb-2 text-sm sm:text-base">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm sm:text-base"
                placeholder="Lagos"
              />
            </div>

            {/* Available Countries */}
            <div>
              <label className="block font-semibold mb-3 text-sm sm:text-base">Available in Countries</label>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Select all countries where this product will be displayed</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {africanCountries.map((country: any) => (
                  <label key={country.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.countries.includes(country.name)}
                      onChange={() => handleCountryToggle(country.name)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="truncate">{country.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {formData.countries.length} countries selected
                {formData.countries.length === 0 && ' (will default to store\'s country)'}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? 'Posting Product...' : '📦 Post Product'}
              </button>
              <Link
                href="/admin-dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition text-sm sm:text-base text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
