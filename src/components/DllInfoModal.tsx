import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, X, ShieldCheck, Zap, Terminal, Code2, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { Language } from '../i18n';

interface DllInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const DllInfoModal: React.FC<DllInfoModalProps> = ({ isOpen, onClose, lang }) => {
  const isEn = lang === 'en';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] shadow-2xl border border-neutral-200 flex flex-col overflow-hidden text-neutral-900"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/20 border border-blue-400/40 rounded-xl">
                <Cpu className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  {isEn ? 'Pure Custom Native DLL Specification' : '순수 창작 네이티브 DLL 기술 명세'}
                </h3>
                <p className="text-[11px] text-neutral-300 font-mono">
                  ScreensaverCore.dll (v1.1.0 • C-ABI / Win32)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed">
            {/* Core Motivation */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-center gap-2 font-semibold text-blue-900 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>{isEn ? 'Why a Pure Custom DLL?' : '순수 창작 DLL 개발 배경 및 필요성'}</span>
              </div>
              <p className="text-blue-800 text-[11px]">
                {isEn
                  ? 'Traditional scripts relied on reg.exe or PowerShell which took 1~2 seconds and failed to notify Windows Explorer in real-time. ScreensaverCore.dll directly talks to Win32 kernel in <0.1ms with zero process overhead.'
                  : '기존 Windows 배치 파일은 reg.exe 및 파워쉘을 호출하여 1~2초가 소요되고 탐색기 메모리 캐시가 즉시 갱신되지 않았습니다. 순수 창작 DLL은 0.1ms 이내 원자적 처리 및 Win32 브로드캐스트로 재부팅 없이 즉시 반영합니다.'}
              </p>
            </div>

            {/* Comparison Table / Improvements */}
            <div className="space-y-2">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                {isEn ? 'Existing DLL Flaws & Key Improvements' : '기존 Windows DLL 오류 및 개선 사항'}
              </h4>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                <div className="border border-red-200 bg-red-50/50 rounded-lg p-2.5">
                  <span className="font-semibold text-red-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    {isEn ? 'Legacy desk.cpl Deprecated in Win 11' : '레거시 desk.cpl Windows 11 폐지 문제'}
                  </span>
                  <p className="text-neutral-600 mt-1">
                    {isEn
                      ? 'rundll32 desk.cpl,InstallScreenSaver fails on Win11 22H2+. ScreensaverCore.dll invokes standardized Core Win32 API natively.'
                      : 'Windows 11에서 desk.cpl 제어판이 제거되어 기존 스크립트 미작동. 순수 창작 DLL은 Win32 표준 코어 API를 직접 호출하여 영구 호환.'}
                  </p>
                </div>

                <div className="border border-green-200 bg-green-50/50 rounded-lg p-2.5">
                  <span className="font-semibold text-green-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    {isEn ? '100% Stack-Safe rundll32 Signature' : '100% 스택 안전 rundll32 호출 규격'}
                  </span>
                  <p className="text-neutral-600 mt-1">
                    {isEn
                      ? 'Calling user32.dll directly caused crash/stack corruption (c0000005). ScreensaverCore.dll provides exact CALLBACK stdcall signature.'
                      : 'user32.dll을 비표준 규격으로 rundll32 호출 시 발생하는 스택 오염 및 크래시(c0000005)를 정격 CALLBACK 시그니처로 완벽 해결.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Exported APIs */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" />
                {isEn ? 'Exported Functions (C-ABI)' : '내보내기 함수 목록 (C-ABI 규격)'}
              </h4>
              <div className="bg-neutral-900 text-neutral-200 rounded-lg p-2.5 font-mono text-[10px] space-y-1">
                <div><span className="text-blue-400">int</span> GetScreensaverSettingsNative(ScreensaverConfig*)</div>
                <div><span className="text-blue-400">int</span> ApplyScreensaverSettingsNative(const ScreensaverConfig*)</div>
                <div><span className="text-blue-400">int</span> TriggerScreensaverPreview(const wchar_t*, HWND, BOOL)</div>
                <div><span className="text-blue-400">int</span> BroadcastScreensaverSettingChange(void)</div>
                <div><span className="text-blue-400">void CALLBACK</span> ApplyScreensaverSettingsRundll32(...)</div>
                <div><span className="text-blue-400">void CALLBACK</span> TriggerPreviewRundll32(...)</div>
              </div>
            </div>

            {/* rundll32 usage example */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-neutral-700" />
                {isEn ? 'Batch / CMD rundll32 Command' : '배치 파일 및 CMD 실행 명령 예시'}
              </h4>
              <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-2 font-mono text-[10px] text-neutral-800 break-all select-all">
                rundll32.exe ScreensaverCore.dll,ApplyScreensaverSettingsRundll32 active=1;scr=Mystify.scr;timeout=10;secure=1
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium text-xs transition-colors"
            >
              {isEn ? 'Close' : '닫기'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
