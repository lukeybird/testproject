// In-memory state (no database)
let currentState = null

export async function GET() {
  return Response.json({ state: currentState })
}

export async function POST(request) {
  const body = await request.json()
  const { state } = body
  if (typeof state === 'boolean') {
    currentState = state
  }
  return Response.json({ success: true })
}
