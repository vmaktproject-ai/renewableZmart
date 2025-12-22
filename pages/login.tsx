import { useState, ChangeEvent, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { authService } from '@/lib/services'
import { validateEmail } from '@/lib/emailValidation'

interface FormState {
  email: string
  password: string
  rememberMe: boolean
}

interface Errors {
  [key: string]: string
}

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value } as FormState)
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validateForm = () => {
    const newErrors: Errors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailValidation = validateEmail(formData.email)
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error || 'Invalid email'
      }
    }
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    setLoading(true)
    setMessage(`Connecting to ${provider}...`)
    setTimeout(() => {
      const socialUser = {
        id: Date.now(),
        firstName: provider === 'Google' ? 'Google' : 'Facebook',
        lastName: 'User',
        email: `user@${provider.toLowerCase()}.com`,
        phone: '',
        accountType: 'customer',
        provider: provider,
        createdAt: new Date().toISOString(),
      }

    const users = JSON.parse(localStorage.getItem('renewablezmart_users') || '[]');
      const existingUser = users.find((u: any) => u.email === socialUser.email)
      if (!existingUser) {
        users.push(socialUser)
        localStorage.setItem('renewablezmart_users', JSON.stringify(users))
      }
      localStorage.setItem('renewablezmart_current_user', JSON.stringify(existingUser || socialUser))
      setMessage(`✅ Logged in with ${provider}! Redirecting...`)
      setLoading(false)
      setTimeout(() => router.push('/'), 1500)
    }, 1500)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setMessage('')
    
    try {
      const response = await authService.login(formData.email, formData.password)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('renewablezmart_current_user', JSON.stringify(response.user))
      setMessage('✅ Login successful! Redirecting...')
      
      // Clear form after successful login
      setFormData({ email: '', password: '', rememberMe: false })
      setErrors({})
      
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error: any) {
      setErrors({ email: error.response?.data?.message || 'Invalid credentials. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-8 rounded-t-lg">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-teal-50">Login to your RenewableZmart account</p>
          </div>
          <div className="bg-white shadow-lg rounded-b-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="your.email@example.com" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="current-password" className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your password" />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">Forgot password?</Link>
              </div>
              {message && <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">{message}</div>}
              <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mb-4">{loading ? 'Logging in...' : 'Login'}</button>
              <div className="mt-6 text-center text-sm text-gray-600">Don't have an account? <Link href="/register" className="text-teal-600 font-semibold hover:underline">Register now</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
