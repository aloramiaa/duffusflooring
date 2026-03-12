/* global process, Buffer */
import { head, put } from '@vercel/blob'

const PREFIX = 'duffus-flooring'
const ADMIN_KEY = process.env.ADMIN_KEY || 'emberveil'

const seedData = {
  reviews: [],
  messages: [],
  projects: [
    {
      id: 'rooftop-deck',
      title: 'Roof Top Deck',
      location: '',
      type: 'Deck',
      description: 'Professional rooftop deck installation with premium materials. Featured multiple images and video documentation.',
      image: '/roof top deck/619519319_18091281887069722_1372485204443114063_n.jpg',
      albumName: 'roof top deck',
      imageCount: 7,
      createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
      id: 'bedroom-hardwood',
      title: 'Bedroom Hardwood Installation',
      location: '',
      type: 'Hardwood',
      description: 'Complete bedroom hardwood flooring installation with professional finish.',
      image: '/bedroom hardwood/621140552_17924151783069573_2879626915241593870_n.webp',
      albumName: 'bedroom hardwood',
      imageCount: 5,
      createdAt: '2026-01-20T10:00:00.000Z'
    },
    {
      id: 'deck-projects',
      title: 'Custom Deck Projects',
      location: '',
      type: 'Deck',
      description: 'Multiple custom deck installations featuring quality craftsmanship and attention to detail.',
      image: '/decks/2b33f250-ab54-4a82-97bd-772b583cd3a8.jpg',
      albumName: 'decks',
      imageCount: 9,
      createdAt: '2026-01-25T10:00:00.000Z'
    },
    {
      id: 'hardwood-stairs',
      title: 'Hardwood Stairs Installation',
      location: '',
      type: 'Hardwood',
      description: 'Professional hardwood stair installation and refinishing services.',
      image: '/hardwood stairs/1433394e-6392-441d-817b-ff380bfe4fc2.jpg',
      albumName: 'hardwood stairs',
      imageCount: 7,
      createdAt: '2026-02-01T10:00:00.000Z'
    },
    {
      id: 'vinyl-flooring',
      title: 'Vinyl Flooring Projects',
      location: '',
      type: 'Vinyl',
      description: 'High-quality vinyl flooring installations for residential properties.',
      image: '/Vinyl/4080e37c-9b1e-4778-8d74-ddfe6adb41e8.jpg',
      albumName: 'Vinyl',
      imageCount: 7,
      createdAt: '2026-02-10T10:00:00.000Z'
    }
  ],
  services: [
    {
      id: 'hardwood',
      name: 'Hardwood Installation & Refinishing',
      description: 'Premium hardwood flooring installed and refinished with precision to enhance durability and natural beauty. Includes solid and engineered hardwood installation, sanding and refinishing, custom stain and finish options, board replacement and repairs.',
      image: null,
      createdAt: '2026-01-01T10:00:00.000Z'
    },
    {
      id: 'vinyl',
      name: 'Luxury Vinyl Tile (LVT) & Luxury Vinyl Plank (LVP)',
      description: 'Durable, water-resistant flooring solutions that replicate natural wood while offering easy maintenance. Includes professional LVT & LVP installation, residential and commercial applications, modern low-maintenance finishes, repair and replacement services.',
      image: null,
      createdAt: '2026-01-02T10:00:00.000Z'
    },
    {
      id: 'tile',
      name: 'Tile Installation',
      description: 'Coordinated tile installations completed by trusted trade professionals to meet high workmanship standards. Includes floor tile installation, bathroom tile flooring, entryways and high-traffic areas.',
      image: null,
      createdAt: '2026-01-03T10:00:00.000Z'
    },
    {
      id: 'commercial',
      name: 'Commercial Flooring Solutions',
      description: 'Reliable flooring systems designed to withstand heavy use while maintaining a clean, professional appearance. Includes office and retail installations, rental property flooring, multi-unit developments, durable high-traffic materials.',
      image: null,
      createdAt: '2026-01-04T10:00:00.000Z'
    },
    {
      id: 'repairs',
      name: 'Subfloor Preparation, Leveling & Repairs',
      description: 'A strong foundation ensures long-term performance — we prepare and inspect every surface before installation. Includes subfloor inspection and preparation, surface leveling, structural repairs, maintenance solutions.',
      image: null,
      createdAt: '2026-01-05T10:00:00.000Z'
    }
  ]
}

function pathFor(name) {
  return `${PREFIX}/${name}.json`
}

async function readBlobJson(path) {
  const meta = await head(path, { token: process.env.BLOB_READ_WRITE_TOKEN })
  const response = await fetch(meta.downloadUrl, { cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to read blob JSON')
  return response.json()
}

async function writeBlobJson(path, data) {
  await put(path, JSON.stringify(data, null, 2), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token: process.env.BLOB_READ_WRITE_TOKEN
  })
}

export async function getCollection(name) {
  const path = pathFor(name)
  try {
    const data = await readBlobJson(path)
    return Array.isArray(data) ? data : []
  } catch {
    const initial = seedData[name] || []
    // Do not let a failed seed-write crash the caller (e.g. BLOB_READ_WRITE_TOKEN not yet set).
    try { await writeBlobJson(path, initial) } catch { /* no-op */ }
    return initial
  }
}

export async function setCollection(name, data) {
  const path = pathFor(name)
  const safe = Array.isArray(data) ? data : []
  await writeBlobJson(path, safe)
  return safe
}

export function isAdmin(req) {
  return Boolean(req.query?.key) && req.query.key === ADMIN_KEY
}

export function requireAdmin(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({ error: 'Forbidden' })
    return false
  }
  return true
}

/**
 * Wraps a Vercel API handler so any unhandled exception returns a JSON 500
 * instead of crashing with FUNCTION_INVOCATION_FAILED.
 */
export function createHandler(fn) {
  return async function handler(req, res) {
    try {
      await fn(req, res)
    } catch (err) {
      console.error('[API error]', req.method, req.url, err?.message ?? err)
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'Internal server error' })
      }
    }
  }
}

export async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}
