import '../styles/global.css'
import type { AppProps } from 'next/app'
import { CartProvider } from '../context/CartContext'
import { CurrencyProvider } from '../context/CurrencyContext'
import { NotificationProvider } from '../context/NotificationContext'
import ErrorBoundary from '../components/ErrorBoundary'
import LiveChat from '../components/LiveChat'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <CartProvider>
          <NotificationProvider>
            <Component {...pageProps} />
            <LiveChat />
          </NotificationProvider>
        </CartProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  )
}
