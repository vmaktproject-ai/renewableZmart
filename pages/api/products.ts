import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    if (req.query.country) queryParams.append('country', req.query.country as string)
    if (req.query.category) queryParams.append('category', req.query.category as string)
    if (req.query.search) queryParams.append('search', req.query.search as string)
    if (req.query.storeId) queryParams.append('storeId', req.query.storeId as string)

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}products${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    
    console.log('Proxying products to:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Backend products response:', data.length || 0, 'products')
    
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}
