Add-Type -AssemblyName System.Windows.Forms

$code = @"
using System;
using System.Runtime.InteropServices;

public class Win32Window {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_SHOWWINDOW = 0x0040;

    public static void SetTopMost(IntPtr hWnd) {
        if (hWnd != IntPtr.Zero) {
            SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
        }
    }
}
"@

Add-Type -TypeDefinition $code

# Calculate 1/4 screen bounds (50% W, 50% H)
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$width = [int]($screen.Width / 2)
$height = [int]($screen.Height / 2)

# Convert local HTML path to proper URI regardless of folder location or non-ASCII/space characters
$htmlFile = Join-Path $PSScriptRoot "index.html"
$fileUri = ([System.Uri]$htmlFile).AbsoluteUri

# 1. Search Chrome in all standard locations (User LocalAppData + ProgramFiles)
$chromeCandidates = @(
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$chromeExe = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

# 2. Search Edge in all standard locations
$edgeCandidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
)
$edgeExe = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

# Select preferred browser
$browserExe = $null
if ($chromeExe) {
    $browserExe = $chromeExe
} elseif ($edgeExe) {
    $browserExe = $edgeExe
}

if ($browserExe) {
    Start-Process -FilePath $browserExe -ArgumentList "--app=$fileUri", "--window-position=0,0", "--window-size=$width,$height"
} else {
    # Fallback to default system browser
    Start-Process $fileUri
}
