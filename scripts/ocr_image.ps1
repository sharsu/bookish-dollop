param(
  [Parameter(Mandatory = $true)]
  [string]$ImagePath
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await-WinRT {
  param(
    [Parameter(Mandatory = $true)]$Operation,
    [Parameter(Mandatory = $true)][Type]$ResultType
  )

  $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 } |
    Select-Object -First 1

  $task = $asTaskGeneric.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.Wait()
  return $task.Result
}

$StorageFile = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$FileAccessMode = [Windows.Storage.FileAccessMode, Windows.Storage, ContentType=WindowsRuntime]
$BitmapDecoder = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$SoftwareBitmap = [Windows.Graphics.Imaging.SoftwareBitmap, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$BitmapPixelFormat = [Windows.Graphics.Imaging.BitmapPixelFormat, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$BitmapAlphaMode = [Windows.Graphics.Imaging.BitmapAlphaMode, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
$OcrEngine = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime]
$OcrResult = [Windows.Media.Ocr.OcrResult, Windows.Foundation, ContentType=WindowsRuntime]
$RandomAccessStream = [Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType=WindowsRuntime]

$resolvedPath = (Resolve-Path $ImagePath).Path
$file = Await-WinRT ($StorageFile::GetFileFromPathAsync($resolvedPath)) $StorageFile
$stream = Await-WinRT ($file.OpenAsync($FileAccessMode::Read)) $RandomAccessStream
$decoder = Await-WinRT ($BitmapDecoder::CreateAsync($stream)) $BitmapDecoder
$bitmap = Await-WinRT ($decoder.GetSoftwareBitmapAsync()) $SoftwareBitmap
$converted = $SoftwareBitmap::Convert($bitmap, $BitmapPixelFormat::Bgra8, $BitmapAlphaMode::Premultiplied)
$engine = $OcrEngine::TryCreateFromUserProfileLanguages()
$result = Await-WinRT ($engine.RecognizeAsync($converted)) $OcrResult

Write-Output $result.Text
