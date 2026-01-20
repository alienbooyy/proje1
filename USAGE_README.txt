# Restaurant POS System - Quick Start Guide

## Installation

1. Extract this ZIP file to a folder on your computer
2. You have two options to start the server:
   - **Easy Way**: Double-click `start.bat` (opens with helpful messages)
   - **Direct Way**: Double-click `pos-system.exe`
3. Wait for the message "POS server running on http://localhost:3000"
4. Open your web browser and go to: http://localhost:3000

That's it! The POS system is now running on your computer.

## First Time Setup

When you first run the application:
- A `data` folder will be created automatically to store your database
- The server will start on port 3000 (configurable in config.json)

## Using the System

### Admin Login
- Click the "Admin" button in the top right corner
- Default password: `admin123`
- Change the password in `config.json` after first use

### Main Features
- **Tables Management**: View and manage restaurant tables
- **Orders**: Create and manage orders for each table
- **Products**: Add/edit menu items and prices
- **Reports**: Generate sales reports and export to Excel
- **Inventory**: Track ingredients and stock levels
- **Recipes**: Link ingredients to products

## Configuration

Edit `config.json` to customize:
- Admin password
- Server port (default: 3000)
- Printer settings (if you have thermal printers)

Example config.json:
```json
{
  "adminPassword": "your-secure-password",
  "serverPort": 3000,
  "printers": {
    "kitchen": {
      "enabled": false,
      "port": "/dev/usb/lp0",
      "name": "Kitchen Printer"
    }
  }
}
```

## Stopping the Server

- Press `Ctrl+C` in the console window where the server is running
- Or simply close the console window

## Data Storage

All data is stored locally in the `data` folder:
- Database: `data/pos.db`
- Backup this folder regularly to prevent data loss

## Troubleshooting

### Port Already in Use
If you see an error about port 3000 being in use:
1. Close any other applications using port 3000
2. Or change the port in `config.json`

### Cannot Access the Website
- Make sure the server is running (console window is open)
- Check that you're using the correct URL: http://localhost:3000
- Try restarting the server

### Data Not Saving
- Ensure the application has write permissions in its folder
- Check that the `data` folder exists and is writable

## Network Access

To access from other devices on your network:
1. Find your computer's IP address (e.g., 192.168.1.100)
2. On other devices, use: http://192.168.1.100:3000

## Support

For issues or questions, refer to the main README.md file or contact support.

## System Requirements

- Windows 7 or later (64-bit)
- 100MB free disk space
- No additional software required (Node.js is bundled)
