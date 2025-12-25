import '../styles/global.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '../context/CartContext'
import { CurrencyProvider } from '../context/CurrencyContext'
import { NotificationProvider } from '../context/NotificationContext'
import ErrorBoundary from '../components/ErrorBoundary'
import LiveChat from '../components/LiveChat'
import { useEffect } from 'react'

function InitializeApp() {
  useEffect(() => {
    // Initialize location to Nigeria/Lagos if not set
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('renewablezmart_location')
      if (!savedLocation) {
        localStorage.setItem('renewablezmart_location', JSON.stringify({ country: 'Nigeria', city: 'Lagos' }))
        // Dispatch custom event to notify components of location initialization
        window.dispatchEvent(new Event('locationChanged'))
      }
    }
  }, [])

  return null
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <CartProvider>
          <NotificationProvider>
            <InitializeApp />
            <Component {...pageProps} />
            <LiveChat />
          </NotificationProvider>
        </CartProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  )
}
