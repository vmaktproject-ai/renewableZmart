# Server Crash Prevention & Troubleshooting Guide

## Common Crash Causes Fixed

### 1. **Port Conflicts (EADDRINUSE Error)**
**Problem**: Multiple node processes running on the same port
**Solution**: 
- Added better error messaging for port conflicts
- Use the cleanup command before restarting:
  ```powershell
  Stop-Process -Name node -Force
  ```

### 2. **Unhandled Promise Rejections**
**Problem**: Async errors causing server to crash
**Solution**: 
- Modified error handler to log but not exit on promise rejections
- Server now stays alive for debugging

### 3. **Database Connection Failures**
**Problem**: Server exits immediately if DB connection fails
**Solution**:
- Wrapped database initialization in try-catch
- Server continues running even if DB fails initially
- Allows you to fix DB issues without restarting server

### 4. **Uncaught Exceptions**
**Problem**: Any unhandled error crashes entire server
**Solution**:
- Logging exceptions without automatic exit
- Only critical errors (port conflicts) trigger shutdown

## How to Safely Start/Restart Servers

### Backend:
```powershell
# Stop all node processes first
Stop-Process -Name node -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start backend
cd "c:\VEMAKT TECH\E-commerce\backend"
npm run start:dev
```

### Frontend:
```powershell
# In a separate terminal
cd "c:\VEMAKT TECH\E-commerce"
npm run dev
```

## Quick Diagnostic Checks

### Check if servers are running:
```powershell
# Check ports
Get-NetTCPConnection -LocalPort 3000,4000 -ErrorAction SilentlyContinue

# Check node processes
Get-Process node -ErrorAction SilentlyContinue
```

### Check database connection:
```powershell
cd backend
node -e "const {Client}=require('pg');const c=new Client({host:'127.0.0.1',port:5432,user:'postgres',password:'mthrx1z3',database:'ecommerce_db'});c.connect().then(()=>{console.log('✅ DB connected');c.end()}).catch(e=>{console.error('❌ DB error:',e.message);c.end()})"
```

## When "Connection Refused" Errors Occur

### Browser Issues:
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Try incognito/private mode**
3. **Try different browser**
4. **Hard refresh**: Ctrl+F5

### URL Issues:
Make sure you're accessing:
- Frontend: `http://localhost:3000` or `http://127.0.0.1:3000`
- Backend: `http://localhost:4000` or `http://127.0.0.1:4000`
- **NOT** just `localhost` without port number

### Server Status Check:
```powershell
# Backend health check
Invoke-WebRequest -Uri http://localhost:4000/api/health

# Frontend health check
Invoke-WebRequest -Uri http://localhost:3000
```

## ts-node-dev Respawn Issues

The backend uses `ts-node-dev` which automatically restarts on file changes. Sometimes this causes issues:

### If you see repeated crashes:
1. Stop making file changes
2. Wait for server to stabilize
3. Check terminal for actual errors (not just restart messages)

### If respawn is too aggressive:
Edit `package.json` to add delay:
```json
"start:dev": "ts-node-dev --respawn --transpile-only --exit-child --rs-delay=2000 src/server.ts"
```

## Windows Firewall Issues

If others can't connect but localhost works:
1. Open Windows Defender Firewall
2. Allow Node.js through firewall
3. Or temporarily disable firewall to test

## Database Connection Pool Exhaustion

If you see "too many clients" errors:
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname='ecommerce_db';

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname='ecommerce_db' 
AND state='idle' 
AND pid <> pg_backend_pid();
```

## Clean Restart Procedure

When experiencing persistent issues:

```powershell
# 1. Stop everything
Stop-Process -Name node -Force
taskkill /F /IM node.exe

# 2. Clear any hung processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Wait for cleanup
Start-Sleep -Seconds 3

# 4. Verify ports are free
netstat -ano | findstr ":3000"
netstat -ano | findstr ":4000"

# 5. Start backend first
cd "c:\VEMAKT TECH\E-commerce\backend"
npm run start:dev

# 6. Wait for backend to fully start (watch for "Server running" message)

# 7. In new terminal, start frontend
cd "c:\VEMAKT TECH\E-commerce"
npm run dev
```

## Monitoring for Crashes

The improved server now logs:
- ✅ Successful startups
- ❌ Error conditions (without crashing)
- 📊 Database status
- 🔄 Graceful shutdowns

Watch the terminal output. Real crashes will show:
- "EADDRINUSE" = port already in use
- "ECONNREFUSED" = can't connect to database
- "Error: listen EACCES" = permission denied on port

## Prevention Tips

1. **Always stop servers before restarting**: Don't run multiple instances
2. **Use the batch files**: `start-backend.bat` and `start-frontend.bat`
3. **Wait for full startup**: Don't navigate to site until you see "Server running"
4. **Check database first**: Make sure PostgreSQL service is running
5. **One terminal per server**: Don't mix frontend/backend in same terminal
6. **Don't spam Ctrl+C**: Press once and wait for graceful shutdown

## Still Having Issues?

If crashes continue after these fixes:
1. Check PostgreSQL service is running
2. Verify .env file has correct credentials
3. Check Windows Event Viewer for system errors
4. Try running as Administrator
5. Check antivirus isn't blocking Node.js
6. Ensure ports 3000 and 4000 aren't used by other apps

## Log Files

Backend logs to console only (no file). To save logs:
```powershell
npm run start:dev 2>&1 | Tee-Object -FilePath server.log
```

Then check `server.log` for crash details.
