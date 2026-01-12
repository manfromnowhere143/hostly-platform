/**
 * CURATED IMAGES MAPPING - Boom ID to Local Images
 *
 * Maps Boom PMS property IDs to their curated local image paths.
 * This ensures search results show the beautiful apartment photos
 * that match the Rently luxury website.
 */

// ─── Apartment Photo Mappings ──────────────────────────────────────────────────

interface ApartmentMapping {
  boomId: number
  name: string
  project: 'seaside' | 'eilat42'
  folder: string
  imageCount: number
}

// Sea Side Apartments
const SEASIDE_MAPPINGS: ApartmentMapping[] = [
  { boomId: 21102, name: 'Mykonos', project: 'seaside', folder: 'mykonos', imageCount: 5 },
  { boomId: 18271, name: 'Poppy', project: 'seaside', folder: 'poppy', imageCount: 5 },
  { boomId: 18270, name: 'Lily', project: 'seaside', folder: 'lily', imageCount: 5 },
  { boomId: 18272, name: 'Camellia', project: 'seaside', folder: '33-camellia', imageCount: 5 },
  { boomId: 18268, name: 'Ivy', project: 'seaside', folder: 'ivy', imageCount: 5 },
  { boomId: 18266, name: 'Zinnia', project: 'seaside', folder: 'zinnia', imageCount: 5 },
  { boomId: 18267, name: 'Daisy', project: 'seaside', folder: 'daisy', imageCount: 5 },
  { boomId: 18265, name: 'Clover', project: 'seaside', folder: '78-clover', imageCount: 5 },
  { boomId: 18264, name: 'Tranquil', project: 'seaside', folder: 'tranquil', imageCount: 5 },
  { boomId: 19635, name: 'Rose', project: 'seaside', folder: 'rose', imageCount: 5 },
  { boomId: 19651, name: 'Rosy', project: 'seaside', folder: 'rosy', imageCount: 5 },
  { boomId: 18261, name: 'Flora', project: 'seaside', folder: 'flora', imageCount: 5 },
  { boomId: 18250, name: 'Zinnia II', project: 'seaside', folder: 'zinnia2', imageCount: 5 },
  { boomId: 18248, name: 'Jasmine', project: 'seaside', folder: 'jasmine', imageCount: 5 },
  { boomId: 18234, name: 'Marigold', project: 'seaside', folder: 'marigold', imageCount: 5 },
  { boomId: 18253, name: 'Laura', project: 'seaside', folder: 'laura', imageCount: 5 },
  { boomId: 18239, name: 'Tulip', project: 'seaside', folder: 'tulip', imageCount: 5 },
  { boomId: 18244, name: 'Lavender', project: 'seaside', folder: 'lavender', imageCount: 5 },
  { boomId: 18249, name: 'Lotus', project: 'seaside', folder: 'lotus', imageCount: 5 },
  { boomId: 22470, name: 'Sunflower', project: 'seaside', folder: 'sunflower', imageCount: 5 },
  { boomId: 18259, name: 'Dahlia', project: 'seaside', folder: 'dahlia', imageCount: 5 },
  { boomId: 18233, name: 'Violet', project: 'seaside', folder: 'violet', imageCount: 5 },
  { boomId: 18238, name: 'Orchid', project: 'seaside', folder: 'orchid', imageCount: 5 },
  { boomId: 18243, name: 'Lagoon', project: 'seaside', folder: 'lagoon', imageCount: 5 },
]

// Eilat 42 Apartments
const EILAT42_MAPPINGS: ApartmentMapping[] = [
  { boomId: 18391, name: 'Mango', project: 'eilat42', folder: '10-mango', imageCount: 5 },
  { boomId: 18992, name: 'Strawberry', project: 'eilat42', folder: '13-strawberry', imageCount: 5 },
  { boomId: 19627, name: 'Peach', project: 'eilat42', folder: '15-peach', imageCount: 5 },
  { boomId: 21112, name: 'Blueberry', project: 'eilat42', folder: '21-blueberry', imageCount: 5 },
]

// Combined mapping lookup
const ALL_MAPPINGS = [...SEASIDE_MAPPINGS, ...EILAT42_MAPPINGS]

// Create lookup maps for fast access
const boomIdToMapping = new Map<number, ApartmentMapping>()
const nameToMapping = new Map<string, ApartmentMapping>()

for (const mapping of ALL_MAPPINGS) {
  boomIdToMapping.set(mapping.boomId, mapping)
  nameToMapping.set(mapping.name.toLowerCase(), mapping)
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Get curated images for a property by Boom ID
 */
export function getImagesByBoomId(boomId: number): string[] {
  const mapping = boomIdToMapping.get(boomId)
  if (!mapping) return []

  return Array.from({ length: mapping.imageCount }, (_, i) =>
    `/apartments/${mapping.project}/${mapping.folder}/${i + 1}.jpg`
  )
}

/**
 * Get curated images by searching the property name
 * Matches names like "Clover - Sea Side #78" or just "Clover"
 */
export function getImagesByName(propertyName: string): string[] {
  // Try to extract the flower/fruit name from property names like "Clover - Sea Side #78"
  const nameParts = propertyName.split(/[-–—]/)[0].trim().toLowerCase()

  const mapping = nameToMapping.get(nameParts)
  if (!mapping) return []

  return Array.from({ length: mapping.imageCount }, (_, i) =>
    `/apartments/${mapping.project}/${mapping.folder}/${i + 1}.jpg`
  )
}

/**
 * Get the apartment mapping for enrichment
 */
export function getApartmentMapping(boomId: number): ApartmentMapping | undefined {
  return boomIdToMapping.get(boomId)
}

/**
 * Check if we have curated data for a Boom ID
 */
export function hasCuratedImages(boomId: number): boolean {
  return boomIdToMapping.has(boomId)
}
