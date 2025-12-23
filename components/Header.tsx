import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { useState, useEffect, MouseEvent } from 'react'
import { africanCountries } from '../data/locations'
import { getCountryCurrency } from '../lib/currency'
import { useRouter } from 'next/router'
import NotificationBell from './NotificationBell'

interface CurrentUser {
  firstName?: string
  lastName?: string
  email: string
  accountType?: 'vendor' | 'customer' | string
  role?: 'VENDOR' | 'CUSTOMER' | string
}

interface HeaderProps {
  onCategoryChange?: (category: string) => void
}

type Country = {
  name: string
  flag?: string
  states?: string[]
  cities?: string[]
}

// Derive ISO country code from flag emoji (works cross-platform)
const emojiToCountryCode = (emoji?: string): string => {
  if (!emoji) return 'UN'
  const codePoints = Array.from(emoji)
    .map((c) => c.codePointAt(0) ?? 0)
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
  if (codePoints.length < 2) return 'UN'
  const letters = codePoints
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 65))
    .join('')
  return letters || 'UN'
}

// Comprehensive country name to ISO code mapping
const getCountryISOCode = (countryName: string): string => {
  const countryMap: Record<string, string> = {
    'Nigeria': 'NG',
    'Algeria': 'DZ',
    'Angola': 'AO',
    'Benin': 'BJ',
    'Botswana': 'BW',
    'Burkina Faso': 'BF',
    'Burundi': 'BI',
    'Cameroon': 'CM',
    'Cape Verde': 'CV',
    'Central African Republic': 'CF',
    'Chad': 'TD',
    'Comoros': 'KM',
    'Congo (Brazzaville)': 'CG',
    'Congo (Kinshasa)': 'CD',
    'Djibouti': 'DJ',
    'Egypt': 'EG',
    'Equatorial Guinea': 'GQ',
    'Eritrea': 'ER',
    'Eswatini': 'SZ',
    'Ethiopia': 'ET',
    'Gabon': 'GA',
    'Gambia': 'GM',
    'Ghana': 'GH',
    'Guinea': 'GN',
    'Guinea-Bissau': 'GW',
    'Ivory Coast': 'CI',
    'Kenya': 'KE',
    'Lesotho': 'LS',
    'Liberia': 'LR',
    'Libya': 'LY',
    'Madagascar': 'MG',
    'Malawi': 'MW',
    'Mali': 'ML',
    'Mauritania': 'MR',
    'Mauritius': 'MU',
    'Morocco': 'MA',
    'Mozambique': 'MZ',
    'Namibia': 'NA',
    'Niger': 'NE',
    'Rwanda': 'RW',
    'São Tomé and Príncipe': 'ST',
    'Senegal': 'SN',
    'Seychelles': 'SC',
    'Sierra Leone': 'SL',
    'Somalia': 'SO',
    'South Africa': 'ZA',
    'South Sudan': 'SS',
    'Sudan': 'SD',
    'Tanzania': 'TZ',
    'Togo': 'TG',
    'Tunisia': 'TN',
    'Uganda': 'UG',
    'Zambia': 'ZM',
    'Zimbabwe': 'ZW'
  }
  return countryMap[countryName] || countryName.substring(0, 2).toUpperCase()
}

