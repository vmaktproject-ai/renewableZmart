import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { authService } from '@/lib/services'
import { africanCountries } from '../data/locations'
import { validatePhoneNumber, formatPhoneNumber, getPhoneInfo } from '@/lib/phoneValidation'
import { validateEmail, suggestEmailCorrection } from '@/lib/emailValidation'
import { validateCompanyRegistration, getRegNumberInfo } from '@/lib/companyValidation'

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  accountType: 'customer' | 'vendor' | 'installer'
  country: string
  city: string
  businessName: string
  businessRegNumber: string
  certifications: string
  yearsOfExperience: string
  serviceAreas: string
  acceptTerms: boolean
  interestedInPaySmallSmall: boolean
}

interface Errors { [key: string]: string }

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'customer',
    country: 'Nigeria',
    city: '',
    businessName: '',
    businessRegNumber: '',
    certifications: '',
    yearsOfExperience: '',
    serviceAreas: '',
    acceptTerms: false,
    interestedInPaySmallSmall: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])

  useEffect(() => {
    // Always start with a fresh empty form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      accountType: 'customer',
      country: 'Nigeria',
      city: '',
      businessName: '',
      businessRegNumber: '',
      certifications: '',
      yearsOfExperience: '',
      serviceAreas: '',
      acceptTerms: false,
      interestedInPaySmallSmall: false,
    })
    setErrors({})
    setMessage('')
    
    // Set cities for default country
    const defaultCountry = africanCountries.find(c => c.name === 'Nigeria')
    if (defaultCountry) {
      setAvailableCities(defaultCountry.states || defaultCountry.cities || [])
    }
  }, [])

  useEffect(() => {
    if (router.query.type === 'vendor') {
      setFormData((prev) => ({ ...prev, accountType: 'vendor' }))
    } else if (router.query.type === 'installer') {
      setFormData((prev) => ({ ...prev, accountType: 'installer' }))
    }
  }, [router.query])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    
    // Handle country change - update available cities
    if (name === 'country') {
      const selectedCountry = africanCountries.find(c => c.name === value)
      setAvailableCities(selectedCountry?.states || selectedCountry?.cities || [])
      setFormData({ ...formData, country: value, city: '' } as FormState)
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value } as FormState)
    }
    
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validateForm = () => {
    const newErrors: Errors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Invalid email'
        if (emailValidation.suggestion) {
          newErrors.email += ` Did you mean: ${emailValidation.suggestion}?`
        }
      }
    }
    
    // Validate phone number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      const phoneValidation = validatePhoneNumber(formData.phone, formData.country)
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error || 'Invalid phone number'
      }
    }
    
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'

    if (formData.accountType === 'vendor') {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required for vendors'
      if (!formData.businessRegNumber.trim()) {
        newErrors.businessRegNumber = 'Business registration number is required'
      } else {
        const regValidation = validateCompanyRegistration(formData.businessRegNumber, formData.country)
        if (!regValidation.isValid) {
          newErrors.businessRegNumber = regValidation.error || 'Invalid registration number'
          if (regValidation.suggestion) {
            newErrors.businessRegNumber += ` (${regValidation.suggestion})`
          }
        }
      }
    }

    if (formData.accountType === 'installer') {
      if (!formData.certifications.trim()) newErrors.certifications = 'Certifications are required for installers'
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required'
      if (!formData.serviceAreas.trim()) newErrors.serviceAreas = 'Service areas are required'
    }

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setMessage('')
    
    try {
      const registrationData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        accountType: formData.accountType,
      }

      // Add vendor-specific fields
      if (formData.accountType === 'vendor') {
        registrationData.businessName = formData.businessName
        registrationData.businessRegNumber = formData.businessRegNumber
        registrationData.interestedInPaySmallSmall = formData.interestedInPaySmallSmall
      }

      // Add installer-specific fields
      if (formData.accountType === 'installer') {
        registrationData.certifications = formData.certifications
        registrationData.yearsOfExperience = parseInt(formData.yearsOfExperience)
        registrationData.serviceAreas = formData.serviceAreas
      }

      console.log('Sending registration data:', registrationData)
      const response = await authService.register(registrationData)
      console.log('Registration response:', response)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('renewablezmart_current_user', JSON.stringify(response.user))
      
      // Clear form immediately after successful registration
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        accountType: 'customer',
        country: 'Nigeria',
        city: '',
        businessName: '',
        businessRegNumber: '',
        certifications: '',
        yearsOfExperience: '',
        serviceAreas: '',
        acceptTerms: false,
        interestedInPaySmallSmall: false,
      })
      setErrors({})
      
      // Auto-populate location from registration
      localStorage.setItem('renewablezmart_location', JSON.stringify({
        country: formData.country,
        city: formData.city,
      }))
      
      // Clear cart for new user
      localStorage.removeItem('renewablezmart_cart')
      
      setMessage('✅ Registration successful! Auto-logging in...')
      
      // Route to appropriate profile update page based on account type
      let redirectPath = '/'
      if (formData.accountType === 'vendor') {
        redirectPath = '/vendor-profile-update'
      } else if (formData.accountType === 'installer') {
        redirectPath = '/installer-profile-update'
      }
      
      // Force full page reload to refresh cart context
      setTimeout(() => {
        window.location.href = redirectPath
      }, 1500)
    } catch (error: any) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      
      // Show specific error for duplicate email
      if (error.response?.status === 409 || errorMessage.toLowerCase().includes('already registered')) {
        setErrors({ 
          email: errorMessage
        })
        setMessage('❌ ' + errorMessage)
      } else {
        setErrors({ email: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-8 rounded-t-lg">
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-teal-50">Join RenewableZmart and start shopping for sustainable energy solutions</p>
          </div>
          <div className="bg-white shadow-lg rounded-b-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">I am a <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-4">
                  <button type="button" onClick={() => setFormData({ ...formData, accountType: 'customer' })} className={`p-4 border-2 rounded-lg text-center transition ${formData.accountType === 'customer' ? 'border-teal-600 bg-teal-50' : 'border-gray-300 hover:border-teal-300'}`}>
                    <div className="text-3xl mb-2">🛒</div>
                    <div className="font-bold">Customer</div>
                    <div className="text-xs text-gray-600">Buy products</div>
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, accountType: 'vendor' })} className={`p-4 border-2 rounded-lg text-center transition ${formData.accountType === 'vendor' ? 'border-teal-600 bg-teal-50' : 'border-gray-300 hover:border-teal-300'}`}>
                    <div className="text-3xl mb-2">🏪</div>
                    <div className="font-bold">Vendor</div>
                    <div className="text-xs text-gray-600">Sell products</div>
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, accountType: 'installer' })} className={`p-4 border-2 rounded-lg text-center transition ${formData.accountType === 'installer' ? 'border-teal-600 bg-teal-50' : 'border-gray-300 hover:border-teal-300'}`}>
                    <div className="text-3xl mb-2">🔧</div>
                    <div className="font-bold">Installer</div>
                    <div className="text-xs text-gray-600">Install systems</div>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="off" className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} placeholder="John" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="off" className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Doe" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="off" className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="john@gmail.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                <p className="text-xs text-gray-600 mt-1">⚠️ Use a valid email - disposable/temporary emails are not allowed</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  autoComplete="off"
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder={formData.country ? (getPhoneInfo(formData.country)?.format || '+XXX XXX XXX XXXX') : '+234 XXX XXX XXXX'} 
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                {formData.country && getPhoneInfo(formData.country) && (
                  <p className="text-xs text-gray-600 mt-1">Format: {getPhoneInfo(formData.country)?.format}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country <span className="text-red-500">*</span></label>
                  <select name="country" value={formData.country} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select Country</option>
                    {africanCountries.map((country) => (
                      <option key={country.name} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City/State <span className="text-red-500">*</span></label>
                  <select name="city" value={formData.city} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`} disabled={!formData.country}>
                    <option value="">Select City/State</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>

              {formData.accountType === 'vendor' && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">🏢 Business Information (Required for Vendors)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name <span className="text-red-500">*</span></label>
                      <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Your Company Ltd" />
                      {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Registration Number <span className="text-red-500">*</span></label>
                      <input type="text" name="businessRegNumber" value={formData.businessRegNumber} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.businessRegNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="RC-123456 or BN-123456" />
                      {errors.businessRegNumber && <p className="text-red-500 text-xs mt-1">{errors.businessRegNumber}</p>}
                      <p className="text-xs text-gray-600 mt-1">Format: RC-XXXXXX or BN-XXXXXX (CAC Number)</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                      <input type="checkbox" name="interestedInPaySmallSmall" checked={formData.interestedInPaySmallSmall} onChange={handleChange} className="w-5 h-5 cursor-pointer" />
                      <div>
                        <span className="text-sm font-semibold text-gray-900">I am interested in "Pay Small Small" installment deals 💰</span>
                        <p className="text-xs text-gray-600 mt-1">Allow customers to buy your products on flexible payment plans</p>
                      </div>
                    </label>
                  </div>
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-800">ℹ️ Your business registration will be verified before you can upload products. Ensure the number matches your CAC registration.</p>
                  </div>
                </div>
              )}

              {formData.accountType === 'installer' && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">🔧 Professional Information (Required for Installers)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications <span className="text-red-500">*</span></label>
                      <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.certifications ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., NABCEP, IRENA Certified" />
                      {errors.certifications && <p className="text-red-500 text-xs mt-1">{errors.certifications}</p>}
                      <p className="text-xs text-gray-600 mt-1">List your professional certifications</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience <span className="text-red-500">*</span></label>
                      <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`} placeholder="5" min="0" />
                      {errors.yearsOfExperience && <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</p>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Areas <span className="text-red-500">*</span></label>
                    <input type="text" name="serviceAreas" value={formData.serviceAreas} onChange={handleChange} className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.serviceAreas ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., Lagos, Abuja, Port Harcourt" />
                    {errors.serviceAreas && <p className="text-red-500 text-xs mt-1">{errors.serviceAreas}</p>}
                    <p className="text-xs text-gray-600 mt-1">List cities/states where you provide services</p>
                  </div>
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-800">ℹ️ Your credentials will be verified. Customers can book your services for solar system installations.</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Min. 8 characters" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="Re-enter password" />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-2">
                  <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} className="mt-1" />
                  <span className="text-sm text-gray-700">
                    I agree to the <Link href="/terms" className="text-teal-600 hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
              </div>

              {message && <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">{message}</div>}

              <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account? <Link href="/login" className="text-teal-600 font-semibold hover:underline">Login here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
