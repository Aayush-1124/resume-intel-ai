import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, History, Loader, AlertCircle, RotateCcw,
  Clock, Tag, CheckCircle, ChevronRight,
} from 'lucide-react';
import { api } from '../utils/api.js';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function VersionHistoryPanel({ isOpen, onClose, localId, currentResume, onRestore }) {
  const [versions, setVersions]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [restoring, setRestoring]     = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelDraft, setLabelDraft]   = useState('');

  useEffect(() => {
    if (!isOpen || !localId) return;
    setError('');
    setLoading(true);
    api.getVersions(localId)
      .then((data) => setVersions(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen, localId]);

  const handleRestore = async (versionId) => {
    setRestoring(versionId);
    try {
      const versionData = await api.getVersion(localId, versionId);
      if (versionData?.snapshot) {
        onRestore(versionData.snapshot);
        onClose();
      }
    } catch (err) {
      setError(`Could not restore version: ${err.message}`);
    } finally {
      setRestoring(null);
    }
  };

  const handleSaveLabel = async (versionId) => {
    try {
      await api.labelVersion(localId, versionId, labelDraft);
      setVersions((prev) => prev.map((v) => v._id === versionId ? { ...v, label: labelDraft } : v));
    } catch { /* silent — label is cosmetic */ }
    setEditingLabel(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/15"
               style={{ background: 'var(--surface-container)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
                <History size={14} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Version History</h2>
                <p className="text-[0.6rem] text-on-surface-variant/60 mt-0.5">Auto-saved on every download</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader size={20} className="animate-spin text-on-surface-variant/40" />
              </div>
            )}

            {error && (
              <div className="flex gap-2 p-3 rounded-xl bg-error/8 border border-error/15">
                <AlertCircle size={13} className="text-error shrink-0 mt-0.5" />
                <p className="text-xs text-error">{error}</p>
              </div>
            )}

            {!loading && !error && versions.length === 0 && (
              <div className="text-center py-12 space-y-2">
                <History size={32} className="mx-auto text-on-surface-variant/20" />
                <p className="text-sm font-medium text-on-surface-variant/60">No saved versions yet</p>
                <p className="text-xs text-on-surface-variant/40">Versions are saved automatically when you download your resume.</p>
              </div>
            )}

            {!loading && versions.map((v, i) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-outline-variant/10 bg-surface-container hover:border-outline-variant/20 transition-all"
              >
                {/* Timeline dot */}
                <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0 group-hover:bg-primary transition-colors" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {editingLabel === v._id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={labelDraft}
                        onChange={(e) => setLabelDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveLabel(v._id);
                          if (e.key === 'Escape') setEditingLabel(null);
                        }}
                        className="field-input py-1 text-xs flex-1"
                        placeholder="e.g. Before AI tailor, Final version…"
                        maxLength={60}
                      />
                      <button onClick={() => handleSaveLabel(v._id)}
                        className="p-1 text-tertiary hover:text-tertiary/80">
                        <CheckCircle size={13} />
                      </button>
                      <button onClick={() => setEditingLabel(null)}
                        className="p-1 text-on-surface-variant/50 hover:text-on-surface-variant">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 cursor-pointer group/label"
                      onClick={() => { setEditingLabel(v._id); setLabelDraft(v.label || ''); }}
                      title="Click to label this version"
                    >
                      {v.label
                        ? <span className="text-xs font-semibold text-on-surface truncate">{v.label}</span>
                        : <span className="text-xs text-on-surface-variant/40 group-hover/label:text-on-surface-variant/70 flex items-center gap-1 transition-colors">
                            <Tag size={10} /> Add label
                          </span>
                      }
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="text-on-surface-variant/40" />
                    <span className="text-[0.6rem] text-on-surface-variant/50">{formatDate(v.savedAt)} · {timeAgo(v.savedAt)}</span>
                  </div>
                </div>

                {/* Restore */}
                <button
                  onClick={() => handleRestore(v._id)}
                  disabled={!!restoring}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-[0.65rem] font-bold uppercase tracking-wide hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
                >
                  {restoring === v._id
                    ? <Loader size={11} className="animate-spin" />
                    : <RotateCcw size={11} />
                  }
                  Restore
                </button>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center gap-2">
            <AlertCircle size={12} className="text-on-surface-variant/40 shrink-0" />
            <p className="text-[0.6rem] text-on-surface-variant/40">
              Versions auto-save to the server on each download. Restoring replaces your current resume — it can be re-saved as a new version.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
