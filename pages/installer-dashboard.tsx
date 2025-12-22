import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Head from 'next/head'

interface InstallerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  businessName: string
  certifications: string
  yearsOfExperience: string
  serviceAreas: string
  country: string
  city: string
  profilePhoto?: string
  bio?: string
  specialties?: string[]
  rating?: number
  completedProjects?: number
  verified?: boolean
}

interface Project {
  id: number
  title: string
  description: string
  category: string
  location: string
  completedDate: string
  images: string[]
}

export default function InstallerDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'projects' | 'reviews'>('overview')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<InstallerProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [showAddProject, setShowAddProject] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('')

  const [profileForm, setProfileForm] = useState({
    businessName: '',
    certifications: '',
    yearsOfExperience: '',
    serviceAreas: '',
    bio: '',
    specialties: [] as string[],
    phone: '',
    country: 'Nigeria',
    city: ''
  })
  const [availableProfileCities, setAvailableProfileCities] = useState<string[]>([])

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    category: 'solar',
    location: '',
    completedDate: '',
    images: [] as File[]
  })

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    if (user) {
      const parsedUser = JSON.parse(user)
      setCurrentUser(parsedUser)
      
      // Check if user is installer
      if (parsedUser.role !== 'installer' && parsedUser.accountType !== 'installer') {
        router.push('/')
        return
      }
      
      fetchProfile()
      fetchProjects()
    } else {
      router.push('/login')
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:4000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        const country = data.country || 'Nigeria'
        setProfileForm({
          businessName: data.businessName || '',
          certifications: data.certifications || '',
          yearsOfExperience: data.yearsOfExperience || '',
          serviceAreas: data.serviceAreas || '',
          bio: data.bio || '',
          specialties: data.specialties || [],
          phone: data.phone || '',
          country: country,
          city: data.city || ''
        })
        setProfilePhotoPreview(data.profilePhoto || '')
        // Set available cities for the installer's country
        const selectedCountry = africanCountries.find(c => c.name === country)
        setAvailableProfileCities(selectedCountry?.states || selectedCountry?.cities || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:4000/api/installer/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB')
        return
      }
      
      setProfilePhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile) return

    setUploadingPhoto(true)
    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('profilePhoto', profilePhotoFile)

      const response = await fetch('http://localhost:4000/api/users/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        alert('Profile photo updated successfully!')
        setProfile(prev => prev ? { ...prev, profilePhoto: data.profilePhoto } : null)
        setProfilePhotoFile(null)
      } else {
        const error = await response.json()
        alert(`Failed to upload photo: ${error.message}`)
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleProfileUpdate = async () => {
    // Validate phone number
    if (profileForm.phone) {
      const phoneValidation = validatePhoneNumber(profileForm.phone, profileForm.country)
      if (!phoneValidation.isValid) {
        alert(phoneValidation.error || 'Invalid phone number')
        return
      }
    }

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('http://localhost:4000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        fetchProfile()
      } else {
        const error = await response.json()
        alert(`Failed to update profile: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddProject = async () => {
    if (!projectForm.title || !projectForm.description) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('title', projectForm.title)
      formData.append('description', projectForm.description)
      formData.append('category', projectForm.category)
      formData.append('location', projectForm.location)
      formData.append('completedDate', projectForm.completedDate)

      projectForm.images.forEach((file) => {
        formData.append('images', file)
      })

      const response = await fetch('http://localhost:4000/api/installer/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        alert('Project added successfully!')
        // Clear the form
        setProjectForm({
          title: '',
          description: '',
          category: 'solar',
          location: '',
          completedDate: '',
          images: []
        })
        setShowAddProject(false)
        fetchProjects()
      } else {
        const error = await response.json()
        alert(`Failed to add project: ${error.message}`)
      }
    } catch (error) {
      console.error('Error adding project:', error)
      alert(`Failed to add project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleProjectImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (projectForm.images.length + files.length > 10) {
      alert('Maximum 10 files allowed (images and videos combined)')
      return
    }
    setProjectForm(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeProjectImage = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Installer Dashboard - RenewableZmart</title>
      </Head>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.firstName?.[0]}{currentUser.lastName?.[0]}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.businessName || `${currentUser.firstName} ${currentUser.lastName}`}</h1>
              <p className="text-gray-600">{profile?.bio || 'Professional Renewable Energy Installer'}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">📍 {profile?.city}, {profile?.country}</span>
                <span className="text-sm text-gray-500">⭐ {profile?.rating?.toFixed(1) || '5.0'} Rating</span>
                <span className="text-sm text-gray-500">✅ {profile?.completedProjects || 0} Projects</span>
                {profile?.verified && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>}
              </div>
              {profilePhotoFile && (
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Save Photo'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold ${activeTab === 'overview' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-semibold ${activeTab === 'profile' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-4 font-semibold ${activeTab === 'projects' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              🔧 Projects
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ⭐ Reviews
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
              <div className="text-gray-600">Total Projects</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gray-900">{profile?.rating?.toFixed(1) || '5.0'}</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-2">📞</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-gray-600">Inquiries This Month</div>
            </div>

            <div className="col-span-1 md:col-span-3 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('projects')}
                  className="p-4 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 text-left"
                >
                  <div className="text-2xl mb-2">➕</div>
                  <div className="font-semibold">Add New Project</div>
                  <div className="text-sm text-gray-600">Showcase your completed work</div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 text-left"
                >
                  <div className="text-2xl mb-2">✏️</div>
                  <div className="font-semibold">Update Profile</div>
                  <div className="text-sm text-gray-600">Keep your information current</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Manage Your Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={profileForm.businessName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Tell customers about your experience and expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder={profileForm.country ? (getPhoneInfo(profileForm.country)?.format || '+XXX XXX XXX') : '+XXX XXX XXX'}
                />
                {profileForm.country && getPhoneInfo(profileForm.country) && (
                  <p className="text-xs text-gray-600 mt-1">Format: {getPhoneInfo(profileForm.country)?.format}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                <textarea
                  value={profileForm.certifications}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, certifications: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="List your professional certifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="text"
                  value={profileForm.yearsOfExperience}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                <input
                  type="text"
                  value={profileForm.serviceAreas}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, serviceAreas: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Lagos, Abuja, Port Harcourt"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                  <select
                    value={profileForm.country}
                    onChange={(e) => {
                      const selectedCountry = africanCountries.find(c => c.name === e.target.value)
                      setAvailableProfileCities(selectedCountry?.states || selectedCountry?.cities || [])
                      setProfileForm(prev => ({ ...prev, country: e.target.value, city: '' }))
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
                    value={profileForm.city}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    disabled={!profileForm.country}
                  >
                    <option value="">Select City/State</option>
                    {availableProfileCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">My Projects</h2>
                <button
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  {showAddProject ? '✕ Cancel' : '➕ Add Project'}
                </button>
              </div>

              {showAddProject && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., 5kW Solar Installation for Residential Home"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Describe the project scope, challenges, and solutions..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={projectForm.category}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="solar">Solar</option>
                        <option value="wind">Wind</option>
                        <option value="inverters">Inverters</option>
                        <option value="batteries">Batteries</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={projectForm.location}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="City, State"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
                      <input
                        type="date"
                        value={projectForm.completedDate}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, completedDate: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Images & Videos (Max 10)</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleProjectImageSelect}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload up to 10 images and videos (JPG, PNG, MP4, WebM)</p>
                    {projectForm.images.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {projectForm.images.map((file, index) => (
                          <div key={index} className="relative">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-2xl">🎥</span>
                              </div>
                            )}
                            <button
                              onClick={() => removeProjectImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddProject}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold"
                  >
                    Add Project
                  </button>
                </div>
              )}
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow-md">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                  <p className="text-gray-600 mb-4">Showcase your work by adding your first project</p>
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Add Project
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200">
                      {project.images?.[0] && (
                        <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">{project.category}</span>
                        <span className="text-xs text-gray-500">{project.completedDate}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      <p className="text-sm text-gray-500">📍 {project.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Complete projects to receive customer reviews</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
