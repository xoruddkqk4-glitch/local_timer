@echo off
chcp 65001 > nul
title 05Timer 고가시성 오프라인 타이머 실행기

:: Get screen resolution via PowerShell
for /f "tokens=1,2 delims=," %%A in ('powershell -command "Add-Type -AssemblyName System.Windows.Forms; $s = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; Write-Output \"$([int]($s.Width/2)),$([int]($s.Height/2))\""') do (
    set WIDTH=%%A
    set HEIGHT=%%B
)

if "%WIDTH%"=="" set WIDTH=960
if "%HEIGHT%"=="" set HEIGHT=540

set HTML_PATH=%~dp0index.html

:: Try launching Chrome app window at (0,0) with 1/4 screen size
start chrome --app="file:///%HTML_PATH%" --window-position=0,0 --window-size=%WIDTH%,%HEIGHT% >nul 2>&1
if %errorlevel% neq 0 (
    :: Fallback to MS Edge app mode if Chrome is not installed
    start msedge --app="file:///%HTML_PATH%" --window-position=0,0 --window-size=%WIDTH%,%HEIGHT% >nul 2>&1
    if %errorlevel% neq 0 (
        :: Fallback to default browser
        start "" "%HTML_PATH%"
    )
)
