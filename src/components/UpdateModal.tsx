import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, ExternalLink, GitBranch, ArrowRight, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { ReleaseInfo } from '../services/updateService';
import { Language, TRANSLATIONS } from '../i18n';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  releaseInfo: ReleaseInfo | null;
  currentVersion: string;
  lang: Language;
  onOpenUrl: (url: string) => void;
  onSkipVersion: (neverShowAgain: boolean) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  releaseInfo,
  currentVersion,
  lang,
  onOpenUrl,
  onSkipVersion,
}) => {
  const [copiedRepo, setCopiedRepo] = useState(false);
  const t = TRANSLATIONS[lang];

  if (!isOpen || !releaseInfo) return null;

  const handleCopyRepo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(releaseInfo.repoUrl);
      setCopiedRepo(true);
      setTimeout(() => setCopiedRepo(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadClick = () => {
    // If direct exe asset exists, open it, otherwise open the release page
    const targetUrl = releaseInfo.downloadUrl || releaseInfo.htmlUrl;
    onOpenUrl(targetUrl);
    onClose();
  };

  const handleRepoClick = () => {
    onOpenUrl(releaseInfo.repoUrl);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title={t.cancel}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight leading-snug">{t.updateAvailable}</h3>
                <p className="text-xs text-blue-100 opacity-90">{t.updateDesc}</p>
              </div>
            </div>

            {/* Version Diff Badges */}
            <div className="mt-3 bg-white/15 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-blue-100">{t.currentVer}:</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                  v{currentVersion}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-200" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-amber-200">{t.latestVer}:</span>
                <span className="bg-amber-400 text-neutral-900 text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
                  v{releaseInfo.version}
                </span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-neutral-800 text-xs">
            {/* GitHub Repository Path */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                  {t.githubPath}
                </span>
                <button
                  onClick={handleCopyRepo}
                  className="text-[10px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 font-medium bg-white border border-neutral-200 px-2 py-0.5 rounded-md shadow-2xs hover:bg-neutral-100 transition-colors"
                >
                  {copiedRepo ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copiedRepo ? t.copied : t.copy}
                </button>
              </div>
              <div
                onClick={handleRepoClick}
                className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 break-all bg-white p-2 rounded-lg border border-neutral-100"
              >
                <span>{releaseInfo.repoUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0 ml-auto opacity-70" />
              </div>
            </div>

            {/* Release Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  {t.releaseNotes} ({releaseInfo.tagName})
                </span>
                <span className="text-[10px] text-neutral-400">
                  {new Date(releaseInfo.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="bg-[#1e1e1e] text-neutral-200 p-3 rounded-xl border border-neutral-700 font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap selection:bg-blue-600">
                {releaseInfo.body}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-neutral-50 border-t border-neutral-200 p-3.5 flex flex-col gap-2 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleDownloadClick}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-sm text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {t.updateNow}
              </button>
              <button
                onClick={handleRepoClick}
                className="flex items-center justify-center gap-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t.openRepo}
              </button>
            </div>

            <div className="flex justify-between items-center pt-1 px-1">
              <button
                onClick={() => onSkipVersion(true)}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 underline transition-colors cursor-pointer"
              >
                {t.skipThisVer}
              </button>
              <button
                onClick={onClose}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 font-medium transition-colors cursor-pointer px-2 py-1 rounded hover:bg-neutral-200"
              >
                {t.later}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
