# Renames --re- CSS variable prefix to --ee- across the remaining JS files.
# Order matters: longer/prefix names first to avoid clipping (e.g. border2 before border).
# Run this from C:\Users\tr4k2\Code\Eternal Empire

$files = @(
    "assets\js\army-simulator.js",
    "assets\js\battle-simulator.js",
    "assets\js\breeding-analyzer.js",
    "assets\js\council-of-research.js"
)

$replacements = @(
    @{ Find = '--re-border2';  Replace = '--ee-border2' },
    @{ Find = '--re-surface2'; Replace = '--ee-surface2' },
    @{ Find = '--re-border';   Replace = '--ee-border' },
    @{ Find = '--re-surface';  Replace = '--ee-surface' },
    @{ Find = '--re-yellow';   Replace = '--ee-yellow' },
    @{ Find = '--re-red';      Replace = '--ee-red' },
    @{ Find = '--re-white';    Replace = '--ee-white' },
    @{ Find = '--re-purple';   Replace = '--ee-purple' },
    @{ Find = '--re-crimson';  Replace = '--ee-crimson' },
    @{ Find = '--re-dark';     Replace = '--ee-dark' },
    @{ Find = '--re-gold';     Replace = '--ee-gold' }
)

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        Write-Host "SKIP (not found): $file" -ForegroundColor Yellow
        continue
    }

    # Read as raw UTF-8 (no BOM) to avoid encoding corruption
    $content = [System.IO.File]::ReadAllText($file, [System.Text.UTF8Encoding]::new($false))

    $before = ($content -split '--re-').Count - 1

    foreach ($r in $replacements) {
        $content = $content.Replace($r.Find, $r.Replace)
    }

    $after = ($content -split '--re-').Count - 1

    # Write back as UTF-8 without BOM
    [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))

    Write-Host "$file : $before matches before -> $after remaining after" -ForegroundColor Cyan
}

Write-Host "`nDone. Now run node --check on each file, then the Select-String verification." -ForegroundColor Green
