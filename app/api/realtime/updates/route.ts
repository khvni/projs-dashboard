// Server-Sent Events (SSE) endpoint for real-time updates
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { addConnection, removeConnection, createSSEHeaders } from '@/lib/utils/sse';

// Force Node.js runtime for SSE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/realtime/updates - SSE endpoint
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      start(controller) {
        // Add connection
        addConnection(userId, controller);

        // Send initial connection message
        const connectMsg = JSON.stringify({
          type: 'connected',
          userId,
          timestamp: Date.now(),
        });
        controller.enqueue(`data: ${connectMsg}\n\n`);

        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(`: heartbeat ${Date.now()}\n\n`);
          } catch (error) {
            console.error('[SSE] Heartbeat error:', error);
            clearInterval(heartbeatInterval);
          }
        }, 30000);

        // Cleanup on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          removeConnection(userId);
          try {
            controller.close();
          } catch (error) {
            // Already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: createSSEHeaders(),
    });
  } catch (error) {
    console.error('[SSE] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
