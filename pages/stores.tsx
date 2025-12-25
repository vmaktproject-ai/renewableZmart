import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Link from 'next/link'
import { productService } from '@/lib/services'
import { useCurrency } from '../context/CurrencyContext'
import type { CatalogProduct } from '../types'

interface Store {
  id: string
  name: string
  slug: string
  description: string
  logo?: string
  banner?: string
  rating?: number
  totalProducts?: number
  city?: string
  country?: string
  isVerified?: boolean
}

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('Nigeria')
  const [selectedCity, setSelectedCity] = useState('all')
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    // Get selected country from localStorage
    const savedLocation = typeof window !== 'undefined' ? localStorage.getItem('renewablezmart_location') : null
    if (savedLocation) {
      const { country } = JSON.parse(savedLocation)
      setSelectedCountry(country)
    }

    const fetchStoresAndProducts = async () => {
      try {
        // Fetch stores
        const storesResponse = await fetch('/api/stores')
        if (storesResponse.ok) {
          const storesData = await storesResponse.json()
          console.log('Stores fetched:', storesData)
          setStores(storesData)
        } else {
          console.error('Stores response not ok:', storesResponse.status)
          setStores([])
        }

        // Fetch all vendor products (without approval filter)
        const productsResponse = await fetch('http://localhost:4000/api/products/all-vendor')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          console.log('Vendor products fetched:', productsData?.length || 0)
          setProducts(productsData)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setStores([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchStoresAndProducts()
  }, [])

  // Get unique cities from stores for the selected country
  const availableCities = stores
    .filter(store => !selectedCountry || store.country === selectedCountry)
    .map(store => store.city)
    .filter((city, index, self) => city && self.indexOf(city) === index)
    .sort()

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (store.city && store.city.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Filter by country - show all stores in the user's selected country
    const matchesCountry = !selectedCountry || store.country === selectedCountry
    
    // Filter by city
    const matchesCity = selectedCity === 'all' || store.city === selectedCity
    
    return matchesSearch && matchesCountry && matchesCity
  })

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Head>
        <title>Vendor Stores - RenewableZmart</title>
        <meta name="description" content="Browse trusted vendor stores on RenewableZmart - Quality renewable energy products from verified sellers" />
      </Head>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">🏪 Vendor Stores in {selectedCountry}</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90">Discover trusted sellers of renewable energy products</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search stores by name..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:flex">
                <select 
                  className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-emerald-600 rounded-lg focus:outline-none focus:border-emerald-700 bg-white text-sm sm:text-base"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <select className="px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-sm sm:text-base">
                  <option>All Stores</option>
                  <option>Verified Only</option>
                  <option>Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Store Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading stores...</div>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600">No stores found matching your search.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {filteredStores.map((store) => (
                <Link href={`/store/${store.slug}`} key={store.id}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group">
                    {/* Store Banner */}
                    <div className="h-12 bg-gradient-to-br from-emerald-500 to-teal-500 relative flex items-center justify-start pl-2">
                      {/* Store Logo on left side */}
                      <div 
                        className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden"
                        onClick={(e) => {
                          if (store.logo) {
                            e.preventDefault()
                            e.stopPropagation()
                            const logoUrl = store.logo.startsWith('http') 
                              ? store.logo 
                              : `http://localhost:4000${store.logo.startsWith('/') ? '' : '/'}${store.logo}`
                            setViewingImage(logoUrl)
                          }
                        }}
                      >
                        {store.logo ? (
                          <img 
                            src={store.logo.startsWith('http') ? store.logo : `http://localhost:4000${store.logo.startsWith('/') ? '' : '/'}${store.logo}`} 
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">🏬</span>
                        )}
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="px-2 py-2">
                      <h3 className="text-[10px] font-bold mb-2 group-hover:text-emerald-600 transition line-clamp-1">
                        {store.name}
                      </h3>

                      <div className="text-[9px] text-gray-600 mb-0.5">
                        <div>📦 {store.totalProducts || 0}</div>
                        <div>📍 {store.city || store.country || 'Nigeria'}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* All Products from All Stores */}
          <div className="mt-12">
            <div className="flex items-center justify-end mb-6">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-sm">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Best Selling</option>
              </select>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-600">No products available yet.</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            

          </div>
        </div>
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

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>RenewableZmart - Sustainable Energy Solutions. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">Powered by Vemakt Technology</p>
        </div>
      </footer>
    </div>
  )
}
