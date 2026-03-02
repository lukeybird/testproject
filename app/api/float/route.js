import { put, get } from '@vercel/blob'

const BLOB_PATH = 'float-state.json'

// In-memory fallback for local dev when Blob token is not set
let memoryState = null

function hasBlobToken() {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

function normalizeState(value) {
  if (value === true || value === false) return value
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  let state = null
  let storage = 'memory'

  if (hasBlobToken()) {
    storage = 'blob'
    try {
      const result = await get(BLOB_PATH, { access: 'private' })
      if (result?.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text()
        const data = JSON.parse(text || '{}')
        state = normalizeState(data.state)
      }
    } catch {
      // Blob not found or error (e.g. no blob created yet)
    }
  } else {
    state = memoryState
  }

  headers['X-Storage'] = storage
  return Response.json(
    { state, _meta: { storage } },
    { headers }
  )
}

export async function POST(request) {
  const body = await request.json()
  const { state } = body
  if (typeof state !== 'boolean') {
    return Response.json({ success: true })
  }

  if (hasBlobToken()) {
    await put(BLOB_PATH, JSON.stringify({ state }), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } else {
    memoryState = state
  }
  return Response.json({ success: true })
}
