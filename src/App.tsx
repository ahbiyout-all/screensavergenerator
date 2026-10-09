import React, { useState } from 'react';
import { Monitor, Download, Copy, Check, Shield, Clock, FileCode2, Upload, Trash2, Loader2, Info, AlertTriangle, ExternalLink, Sparkles, RefreshCw, Play, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toggle } from './components/Toggle';
import { LanguageSwitch } from './components/LanguageSwitch';
import { UpdateModal } from './components/UpdateModal';
import { DllInfoModal } from './components/DllInfoModal';
import { ScrMakerModal } from './components/ScrMakerModal';
import { useScreensaver } from './hooks/useScreensaver';
import { useUpdateChecker } from './hooks/useUpdateChecker';
import { Language, TRANSLATIONS, SCREENSAVERS_DATA } from './i18n';
import { APP_VERSION, GITHUB_REPO, GITHUB_REPO_URL } from './version';

export default function App() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDllModal, setShowDllModal] = useState(false);
  const [showScrMakerModal, setShowScrMakerModal] = useState(false);
  const [extraScreensavers, setExtraScreensavers] = useState<Array<{ id: string; name: { ko: string; en: string } }>>([]);
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_language');
      if (saved === 'ko' || saved === 'en') return saved;
    }
    return 'ko';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', newLang);
    }
  };

  const t = TRANSLATIONS[lang];

  const {
    isChecking: isCheckingUpdate,
    hasNewUpdate,
    releaseInfo,
    showUpdateModal,
    checkForUpdates,
    dismissUpdate,
    simulateUpdateNotification,
    currentVersion,
    setShowUpdateModal,
  } = useUpdateChecker();

  const {
    isActive, setIsActive,
    screensaver, setScreensaver,
    customFile, setCustomFile,
    timeoutMinutes, setTimeoutMinutes,
    isSecure, setIsSecure,
    batchScript,
    copied,
    toastMessage,
    isApplying,
    isFetching,
    systemSettings,
    showToast,
    handleDownload,
    handleCopy,
    handleApply,
    handlePreviewScreensaver,
  } = useScreensaver(lang);

  if (isFetching) {
    return (
      <div className="h-screen w-full bg-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  const allScreensavers = [...SCREENSAVERS_DATA, ...extraScreensavers];

  const getScreensaverName = (id: string) => {
    const found = allScreensavers.find(s => s.id.toLowerCase() === id.toLowerCase());
    return found ? found.name[lang].split(' (')[0] : id;
  };

  const handleRegisterCustomScreensaver = (scrFileName: string, displayName: string) => {
    setExtraScreensavers(prev => {
      const exists = prev.some(item => item.id.toLowerCase() === scrFileName.toLowerCase());
      if (exists) return prev;
      return [...prev, {
        id: scrFileName,
        name: { ko: displayName, en: displayName }
      }];
    });
    setScreensaver(scrFileName);
  };

  const handleOpenExternalUrl = async (e: React.MouseEvent, url: string) => {
    e.preventDefault();

    // 1. Tauri 데스크톱 앱 환경인 경우 Rust open_url 명령으로 시스템 기본 브라우저 실행
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_url', { url });
        showToast(t.siteOpened);
        return;
      } catch (err) {
        console.error('Tauri open_url error:', err);
      }
    }

    // 2. 웹 / 브라우저 환경인 경우
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        await navigator.clipboard.writeText(url);
        showToast(t.popupBlocked);
      } else {
        showToast(t.navigatingSite);
      }
    } catch (err) {
      console.error('window.open error:', err);
      try {
        await navigator.clipboard.writeText(url);
        showToast(t.linkCopied);
      } catch {
        showToast(url);
      }
    }
  };

  const handleVersionBadgeClick = async () => {
    if (hasNewUpdate && releaseInfo) {
      setShowUpdateModal(true);
    } else {
      showToast(t.checkingUpdates);
      await checkForUpdates(true);
      if (!hasNewUpdate) {
        showToast(`${t.upToDate} (v${APP_VERSION})`);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-neutral-100 text-neutral-900 font-sans p-3 flex flex-col overflow-hidden max-w-[600px] mx-auto">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 bg-neutral-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium"
          >
            <Check className="w-3.5 h-3.5 text-green-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-3 shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="bg-blue-100 p-1.5 rounded-lg shrink-0">
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight truncate">{t.title}</h1>
              <button
                onClick={handleVersionBadgeClick}
                title={`${t.checkUpdates} (v${APP_VERSION})`}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  hasNewUpdate
                    ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 animate-pulse'
                    : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {isCheckingUpdate ? (
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                ) : hasNewUpdate ? (
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                ) : null}
                <span>v{APP_VERSION}</span>
                {hasNewUpdate && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
              </button>

              <button
                onClick={simulateUpdateNotification}
                title="GitHub 최신 릴리즈 업데이트 알림 팝업 미리보기 테스트"
                className="text-[9px] text-neutral-400 hover:text-blue-600 px-1 py-0.5 rounded border border-dashed border-neutral-300 hover:border-blue-400 transition-colors cursor-pointer shrink-0"
              >
                TEST UPDATE
              </button>

              <button
                onClick={() => setShowDllModal(true)}
                title={t.dllSpecModalTitle}
                className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-1.5 py-0.5 rounded border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Cpu className="w-2.5 h-2.5 text-blue-600" />
                <span>DLL Core</span>
              </button>

              <button
                onClick={() => setShowScrMakerModal(true)}
                title={t.scrMakerTitle}
                className="text-[9px] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{lang === 'ko' ? '.scr 제작' : '.SCR Studio'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 truncate">{t.subtitle}</p>
          </div>
        </div>

        {/* 한글 / 영어 전환 버튼 */}
        <div className="shrink-0">
          <LanguageSwitch currentLanguage={lang} onLanguageChange={handleLanguageChange} />
        </div>
      </header>

      {systemSettings && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 shrink-0 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-0.5">{t.currentSettings}</p>
            <p className="opacity-90">
              {t.status}: <span className="font-medium">{systemSettings.is_active ? t.on : t.off}</span> |{' '}
              {t.type}: <span className="font-medium">{getScreensaverName(systemSettings.screensaver)}</span> |{' '}
              {t.wait}: <span className="font-medium">{systemSettings.timeout_minutes === 0 ? t.immediate : `${systemSettings.timeout_minutes}${t.minutes}`}</span> |{' '}
              {t.password}: <span className="font-medium">{systemSettings.is_secure ? t.used : t.notUsed}</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-3.5 shrink-0 space-y-3.5">
          <Toggle 
            checked={isActive} 
            onChange={setIsActive} 
            label={t.enableScreensaver} 
            description={t.enableScreensaverDesc}
          />

          <div className={`space-y-3.5 transition-opacity duration-200 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm text-neutral-900 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                  {t.screensaverType}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowScrMakerModal(true)}
                    title={t.scrMakerTitle}
                    className="text-[11px] font-medium text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
                    <span>{t.scrMakerBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePreviewScreensaver}
                    title={t.testPreviewDesc}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{t.testPreview}</span>
                  </button>
                </div>
              </div>
              <select 
                value={screensaver}
                onChange={(e) => setScreensaver(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors"
              >
                {allScreensavers.map(s => (
                  <option key={s.id} value={s.id}>{s.name[lang]}</option>
                ))}
              </select>
              
              <AnimatePresence>
                {screensaver === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-1 overflow-hidden"
                  >
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".scr" 
                        onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
                        className="hidden" 
                        id="scr-upload"
                      />
                      <label htmlFor="scr-upload" className="flex items-center justify-center gap-2 w-full bg-neutral-50 border border-neutral-300 border-dashed text-neutral-900 text-xs rounded-lg hover:bg-neutral-100 cursor-pointer p-2.5 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="font-medium">{customFile ? customFile.name : t.selectScrFile}</span>
                      </label>
                      {customFile && (
                        <button
                          onClick={() => setCustomFile(null)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-sm text-neutral-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                {t.waitTime}
              </label>
              <select 
                value={timeoutMinutes}
                onChange={(e) => setTimeoutMinutes(parseInt(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-300 text-neutral-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors"
              >
                {Array.from({ length: 13 }, (_, i) => i * 5).map(min => (
                  <option key={min} value={min}>
                    {min === 0 ? t.immediate : `${min}${t.minutes}`}
                  </option>
                ))}
              </select>
            </div>

            <Toggle 
              checked={isSecure} 
              onChange={setIsSecure} 
              icon={Shield}
              label={t.logonScreen} 
              description={t.logonScreenDesc}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-3.5 flex flex-col flex-1 min-h-[150px]">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-blue-600" />
              {t.scriptPreview}
            </h2>
            <button 
              onClick={handleCopy}
              className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1 text-xs bg-neutral-100 px-2 py-1 rounded-md"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copied ? t.copied : t.copy}
            </button>
          </div>
          
          <div className="flex-1 bg-[#1E1E1E] rounded-lg border border-neutral-800 overflow-hidden flex flex-col mb-3">
            <div className="p-2.5 overflow-auto flex-1">
              <pre className="text-[#D4D4D4] font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {batchScript}
              </pre>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => setShowConfirm(true)}
              disabled={isApplying}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm text-sm"
            >
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isApplying ? t.applying : t.applySettings}
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-2.5 rounded-lg transition-colors shadow-sm text-sm"
            >
              <Download className="w-4 h-4" />
              {t.downloadBat}
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-4 shrink-0 text-center text-[10px] text-neutral-400 flex flex-col items-center gap-0.5">
        <p className="font-medium text-neutral-500">Copyright © 2026 AhBiYout All rights reserved. (v{APP_VERSION})</p>
        <p className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>{t.developer}: AhBiYout</span>
          <span>|</span>
          <span>
            {t.company}:{' '}
            <a
              href="http://www.cisnet.co.kr/"
              onClick={(e) => handleOpenExternalUrl(e, 'http://www.cisnet.co.kr/')}
              target="_blank"
              rel="noopener noreferrer"
              title="클릭하여 웹사이트 열기"
              className="hover:text-blue-600 font-medium transition-colors underline inline-flex items-center gap-0.5"
            >
              cisnet.co.kr
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </span>
          <span>|</span>
          <span>
            {t.blog}:{' '}
            <a
              href="https://ahbiyoutvibe.blogspot.com/"
              onClick={(e) => handleOpenExternalUrl(e, 'https://ahbiyoutvibe.blogspot.com/')}
              target="_blank"
              rel="noopener noreferrer"
              title="클릭하여 블로그 열기"
              className="hover:text-blue-600 font-medium transition-colors underline inline-flex items-center gap-0.5"
            >
              ahbiyoutvibe.blogspot.com
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </span>
          <span>|</span>
          <span>
            GitHub:{' '}
            <a
              href={GITHUB_REPO_URL}
              onClick={(e) => handleOpenExternalUrl(e, GITHUB_REPO_URL)}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub 저장소 열기"
              className="hover:text-blue-600 font-medium transition-colors underline inline-flex items-center gap-0.5"
            >
              AhBiYout/{GITHUB_REPO}
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          </span>
        </p>
      </footer>

      <UpdateModal
        isOpen={showUpdateModal}
        onClose={() => dismissUpdate(false)}
        releaseInfo={releaseInfo}
        currentVersion={currentVersion}
        lang={lang}
        onOpenUrl={(url) => handleOpenExternalUrl({ preventDefault: () => {} } as React.MouseEvent, url)}
        onSkipVersion={(neverShowAgain) => dismissUpdate(neverShowAgain)}
      />

      <DllInfoModal
        isOpen={showDllModal}
        onClose={() => setShowDllModal(false)}
        lang={lang}
      />

      <ScrMakerModal
        isOpen={showScrMakerModal}
        onClose={() => setShowScrMakerModal(false)}
        lang={lang}
        onRegisterScreensaver={handleRegisterCustomScreensaver}
      />

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-[340px] overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">{t.confirmTitle}</h3>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t.confirmDesc}
                  <br /><br />
                  <span className="text-xs text-neutral-500">
                    {t.confirmWebNotice}
                  </span>
                </p>
              </div>
              <div className="bg-neutral-50 p-3 flex gap-2 justify-end border-t border-neutral-100">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200 bg-neutral-100 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    handleApply();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {t.confirmButton}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
