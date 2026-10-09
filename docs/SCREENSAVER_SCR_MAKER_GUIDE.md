# Windows 화면 보호기(.scr) 제작 스튜디오 개발 및 동작 원리 가이드
> **문서 버전:** 1.0.0  
> **대상 플랫폼:** Windows 10, Windows 11 (Win32 / .NET Framework 4.0+)  
> **저작권 및 제작:** Screensaver Manager (AhBiYout / cisnet)

---

## 1. 윈도우 화면 보호기(.scr)란 무엇인가?

윈도우 화면 보호기(`.scr`)는 특별한 전용 포맷이 아니라, **확장자만 `.scr`로 변경된 표준 Win32 PE(Portable Executable) 실행 파일(`exe`)**입니다.

윈도우 운영체제(Windows Explorer 및 Desktop Window Manager)는 사용자의 유휴 시간(Idle time)이 도달하거나 제어판에서 테스트할 때 지정된 `.scr` 파일을 실행하며, 이때 **특정 명령줄 인자(Command Line Switches)**를 전달합니다.

### 표준 명령줄 인자 규격 (Windows Screen Saver Protocol)

| 인자 (Switch) | 동작 설명 | 비고 |
|---|---|---|
| **`/s`** | **화면 보호기 전체 화면 실행 (Screensaver Mode)** | 모니터 전체에 테두리 없는 전체화면 창을 띄우고 커서를 숨기며 렌더링 시작 |
| **`/c`** 또는 **`/c:HWND`** | **환경 설정 대화상자 (Configuration Mode)** | 제어판 화면 보호기 설정 창에서 [설정(C)] 버튼 클릭 시 호출 |
| **`/p <HWND>`** | **미니 모니터 미리보기 (Preview Mode)** | 제어판 창 내부의 작은 모니터 모형(HWND)에 자식 창(`SetParent`)으로 렌더링 |
| 인자 없음 | 기본적으로 `/c` (설정) 또는 `/s` (실행)로 폴백 | 탐색기에서 더블클릭 시 실행 |

---

## 2. 무설치(Zero-Dependency) C# 자동 컴파일 원리

본 스튜디오에서 생성하는 `.scr` 빌드 패키지는 **Visual Studio, .NET SDK, C++ 빌드 도구 등을 전혀 설치할 필요가 없습니다.**

### 윈도우 기본 내장 C# 컴파일러 (`csc.exe`) 활용
모든 Windows 7, 8, 10, 11 운영체제에는 `.NET Framework 4.0/4.8` 런타임 및 **C# 컴파일러(`csc.exe`)**가 기본 시스템 폴더에 탑재되어 있습니다:
- **64비트:** `%windir%\Microsoft.NET\Framework64\v4.0.30319\csc.exe`
- **32비트:** `%windir%\Microsoft.NET\Framework\v4.0.30319\csc.exe`

### 1-클릭 컴파일 명령 (`Build_Scr.bat`)
```cmd
"%windir%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" ^
  /target:winexe ^
  /optimize+ ^
  /platform:anycpu ^
  /out:"MyScreensaver.scr" ^
  /reference:System.Windows.Forms.dll,System.Drawing.dll ^
  "MyScreensaver.cs"
```
* **소요 시간:** 약 **0.3초 ~ 0.8초** 만에 독립 실행 가능한 완제품 `.scr` 바이너리가 생성됩니다.

---

## 3. 화면 보호기 템플릿 사양

본 스튜디오는 5종의 고품질 실시간 애니메이션 엔진을 제공합니다:

### 1. Matrix Digital Rain (매트릭스 코드 비)
- 네온 녹색(또는 사용자 지정 색상) 디지털 문자 낙하
- 선두 문자 고휘도 발광(White Head) 및 8단계 페이드 아웃 꼬리(Fade Trail)
- 캔버스 실시간 컬럼 계산 및 무작위 재생성

### 2. 3D Space Starfield Warp (3차원 우주 워프)
- 3차원 투영 공식($X' = X \cdot \frac{K}{Z}$, $Y' = Y \cdot \frac{K}{Z}$)을 적용한 60FPS 항성 워프
- 고속 워프 시 이전 좌표와 연결되는 벡터 잔상(Warp Trail Effect)

### 3. Minimal Clock & Date (미니멀 시계 및 날짜)
- 24시간 / 12시간 표기 모드 및 초 단위 표기 토글
- 현재 시스템 날짜 및 요일 한글/영문 자동 포맷팅
- 커스텀 다짐 문구 또는 명언 삽입 지원

