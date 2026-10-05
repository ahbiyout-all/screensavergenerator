# 작업 로그 (Work Log)

> **프로젝트**: Windows 10/11 화면 보호기 설정 관리자 및 배치 파일 생성기 (`screensavergenerator`)  
> **개발자**: AhBiYout (Git: `AhBiYout-all`)  
> **소속**: [http://www.cisnet.co.kr/](http://www.cisnet.co.kr/) | **공식 블로그**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)  
> **GitHub 저장소**: [https://github.com/AhBiYout/screensavergenerator](https://github.com/AhBiYout/screensavergenerator)

---

## 📅 2026-10-05: GitHub 자동 푸시 및 배포 파이프라인 구축 (v1.1.0)

### 1. 작업 개요
- 모바일(APK) 및 iOS 설정 제거 후 **Windows 전용(PC) 단독 타겟 최적화**.
- GitHub 자동 푸시 스크립트(`scripts/github-push.bat`, `push.bat`, `github-push.bat`, `scripts/github-push.ps1`, `scripts/github-sync.sh`) 구현.
- Single Source of Truth 기반 다단 동적 버전 추출 메커니즘 (Node.js `package.json` ➔ PowerShell ➔ `docs/PATCHNOTES.md` 정규식 파싱 ➔ v%APP_VER%).
- GitHub Actions CI/CD 워크플로우(`.github/workflows/release.yml`)와 태그(`v%APP_VER%`) 연동.
- GitHub Releases 기반 실시간 자동 업데이트 알림 팝업 모달(`UpdateModal.tsx`, `useUpdateChecker.ts`) 탑재.
- 대용량 캐시 및 바이너리 누출 방지를 위한 `.gitignore` 정밀 고도화.

### 2. 세부 산출물
1. `push.bat` / `github-push.bat`:
   - 루트 경로에서 원클릭으로 Git 초기화, 원격 저장소(`origin`) 연결, 커밋, 태깅(`vX.Y.Z`), 푸시를 자동 수행.
2. `scripts/github-push.bat` & `scripts/github-push.ps1`:
   - 콘솔 창 타이틀 동적 동기화 (`title AhBiYout Screensaver Generator - GitHub Push Pipeline [v%APP_VER%]`).
   - Windows CRLF 인코딩 적용.
3. `scripts/ensure-crlf.js`:
   - 모든 배치 스크립트의 CRLF 줄바꿈 규격 자동 검증 및 보정.
4. `.github/workflows/release.yml`:
   - `v*.*.*` 태그 푸시 시 `windows-latest` 러너에서 Tauri 데스크톱 앱(`.exe` / `.msi`) 빌드 및 GitHub Releases 자산 자동 첨부.
