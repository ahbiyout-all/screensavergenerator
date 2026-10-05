import { useState, useEffect, useCallback } from 'react';
import { checkGitHubRelease, ReleaseInfo, compareSemver } from '../services/updateService';
import { APP_VERSION, GITHUB_REPO_URL } from '../version';

export function useUpdateChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);

  const checkForUpdates = useCallback(async (manual = false) => {
    setIsChecking(true);
    setLastCheckMessage(null);

    try {
      const release = await checkGitHubRelease();

      if (!release) {
        if (manual) {
          setLastCheckMessage('github_no_release');
        }
        setIsChecking(false);
        return;
      }

      setReleaseInfo(release);
      const isNew = release.hasUpdate;
      setHasNewUpdate(isNew);

      if (isNew) {
        const dismissed = localStorage.getItem('dismissed_update_version');
        if (manual || dismissed !== release.version) {
          setShowUpdateModal(true);
        }
      } else {
        if (manual) {
          setLastCheckMessage('up_to_date');
        }
      }
    } catch (err) {
      console.error('[UpdateChecker] Error checking updates:', err);
      if (manual) {
        setLastCheckMessage('check_error');
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check once on app mount (after a 1.5s delay to ensure UI loads fast)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  const dismissUpdate = (neverShowAgain = false) => {
    if (neverShowAgain && releaseInfo) {
      localStorage.setItem('dismissed_update_version', releaseInfo.version);
    }
    setShowUpdateModal(false);
  };

  // Test simulation helper to preview the update popup
  const simulateUpdateNotification = () => {
    const mockRelease: ReleaseInfo = {
      tagName: 'v1.1.0',
      version: '1.1.0',
      name: '화면보호기설정 v1.1.0 정식 업데이트',
      body: `### 🌟 v1.1.0 주요 업데이트 내역
- 🚀 GitHub Releases 기반 실시간 자동 업데이트 알림 팝업 시스템 탑재
- 🛡️ Windows 레지스트리 보안 샌드박스 정책 완화 및 스크립트 실행 최적화
- 📱 모바일/웹 환경 배치 파일 즉시 복사 및 PWA 오프라인 캐싱 지원
- 🌐 영문 모드 시 스크립트 미리보기 및 생성 완벽 다국어 연동
- 📦 불필요한 빌드 산출물 .gitignore 전면 정비 (저장소 다이어트)`,
      publishedAt: new Date().toISOString(),
      htmlUrl: `${GITHUB_REPO_URL}/releases/tag/v1.1.0`,
      downloadUrl: `${GITHUB_REPO_URL}/releases/download/v1.1.0/화면보호기설정_v1.1.0.exe`,
      repoUrl: GITHUB_REPO_URL,
      hasUpdate: true,
    };

    setReleaseInfo(mockRelease);
    setHasNewUpdate(true);
    setShowUpdateModal(true);
  };

  return {
    isChecking,
    hasNewUpdate,
    releaseInfo,
    showUpdateModal,
    setShowUpdateModal,
    checkForUpdates,
    dismissUpdate,
    simulateUpdateNotification,
    lastCheckMessage,
    currentVersion: APP_VERSION,
  };
}
