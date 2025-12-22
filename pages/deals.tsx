import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Link from 'next/link'
import type { CatalogProduct } from '../types'
import { productService } from '@/lib/services'

export default function DealsPage() {
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

  const dealsProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price)

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Flash Deals - RenewableZmart</title>
        <meta name="description" content="Limited time deals on renewable energy products" />
      </Head>
      <Header />

      <main>
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-orange-500">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-semibold">Flash Deals</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">⚡ Flash Deals</h1>
            <p className="text-xl text-gray-200">Limited time offers - Don't miss out!</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{dealsProducts.length} Deals Available</h2>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:border-teal-600">
              <option>Sort by: Best Discount</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {dealsProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {dealsProducts.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">No deals at the moment</h3>
              <p className="text-gray-600 mb-4">Check back soon for amazing offers!</p>
              <Link href="/" className="inline-block bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800">Browse All Products</Link>
            </div>
          )}
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
