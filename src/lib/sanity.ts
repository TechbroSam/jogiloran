// src/lib/sanity.ts

import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2025-08-14'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // set to `false` for un-cached, fresh data
})

// Helper function for generating image URLs with only the asset reference data in your documents.
// Read more: https://www.sanity.io/docs/image-url
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}