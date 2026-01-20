# Testing the Windows Executable

## Pre-Deployment Testing Checklist

This document outlines how to test the Windows executable before distribution.

## Automated Verification

Run the verification script to ensure all files are present:

```bash
npm run verify
```

This checks:
- ✅ All required files are present
- ✅ Executable file size is valid
- ✅ Directory structure is correct

## Manual Testing on Windows

### Prerequisites
- Windows 7 or later (64-bit)
- No other software required

### Test Steps

1. **Extract the Distribution**
   - Extract `pos-system-dist.zip` to a test folder
   - Verify all files are present:
     - `pos-system.exe`
     - `config.json`
     - `README.txt`
     - `public/` folder with all contents

2. **First Launch**
   - Double-click `pos-system.exe`
   - A console window should appear with: "POS server running on http://localhost:3000"
   - Verify that a `data/` folder is created automatically

3. **Access Web Interface**
   - Open a web browser
   - Navigate to `http://localhost:3000`
   - Verify the POS interface loads correctly

4. **Test Core Functionality**

   **Admin Login:**
   - Click "Admin" button
   - Enter password: `admin123`
   - Verify successful login

   **Table Management:**
   - Add a new table (e.g., "Masa 1")
   - Verify table appears with green status (empty)
   - Verify table can be renamed
   - Verify table can be deleted

   **Product Management:**
   - Navigate to products section
   - Add a product (e.g., "Kahve", price: 25.00)
   - Verify product appears in list
   - Verify product can be deleted (deactivated)

   **Order Management:**
   - Click on a table
   - Add products to the order
   - Verify order items appear with correct prices
   - Verify total is calculated correctly
   - Test payment functionality
   - Verify order can be closed

   **Reports:**
   - Navigate to Reports section
   - Select date range (today to today)
   - Generate report
   - Verify summary data appears
   - Test Excel export functionality

5. **Configuration Testing**
   - Stop the server (Ctrl+C)
   - Edit `config.json`:
     - Change admin password
     - Change server port to 3001
   - Restart the server
   - Verify new password works
   - Verify server runs on new port

6. **Database Persistence**
   - Create some data (tables, products, orders)
   - Stop the server
   - Restart the server
   - Verify all data persists correctly

7. **Multi-Device Access**
   - Find your computer's IP address (e.g., 192.168.1.100)
   - From another device on the same network:
   - Access `http://192.168.1.100:3000`
   - Verify interface loads and works correctly

8. **Stop and Cleanup**
   - Stop the server with Ctrl+C
   - Verify the process terminates cleanly
   - Verify database file is not corrupted

## Expected Results

✅ **Success Criteria:**
- Server starts without errors
- Web interface is accessible and functional
- All CRUD operations work correctly
- Database persists data between restarts
- Configuration changes are applied
- No console errors during normal operation

❌ **Common Issues:**

**Port already in use:**
- Solution: Change port in config.json or close other applications

**Cannot access from other devices:**
- Check firewall settings
- Verify devices are on the same network

**Database errors:**
- Ensure application has write permissions
- Check that data/ folder exists and is writable

## Performance Testing

Monitor during operation:
- Memory usage should be < 200MB
- CPU usage should be low during idle
- Response time should be < 1 second for most operations

## Security Testing

- Verify admin panel requires password
- Test with incorrect password (should be rejected)
- Verify SQL injection protection (try: `'; DROP TABLE--`)
- Verify XSS protection in text inputs

## Regression Testing

After any code changes, re-run:
```bash
npm run clean
npm install
npm run package
npm run verify
```

Then repeat manual testing steps.

## Known Limitations

1. **Windows Only**: Executable is compiled for Windows x64 only
2. **Local Network**: No internet access required or used
3. **Single Instance**: Running multiple instances will conflict on the same port
4. **No Auto-Update**: Updates require manual replacement of executable

## Testing Complete

When all tests pass:
- ✅ Package is ready for distribution
- ✅ Create ZIP file: `pos-system-dist.zip`
- ✅ Upload to releases page
- ✅ Update release notes with any important information
