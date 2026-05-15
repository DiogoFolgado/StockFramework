# Version Bump Script — StockFramework

## Versioning Convention
File is renamed on major releases: `stock_framework_v{N}_{patch}.html`
Example: `stock_framework_v5_25.html` → `stock_framework_v6_00.html`

## How to Version Bump
Since there is no build system, versioning is manual:

1. Make your changes in the current file
2. For a minor patch: update the patch number in the filename
   ```
   stock_framework_v5_25.html → stock_framework_v5_26.html
   ```
3. For a major feature addition: bump the major version
   ```
   stock_framework_v5_25.html → stock_framework_v6_00.html
   ```

## PowerShell Rename Command
```powershell
# Minor patch bump (25 → 26)
Rename-Item "stock_framework_v5_25.html" "stock_framework_v5_26.html"

# Major version bump
Rename-Item "stock_framework_v5_25.html" "stock_framework_v6_00.html"
```

## Changelog Format
Track changes in `docs/CHANGELOG.md` — add a new entry for each version.
