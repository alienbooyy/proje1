# Building the Executable

This guide explains how to build the POS system as a Windows executable.

## Prerequisites

- Node.js v14 or higher
- npm

## Build Steps

1. Install dependencies:
```bash
npm install
```

2. Build the executable:
```bash
npm run build
```

This will create `dist/pos-system.exe` (approximately 50MB).

## Creating Distribution Package

After building, you need to create a distribution package that includes:

1. The executable: `dist/pos-system.exe`
2. Configuration file: `config.json`
3. Static files directory: `public/`
4. User README: `USAGE_README.txt`

Run the package script:
```bash
npm run package
```

This will create a `dist/` folder ready for distribution with all necessary files.

## Distribution Structure

```
dist/
├── pos-system.exe       # Main executable
├── config.json          # Configuration file
├── public/              # Web interface files
│   ├── index.html
│   ├── css/
│   └── js/
└── README.txt          # User instructions
```

## Notes

- The executable is standalone and includes Node.js runtime
- The `data/` folder will be created automatically when the application first runs
- Users only need to extract the zip and run `pos-system.exe`
- No Node.js installation required on the target system
