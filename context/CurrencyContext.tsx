import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { detectUserCurrency, formatPrice, currencies } from '@/lib/currency'

interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  formatPrice: (priceInNGN: number) => string
  availableCurrencies: string[]
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('NGN')

  useEffect(() => {
    // First, check location from localStorage to determine currency
    const location = localStorage.getItem('renewablezmart_location')
    if (location) {
      try {
        const { country } = JSON.parse(location)
        // Map country to currency code
        const countryToCurrency: { [key: string]: string } = {
          'Nigeria': 'NGN',
          'Kenya': 'KES',
          'Ghana': 'GHS',
          'South Africa': 'ZAR',
          'Egypt': 'EGP',
          'Morocco': 'MAD',
          'Algeria': 'DZD',
          'Tunisia': 'TND',
          'Ethiopia': 'ETB',
          'Tanzania': 'TZS',
          'Uganda': 'UGX',
          'Rwanda': 'RWF'
        }
        const locationCurrency = countryToCurrency[country] || 'NGN'
        setCurrencyState(locationCurrency)
        return
      } catch (e) {
        console.error('Error parsing location:', e)
      }
    }

    // Fallback to saved preference or detection
    const savedCurrency = localStorage.getItem('preferredCurrency')
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(savedCurrency)
    } else {
      const detected = detectUserCurrency()
      setCurrencyState(detected)
    }
  }, [])

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferredCurrency', newCurrency)
  }

  const formatPriceInCurrency = (priceInNGN: number): string => {
    return formatPrice(priceInNGN, currency)
  }

  const availableCurrencies = Object.keys(currencies)

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        formatPrice: formatPriceInCurrency,
        availableCurrencies
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