### 4. Cyber Neon Waves (네온 사이버 웨이브)
- 다중 고조파 사인파($\sin(x \cdot \omega + \phi)$) 복합 궤적
- 듀얼 컬러 네온 발광 효과(Glow Shader)

### 5. Bouncing Text / Logo (바운싱 텍스트/로고)
- 고전 DVD 로고 바운스 스타일의 경계면 완전 탄성 충돌
- 사용자 지정 텍스트 및 로고 컬러 지원

---

## 4. 설치 및 윈도우 등록 방법

### 방법 A: 우클릭 설치 (가장 간편)
1. 생성된 `[파일명].scr` 파일을 마우스 우클릭합니다.
2. 메뉴에서 **[설치(I)]**를 클릭합니다.
3. 윈도우가 자동으로 해당 `.scr`을 활성 화면 보호기로 등록하고 [화면 보호기 설정] 창을 엽니다.

### 방법 B: `Install.bat` 자동 설치 스크립트 실행
- 패키지에 동봉된 `Install.bat`을 실행하면:
  1. `C:\Windows\System32\` 폴더에 `.scr` 파일 복사
  2. 레지스트리 `HKCU\Control Panel\Desktop\SCRNSAVE.EXE`에 즉시 등록
  3. 실시간 테스트 및 윈도우 설정 창 호출 메뉴 제공

### 방법 C: 화면 보호기 관리자 앱에서 직접 선택
1. 본 앱의 `.scr 제작 스튜디오`에서 **[현재 화면 보호기 목록에 추가]** 버튼 클릭
2. 메인 화면의 화면 보호기 드롭다운에서 선택 후 **[설정 적용]** 클릭

---

## 5. C# Win32 구현 세부 기술

### 마우스 흔들림 민감도 필터링
책상 진동 등으로 마우스가 1~2픽셀 미세하게 움직였을 때 화면 보호기가 즉시 꺼지는 오작동을 방지하기 위해 5픽셀 이상의 유효 이동이 감지될 때만 종료하도록 설계되었습니다:
```csharp
if (!mouseLocation.IsEmpty)
{
    // 다중 모니터 경계선 이동 및 데스크 진동 방지 (15px 임계값)
    if (Math.Abs(mouseLocation.X - e.X) > 15 || Math.Abs(mouseLocation.Y - e.Y) > 15)
    {
        Application.Exit();
    }
}
mouseLocation = e.Location;
```

### 더블 버퍼링(Double Buffering) 60FPS 무깜빡임 렌더링
```csharp
this.DoubleBuffered = true;
this.SetStyle(
    ControlStyles.AllPaintingInWmPaint | 
    ControlStyles.UserPaint | 
    ControlStyles.OptimizedDoubleBuffer, 
    true
);
```
화면 깜빡임(Flickering) 없이 부드러운 60프레임 그래픽을 보장합니다.

---

## 6. 다중 모니터 (듀얼/트리플) 환경 고려 사항 및 필수 해결책

모니터를 2개 이상 사용하는 듀얼/트리플 모니터 환경에서 화면 보호기를 제작하거나 동작시킬 때 반드시 고려해야 하는 5가지 핵심 기술 과제와 적용 솔루션입니다:

### 1) 보조 모니터 방치 및 OLED 번인(Burn-in) 문제
* **문제점:** Windows의 구형 기본 화면 보호기나 일반적인 프로그램은 `Screen.PrimaryScreen`(주 모니터) 하나에만 창을 띄웁니다. 이 경우 보조 모니터에는 기존 작업 창이나 민감한 개인 정보가 그대로 노출되며, OLED 모니터의 경우 정적 화면이 계속 켜져 있어 **영구 번인(Burn-in) 위험**이 발생합니다.
* **해결책:** `Screen.AllScreens` 배열을 순회하여 **모든 연결된 디스플레이마다 전체화면 창을 생성**해야 합니다.
  - **옵션 A (전체 실행):** 모든 모니터에 독립된 애니메이션 인스턴스를 실행하여 일체감 있는 비주얼 연출.
  - **옵션 B (보조 모니터 암전):** 주 모니터에서만 애니메이션을 돌리고, 보조 모니터는 순수 블랙 스크린(`Color.Black`)으로 덮어 전력 절감과 번인을 원천 차단.

### 2) WinForms의 `WindowState.Maximized` 주 모니터 튕김 버그
* **문제점:** Windows Forms에서 보조 모니터의 좌표(`screen.Bounds`)를 창에 할당하더라도 `this.WindowState = FormWindowState.Maximized`를 호출하면, Windows 운영체제가 해당 창을 강제로 **주 모니터(Primary Monitor)로 낚아채서 최대화**하는 고질적인 버그가 발생합니다.
* **해결책:** 
  ```csharp
  this.StartPosition = FormStartPosition.Manual;
  this.Bounds = screen.Bounds;               // 각 모니터의 물리 좌표와 해상도 지정
  this.FormBorderStyle = FormBorderStyle.None;
  this.WindowState = FormWindowState.Normal;   // ★ Maximized가 아닌 Normal 유지 필수!
  ```

### 3) Per-Monitor DPI Scaling (이종 해상도/배율 불일치)
* **문제점:** 주 모니터가 4K(배율 150%)이고 보조 모니터가 FHD(배율 100%)인 경우, 프로세스가 DPI Aware하지 않으면 Windows Desktop Window Manager(DWM)가 가상 비트맵 확대를 적용합니다. 이로 인해 보조 모니터의 화면 보호기 창이 일부 잘리거나, 주 모니터 쪽으로 삐져나오거나, 폰트와 렌더링이 흐릿해집니다.
* **해결책:** 프로그램 시작 시점에 Per-Monitor DPI 인식 P/Invoke 호출:
  ```csharp
  [DllImport("shcore.dll")]
  static extern int SetProcessDpiAwareness(int awareness);

  // Main() 진입 직후 호출: 2 = PROCESS_PER_MONITOR_DPI_AWARE
  SetProcessDpiAwareness(2);
  ```

### 4) 마우스 이동 종료 감도 및 일괄 종료(Exit Sync) 동기화
* **문제점:** 
  - 모니터가 2개 이상일 때 마우스 커서가 모니터 경계선에 걸쳐 있거나 배율이 전환될 때 윈도우 마우스 좌표 점프 현상으로 실행되자마자 즉시 꺼질 수 있습니다.
  - 어느 한 화면에서 마우스나 키보드 입력이 발생했을 때 다른 모니터의 창도 빠짐없이 동시에 꺼져야 합니다.
* **해결책:**
  - 마우스 이동 임계값을 15px로 지정하여 미세 지터(Jitter) 무시:
    ```csharp
    if (!mouseLocation.IsEmpty)
    {
        if (Math.Abs(mouseLocation.X - e.X) > 15 || Math.Abs(mouseLocation.Y - e.Y) > 15)
        {
            Application.Exit();
        }
    }
    ```
  - 어느 폼이든 이벤트 감지 시 `Application.Exit()`을 호출하여 프로세스 전체의 모든 화면 보호기 폼을 일괄 안전 종료.

### 5) 그래픽 자원 소비 분산 및 하드웨어 가속 최적화
* **문제점:**
  - 3개 이상의 모니터(예: 트리플 4K 모니터)에서 고해상도 그래픽 연산을 동시에 60FPS로 돌릴 경우 GPU/CPU 점유율이 급증하여 불필요한 발열과 전력 낭비가 발생합니다.
* **해결책:**
  - `primary_active_black_secondary` 모드를 제공하여 사용자가 보조 모니터는 타이머 렌더링을 완전히 바이패스하고 단순한 흑색 배경으로 유지할 수 있도록 지원.
  - 화면 보호기 동작 타이머 인터벌을 16ms(60FPS)로 고정하고, `Invalidate()` 영역 최소화 및 더블 버퍼링 기법을 적용하여 CPU 점유율을 1~2% 미만으로 유지.

---

## 7. 🚀 다중 모니터 배포 점검 체크리스트

1. [x] **DPI 인식**: `shcore.dll!SetProcessDpiAwareness(2)`를 통한 Per-Monitor v2 DPI 인식 적용 여부
2. [x] **화면 수집**: `Screen.AllScreens`를 순회하여 모든 모니터의 사각 영역(`Bounds`)을 개별 윈도우로 생성했는가?
3. [x] **최대화 방지**: `WindowState`를 `Maximized`가 아닌 `Normal`로 유지하고 `Bounds`를 수동 설정했는가?
4. [x] **지터 필터**: 마우스 이동 임계값(15px)을 적용하여 DPI 전환 시 오작동을 차단했는가?
5. [x] **동시 종료**: 임의의 모니터에서 입력 발생 시 모든 창이 동기화되어 일괄 종료되는가?
6. [x] **CLI 매개변수**: Windows 제어판의 `/p <HWND>`, `/c`, `/s` 파라미터가 정상 분기되는가?


