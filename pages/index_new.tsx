import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import { productService } from '@/lib/services'
import { useCurrency } from '../context/CurrencyContext'
import Link from 'next/link'
import type { CatalogProduct } from '../types'

export default function Home() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll()
        setProducts(data as any)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        import('../data/products.json').then(({ default: staticProducts }) => {
          setProducts(staticProducts as CatalogProduct[])
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const list = products
  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>RenewableZmart - Sustainable Energy Products</title>
        <meta name="description" content="Shop quality solar panels, batteries, inverters & accessories across Africa" />
      </Head>
      <Header />

      <main>
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-4">Power Your Future with Renewable Energy</h1>
              <p className="text-xl mb-8 text-green-50">Quality solar panels, inverters, batteries & accessories delivered across Africa</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/calculator" className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">📊 Load Calculator</Link>
                <Link href="/deals" className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition shadow-lg">⚡ Flash Deals</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Left Sidebar - Categories */}
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-3">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/category/solar" className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 rounded-lg transition group">
                      <span className="text-2xl group-hover:scale-110 transition">☀️</span>
                      <span className="font-medium text-gray-700 group-hover:text-orange-700">Solar Panels</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/inverters" className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition group">
                      <span className="text-2xl group-hover:scale-110 transition">⚡</span>
                      <span className="font-medium text-gray-700 group-hover:text-blue-700">Inverters</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/batteries" className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition group">
                      <span className="text-2xl group-hover:scale-110 transition">🔋</span>
                      <span className="font-medium text-gray-700 group-hover:text-purple-700">Batteries</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/solarlights" className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 rounded-lg transition group">
                      <span className="text-2xl group-hover:scale-110 transition">💡</span>
                      <span className="font-medium text-gray-700 group-hover:text-amber-700">Solar Lights</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/category/accessories" className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 rounded-lg transition group">
                      <span className="text-2xl group-hover:scale-110 transition">🔧</span>
                      <span className="font-medium text-gray-700 group-hover:text-gray-700">Accessories</span>
                    </Link>
                  </li>
                </ul>

                {/* Price Filters */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Price Range</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-green-600">
                      <input type="checkbox" className="rounded text-green-600" />
                      <span>{formatPrice(550000)} - {formatPrice(1000000)}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-green-600">
                      <input type="checkbox" className="rounded text-green-600" />
                      <span>{formatPrice(1000000)} - {formatPrice(2000000)}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-green-600">
                      <input type="checkbox" className="rounded text-green-600" />
                      <span>Above {formatPrice(2000000)}</span>
                    </label>
                  </div>
                </div>

                {/* Special Offers */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">Special Offers</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-green-600">
                      <input type="checkbox" className="rounded text-green-600" />
                      <span>🔥 On Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-green-600">
                      <input type="checkbox" className="rounded text-green-600" />
                      <span>✓ In Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Flash Deals Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-3xl">⚡</span>
                    Flash Deals
                    <span className="text-sm font-normal text-red-600 bg-red-50 px-3 py-1 rounded-full ml-2">Limited Time!</span>
                  </h2>
                  <Link href="/deals" className="text-green-600 font-semibold hover:text-green-700 flex items-center gap-1">
                    See All <span>›</span>
                  </Link>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading products...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {list.slice(0, 4).map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pay Small Small Banner */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
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
                    <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">3 MONTHS</span>
                      </div>
                      <p className="text-sm text-gray-700">{formatPrice(450000)} - {formatPrice(1000000)}</p>
                    </div>
                    
                    <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">6 MONTHS</span>
                      </div>
                      <p className="text-sm text-gray-700">Other amounts</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg px-4 py-2 inline-block mb-4">
                      <span className="text-sm text-white font-semibold">0% Interest • No Hidden Charges • Secure</span>
                    </div>
                    <div>
                      <Link href="/category/inverters" className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105">
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Products Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">All Products ({list.length})</h2>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-sm">
                    <option>Sort by: Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                    <option>Best Selling</option>
                  </select>
                </div>
                {loading ? (
                  <div className="text-center py-12 text-gray-500">Loading products...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {list.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
