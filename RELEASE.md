# Release Checklist for POS System Executable

## Building the Release

### 1. Prepare Build Environment
```bash
# Clean previous builds
npm run clean

# Install fresh dependencies
npm install
```

### 2. Build the Distribution Package
```bash
# Build executable and create distribution package
npm run package
```

### 3. Verify the Package
```bash
# Run verification script
npm run verify
```

Expected output:
- ✅ All required files present
- ✅ Executable size ~50MB
- ✅ All static assets included

### 4. Create Distribution Archive

**On Linux/Mac:**
```bash
cd dist && zip -r ../pos-system-dist.zip *
```

**On Windows:**
```cmd
cd dist
7z a ../pos-system-dist.zip *
```

Or use Windows Explorer to right-click → "Send to" → "Compressed (zipped) folder"

## Pre-Release Testing

### Automated Tests
- [x] Build process completes without errors
- [x] Package script copies all files
- [x] Verification script passes
- [x] Security scan passes (no vulnerabilities)

### Manual Tests (Windows Required)
- [ ] Extract ZIP to test folder
- [ ] Run start.bat
- [ ] Verify server starts correctly
- [ ] Access http://localhost:3000
- [ ] Test admin login (password: admin123)
- [ ] Create a table
- [ ] Create a product
- [ ] Create an order
- [ ] Process payment
- [ ] Generate report
- [ ] Export to Excel
- [ ] Stop server cleanly
- [ ] Restart and verify data persistence

## Release Assets

### Files to Upload
1. **pos-system-dist.zip** - Complete distribution package
   - Size: ~50MB
   - Contains: executable, config, public/, README, batch file

### Release Notes Template

```markdown
# Restaurant POS System v0.1.0 - Windows Executable

## What's New
- Standalone Windows executable (no Node.js required)
- Easy installation: just extract and run
- Includes user-friendly launcher (start.bat)

## Download
Download `pos-system-dist.zip` and extract to a folder.

## Quick Start
1. Extract the ZIP file
2. Double-click `start.bat`
3. Open browser to http://localhost:3000
4. Default admin password: `admin123`

## System Requirements
- Windows 7 or later (64-bit)
- 100MB free disk space
- No additional software required

## What's Included
- pos-system.exe - Main application
- start.bat - Quick launcher
- config.json - Configuration file
- public/ - Web interface files
- README.txt - Full user guide

## Configuration
Edit `config.json` to customize:
- Admin password
- Server port (default: 3000)
- Printer settings

## Support
For issues, please open a GitHub issue or refer to README.txt in the package.

## Security Notes
- Change default admin password after first use
- Use only on trusted local networks
- Backup the data/ folder regularly
```

## Post-Release

### Documentation Updates
- [ ] Update main README with download link
- [ ] Add release link to documentation
- [ ] Update version number for next release

### User Communication
- [ ] Announce release (if applicable)
- [ ] Provide support channels
- [ ] Collect feedback for improvements

## Troubleshooting Common Issues

### Build Fails
- Ensure Node.js v14+ is installed
- Delete node_modules and reinstall
- Check disk space (need ~500MB for build)

### Package Incomplete
- Run `npm run build` first
- Check build errors in console
- Verify source files are not corrupted

### Verification Fails
- Executable must be > 30MB
- All source files must exist
- Re-run `npm run package`

## Version Management

Current version: **0.1.0**

To update version:
1. Edit package.json version field
2. Update README.md references
3. Create new git tag: `git tag v0.1.0`
4. Push tag: `git push origin v0.1.0`

## File Sizes Reference

Expected sizes:
- pos-system.exe: ~50MB
- pos-system-dist.zip: ~25MB (compressed)
- Extracted distribution: ~55MB
- With data/database: +1-10MB (grows with use)

## Build Environment

Successfully tested on:
- Node.js v18.x
- npm v9.x
- pkg v5.8.1
- Platform: Linux (builds for Windows)

## Future Improvements

Consider for next release:
- [ ] Linux executable variant
- [ ] macOS executable variant
- [ ] Auto-updater feature
- [ ] Installer wizard (optional)
- [ ] Digital signature for executable
- [ ] Smaller executable size optimization
