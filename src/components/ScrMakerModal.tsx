import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, Download, Copy, Check, Play, Maximize2, 
  Settings2, Code2, Layers, Monitor, Terminal, FileCode, CheckCircle2,
  Palette, Cpu, RefreshCw, Info, ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { ScrMakerConfig, ScrTemplateType, DEFAULT_SCR_CONFIG } from '../types/screensaverMaker';
import { generateCSharpSource, generateBuildBat, generateInstallBat, generateHtmlSource } from '../utils/scrGenerator';
import { Language, TRANSLATIONS } from '../i18n';

interface ScrMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onRegisterScreensaver?: (scrFileName: string, displayName: string) => void;
}

export const ScrMakerModal: React.FC<ScrMakerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onRegisterScreensaver
}) => {
  const t = TRANSLATIONS[lang];
  const [config, setConfig] = useState<ScrMakerConfig>(DEFAULT_SCR_CONFIG);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'guide'>('preview');
  const [isBuildingZip, setIsBuildingZip] = useState(false);
  const [showFullscreenCanvas, setShowFullscreenCanvas] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Canvas Animation Engine
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const targetCanvas = showFullscreenCanvas ? fullCanvasRef.current : canvasRef.current;
    if (!targetCanvas) return;

    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    let width = targetCanvas.width = targetCanvas.parentElement?.clientWidth || 600;
    let height = targetCanvas.height = targetCanvas.parentElement?.clientHeight || 380;

    const handleResize = () => {
      if (targetCanvas) {
        width = targetCanvas.width = targetCanvas.parentElement?.clientWidth || 600;
        height = targetCanvas.height = targetCanvas.parentElement?.clientHeight || 380;
      }
    };
    window.addEventListener('resize', handleResize);

    // Template state
    let matrixDrops: number[] = [];
    const matrixFontSize = config.matrixCharSize;
    const matrixCols = Math.max(10, Math.floor(width / matrixFontSize));
    for (let i = 0; i < matrixCols; i++) {
      matrixDrops[i] = Math.floor(Math.random() * -50);
    }
    const matrixChars = (config.matrixCustomText || '0123456789 ABCDEF').split('');

    let stars = Array.from({ length: config.starCount }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 1000 + 1
    }));

    let bounceX = 60, bounceY = 80;
    let bounceVx = config.bouncingSpeed * 0.8;
    let bounceVy = config.bouncingSpeed * 0.6;

    let wavePhase = 0;

    const render = () => {
      if (!ctx) return;

      if (config.template === 'matrix') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `bold ${matrixFontSize}px monospace`;
        for (let i = 0; i < matrixDrops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * matrixFontSize;
          const y = matrixDrops[i] * matrixFontSize;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(char, x, y);

          ctx.fillStyle = config.matrixCharColor;
          ctx.fillText(char, x, y - matrixFontSize);

          if (y > height && Math.random() > 0.96) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i] += config.matrixSpeed * 0.15;
        }
      } else if (config.template === 'starfield') {
        ctx.fillStyle = 'rgba(5, 5, 10, 0.35)';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        for (let star of stars) {
          star.z -= config.starSpeed * 1.5;
          if (star.z <= 0) {
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
            star.z = 1000;
          }

          const k = 400 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;
          const size = Math.max(1, (1000 - star.z) / 220);

          if (px >= 0 && px < width && py >= 0 && py < height) {
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = config.starColor;
            ctx.fill();

            if (config.starWarpEffect && star.z < 600) {
              const prevK = 400 / (star.z + 20);
              const prevPx = star.x * prevK + cx;
              const prevPy = star.y * prevK + cy;
              ctx.beginPath();
              ctx.moveTo(prevPx, prevPy);
              ctx.lineTo(px, py);
              ctx.strokeStyle = config.starColor;
              ctx.globalAlpha = 0.35;
              ctx.lineWidth = size * 0.8;
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }
          }
        }
      } else if (config.template === 'clock') {
        ctx.fillStyle = '#05070E';
        ctx.fillRect(0, 0, width, height);

        const now = new Date();
        const hours = config.clockFormat24h 
          ? String(now.getHours()).padStart(2, '0') 
          : String(now.getHours() % 12 || 12).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = config.clockShowSeconds ? `:${String(now.getSeconds()).padStart(2, '0')}` : '';
        const timeStr = `${hours}:${minutes}${seconds}`;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = config.clockFontColor;
        ctx.font = `bold ${Math.min(config.clockFontSize, width / 7)}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(timeStr, width / 2, height / 2 - 25);

        if (config.clockShowDate) {
          const dateStr = now.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
          });
          ctx.fillStyle = '#94A3B8';
          ctx.font = `500 ${Math.max(13, Math.min(20, width / 24))}px system-ui, sans-serif`;
          ctx.fillText(dateStr, width / 2, height / 2 + 35);
        }

        if (config.clockCustomMessage) {
          ctx.fillStyle = '#64748B';
          ctx.font = `400 ${Math.max(12, Math.min(16, width / 30))}px system-ui, sans-serif`;
          ctx.fillText(config.clockCustomMessage, width / 2, height / 2 + 75);
        }
      } else if (config.template === 'neon_waves') {
        ctx.fillStyle = 'rgba(5, 5, 12, 0.18)';
        ctx.fillRect(0, 0, width, height);

        wavePhase += config.waveSpeed * 0.02;
        const waveCount = config.waveCount;

        for (let i = 0; i < waveCount; i++) {
          ctx.beginPath();
          const baseOffset = (i - waveCount / 2) * (height / 10);
          for (let x = 0; x <= width; x += 12) {
            const y = height / 2 + baseOffset + Math.sin(x * 0.008 + wavePhase + i * 0.7) * (height / 9);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = i % 2 === 0 ? config.waveColor1 : config.waveColor2;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 12;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else if (config.template === 'bouncing') {
        ctx.fillStyle = 'rgba(5, 5, 12, 0.25)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `900 ${config.bouncingSize}px system-ui, sans-serif`;
        const textWidth = ctx.measureText(config.bouncingText).width;

        bounceX += bounceVx;
        bounceY += bounceVy;

        if (bounceX <= 10 || bounceX + textWidth >= width - 10) bounceVx = -bounceVx;
        if (bounceY <= config.bouncingSize || bounceY >= height - 20) bounceVy = -bounceVy;

        ctx.fillStyle = config.bouncingTextColor;
        ctx.shadowBlur = 18;
        ctx.shadowColor = config.bouncingTextColor;
        ctx.fillText(config.bouncingText, bounceX, bounceY);
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, config, showFullscreenCanvas, lang]);

  if (!isOpen) return null;

  // Package builder (.zip)
  const handleDownloadZip = async () => {
    setIsBuildingZip(true);
    try {
      const zip = new JSZip();
      const safeName = config.outputName.replace(/[^a-zA-Z0-9_]/g, '') || 'MyScreensaver';

      const csSource = generateCSharpSource(config);
      const buildBat = generateBuildBat(config);
      const installBat = generateInstallBat(config);
      const htmlSource = generateHtmlSource(config);

      zip.file(`${safeName}.cs`, csSource);
      zip.file(`Build_Scr.bat`, buildBat);
      zip.file(`Install_Scr.bat`, installBat);
      zip.file(`index.html`, htmlSource);
      zip.file(`README.txt`, `=====================================================================
Windows .scr Screensaver Build Package: ${safeName}.scr
Generated by Screensaver Manager Studio
=====================================================================

[ 빌드 방법 - 설치 불필요 ]
1. "Build_Scr.bat" 파일을 더블 클릭하여 실행합니다.
2. 윈도우 기본 내장 C# 컴파일러(csc.exe)가 자동으로 0.5초 만에 "${safeName}.scr" 파일을 빌드합니다.
3. 생성된 "${safeName}.scr"을 우클릭하여 [설치]를 누르거나 "Install.bat"을 실행하세요.

[ 기능 사양 ]
* 전체화면 실행 모드 (/s)
* 환경설정 대화상자 (/c)
* 윈도우 제어판 미리보기 창 (/p <HWND>)
* 마우스 이동 / 키보드 입력 시 즉시 부드럽게 종료
`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}_ScreenSaver_Package.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(lang === 'ko' ? '빌드 패키지(.zip) 다운로드가 완료되었습니다!' : 'Package (.zip) downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast(lang === 'ko' ? '패키지 생성 중 오류가 발생했습니다.' : 'Failed to generate package.');
    } finally {
      setIsBuildingZip(false);
    }
  };

  const handleDownloadHtml = () => {
    const safeName = config.outputName.replace(/[^a-zA-Z0-9_]/g, '') || 'MyScreensaver';
    const html = generateHtmlSource(config);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(lang === 'ko' ? 'HTML5 화면 보호기가 다운로드되었습니다!' : 'HTML5 screensaver downloaded!');
  };

  const handleCopyCode = async () => {
    const code = generateCSharpSource(config);
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast(t.csCopied);
  };

  const handleAddToManager = () => {
    const safeName = (config.outputName.replace(/[^a-zA-Z0-9_]/g, '') || 'MyScreensaver') + '.scr';
    if (onRegisterScreensaver) {
      onRegisterScreensaver(safeName, `${config.title} (${safeName})`);
    }
    showToast(t.addedToManagerToast);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {t.scrMakerTitle}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
                    Win32 .SCR Studio
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.scrMakerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'preview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {t.livePreview}</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'code' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> C# Source</span>
                </button>
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'guide' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Guide</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

            {activeTab === 'preview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Canvas & Template Selection */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  {/* Template Picker */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'matrix', label: t.templateMatrix, icon: Terminal, color: 'text-emerald-400 border-emerald-500/40' },
                      { id: 'starfield', label: t.templateStarfield, icon: Sparkles, color: 'text-blue-400 border-blue-500/40' },
                      { id: 'clock', label: t.templateClock, icon: Monitor, color: 'text-amber-400 border-amber-500/40' },
                      { id: 'neon_waves', label: t.templateNeon, icon: Cpu, color: 'text-purple-400 border-purple-500/40' },
                      { id: 'bouncing', label: t.templateBouncing, icon: Layers, color: 'text-cyan-400 border-cyan-500/40' },
                    ].map((tpl) => {
                      const Icon = tpl.icon;
                      const isSelected = config.template === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => setConfig({ ...config, template: tpl.id as ScrTemplateType })}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                          <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {tpl.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Canvas Viewport */}
                  <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-700/80 bg-black shadow-inner group">
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    
                    {/* Controls Overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowFullscreenCanvas(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all shadow-sm"
                        title={t.fullscreenPreview}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{t.fullscreenPreview}</span>
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] text-slate-400 border border-white/5 pointer-events-none">
                      60 FPS Win32 GDI+ Simulation
                    </div>
                  </div>
                </div>

                {/* Right: Detailed Settings Panel */}
                <div className="lg:col-span-5 flex flex-col space-y-4 bg-slate-900/60 border border-slate-800/90 rounded-xl p-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Settings2 className="w-4 h-4 text-cyan-400" />
                      <span>{t.screensaverType} 옵션</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {config.template.toUpperCase()}
                    </span>
                  </div>

                  {/* Template-Specific Controls */}
                  <div className="space-y-3.5 text-xs text-slate-300">
                    {/* Output Filename */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.outputFilename}</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={config.outputName}
                          onChange={(e) => setConfig({ ...config, outputName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                          placeholder="MyScreensaver"
                        />
                        <span className="ml-2 text-slate-500 font-mono">.scr</span>
                      </div>
                    </div>

                    {/* Matrix controls */}
                    {config.template === 'matrix' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.colorSetting}</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={config.matrixCharColor}
                              onChange={(e) => setConfig({ ...config, matrixCharColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                            />
                            <span className="font-mono text-slate-300">{config.matrixCharColor}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.speedSetting}: {config.matrixSpeed}</label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={config.matrixSpeed}
                            onChange={(e) => setConfig({ ...config, matrixSpeed: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.sizeSetting}: {config.matrixCharSize}px</label>
                          <input
                            type="range"
                            min="12"
                            max="32"
                            value={config.matrixCharSize}
                            onChange={(e) => setConfig({ ...config, matrixCharSize: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.customText}</label>
                          <input
                            type="text"
                            value={config.matrixCustomText}
                            onChange={(e) => setConfig({ ...config, matrixCustomText: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Starfield controls */}
                    {config.template === 'starfield' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.starCountLabel}: {config.starCount}</label>
                          <input
                            type="range"
                            min="100"
                            max="800"
                            step="50"
                            value={config.starCount}
                            onChange={(e) => setConfig({ ...config, starCount: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.speedSetting}: {config.starSpeed}</label>
                          <input
                            type="range"
                            min="2"
                            max="15"
                            value={config.starSpeed}
                            onChange={(e) => setConfig({ ...config, starSpeed: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.colorSetting}</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={config.starColor}
                              onChange={(e) => setConfig({ ...config, starColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                            />
                            <span className="font-mono text-slate-300">{config.starColor}</span>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={config.starWarpEffect}
                            onChange={(e) => setConfig({ ...config, starWarpEffect: e.target.checked })}
                            className="rounded accent-cyan-500 w-4 h-4"
                          />
                          <span>{t.warpTrail}</span>
                        </label>
                      </>
                    )}

                    {/* Clock controls */}
                    {config.template === 'clock' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.colorSetting}</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={config.clockFontColor}
                              onChange={(e) => setConfig({ ...config, clockFontColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                            />
                            <span className="font-mono text-slate-300">{config.clockFontColor}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.clockFormat24h}
                              onChange={(e) => setConfig({ ...config, clockFormat24h: e.target.checked })}
                              className="rounded accent-cyan-500 w-4 h-4"
                            />
                            <span>{t.clockFormat}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.clockShowSeconds}
                              onChange={(e) => setConfig({ ...config, clockShowSeconds: e.target.checked })}
                              className="rounded accent-cyan-500 w-4 h-4"
                            />
                            <span>{t.showSeconds}</span>
                          </label>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.clockShowDate}
                            onChange={(e) => setConfig({ ...config, clockShowDate: e.target.checked })}
                            className="rounded accent-cyan-500 w-4 h-4"
                          />
                          <span>{t.showDate}</span>
                        </label>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.customMessage}</label>
                          <input
                            type="text"
                            value={config.clockCustomMessage}
                            onChange={(e) => setConfig({ ...config, clockCustomMessage: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Neon Waves controls */}
                    {config.template === 'neon_waves' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Color 1</label>
                            <input
                              type="color"
                              value={config.waveColor1}
                              onChange={(e) => setConfig({ ...config, waveColor1: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Color 2</label>
                            <input
                              type="color"
                              value={config.waveColor2}
                              onChange={(e) => setConfig({ ...config, waveColor2: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.speedSetting}: {config.waveSpeed}</label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={config.waveSpeed}
                            onChange={(e) => setConfig({ ...config, waveSpeed: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">Wave Count: {config.waveCount}</label>
                          <input
                            type="range"
                            min="2"
                            max="8"
                            value={config.waveCount}
                            onChange={(e) => setConfig({ ...config, waveCount: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Bouncing controls */}
                    {config.template === 'bouncing' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.customText}</label>
                          <input
                            type="text"
                            value={config.bouncingText}
                            onChange={(e) => setConfig({ ...config, bouncingText: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.colorSetting}</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={config.bouncingTextColor}
                              onChange={(e) => setConfig({ ...config, bouncingTextColor: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                            />
                            <span className="font-mono text-slate-300">{config.bouncingTextColor}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.speedSetting}: {config.bouncingSpeed}</label>
                          <input
                            type="range"
                            min="2"
                            max="12"
                            value={config.bouncingSpeed}
                            onChange={(e) => setConfig({ ...config, bouncingSpeed: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-400 mb-1">{t.sizeSetting}: {config.bouncingSize}px</label>
                          <input
                            type="range"
                            min="20"
                            max="64"
                            value={config.bouncingSize}
                            onChange={(e) => setConfig({ ...config, bouncingSize: Number(e.target.value) })}
                            className="w-full accent-cyan-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Exit Conditions */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="text-[11px] font-medium text-slate-400">{t.exitOptions}</div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.exitOnMouseMove}
                          onChange={(e) => setConfig({ ...config, exitOnMouseMove: e.target.checked })}
                          className="rounded accent-cyan-500 w-4 h-4"
                        />
                        <span>{t.exitOnMouse}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.exitOnKeyPress}
                          onChange={(e) => setConfig({ ...config, exitOnKeyPress: e.target.checked })}
                          className="rounded accent-cyan-500 w-4 h-4"
                        />
                        <span>{t.exitOnKey}</span>
                      </label>
                    </div>

                    {/* Multi-Monitor Mode Options */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                        <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.multiMonitorSettings}</span>
                      </div>
                      <div className="space-y-1.5">
                        <label className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          config.multiMonitorMode === 'all_screens' 
                            ? 'bg-cyan-950/40 border-cyan-500/70 text-white' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}>
                          <input
                            type="radio"
                            name="multiMonitorMode"
                            checked={config.multiMonitorMode === 'all_screens'}
                            onChange={() => setConfig({ ...config, multiMonitorMode: 'all_screens' })}
                            className="mt-0.5 accent-cyan-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{t.multiMonitorAllScreens}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.multiMonitorAllScreensDesc}</div>
                          </div>
                        </label>

                        <label className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          config.multiMonitorMode === 'primary_active_black_secondary' 
                            ? 'bg-cyan-950/40 border-cyan-500/70 text-white' 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}>
                          <input
                            type="radio"
                            name="multiMonitorMode"
                            checked={config.multiMonitorMode === 'primary_active_black_secondary'}
                            onChange={() => setConfig({ ...config, multiMonitorMode: 'primary_active_black_secondary' })}
                            className="mt-0.5 accent-cyan-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{t.multiMonitorPrimaryActive}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.multiMonitorPrimaryActiveDesc}</div>
                          </div>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Windows Forms / GDI+ 네이티브 C# 소스 코드 (.NET 4.0+ / csc.exe 자동 빌드 호환)
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-all border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? t.copied : t.copyCsSource}</span>
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[460px] leading-relaxed">
                    <code>{generateCSharpSource(config)}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-4 text-slate-300 text-xs leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400" />
                    {t.howScrWorks}
                  </h3>
                  <p className="text-slate-300">
                    {t.howScrWorksDesc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-mono text-cyan-400 font-bold">/s (Screensaver)</div>
                    <div className="text-slate-400">전체 화면 실행 모드. 모니터 전체에 테두리 없는 전체화면 폼을 띄우고 커서를 숨깁니다.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-mono text-cyan-400 font-bold">/c (Configure)</div>
                    <div className="text-slate-400">설정 모드. 윈도우 디스플레이 설정 창에서 [설정] 버튼을 클릭했을 때 옵션 대화상자를 띄웁니다.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-mono text-cyan-400 font-bold">/p &lt;HWND&gt; (Preview)</div>
                    <div className="text-slate-400">미리보기 모드. 윈도우 모니터 미리보기 상자(핸들)의 자식 창으로 연결(SetParent)하여 렌더링합니다.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-900/50 space-y-2.5">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>🖥️ 다중 모니터 (듀얼/트리플) 완벽 대응 아키텍처</span>
                  </div>
                  <ul className="text-slate-300 text-[11px] space-y-1.5 list-disc pl-4">
                    <li><strong className="text-white">모든 디스플레이 개별 인스턴스:</strong> <code className="text-cyan-300">Screen.AllScreens</code>를 순회하여 보조 모니터가 바탕화면으로 방치되는 현상 원천 차단</li>
                    <li><strong className="text-white">주 모니터 튕김 버그(Maximized Bug) 방지:</strong> WinForms의 Maximized 강제 스냅 버그를 해결하기 위해 <code className="text-cyan-300">FormWindowState.Normal</code> 및 정밀 좌표 바인딩 적용</li>
                    <li><strong className="text-white">Per-Monitor DPI 인식:</strong> 4K + FHD 등 배율이 서로 다른 모니터 간 화면 잘림이나 위치 어긋남을 막는 <code className="text-cyan-300">SetProcessDpiAwareness(2)</code> 내장</li>
                    <li><strong className="text-white">마우스 지터 필터:</strong> 디스플레이 간 경계 이동 및 책상 미세 진동으로 인한 오작동을 방지하는 15px 오차 허용 임계값 적용</li>
                    <li><strong className="text-white">OLED 번인 보호 모드:</strong> 보조 모니터를 순수 블랙(Pure Black)으로 암전 처리하여 전력 절감 및 번인 완벽 방지 지원</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="text-slate-400 font-sans font-semibold text-xs text-white">⚡ csc.exe 기본 내장 컴파일 명령 (추가 프로그램 설치 불필요):</div>
                  <div className="p-2.5 bg-black/50 rounded-lg text-emerald-400 border border-emerald-950">
                    %windir%\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /optimize+ /out:"{config.outputName}.scr" /reference:System.Windows.Forms.dll,System.Drawing.dll "{config.outputName}.cs"
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Bar Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToManager}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.addToManager}</span>
              </button>

              <button
                onClick={handleDownloadHtml}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t.downloadHtml}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadZip}
                disabled={isBuildingZip}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {isBuildingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>패키징 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{t.downloadPackage}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen Canvas Overlay */}
      {showFullscreenCanvas && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none"
          onClick={() => setShowFullscreenCanvas(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowFullscreenCanvas(false); }}
          tabIndex={0}
        >
          <canvas ref={fullCanvasRef} className="w-full h-full block" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/60 text-xs pointer-events-none">
            {lang === 'ko' ? '화면을 클릭하거나 ESC 키를 누르면 이전으로 돌아갑니다' : 'Click screen or press ESC to exit preview'}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/50 text-white text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
