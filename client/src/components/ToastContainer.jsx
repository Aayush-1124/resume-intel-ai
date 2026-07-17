import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type = 'error', duration = 5000, onRetry = null } = e.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type, onRetry }]);

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    };

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: { message: '✅ Back online! You are reconnected.', type: 'success', duration: 3000 },
        })
      );
    };

    window.addEventListener('app:toast', handleToast);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('app:toast', handleToast);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [dismiss]);

  const styleMap = {
    error:   'bg-[#2a0a0a] border-red-800/60 text-red-100',
    success: 'bg-[#0a2a14] border-green-800/60 text-green-100',
    info:    'bg-[#0a1a2e] border-blue-800/60 text-blue-100',
    warning: 'bg-[#2a1a00] border-amber-700/60 text-amber-100',
  };

  const iconMap = {
    error:   <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />,
    success: <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />,
    info:    <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />,
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-red-900 text-red-100 px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg"
          >
            <WifiOff size={16} />
            <span className="text-sm font-semibold">
              📡 You are offline. Please check your internet connection.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Stack */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-6 right-4 z-[200] flex flex-col gap-3 pointer-events-none max-w-sm w-full"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              role="alert"
              className={`pointer-events-auto flex flex-col gap-2 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${styleMap[t.type] || styleMap.error}`}
            >
              {/* Message row */}
              <div className="flex items-start gap-3">
                {iconMap[t.type] || iconMap.error}
                <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
                {/* Dismiss X */}
                <button
                  onClick={() => dismiss(t.id)}
                  className="ml-1 opacity-50 hover:opacity-100 transition-opacity text-inherit cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>

              {/* Retry button — only shown when onRetry is provided */}
              {t.onRetry && (
                <button
                  onClick={() => {
                    dismiss(t.id);
                    t.onRetry();
                  }}
                  className="self-start flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Try Again
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
