import Head from 'next/head'
import Header from '../../components/Header'
import ProductCard from '../../components/ProductCard'
import { useRouter } from 'next/router'
import { useCurrency } from '../../context/CurrencyContext'
import Link from 'next/link'
import type { CatalogProduct } from '../../types'
import { useState, useEffect } from 'react'
import { productService } from '@/lib/services'

type CategoryKey = 'solar' | 'inverters' | 'batteries' | 'accessories' | 'lighting' | 'wind' | 'water' | 'ev' | 'appliances' | string

export default function CategoryPage() {
  const router = useRouter()
  const { category } = router.query as { category?: CategoryKey }
  const { formatPrice } = useCurrency()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll()
        setProducts(data as any)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const categoryNames: Record<string, string> = {
    solar: 'Solar Panels',
    inverters: 'Inverters',
    batteries: 'Batteries & Energy Storage',
    solarlights: 'Solar Lights',
    accessories: 'Accessories & Components',
  }

  const categoryIcons: Record<string, string> = {
    solar: '☀️',
    inverters: '⚡',
    batteries: '🔋',
    accessories: '🔧',
    lighting: '💡',
    wind: '🌬️',
    water: '💧',
    ev: '🚗',
    appliances: '🏠',
  }

  const filteredProducts = category ? products.filter((p) => p.category === category) : []
  const categoryName = (category && categoryNames[category]) || 'Products'
  const categoryIcon = (category && categoryIcons[category]) || '📦'

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>{categoryName} - RenewableZmart</title>
        <meta name="description" content={`Shop ${categoryName} at RenewableZmart`} />
      </Head>
      <Header />

      <main>
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-teal-600">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-semibold">{categoryName}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">{categoryIcon} {categoryName}</h1>
            <p className="text-green-100">{filteredProducts.length} products available</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
                <h3 className="font-bold text-lg mb-4">All Categories</h3>
                <ul className="space-y-2">
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <li key={key}>
                      <Link href={`/category/${key}`} className={`flex items-center gap-2 p-2 rounded-lg ${category === key ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:bg-gray-50'}`}>
                        <span>{categoryIcons[key]}</span>
                        <span className="text-sm">{name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold text-sm mb-3">Price Range</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>{formatPrice(550000)} - {formatPrice(1000000)}</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>{formatPrice(1000000)} - {formatPrice(2000000)}</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>{formatPrice(2000000)} - {formatPrice(5000000)}</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>{formatPrice(5000000)} - {formatPrice(10000000)}</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>Above {formatPrice(10000000)}</span></label>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Showing {filteredProducts.length} products</h2>
                <select className="px-4 py-2 border rounded-lg focus:outline-none focus:border-teal-600">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-bold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try browsing other categories</p>
                  <Link href="/" className="inline-block bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800">Back to Home</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>RenewableZmart - Sustainable Energy Solutions. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Powered by renewable energy 🌱</p>
          <p className="text-sm text-gray-400 mt-1">Powered by Vemakt Technology</p>
        </div>
      </footer>
    </div>
  )
}
