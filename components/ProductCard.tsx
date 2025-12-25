import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import type { CatalogProduct } from '../types'
import { MouseEvent } from 'react'
import { getBackendBaseUrl } from '../lib/apiConfig'

interface ProductCardProps {
  product: CatalogProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    addToCart(product)
  }

  // Get full image URL - use backend directly for images
  const baseUrl = typeof window !== 'undefined' ? getBackendBaseUrl() : 'http://localhost:4000'
  
  const imageUrl = product.image?.startsWith('http') 
    ? product.image 
    : `${baseUrl}${product.image || '/uploads/default-product.jpg'}`

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-emerald-300 h-full flex flex-col">
        {/* Product Image - Smaller height and width */}
        <div className="relative bg-gray-50 overflow-hidden h-40 flex items-center justify-center p-3">
          <img 
            src={imageUrl} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
          />
          {product.eco && (
            <div className="absolute top-1.5 right-1.5 bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
              🌱 Eco
            </div>
          )}
        </div>

        {/* Product Info - Compact */}
        <div className="p-3 flex flex-col flex-grow bg-white">
          <h3 className="font-normal text-xs mb-2 line-clamp-2 min-h-[32px] text-gray-700 leading-relaxed">{product.title}</h3>
          
          <div className="flex flex-col gap-0.5 mb-2 mt-auto">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
          </div>

          {/* Visit Store */}
          <div className="flex items-center justify-end text-xs text-emerald-600 mb-2">
            {(() => {
              // Try to derive a store slug/id from product data (some product shapes include store or storeId)
              const anyProduct = product as any
              const storeSlug = anyProduct.store?.slug || anyProduct.storeSlug || anyProduct.storeId || anyProduct.store_id
              if (!storeSlug) return null
              const storeHref = `/store/${storeSlug}`
              return (
                <button 
                  className="text-emerald-600 font-semibold text-xs hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    window.location.href = storeHref
                  }}
                >
                  Visit Store
                </button>
              )
            })()}
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart} 
            className="w-full bg-orange-500 text-white py-1.5 rounded-lg hover:bg-orange-600 transition font-semibold text-xs"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  )
}
