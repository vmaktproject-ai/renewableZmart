import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import PasswordInput from '../components/PasswordInput'
import { useRouter } from 'next/router'
import { getApiBaseUrl } from '@/lib/apiConfig'

interface AdminInfo {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  adminLevel: string
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  adminLevel?: string
}

export default function AdminProfile() {
  const router = useRouter()
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [allAdmins, setAllAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('renewablezmart_current_user')
    const token = localStorage.getItem('accessToken')
    
    if (!user || !token) {
      router.push('/login')
      return
    }
    
    const userData = JSON.parse(user)
    
    // Check if user is admin
    if (userData.role !== 'admin' && userData.accountType !== 'admin') {
      router.push('/')
      return
    }
    
    fetchAdminInfo(token)
  }, [])

  const fetchAdminInfo = async (token: string) => {
    try {
      const apiBase = getApiBaseUrl()
      
      // Get current admin info
      const adminRes = await fetch(`${apiBase}/admin/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (adminRes.ok) {
        const adminData = await adminRes.json()
        setAdminInfo(adminData)

        // If SA00, fetch all users for password change
        if (adminData.adminLevel === 'SA00') {
          const usersRes = await fetch(`${apiBase}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })

          if (usersRes.ok) {
            const usersData = await usersRes.json()
            setAllAdmins(usersData.filter((u: User) => u.role === 'admin'))
          }
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching admin info:', error)
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!selectedUserId) {
      setError('Please select a user')
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      const apiBase = getApiBaseUrl()
      const response = await fetch(`${apiBase}/admin/change-password/${selectedUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      })

      if (response.ok) {
        setMessage('Password changed successfully!')
        // Clear form fields
        setNewPassword('')
        setConfirmPassword('')
        setSelectedUserId('')
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError('Error changing password')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const getAdminLevelBadge = (level: string) => {
    switch (level) {
      case 'SA00':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">🔴 SA00 - Super Admin</span>
      case 'SA10':
        return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">🟠 SA10 - Assistant Admin</span>
      case 'SA20':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">🟡 SA20 - Normal Admin</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Admin</span>
    }
  }

  const getPermissions = (level: string) => {
    switch (level) {
      case 'SA00':
        return [
          '✅ Change admin passwords',
          '✅ Approve financial transactions',
          '✅ Approve PaySmallSmall requests',
          '✅ Approve product displays',
          '✅ All admin permissions'
        ]
      case 'SA10':
      case 'SA20':
        return [
          '✅ Approve product displays for vendor stores',
          '✅ View platform statistics',
          '❌ Cannot change passwords',
          '❌ Cannot approve financial transactions'
        ]
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Profile - RenewableZmart</title>
      </Head>

      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
            <p className="text-gray-600">Manage your admin account and permissions</p>
          </div>

          {/* Admin Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-semibold">{adminInfo?.firstName} {adminInfo?.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-semibold">{adminInfo?.email}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Admin Level</label>
                <div className="mt-1">
                  {adminInfo && getAdminLevelBadge(adminInfo.adminLevel)}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>
            <ul className="space-y-2">
              {adminInfo && getPermissions(adminInfo.adminLevel).map((permission, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-lg">{permission.startsWith('✅') ? '✅' : '❌'}</span>
                  <span className={permission.startsWith('✅') ? 'text-green-700' : 'text-gray-500'}>
                    {permission.substring(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Password Change (SA00 Only) */}
          {adminInfo?.adminLevel === 'SA00' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🔒 Change User Password (SA00 Only)</h2>
              <p className="text-sm text-gray-600 mb-4">
                As Super Admin, you have the authority to change passwords for any user in the system.
              </p>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                    required
                  >
                    <option value="">-- Select a user --</option>
                    {allAdmins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.firstName} {admin.lastName} ({admin.email}) - {admin.adminLevel || admin.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <PasswordInput
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                {message && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Change Password
                </button>
              </form>
            </div>
          )}

          {/* Non-SA00 Message */}
          {adminInfo?.adminLevel !== 'SA00' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Limited Access</h3>
              <p className="text-yellow-700">
                Only Super Admin (SA00) can change passwords and approve financial transactions.
                Your role allows you to approve product displays for vendor stores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
