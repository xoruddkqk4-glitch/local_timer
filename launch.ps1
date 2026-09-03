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

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$width = [int]($screen.Width / 2)
$height = [int]($screen.Height / 2)

$htmlPath = "$PSScriptRoot\index.html".Replace('\', '/')
$fileUrl = "file:///$htmlPath"

$chrome64 = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
$chrome86 = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
$edge86 = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$edge64 = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"

$browser = $null
if (Test-Path $chrome64) { $browser = $chrome64 }
elseif (Test-Path $chrome86) { $browser = $chrome86 }
elseif (Test-Path $edge86) { $browser = $edge86 }
elseif (Test-Path $edge64) { $browser = $edge64 }

if ($browser) {
    $proc = Start-Process $browser -ArgumentList "--app=`"$fileUrl`"", "--window-position=0,0", "--window-size=$width,$height" -PassThru
    Start-Sleep -Milliseconds 600
    if ($proc -and $proc.MainWindowHandle) {
        [Win32Window]::SetTopMost($proc.MainWindowHandle)
    }
} else {
    Start-Process $fileUrl
}
