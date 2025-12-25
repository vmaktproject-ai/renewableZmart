/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * Vercel Deployment - Testing v1
 */

export const getApiBaseUrl = () => {
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Production fallback
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://renewablezmart-backend.onrender.com/api'
  }
  
  // For client-side local development
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`
  }
  
  // Default fallback
  return 'http://localhost:4000/api'
}

export const getBackendBaseUrl = () => {
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  }
  
  // Production fallback
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://renewablezmart-backend.onrender.com'
  }
  
  // For client-side local development
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000`
  }
  
  // Default fallback
  return 'http://localhost:4000'
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    GET_ALL_VENDOR: '/products/all-vendor'
  },
  STORES: {
    GET_ALL: '/stores',
    GET_BY_ID: (id: string) => `/stores/${id}`
  },
  ORDERS: {
    CREATE: '/orders',
    GET_MY_ORDERS: '/orders/my-orders',
    GET_BY_ID: (id: string) => `/orders/${id}`,
    GET_TRACKING: (id: string) => `/orders/${id}/tracking`
  },
  ADMIN: {
    STATS: '/admin/stats/public',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    PRODUCTS: '/admin/products',
    STORES: '/admin/stores',
    PENDING_PRODUCTS: '/admin/products/pending'
  },
  UPLOADS: {
    GET_FILE: (path: string) => `/uploads${path}`
  }
}
