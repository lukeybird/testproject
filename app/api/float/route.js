import { put, get } from '@vercel/blob'

const BLOB_PATH = 'float-state.json'
const LOG_MAX = 20

// In-memory fallback for local dev when Blob token is not set
let memoryState = null
let memoryLog = []

function hasBlobToken() {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

function normalizeState(value) {
  if (value === true || value === false) return value
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

function ensureLog(log) {
  if (!Array.isArray(log)) return []
  return log
    .filter((e) => e && typeof e.value === 'boolean' && e.at)
    .slice(0, LOG_MAX)
}

async function readBlobData() {
  try {
    const result = await get(BLOB_PATH, { access: 'private' })
    if (result?.statusCode === 200 && result.stream) {
      const text = await new Response(result.stream).text()
      return JSON.parse(text || '{}')
    }
  } catch {
    // Blob not found or error
  }
  return {}
}

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  let state = null
  let log = []
  let storage = 'memory'

  if (hasBlobToken()) {
    storage = 'blob'
    const data = await readBlobData()
    state = normalizeState(data.state)
    log = ensureLog(data.log || [])
  } else {
    state = memoryState
    log = memoryLog.slice(0, LOG_MAX)
  }

  headers['X-Storage'] = storage
  return Response.json(
    { state, log, _meta: { storage } },
    { headers }
  )
}

export async function POST(request) {
  const body = await request.json()
  const { state } = body
  if (typeof state !== 'boolean') {
    return Response.json({ success: true })
  }

  const entry = { value: state, at: new Date().toISOString() }

  if (hasBlobToken()) {
    const data = await readBlobData()
    const log = ensureLog(data.log || [])
    log.unshift(entry)
    const newLog = log.slice(0, LOG_MAX)
    await put(
      BLOB_PATH,
      JSON.stringify({ state, log: newLog }),
      {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    )
  } else {
    memoryState = state
    memoryLog.unshift(entry)
    memoryLog = memoryLog.slice(0, LOG_MAX)
  }
  return Response.json({ success: true })
}