export default function Header({ onCategoryChange }: HeaderProps = {}) {
  const { cart } = useCart()
  const { currency, setCurrency, availableCurrencies } = useCurrency()
  const router = useRouter()
  const count = cart.reduce((s: number, p: { qty: number }) => s + (p.qty || 0), 0)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('Nigeria')
  const [selectedCity, setSelectedCity] = useState<string>('Lagos')
  const [searchLocation, setSearchLocation] = useState<string>('')
  const [mounted, setMounted] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false)
  const [showHelpMenu, setShowHelpMenu] = useState<boolean>(false)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Navigate to home page with search query
    router.push({
      pathname: '/',
      query: { search: searchQuery.trim() }
    })
  }

  useEffect(() => {
    setMounted(true)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('renewablezmart_location') : null
    if (saved) {
      const { country, city } = JSON.parse(saved)
      setSelectedCountry(country)
      setSelectedCity(city)
    }

    const user = typeof window !== 'undefined' ? localStorage.getItem('renewablezmart_current_user') : null
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    
    // Clear cart if no user is logged in (clean up abandoned carts from previous sessions)
    if (!user || !token) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('renewablezmart_cart')
      }
    }
    
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('renewablezmart_current_user')
      localStorage.removeItem('renewablezmart_cart')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
    setCurrentUser(null)
    if (router.pathname !== '/') {
      router.push('/')
    } else {
      router.reload()
    }
  }

  const saveLocation = (country: string, city: string) => {
    setSelectedCountry(country)
    setSelectedCity(city)
    if (typeof window !== 'undefined') {
      localStorage.setItem('renewablezmart_location', JSON.stringify({ country, city }))
      // Dispatch custom event to notify other components of location change
      window.dispatchEvent(new Event('locationChanged'))
    }
    // Update currency based on selected country
    const countryCurrency = getCountryCurrency(country)
    setCurrency(countryCurrency)
    setShowLocationModal(false)
  }

  const countries: Country[] = africanCountries as unknown as Country[]
  const currentCountry: Country = countries.find((c) => c.name === selectedCountry) || countries[0]
  const currentCities: string[] = (currentCountry?.states || currentCountry?.cities || []) as string[]
  const selectedFlagCode = (currentCountry?.flag ? emojiToCountryCode(currentCountry.flag) : 'UN').toLowerCase()

  const filteredCountries = countries.filter((c) => c.name.toLowerCase().includes(searchLocation.toLowerCase()))
  const filteredCities = currentCities.filter((city) => city.toLowerCase().includes(searchLocation.toLowerCase()))

  return (
    <>
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowLocationModal(false)}>
          <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Choose your location</h2>
                <button onClick={() => setShowLocationModal(false)} className="text-2xl hover:text-slate-600 leading-none">×</button>
              </div>
              <p className="text-gray-600 mb-2 text-sm">Select your delivery location</p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm">Country</label>
                <select
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm"
                  value={selectedCountry}
                  onChange={(e) => {
                    const countryName = e.target.value
                    setSelectedCountry(countryName)
                    const country = countries.find((c) => c.name === countryName)
                    const list = (country?.states || country?.cities || []) as string[]
                    setSelectedCity(list[0] || '')
                  }}
                >
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm">{currentCountry?.states ? 'State' : 'City'}</label>
                <select
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 text-sm"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {(currentCountry?.states || currentCountry?.cities || []).map((city) => (
                    <option key={city} value={city as string}>{city as string}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Selected:</span>
                  <img
                    src={`https://flagcdn.com/w20/${selectedFlagCode || 'un'}.png`}
                    alt={`${selectedCountry} flag`}
                    className="w-5 h-4 object-cover rounded shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = `https://flagcdn.com/w20/un.png`
                    }}
                  />
                  <span className="font-bold text-gray-900">{selectedCity}, {selectedCountry}</span>
                </div>
                <button onClick={() => saveLocation(selectedCountry, selectedCity)} className="bg-slate-700 text-white px-5 py-2 rounded-lg font-bold hover:bg-slate-800 text-sm">
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-2xl p-2 hover:bg-gray-100 rounded-lg"
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-sm sm:text-xl">
                  🌱 <span className="hidden sm:inline">RenewableZmart</span>
                </div>
              </Link>
              
              <button onClick={() => setShowLocationModal(true)} className="hidden sm:flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition cursor-pointer">
                <img
                  src={`https://flagcdn.com/w20/${selectedFlagCode || 'un'}.png`}
                  alt={`${selectedCountry} flag`}
                  className="w-5 h-4 object-cover rounded shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = `https://flagcdn.com/w20/un.png`
                  }}
                />
                <div className="text-left">
                  <div className="text-xs text-gray-600">Deliver to</div>
                  <div className="font-bold text-sm">{selectedCity}</div>
                </div>
              </button>
            </div>

            <div className="hidden md:flex flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search for sustainable products..." 
                  className="w-full px-4 py-2 border-2 border-teal-600 rounded-lg focus:outline-none" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 bg-slate-700 text-white px-4 sm:px-6 py-2 rounded-r-lg hover:bg-slate-800"
                >
                  🔍
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {mounted && currentUser ? (
                <div className="relative">
                  <button className="flex items-center gap-2 hover:text-teal-600 peer">
                    <span className="text-2xl">👤</span>
                    <div className="text-left hidden md:block">
                      <div className="text-xs text-gray-600">Welcome</div>
                      <div className="font-bold">{currentUser.firstName} ▼</div>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg hidden peer-focus:block hover:block">
                    <div className="p-3 border-b bg-gray-50">
                      <p className="font-bold text-gray-800">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-xs text-gray-600">{currentUser.email}</p>
                    </div>
                    <Link href="/account" className="block px-4 py-2 hover:bg-gray-100 transition">My Account</Link>
                    <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100 transition">My Orders</Link>
                    <Link href="/report-vendor" className="block px-4 py-2 hover:bg-red-50 transition text-red-600 font-semibold">⚠️ Report</Link>
                    {(currentUser.accountType === 'vendor' || currentUser.role === 'VENDOR' || currentUser.role === 'vendor') && (
                      <Link href="/vendor-dashboard" className="block px-4 py-2 hover:bg-gray-100 transition bg-emerald-50 text-emerald-700 font-semibold">🏪 Vendor Dashboard</Link>
                    )}
                    {(currentUser.accountType === 'installer' || currentUser.role === 'INSTALLER' || currentUser.role === 'installer') && (
                      <Link href="/installer-dashboard" className="block px-4 py-2 hover:bg-gray-100 transition bg-blue-50 text-blue-700 font-semibold">🔧 Installer Dashboard</Link>
                    )}
                    {(currentUser.accountType === 'admin' || currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
                      <Link href="/admin-dashboard" className="block px-4 py-2 hover:bg-gray-100 transition bg-red-50 text-red-700 font-semibold">⚙️ Admin Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition rounded-b-lg">Logout</button>
                  </div>
                </div>
              ) : (
                mounted && (
                  <Link href="/login" className="flex items-center gap-2 hover:text-teal-600">
                    <span className="text-2xl">👤</span>
                    <div className="text-left hidden md:block">
                      <div className="text-xs text-gray-600">Account</div>
                      <div className="font-bold">Login</div>
                    </div>
                  </Link>
                )
              )}

              {/* Help Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowHelpMenu(!showHelpMenu)}
                  className="flex items-center gap-2 hover:text-teal-600"
                >
                  <span className="text-2xl">❓</span>
                  <div className="text-left hidden md:block">
                    <div className="text-xs text-gray-600">Support</div>
                    <div className="font-bold">Help</div>
                  </div>
                </button>

                {showHelpMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl min-w-[200px] z-50">
                    <Link href="/help" className="block px-4 py-2 hover:bg-gray-100 transition font-semibold text-teal-600 border-b">📚 Help Center</Link>
                    <Link href="/about" className="block px-4 py-2 hover:bg-blue-100 transition font-semibold text-blue-700">ℹ️ About Us</Link>
                    <Link href="/track-order" className="block px-4 py-2 hover:bg-emerald-100 transition font-semibold text-emerald-700">📦 Track Order</Link>
                    <Link href="/report-vendor" className="block px-4 py-2 hover:bg-red-100 transition font-semibold text-red-700">⚠️ Report</Link>
                    <Link href="/help#place-order" className="block px-4 py-2 hover:bg-gray-100 transition">Place an order</Link>
                    <Link href="/help#payment" className="block px-4 py-2 hover:bg-gray-100 transition">Payment options</Link>
                    <Link href="/help#track" className="block px-4 py-2 hover:bg-gray-100 transition">Track an order</Link>
                    <Link href="/help#cancel-order" className="block px-4 py-2 hover:bg-gray-100 transition">Cancel an order</Link>
                    <Link href="/help#returns" className="block px-4 py-2 hover:bg-gray-100 transition">Returns & Refunds</Link>
                    <Link href="/help#contact" className="block px-4 py-2 hover:bg-gray-100 transition rounded-b-lg">💬 Live Chat</Link>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <NotificationBell />

              <Link href="/cart" className="relative flex items-center gap-2 hover:text-slate-700">
                <span className="text-2xl">🛒</span>
                <div className="hidden md:block">
                  <div className="text-xs text-gray-600">Cart</div>
                  <div className="font-bold">{mounted ? count : 0} items</div>
                </div>
                {mounted && count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-3 space-y-2">
              <form onSubmit={handleSearch} className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full px-4 py-2 pr-12 border-2 border-teal-600 rounded-lg focus:outline-none" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 bg-slate-700 text-white px-4 py-2 rounded-r-lg hover:bg-slate-800"
                >
                  🔍
                </button>
              </form>
              
              <button onClick={() => setShowLocationModal(true)} className="w-full flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition">
                <img
                  src={`https://flagcdn.com/w20/${selectedFlagCode || 'un'}.png`}
                  alt={`${selectedCountry} flag`}
                  className="w-5 h-4 object-cover rounded shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.onerror = null
                    target.src = `https://flagcdn.com/w20/un.png`
                  }}
                />
                <div className="text-left">
                  <div className="text-xs text-gray-600">Deliver to</div>
                  <div className="font-bold text-sm">{selectedCity}</div>
                </div>
              </button>

              <select 
                onChange={(e) => {
                  const category = e.target.value
                  setShowMobileMenu(false)
                  if (category !== 'all') {
                    router.push(`/category/${category}`)
                  } else if (router.pathname !== '/') {
                    router.push('/')
                  }
                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-sm font-medium"
              >
                <option value="all">All Categories</option>
                <option value="solar">☀️ Solar Panels</option>
                <option value="inverters">⚡ Inverters</option>
                <option value="batteries">🔋 Batteries</option>
                <option value="solarlights">💡 Solar Lights</option>
                <option value="accessories">🔧 Accessories</option>
              </select>

              <Link href="/stores" className="block w-full bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-bold hover:bg-purple-200 text-center" onClick={() => setShowMobileMenu(false)}>
                🏪 Stores
              </Link>
              <Link href="/installers" className="block w-full bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-bold hover:bg-blue-200 text-center" onClick={() => setShowMobileMenu(false)}>
                🔧 Find Installer
              </Link>
              <Link href="/calculator" className="block w-full bg-teal-100 text-teal-700 px-3 py-2 rounded-lg font-bold hover:bg-teal-200 text-center" onClick={() => setShowMobileMenu(false)}>
                📊 Load Calculator
              </Link>
              <Link href="/track-order" className="block w-full bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg font-bold hover:bg-emerald-200 text-center" onClick={() => setShowMobileMenu(false)}>
                📦 Track Order
              </Link>
              <Link href="/deals" className="block w-full text-slate-700 font-bold px-3 py-2 hover:bg-gray-100 rounded-lg text-center" onClick={() => setShowMobileMenu(false)}>
                ⚡ Flash Deals
              </Link>
              
              {/* Dashboard Links for Mobile */}
              {mounted && currentUser && (currentUser.accountType === 'vendor' || currentUser.role === 'VENDOR' || currentUser.role === 'vendor') && (
                <Link href="/vendor-dashboard" className="block w-full bg-orange-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-orange-600 text-center" onClick={() => setShowMobileMenu(false)}>
                  🏪 Vendor Dashboard
                </Link>
              )}
              {mounted && currentUser && (currentUser.accountType === 'installer' || currentUser.role === 'INSTALLER' || currentUser.role === 'installer') && (
                <Link href="/installer-dashboard" className="block w-full bg-blue-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-600 text-center" onClick={() => setShowMobileMenu(false)}>
                  🔧 Installer Dashboard
                </Link>
              )}
              {mounted && currentUser && (currentUser.accountType === 'admin' || currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
                <Link href="/admin-dashboard" className="block w-full bg-red-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-red-600 text-center" onClick={() => setShowMobileMenu(false)}>
                  ⚙️ Admin Dashboard
                </Link>
              )}
              
              <Link href="/register?type=vendor" className="block w-full bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-emerald-700 text-center" onClick={() => setShowMobileMenu(false)}>
                🏪 Sell on RenewableZmart
              </Link>
            </div>
          </div>
        )}

        <div className="hidden md:block bg-gray-50 border-t">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-6 py-2 overflow-x-auto text-sm">
              <select 
                onChange={(e) => {
                  const category = e.target.value
                  if (category !== 'all') {
                    router.push(`/category/${category}`)
                  } else if (router.pathname !== '/') {
                    router.push('/')
                  }
                }}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 bg-white text-sm font-medium"
              >
                <option value="all">All Categories</option>
                <option value="solar">☀️ Solar Panels</option>
                <option value="inverters">⚡ Inverters</option>
                <option value="batteries">🔋 Batteries</option>
                <option value="solarlights">💡 Solar Lights</option>
                <option value="accessories">🔧 Accessories</option>
              </select>
              <Link href="/stores" className="whitespace-nowrap bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold hover:bg-purple-200 flex items-center gap-1">
                🏪 Stores
              </Link>
              {mounted && currentUser && (currentUser.accountType === 'vendor' || currentUser.role === 'VENDOR' || currentUser.role === 'vendor') && (
                <Link href="/vendor-dashboard" className="whitespace-nowrap bg-orange-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-orange-600 flex items-center gap-1 animate-pulse">
                  🏪 Vendor Dashboard
                </Link>
              )}
              {mounted && currentUser && (currentUser.accountType === 'installer' || currentUser.role === 'INSTALLER' || currentUser.role === 'installer') && (
                <Link href="/installer-dashboard" className="whitespace-nowrap bg-blue-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-600 flex items-center gap-1 animate-pulse">
                  🔧 Installer Dashboard
                </Link>
              )}
              {mounted && currentUser && (currentUser.accountType === 'admin' || currentUser.role === 'ADMIN' || currentUser.role === 'admin') && (
                <Link href="/admin-dashboard" className="whitespace-nowrap bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600 flex items-center gap-1 animate-pulse">
                  ⚙️ Admin Dashboard
                </Link>
              )}
              <Link href="/installers" className="whitespace-nowrap bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold hover:bg-blue-200 flex items-center gap-1">
                🔧 Find Installer
              </Link>
              <Link href="/calculator" className="whitespace-nowrap bg-teal-100 text-teal-700 px-3 py-1 rounded-lg font-bold hover:bg-teal-200">📊 Load Calculator</Link>
              <Link href="/track-order" className="whitespace-nowrap bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold hover:bg-emerald-200 flex items-center gap-1">
                📦 Track Order
              </Link>
              <Link href="/deals" className="whitespace-nowrap text-slate-700 font-bold">⚡ Flash Deals</Link>
              <Link href="/register?type=vendor" className="whitespace-nowrap bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-emerald-700">🏪 Sell on RenewableZmart</Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
