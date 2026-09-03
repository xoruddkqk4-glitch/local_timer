Add-Type -AssemblyName System.Windows.Forms
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
    Start-Process $browser -ArgumentList "--app=`"$fileUrl`"", "--window-position=0,0", "--window-size=$width,$height"
} else {
    Start-Process $fileUrl
}
