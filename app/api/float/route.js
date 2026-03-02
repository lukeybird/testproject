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
  if (hasBlobToken()) {
    try {
      const result = await get(BLOB_PATH, { access: 'private' })
      if (result?.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text()
        const data = JSON.parse(text || '{}')
        return Response.json({ state: normalizeState(data.state) })
      }
    } catch {
      // Blob not found or error
    }
    return Response.json({ state: null })
  }
  return Response.json({ state: memoryState })
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
    })
  } else {
    memoryState = state
  }
  return Response.json({ success: true })
}
