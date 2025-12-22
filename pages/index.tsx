import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { productService } from '@/lib/services'
import { useCurrency } from '../context/CurrencyContext'
import Link from 'next/link'
import type { CatalogProduct } from '../types'
import { africanCountries } from '../data/locations'

export default function Home() {
  const router = useRouter()
  const { search } = router.query
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { formatPrice } = useCurrency()

  // Handle search from URL query
  useEffect(() => {
    if (search && typeof search === 'string') {
      setSearchQuery(search)
    }
  }, [search])


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products (approved only)
        const data = await productService.getAll()
        setAllProducts(data as any)
        setProducts(data as any)
        
        // Get saved location from localStorage
        const locationData = localStorage.getItem('renewablezmart_location')
        if (locationData) {
          const { country, city } = JSON.parse(locationData)
          setSelectedCountry(country)
          setSelectedCity(city)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setAllProducts([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filter products when country, city, or search query changes
  useEffect(() => {
    let filtered = allProducts

    // Apply country filter
    if (selectedCountry && selectedCountry !== 'all') {
      filtered = filtered.filter(p => (p as any).country === selectedCountry)
    }

    // Apply city filter
    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter(p => (p as any).city === selectedCity)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        (p as any).description?.toLowerCase().includes(query)
      )
    }

    setProducts(filtered)
  }, [selectedCountry, selectedCity, allProducts, searchQuery])

  // Get unique countries and cities from products
  const availableCountries = ['all', ...new Set(allProducts.map(p => (p as any).country).filter(Boolean))]
  const availableCities = selectedCountry === 'all' 
    ? ['all'] 
    : ['all', ...new Set(allProducts.filter(p => (p as any).country === selectedCountry).map(p => (p as any).city).filter(Boolean))]
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>RenewableZmart - Sustainable Energy Products | Solar, Wind & More</title>
        <meta name="description" content="Shop sustainable energy products - Solar panels, batteries, inverters, and more." />
      </Head>
      <Header />

      <main>
        <div className="container mx-auto px-4 py-8">
          {/* Pay Small Small Banner */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white">Pay Small Small</h2>
              </div>
              <p className="text-center text-white/95 text-lg mb-6">Flexible payment plans - Own your equipment today!</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border-2 border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">3 MONTHS</span>
                  </div>
                  <p className="text-sm text-gray-700">{formatPrice(450000)} - {formatPrice(1000000)}</p>
                </div>
                
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border-2 border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">6 MONTHS</span>
                  </div>
                  <p className="text-sm text-gray-700">Other amounts</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white/20 rounded-lg px-4 py-2 inline-block mb-4">
                  <span className="text-sm text-white font-semibold">0% Interest • No Hidden Charges • Secure</span>
                </div>
                <div>
                  <Link href="/category/inverters" className="inline-block bg-white text-emerald-700 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* All Products */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'} ({products.length})
                </h2>
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); router.push('/') }}
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    Clear search
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Country Filter */}
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-xs sm:text-sm w-full sm:w-auto"
                >
                  <option value="all">All Countries</option>
                  {availableCountries.filter(c => c !== 'all').map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>

                {/* City Filter */}
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-xs sm:text-sm w-full sm:w-auto"
                  disabled={selectedCountry === 'all'}
                >
                  <option value="all">All Cities</option>
                  {availableCities.filter(c => c !== 'all').map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                {/* Sort */}
                <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-xs sm:text-sm w-full sm:w-auto">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Best Selling</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-600">No products found</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2 sm:gap-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}