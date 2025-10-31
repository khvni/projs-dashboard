// Server-Sent Events (SSE) utility for real-time updates

type SSEController = ReadableStreamDefaultController;

// Global store for active SSE connections
const connections = new Map<string, SSEController>();

/**
 * Add a new SSE connection
 */
export function addConnection(userId: string, controller: SSEController): void {
  connections.set(userId, controller);
  console.log(`[SSE] User ${userId} connected. Total connections: ${connections.size}`);
}

/**
 * Remove an SSE connection
 */
export function removeConnection(userId: string): void {
  connections.delete(userId);
  console.log(`[SSE] User ${userId} disconnected. Total connections: ${connections.size}`);
}

/**
 * Get connection count
 */
export function getConnectionCount(): number {
  return connections.size;
}

/**
 * Broadcast update to all connected clients
 */
export function broadcastUpdate(event: string, data: any): void {
  const message = JSON.stringify({ type: event, data, timestamp: Date.now() });
  let successCount = 0;
  let failureCount = 0;

  connections.forEach((controller, userId) => {
    try {
      controller.enqueue(`data: ${message}\n\n`);
      successCount++;
    } catch (error) {
      console.error(`[SSE] Failed to send to user ${userId}:`, error);
      failureCount++;
      // Connection will be cleaned up by abort handler
    }
  });

  console.log(`[SSE] Broadcast '${event}': ${successCount} sent, ${failureCount} failed`);
}

/**
 * Send update to specific user
 */
export function sendToUser(userId: string, event: string, data: any): void {
  const controller = connections.get(userId);
  if (!controller) {
    console.warn(`[SSE] User ${userId} not connected`);
    return;
  }

  const message = JSON.stringify({ type: event, data, timestamp: Date.now() });

  try {
    controller.enqueue(`data: ${message}\n\n`);
    console.log(`[SSE] Sent '${event}' to user ${userId}`);
  } catch (error) {
    console.error(`[SSE] Failed to send to user ${userId}:`, error);
  }
}

/**
 * Send heartbeat to all connections
 */
export function sendHeartbeat(): void {
  connections.forEach((controller, userId) => {
    try {
      controller.enqueue(`: heartbeat\n\n`);
    } catch (error) {
      console.error(`[SSE] Heartbeat failed for user ${userId}:`, error);
    }
  });
}

/**
 * Create SSE response headers
 */
export function createSSEHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering in nginx
  };
}

/**
 * Format SSE message
 */
export function formatSSEMessage(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
