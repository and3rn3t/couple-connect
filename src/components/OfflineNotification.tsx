import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiSlash, CloudArrowUp, CheckCircle, X } from '@phosphor-icons/react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface OfflineNotificationProps {
  className?: string;
}

export function OfflineNotification({ className }: OfflineNotificationProps) {
  const { isOffline, offlineQueue, updateAvailable, applyUpdate, triggerSync, status } =
    useServiceWorker();

  const [showQueue, setShowQueue] = React.useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = React.useState(false);

  const handleApplyUpdate = async () => {
    if (isApplyingUpdate) return;

    setIsApplyingUpdate(true);
    try {
      await applyUpdate();
      toast.success('App updated successfully');
    } catch (error) {
      console.error('Failed to apply update:', error);
      toast.error('Failed to update app');
    } finally {
      setIsApplyingUpdate(false);
    }
  };

  const handleSync = async () => {
    try {
      await triggerSync();
      toast.success('Syncing offline changes...');
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      toast.error('Failed to sync changes');
    }
  };

  if (!status.supported) {
    return null;
  }

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50', className)}>
      <AnimatePresence>
        {/* Offline Banner */}
        {isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-orange-500 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <WifiSlash className="h-5 w-5" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="font-medium">You're offline</span>
                  {offlineQueue.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                      onClick={() => setShowQueue(!showQueue)}
                    >
                      {offlineQueue.length} pending changes
                    </Badge>
                  )}
                </div>
              </div>

              {offlineQueue.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSync}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <CloudArrowUp className="h-4 w-4 mr-1" />
                  Sync when online
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Update Available Banner */}
        {updateAvailable && !isOffline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-blue-500 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">App update available</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleApplyUpdate}
                disabled={isApplyingUpdate}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isApplyingUpdate ? 'Updating...' : 'Update now'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Offline Queue Details */}
        {showQueue && offlineQueue.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-orange-400 text-white border-t border-orange-600"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Pending Changes</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQueue(false)}
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1 text-sm">
                {offlineQueue.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/20 text-white border-white/30"
                    >
                      {item.type}
                    </Badge>
                    <span className="opacity-90">
                      {item.type === 'action'
                        ? 'New action'
                        : item.type === 'issue'
                          ? 'New issue'
                          : 'Progress update'}
                    </span>
                  </div>
                ))}

                {offlineQueue.length > 5 && (
                  <div className="text-xs opacity-75">+{offlineQueue.length - 5} more items</div>
                )}
              </div>

              <div className="mt-2 text-xs opacity-75">
                These changes will sync automatically when you're back online.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact offline indicator for mobile
 */
export function OfflineIndicator({ className }: { className?: string }) {
  const { isOffline, offlineQueue } = useServiceWorker();

  if (!isOffline) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'bg-orange-500 text-white rounded-full p-3 shadow-lg',
        'flex items-center gap-2',
        className
      )}
    >
      <WifiSlash className="h-4 w-4" />
      {offlineQueue.length > 0 && (
        <Badge className="bg-white/20 text-white text-xs">{offlineQueue.length}</Badge>
      )}
    </motion.div>
  );
}
