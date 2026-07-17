import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Briefcase, X } from 'lucide-react';

export default function JobSuccessModal({ isOpen, onClose, onFindJobs }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-surface-container rounded-3xl shadow-2xl border border-outline-variant/10 p-8 max-w-md w-full text-center"
              style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 300, damping: 20 }}
                className="w-20 h-20 rounded-3xl bg-tertiary/15 flex items-center justify-center mx-auto mb-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-tertiary/20 flex items-center justify-center">
                  <CheckCircle size={32} className="text-tertiary" />
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">
                  Resume Downloaded!
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                  We found matching jobs for your new resume. Start applying instantly.
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <button
                  onClick={onFindJobs}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Briefcase size={16} /> Find Jobs for this Resume
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-surface-container-high text-on-surface-variant font-medium text-sm rounded-xl hover:bg-surface-container-highest transition-colors"
                >
                  Maybe Later
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
