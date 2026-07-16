import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, WifiOff } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type = 'error', duration = 4000 } = e.detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    };

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Back online!', type: 'success' }}));
    };

    window.addEventListener('app:toast', handleToast);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('app:toast', handleToast);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-error text-on-error px-4 py-2 flex items-center justify-center gap-2 shadow-lg"
          >
            <WifiOff size={16} />
            <span className="text-sm font-medium">You are currently offline. Check your connection.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl max-w-sm border backdrop-blur-md
                ${t.type === 'error' ? 'bg-error/95 border-error/20 text-on-error' : ''}
                ${t.type === 'success' ? 'bg-tertiary/95 border-tertiary/20 text-on-tertiary' : ''}
                ${t.type === 'info' ? 'bg-surface-container-highest border-outline/20 text-on-surface' : ''}
              `}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'error' && <AlertCircle size={18} />}
                {t.type === 'success' && <CheckCircle size={18} />}
                {t.type === 'info' && <Info size={18} />}
              </div>
              <p className="text-sm font-medium leading-tight">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
