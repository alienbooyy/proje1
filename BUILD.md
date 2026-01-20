# Build and Deployment Guide

## Creating the Executable

To build the Windows executable file:

```bash
npm install
npm run build
```

This will create `proje1-pos.exe` in the `dist/` directory.

## Quick Deployment Package

For a quick deployment package ready for distribution:

```bash
./create-package.sh
```

This script will:
1. Build the executable if not present
2. Create a deployment folder with all necessary files
3. Include Turkish user instructions (KULLANIM.txt)
4. Create a zip file (e.g., `proje1-pos-v0.1.0.zip`)

The resulting zip file (~23MB) can be directly distributed to end users.

## Deployment Package

For deployment to end users, create a folder with the following structure:

```
proje1-pos/
├── proje1-pos.exe       (Generated executable)
├── config.json          (Configuration file)
└── public/              (Web assets folder)
    ├── css/
    ├── js/
    └── index.html
```

### Steps to Deploy:

1. Run `npm run build` to create the executable in `dist/proje1-pos.exe`
2. Create a new folder named `proje1-pos`
3. Copy the following into that folder:
   - `dist/proje1-pos.exe` (rename to `proje1-pos.exe` if desired)
   - `config.json`
   - `public/` folder (entire directory with all contents)
4. Zip the folder and distribute to users

## Running the Application

**For end users (non-technical):**
1. Extract the zip file
2. Double-click `proje1-pos.exe`
3. Wait for the message: `POS server running on http://localhost:3000`
4. Open a web browser and go to `http://localhost:3000`

**Notes:**
- The first run will create a `data/` folder automatically
- No Node.js installation is required
- Windows Defender or antivirus may show a warning - this is normal for unsigned executables
- The application runs completely offline

## Configuration

Edit `config.json` before distributing to change:
- Admin password (default: `admin123`)
- Server port (default: `3000`)
- Printer settings

## Troubleshooting

**Port already in use:**
- Change the port in `config.json` or ensure no other application is using port 3000

**Antivirus blocks the executable:**
- Add an exception for `proje1-pos.exe` in your antivirus settings
- The executable is safe but unsigned

**Cannot access the application:**
- Ensure the executable is running (console window should be open)
- Check firewall settings
- Try accessing `http://127.0.0.1:3000` instead

## Technical Details

- **Engine:** Node.js 18 (embedded)
- **Target:** Windows x64
- **Size:** ~54MB (includes all dependencies)
- **Database:** SQLite (created automatically in `data/pos.db`)
- **Assets:** All web files bundled in executable

## Rebuilding

If you need to rebuild after code changes:

```bash
npm run build
```

The new executable will replace the old one.
