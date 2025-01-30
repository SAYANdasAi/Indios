import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN, // Add token for write access
  useCdn: false, // Set to false for write operations
  stega: {
    studioUrl: process.env.NODE_ENV === 'production' ? `https://${process.env.VERCEL_URL}/studio` : `${process.env.NEXT_PUBLIC_BASE_URL}/studio`
  }
})
