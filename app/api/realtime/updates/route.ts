// Server-Sent Events (SSE) endpoint for real-time updates
export const runtime = 'nodejs' // SSE requires Node.js runtime

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: Request) {
  // TODO: Add authentication check with NextAuth
  // const session = await getServerSession()
  // if (!session) {
  //   return new Response('Unauthorized', { status: 401 })
  // }

  // Generate a unique connection ID
  const connectionId = Math.random().toString(36).substring(7)

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(connectionId, controller)

      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        timestamp: Date.now(),
        message: 'Successfully connected to real-time updates'
      })
      controller.enqueue(`data: ${data}\n\n`)

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
          connections.delete(connectionId)
        }
      }, 30000)

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        connections.delete(connectionId)
        try {
          controller.close()
        } catch (error) {
          // Connection already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Broadcast update to all connected clients
export function broadcastUpdate(event: string, data: any) {
  const message = JSON.stringify({
    type: event,
    data,
    timestamp: Date.now()
  })

  connections.forEach((controller) => {
    try {
      controller.enqueue(`data: ${message}\n\n`)
    } catch (error) {
      // Connection closed, will be cleaned up by the abort handler
    }
  })
}

// Export for use in other API routes
export { connections }
