$source = Get-ChildItem 'd:\MAS-Website\MAS-Website\MAS\assets\img' | Where-Object { $_.Name -like '*Statement*' }
if ($source) {
    Write-Host "Found: $($source.FullName)"
    Write-Host "Name: $($source.Name)"
    $dest = 'd:\MAS-Website\MAS-Website\MAS\assets\img\Statement-of-Facts'
    Move-Item -LiteralPath $source.FullName -Destination $dest -Force
    Write-Host "Renamed to: $dest"
}
