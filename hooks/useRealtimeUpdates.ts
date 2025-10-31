'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeUpdate {
  type: string;
  data?: any;
  timestamp: number;
  message?: string;
  userId?: string;
}

interface UseRealtimeUpdatesOptions {
  projectId?: string;
  onUpdate?: (update: RealtimeUpdate) => void;
}

export function useRealtimeUpdates(options?: UseRealtimeUpdatesOptions) {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/updates');

    eventSource.onopen = () => {
      setConnected(true);
      console.log('[SSE] Connected to real-time updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const update: RealtimeUpdate = JSON.parse(event.data);
        setLastUpdate(update);

        // Call the optional callback
        if (options?.onUpdate) {
          options.onUpdate(update);
        }

        // Handle different update types with React Query cache invalidation
        switch (update.type) {
          case 'connected':
            console.log('[SSE] Connected as user:', update.userId);
            break;

          case 'project_created':
          case 'project_updated':
          case 'project_deleted':
            if (!options?.projectId || update.data?.projectId === options.projectId) {
              queryClient.invalidateQueries({ queryKey: ['projects'] });
              if (update.data?.projectId) {
                queryClient.invalidateQueries({ queryKey: ['project', update.data.projectId] });
              }
            }
            break;

          case 'task_created':
          case 'task_updated':
          case 'task_moved':
          case 'task_deleted':
            if (!options?.projectId || update.data?.projectId === options.projectId) {
              queryClient.invalidateQueries({ queryKey: ['tasks', update.data?.projectId] });
              if (update.data?.taskId) {
                queryClient.invalidateQueries({ queryKey: ['task', update.data.taskId] });
              }
              // Also invalidate project to update progress
              if (update.data?.projectId) {
                queryClient.invalidateQueries({ queryKey: ['project', update.data.projectId] });
              }
            }
            break;

          case 'comment_added':
            if (update.data?.taskId) {
              queryClient.invalidateQueries({ queryKey: ['comments', update.data.taskId] });
            }
            break;

          case 'milestone_created':
          case 'milestone_updated':
          case 'milestone_completed':
            if (update.data?.projectId) {
              queryClient.invalidateQueries({ queryKey: ['milestones', update.data.projectId] });
              queryClient.invalidateQueries({ queryKey: ['project', update.data.projectId] });
            }
            break;

          case 'project_update_created':
            if (update.data?.projectId) {
              queryClient.invalidateQueries({ queryKey: ['projectUpdates', update.data.projectId] });
            }
            break;

          default:
            console.log('[SSE] Unknown update type:', update.type);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse update:', error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      console.error('[SSE] Connection error, will reconnect automatically');
      // Browser will automatically attempt to reconnect
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, [options?.projectId, queryClient]);

  return { connected, lastUpdate };
}
