# 소프트웨어 버전 관리 규정 (Semantic Versioning Guide)

> **Copyright © AhBiYout All rights reserved.**  
> 개발자: AhBiYout | 소속: [http://www.cisnet.co.kr/](http://www.cisnet.co.kr/) | 구글 블로그: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)

본 프로젝트는 **유의적 버전(Semantic Versioning 2.0.0, MAJOR.MINOR.PATCH)** 표준 명세를 준수하여 코드 변경 규모에 따라 버전을 3단계로 명확히 분리하여 관리합니다.

---

## 1. 버전 체계 (Semantic Versioning 3단계)

버전 번호 형식: `MAJOR.MINOR.PATCH` (예: `1.0.5`)

```
 v 1 . 0 . 5
   │   │   └── PATCH: 하위 호환 버그 수정, 문서/메타데이터 업데이트, 소규모 최적화
   │   └────── MINOR: 하위 호환되는 신규 기능 추가, UI 개편
   └────────── MAJOR: 기존 버전과 호환되지 않는 중대한 아키텍처/API/구조 변경
```

### 1) MAJOR 버전 (x.0.0)
- **적용 기준**:
  - 기존 레지스트리/배치 스크립트 규격과 호환되지 않는 대대적인 브레이킹 체인지(Breaking Changes) 발생 시
  - 프레임워크 또는 백엔드 코어(예: Tauri v2 → v3) 전면 재설계
  - 지원 OS 아키텍처 대규모 변경
- **예시**: `1.0.5` → `2.0.0`

### 2) MINOR 버전 (1.x.0)
- **적용 기준**:
  - 기존 동작 및 호환성을 유지하면서 새로운 화면 보호기 제어 기능이 추가될 때
  - 새로운 내보내기 포맷 지원 (예: PowerShell 스크립트 .ps1 내보내기, GPO 연동 등)
  - 새로운 사용자 설정 옵션이나 UI 레이아웃의 유의미한 기능 확장
- **예시**: `1.0.5` → `1.1.0`

### 3) PATCH 버전 (1.0.x)
- **적용 기준**:
  - 기존 기능의 버그 수정 (한글 인코딩, 파일 다이얼로그 경로 오류, 빌드 스크립트 호환성 등)
  - 소속, 개발자, 블로그 링크 등 메타데이터 및 UI 텍스트 보강
  - 문서(`docs/` 폴더) 업데이트 및 자동 빌드 스크립트(`build.bat`) 최적화
- **예시**: `1.0.4` → `1.0.5`

---

## 2. 코드 수정 및 특이점 발생 시 동기화 체크리스트

코드 수정 시 특이점(기능 추가, 버그 수정, 빌드 스크립트 변경, 메타데이터 갱신 등)이 오면 다음 파일들의 버전 정보를 일괄 동기화해야 합니다:

| 순번 | 대상 파일 | 수정 항목 | 설명 |
|---|---|---|---|
| 1 | `package.json` | `"version": "x.y.z"` | Node.js 프로젝트 기준 버전 (Single Source of Truth) |
| 2 | `src-tauri/tauri.conf.json` | `"version": "x.y.z"` | Tauri 실행 파일 메타데이터 버전 |
| 3 | `src/App.tsx` | 헤더 배지 & 푸터 텍스트 | 사용자 화면(UI)에 노출되는 버전 배지 |
| 4 | `scripts/generate-bat.js` | fallback 버전 및 build.bat 생성 | `node scripts/generate-bat.js` 실행 |
| 5 | `scripts/copy-release.js` | fallback 버전 | 릴리스 복사본 파일명 (`화면보호기설정_vx.y.z.exe`) |
| 6 | `docs/PATCHNOTES.md` / `PATCH_NOTES.md` | `## 📌 vx.y.z (YYYY-MM-DD)` | 변경 사항, 원인 및 해결책 기록 |
| 7 | `docs/README.md` & `MANUAL.md` | 버전 및 변경 내역 안내 | 프로젝트 전반 안내문 및 사용자 매뉴얼 동기화 |
| 8 | `docs/WorkLog.md` | 작업 로그 갱신 | 개발 작업 내역 및 산출물 파일 기록 |
| 9 | `docs/BLOG_POST.md` | 블로그 게시 원고 동기화 | 공식 구글 블로그 소개글 및 릴리스 노트 갱신 |

---

## 3. 자동 빌드 및 릴리스 파일 생성 흐름

1. Windows 환경에서 `build.bat` 실행 (또는 `npm run build:exe`)
2. 사용자 포트 번호 입력 (기본값: 3036)
3. `build.bat`가 `package.json`의 `version` 필드를 자동 추출 (`APP_VERSION`)
4. Web 빌드(`vite build`) 및 Tauri 컴파일(`tauri build --no-bundle`) 수행
5. `scripts/copy-release.js`가 컴파일된 실행 파일을 감지하여:
   - `release/화면보호기설정_v${APP_VERSION}.exe`
   - `release/ScreensaverSetup_v${APP_VERSION}.exe`
   - `release/화면보호기설정.exe`
   - `release/ScreensaverSetup.exe`
   총 4가지 규격의 네이티브 파일로 안전 복사 및 패키징 완료.
