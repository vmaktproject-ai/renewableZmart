import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { slug } = req.query
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' })
    }

    const backendUrl = `http://localhost:4000/api/stores/slug/${slug}`
    
    console.log('Proxying to:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Store fetched with products:', data.products?.length || 0)
    
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch store' })
  }
}
