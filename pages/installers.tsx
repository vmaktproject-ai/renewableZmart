import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Link from 'next/link'

interface Installer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  certifications: string
  yearsOfExperience: number
  serviceAreas: string
  country?: string
  rating?: number
  completedJobs?: number
  verified?: boolean
  profileImage?: string
}

export default function Installers() {
  const [installers, setInstallers] = useState<Installer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('Nigeria')
  const [sortFilter, setSortFilter] = useState('all')

  useEffect(() => {
    // Get selected country from localStorage
    const savedLocation = typeof window !== 'undefined' ? localStorage.getItem('renewablezmart_location') : null
    if (savedLocation) {
      const { country } = JSON.parse(savedLocation)
      setSelectedCountry(country)
    }

    const fetchInstallers = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/installers')
        if (response.ok) {
          const data = await response.json()
          setInstallers(data)
        }
      } catch (error) {
        console.error('Failed to fetch installers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInstallers()
  }, [])

  const filteredInstallers = installers.filter(installer => {
    const matchesSearch = 
      installer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installer.certifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installer.serviceAreas.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLocation = selectedLocation === 'all' || 
      installer.serviceAreas.toLowerCase().includes(selectedLocation.toLowerCase())
    
    const matchesCountry = installer.country === selectedCountry
    
    return matchesSearch && matchesLocation && matchesCountry
  })

  // Apply sorting filter
  let sortedInstallers = [...filteredInstallers]
  if (sortFilter === 'verified') {
    sortedInstallers = sortedInstallers.filter(i => i.verified)
  } else if (sortFilter === 'experienced') {
    sortedInstallers.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
  }

  // Get unique service areas from country-filtered installers
  const countryInstallers = installers.filter(i => i.country === selectedCountry)
  const serviceAreasSet = new Set<string>()
  countryInstallers.forEach(installer => {
    installer.serviceAreas.split(',').forEach(area => {
      serviceAreasSet.add(area.trim())
    })
  })
  const uniqueServiceAreas = Array.from(serviceAreasSet).sort()

  // Stats based on country-filtered installers
  const countryStats = {
    total: countryInstallers.length,
    verified: countryInstallers.filter(i => i.verified).length,
    totalJobs: countryInstallers.reduce((sum, i) => sum + (i.completedJobs || 0), 0)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>Find Professional Installers - RenewableZmart</title>
        <meta name="description" content="Connect with certified solar installation professionals across Africa" />
      </Head>
      <Header />

      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-3">🔧 Professional Installers in {selectedCountry}</h1>
            <p className="text-xl text-white/90">Certified experts to install your solar energy systems</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, certification, or location..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                {uniqueServiceAreas.map(area => (
                  <option key={area} value={area.toLowerCase()}>{area}</option>
                ))}
              </select>
              <select 
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-white"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
              >
                <option value="all">All Installers</option>
                <option value="verified">Verified Only</option>
                <option value="experienced">Most Experienced</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">{countryStats.total}</div>
              <div className="text-sm text-gray-600">Registered Installers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{countryStats.verified}</div>
              <div className="text-sm text-gray-600">Verified Professionals</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{countryStats.totalJobs}</div>
              <div className="text-sm text-gray-600">Completed Jobs</div>
            </div>
          </div>

          {/* Installers Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading installers...</div>
            </div>
          ) : sortedInstallers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No installers found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? `No installers match "${searchQuery}"` : 'No installers available for the selected criteria.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedLocation('all')
                  setSortFilter('all')
                }}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedInstallers.map((installer) => (
                <div key={installer.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative">
                    {installer.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <span>✓</span> Verified
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                        {installer.profileImage ? (
                          <img src={installer.profileImage} alt={installer.firstName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>👷</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{installer.firstName} {installer.lastName}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-white/70">{installer.completedJobs || 0} jobs completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Experience</div>
                      <div className="text-lg font-bold text-gray-800">{installer.yearsOfExperience} years</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Certifications</div>
                      <div className="text-sm text-gray-700">{installer.certifications}</div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Service Areas</div>
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <span>📍</span>
                        <span>{installer.serviceAreas}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Link 
                        href={`/installer/${installer.id}`}
                        className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition text-center text-sm"
                      >
                        View Profile
                      </Link>
                      <a href={`tel:${installer.phone}`} className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-bold hover:bg-teal-700 transition text-center text-sm">
                        📞 Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Become an Installer CTA */}
          <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-3">Are you a certified installer?</h2>
            <p className="text-xl mb-6 text-white/90">Join our network and connect with customers who need your expertise</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?type=installer" className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition inline-block">
                Register as Installer
              </Link>
              <Link href="/sell" className="bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-800 transition inline-block">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
