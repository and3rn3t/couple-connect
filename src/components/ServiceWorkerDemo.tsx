import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiSlash, CloudArrowUp, CheckCircle, Download } from '@/components/ui/InlineIcons';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useOfflineActionManager } from '@/utils/offlineActionManager';
import { toast } from 'sonner';

/**
 * Service Worker Demo Component
 * Useful for testing offline functionality
 */
export function ServiceWorkerDemo() {
  const { status, isOffline, updateAvailable, applyUpdate, offlineQueue, triggerSync, getVersion } =
    useServiceWorker();

  const { createActionOfflineFirst } = useOfflineActionManager();

  const [version, setVersion] = React.useState<string>('');

  React.useEffect(() => {
    if (status.active) {
      getVersion()
        .then(setVersion)
        .catch(() => setVersion('unknown'));
    }
  }, [status.active, getVersion]);

  const handleTestOfflineAction = async () => {
    try {
      const actionId = await createActionOfflineFirst({
        title: 'Test Offline Action',
        description: 'This action was created while testing offline functionality',
        assignedTo: 'partner1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        createdBy: 'test-user',
        issueId: 'test-issue',
        notes: [],
      });

      if (actionId) {
        toast.success('Action created successfully');
      } else {
        toast.success('Action queued for offline sync');
      }
    } catch (error) {
      console.error('Failed to create test action:', error);
      toast.error('Failed to create action');
    }
  };

  const handleApplyUpdate = async () => {
    try {
      await applyUpdate();
      toast.success('Update applied successfully');
    } catch (error) {
      console.error('Failed to apply update:', error);
      toast.error('Failed to apply update');
    }
  };

  const handleTriggerSync = async () => {
    try {
      await triggerSync();
      toast.success('Background sync triggered');
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      toast.error('Failed to trigger sync');
    }
  };

  if (!status.supported) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Service Worker Not Supported</CardTitle>
          <CardDescription>
            Your browser doesn't support service workers. Offline functionality won't be available.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Service Worker Status
          {isOffline && (
            <Badge variant="destructive">
              <WifiSlash className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          {status.active && (
            <Badge variant="secondary">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
          {updateAvailable && (
            <Badge variant="default">
              <Download className="h-3 w-3 mr-1" />
              Update Available
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Service worker provides offline support and background sync
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Supported:</strong> {status.supported ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Registered:</strong> {status.registered ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Installing:</strong> {status.installing ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Waiting:</strong> {status.waiting ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Active:</strong> {status.active ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Version:</strong> {version || 'Unknown'}
          </div>
        </div>

        {/* Error Display */}
        {status.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm">
            <strong>Error:</strong> {status.error}
          </div>
        )}

        {/* Offline Queue */}
        {offlineQueue.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Offline Queue ({offlineQueue.length} items)</h4>
            <div className="space-y-1">
              {offlineQueue.slice(0, 3).map((item) => (
                <div key={item.id} className="text-sm p-2 bg-muted rounded">
                  <Badge variant="outline" className="mr-2">
                    {item.type}
                  </Badge>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  {item.retries > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      Retries: {item.retries}
                    </Badge>
                  )}
                </div>
              ))}
              {offlineQueue.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{offlineQueue.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {updateAvailable && (
            <Button onClick={handleApplyUpdate} size="sm">
              <Download className="h-4 w-4 mr-1" />
              Apply Update
            </Button>
          )}

          {offlineQueue.length > 0 && (
            <Button onClick={handleTriggerSync} variant="outline" size="sm">
              <CloudArrowUp className="h-4 w-4 mr-1" />
              Trigger Sync
            </Button>
          )}

          <Button onClick={handleTestOfflineAction} variant="outline" size="sm">
            Test Offline Action
          </Button>
        </div>

        {/* Helpful Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Turn off your internet connection to test offline functionality</p>
          <p>• Offline actions will be queued and synced when you're back online</p>
          <p>• Service worker caches important app resources for offline use</p>
        </div>
      </CardContent>
    </Card>
  );
}
