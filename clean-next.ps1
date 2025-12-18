# PowerShell script to forcefully delete .next folder with symlink handling
# This handles OneDrive-created symlinks that Next.js can't delete
# Usage: powershell -ExecutionPolicy Bypass -File "clean-next.ps1"

$nextPath = Join-Path $PSScriptRoot ".next"

# Stop Node processes first
Write-Host "Stopping Node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Start-Sleep -Seconds 2

if (Test-Path $nextPath) {
    Write-Host "Cleaning .next folder (handling symlinks)..." -ForegroundColor Yellow
    
    # Function to remove reparse points (symlinks/junctions)
    function Remove-ReparsePoints {
        param([string]$Path)
        
        Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                $item = $_
                $attributes = [System.IO.FileAttributes]$item.Attributes
                
                # Check if it's a reparse point (symlink/junction)
                if ($attributes -band [System.IO.FileAttributes]::ReparsePoint) {
                    Write-Host "Removing reparse point: $($item.FullName)" -ForegroundColor Cyan
                    
                    # Try fsutil to delete reparse point
                    $fsutilResult = & fsutil reparsepoint delete "$($item.FullName)" 2>&1
                    
                    if ($LASTEXITCODE -ne 0) {
                        # If fsutil fails, try direct deletion
                        try {
                            $item.Delete()
                        } catch {
                            Write-Host "  Warning: Could not delete $($item.FullName)" -ForegroundColor Yellow
                        }
                    }
                }
            } catch {
                # Ignore errors for individual items
            }
        }
    }
    
    # Remove all reparse points first (including nested ones like static/css)
    Write-Host "Removing symlinks and reparse points..." -ForegroundColor Yellow
    Remove-ReparsePoints -Path $nextPath
    
    # Also handle specific problematic paths that OneDrive often creates
    $problematicPaths = @(
        "$nextPath\static\css",
        "$nextPath\server\edge-runtime-webpack.js",
        "$nextPath\server\vendor-chunks"
    )
    
    foreach ($path in $problematicPaths) {
        if (Test-Path $path) {
            try {
                $item = Get-Item $path -Force -ErrorAction SilentlyContinue
                if ($item -and ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
                    Write-Host "  Removing reparse point: $path" -ForegroundColor Cyan
                    fsutil reparsepoint delete $path 2>&1 | Out-Null
                }
            } catch {
                # Ignore errors for individual paths
            }
        }
    }
    
    # Wait a bit for file system to catch up
    Start-Sleep -Seconds 1
    
    # Now try to delete the folder using multiple methods
    $attempts = 0
    $maxAttempts = 3
    
    while ((Test-Path $nextPath) -and ($attempts -lt $maxAttempts)) {
        $attempts++
        Write-Host "Deletion attempt $attempts of $maxAttempts..." -ForegroundColor Yellow
        
        try {
            # Method 1: PowerShell Remove-Item
            Remove-Item -Path $nextPath -Recurse -Force -ErrorAction Stop
            Write-Host "  Successfully deleted using Remove-Item" -ForegroundColor Green
        } catch {
            Write-Host "  Remove-Item failed, trying cmd rmdir..." -ForegroundColor Yellow
            try {
                # Method 2: CMD rmdir (handles some symlinks better)
                & cmd /c "rmdir /s /q `"$nextPath`""
                Start-Sleep -Seconds 1
            } catch {
                Write-Host "  CMD rmdir also failed, trying robocopy method..." -ForegroundColor Yellow
                try {
                    # Method 3: Robocopy mirror with empty folder
                    $emptyDir = Join-Path $PSScriptRoot ".next-empty-temp"
                    New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
                    & robocopy $emptyDir $nextPath /MIR /R:0 /W:0 | Out-Null
                    Remove-Item $emptyDir -Force -Recurse -ErrorAction SilentlyContinue
                    Remove-Item $nextPath -Force -Recurse -ErrorAction SilentlyContinue
                } catch {
                    Write-Host "  All methods failed" -ForegroundColor Red
                }
            }
        }
        
        if (Test-Path $nextPath) {
            Start-Sleep -Seconds 2
        }
    }
    
    if (Test-Path $nextPath) {
        Write-Host "`nERROR: Could not fully delete .next folder" -ForegroundColor Red
        Write-Host "The folder may be locked by OneDrive or another process." -ForegroundColor Yellow
        Write-Host "`nRecommendations:" -ForegroundColor Yellow
        Write-Host "1. Pause OneDrive syncing temporarily" -ForegroundColor White
        Write-Host "2. Close any file explorers with the folder open" -ForegroundColor White
        Write-Host "3. Move the project outside OneDrive folder" -ForegroundColor White
        exit 1
    } else {
        Write-Host "`nSUCCESS: .next folder deleted!" -ForegroundColor Green
    }
} else {
    Write-Host ".next folder does not exist - nothing to clean" -ForegroundColor Green
}


