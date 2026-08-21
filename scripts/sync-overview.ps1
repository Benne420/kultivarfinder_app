$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$jsonPath = Join-Path $root 'public\kultivare.json'
$thumbnailPath = Join-Path $root 'public\thumbnails'
$outputPath = Join-Path $root 'Kultivare_alle_Sorten.xlsx'

$data = Get-Content -Raw -Encoding UTF8 $jsonPath | ConvertFrom-Json
$thumbnailNames = @{}
Get-ChildItem $thumbnailPath -File | ForEach-Object {
    $thumbnailNames[$_.BaseName.ToLowerInvariant()] = $true
}

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$workbook = $null
$sheet = $null

try {
    $workbook = $excel.Workbooks.Add()
    $sheet = $workbook.Worksheets.Item(1)
    $sheet.Name = 'Alle Sorten'
    $sheet.Cells.Item(1, 1) = 'Sorte'
    $sheet.Cells.Item(1, 2) = 'Terpenprofil'
    $sheet.Cells.Item(1, 3) = 'Fotografiert'

    $row = 2
    foreach ($cultivar in $data) {
        $sheet.Cells.Item($row, 1) = [string]$cultivar.name
        $hasTerpeneProfile = $cultivar.terpenprofil -is [array] -and @($cultivar.terpenprofil).Count -gt 0
        $sheet.Cells.Item($row, 2) = if ($hasTerpeneProfile) { 'Ja' } else { 'Nein' }
        $thumbnailKey = ([string]$cultivar.name).Replace(' ', '_').ToLowerInvariant()
        $sheet.Cells.Item($row, 3) = if ($thumbnailNames.ContainsKey($thumbnailKey)) { 'Ja' } else { 'Nein' }
        $row++
    }

    $lastRow = $row - 1
    $header = $sheet.Range('A1:C1')
    $header.Font.Bold = $true
    $header.Interior.ColorIndex = 15
    $sheet.Range("A1:C$lastRow").AutoFilter() | Out-Null
    $sheet.Application.ActiveWindow.SplitRow = 1
    $sheet.Application.ActiveWindow.FreezePanes = $true
    $sheet.Columns.Item(1).ColumnWidth = 30
    $sheet.Columns.Item(2).ColumnWidth = 15
    $sheet.Columns.Item(3).ColumnWidth = 15
    $sheet.Range("A1:C$lastRow").WrapText = $true
    $workbook.SaveAs($outputPath, 51)
    Write-Output "Excel-Uebersicht aktualisiert: $($data.Count) Sorten"
}
finally {
    if ($workbook) { $workbook.Close($true) }
    $excel.Quit()
    if ($sheet) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($sheet) | Out-Null }
    if ($workbook) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null }
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
