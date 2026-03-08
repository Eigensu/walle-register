$appsDir = "c:\Users\Aanshuvi Shah\Desktop\Eigensu\WALL-E\walle-register\apps"

$files = Get-ChildItem -Path $appsDir -Recurse -Include "*.ts","*.tsx","*.py" -File |
  Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\.next\\" }

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  $original = $content

  # 1. Compound field names: jypl_s7 -> jmcl_s2 (must come first)
  $content = $content -replace 'JYPL_S7', 'JMCL_S2'
  $content = $content -replace 'jypl_s7', 'jmcl_s2'

  # 2. Standalone JYPL -> JMCL (remaining after compound handled)
  $content = $content -replace 'JYPL', 'JMCL'
  $content = $content -replace 'jypl', 'jmcl'
  $content = $content -replace 'Jypl', 'Jmcl'

  # 3. Season / S number replacements
  $content = $content -replace 'Season 8', 'Season 2'
  $content = $content -replace 'season 8', 'season 2'
  $content = $content -replace 'SEASON 8', 'SEASON 2'
  $content = $content -replace ' S8', ' S2'
  $content = $content -replace '"S8"', '"S2"'
  $content = $content -replace 'S8 ', 'S2 '

  if ($content -ne $original) {
    Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
    Write-Host "CHANGED: $($file.FullName)"
  }
}
Write-Host "Done."
