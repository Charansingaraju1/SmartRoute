param(
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Runtime.WindowsRuntime

$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]

function Invoke-WinRtAsync($asyncOp, [Type]$resultType) {
    $type = [System.WindowsRuntimeSystemExtensions]
    $m = $type.GetMethod("AsTask", [Type[]]@($asyncOp.GetType()))
    if ($null -eq $m) {
        $methods = $type.GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.IsGenericMethodDefinition -and $_.GetParameters().Length -eq 1 }
        foreach ($cand in $methods) {
            try {
                $constructed = $cand.MakeGenericMethod($resultType)
                $task = $constructed.Invoke($null, @($asyncOp))
                $task.Wait()
                return $task.Result
            } catch {}
        }
    } else {
        $task = $m.Invoke($null, @($asyncOp))
        $task.Wait()
        return $task.Result
    }
    throw "Unable to convert async op to task"
}

$fullPath = [System.IO.Path]::GetFullPath($ImagePath)
$file = Invoke-WinRtAsync ([Windows.Storage.StorageFile]::GetFileFromPathAsync($fullPath)) ([Windows.Storage.StorageFile])
$stream = Invoke-WinRtAsync ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Invoke-WinRtAsync ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Invoke-WinRtAsync ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
    $lang = [Windows.Globalization.Language]::new("en-US")
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
}

$result = Invoke-WinRtAsync ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

if ($null -ne $result -and $null -ne $result.Text) {
    [Console]::Out.WriteLine($result.Text)
}
