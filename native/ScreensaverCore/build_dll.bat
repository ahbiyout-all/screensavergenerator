@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================================
echo   ScreensaverCore.dll - Native DLL Build Script
echo ========================================================
echo   Target: Windows x64 / x86 Pure C Native DLL
echo   Developer: AhBiYout (AhBiYout-all)
echo ========================================================
echo.

set "OUTPUT_DIR=%~dp0..\..\src-tauri\bin"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

where cl >nul 2>&1
if %errorlevel% equ 0 (
    echo [Compiler] Detected Microsoft Visual C++ Compiler (cl.exe)
    echo [Build] Compiling ScreensaverCore.dll with Static CRT (/MT) and Max Speed (/O2)...
    
    cl /nologo /O2 /W4 /MT /LD /DSCREENSAVER_CORE_EXPORTS ^
       "%~dp0src\ScreensaverCore.c" ^
       /link /DEF:"%~dp0ScreensaverCore.def" ^
       Advapi32.lib User32.lib Shell32.lib ^
       /OUT:"%OUTPUT_DIR%\ScreensaverCore.dll"
       
    if %errorlevel% equ 0 (
        echo.
        echo [SUCCESS] ScreensaverCore.dll successfully built with MSVC!
        echo Artifact: %OUTPUT_DIR%\ScreensaverCore.dll
        goto done
    )
)

where gcc >nul 2>&1
if %errorlevel% equ 0 (
    echo [Compiler] Detected GCC Compiler (MinGW-w64)
    echo [Build] Compiling ScreensaverCore.dll...
    
    gcc -shared -O3 -s -Wall -DSCREENSAVER_CORE_EXPORTS ^
        "%~dp0src\ScreensaverCore.c" ^
        "%~dp0ScreensaverCore.def" ^
        -ladvapi32 -luser32 -lshell32 ^
        -o "%OUTPUT_DIR%\ScreensaverCore.dll"
        
    if %errorlevel% equ 0 (
        echo.
        echo [SUCCESS] ScreensaverCore.dll successfully built with GCC!
        echo Artifact: %OUTPUT_DIR%\ScreensaverCore.dll
        goto done
    )
)

echo [Notice] Neither cl.exe nor gcc was found in PATH.
echo To build ScreensaverCore.dll manually:
echo   1. Open 'x64 Native Tools Command Prompt for VS 2022'
echo   2. Run this script: %~nx0
echo   3. Or Rust Tauri backend will use the embedded Win32 FFI module directly!

:done
echo.
pause
