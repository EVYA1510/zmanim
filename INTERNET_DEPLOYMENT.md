# Internet Deployment Guide

This guide will help you make your Zmanim app accessible from anywhere on the internet.

## ✅ Configuration Status

The app is now properly configured for internet access:
- ✅ Next.js config fixed (removed invalid `allowedDevOrigins`)
- ✅ CORS headers properly configured
- ✅ Server binding to all interfaces (`0.0.0.0`)
- ✅ Fixed port 3333 configuration

## Method 1: Router Port Forwarding (Recommended)

### Step 1: Find Your Public IP Address
1. Go to https://whatismyipaddress.com/ to find your public IP address
2. Write down this IP address (e.g., `199.203.91.130`)

### Step 2: Configure Router Port Forwarding
1. **Access your router's admin panel:**
   - Open your web browser
   - Go to your router's IP address (usually `192.168.1.1` or `192.168.0.1`)
   - Login with admin credentials

2. **Set up port forwarding:**
   - Look for "Port Forwarding", "Virtual Server", or "NAT" settings
   - Create a new rule:
     - **Service Name:** Zmanim App
     - **Internal IP:** `192.168.208.1` (your computer's local IP)
     - **Internal Port:** `3333`
     - **External Port:** `3333` (or any port you prefer like `8080`)
     - **Protocol:** TCP
   - Save the settings

### Step 3: Configure Windows Firewall
Run these commands in PowerShell as Administrator:

```powershell
# Allow incoming connections on port 3333
New-NetFirewallRule -DisplayName "Zmanim App" -Direction Inbound -Protocol TCP -LocalPort 3333 -Action Allow

# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### Step 4: Start Your App
```bash
npm run dev
```

### Step 5: Test Access
- **Local access:** http://localhost:3333
- **Local network:** http://192.168.208.1:3333
- **Internet access:** http://199.203.91.130:3333 (your public IP)

## Method 2: Using ngrok (Temporary Solution)

### Install ngrok
1. Download from https://ngrok.com/download
2. Extract to a folder
3. Create account and get auth token

### Usage
```bash
# In one terminal, start your app
npm run dev

# In another terminal, expose it to internet
ngrok http 3333
```

You'll get a public URL like: `https://abc123.ngrok.io`

## Method 3: Cloud Deployment (Permanent Solution)

### Deploy to Vercel (Free)
1. Push your code to GitHub
2. Go to https://vercel.com
3. Connect your GitHub account
4. Import your repository
5. Deploy automatically

### Deploy to Netlify (Free)
1. Build your app: `npm run build`
2. Go to https://netlify.com
3. Drag and drop your build folder

## Security Considerations

⚠️ **Important Security Notes:**
- Your app will be accessible to anyone on the internet
- Consider adding authentication if needed
- Monitor your router logs for unusual activity
- Use HTTPS in production (Let's Encrypt is free)

## Troubleshooting

### Port Forwarding Not Working
1. **Check router settings:** Ensure port forwarding is enabled
2. **ISP restrictions:** Some ISPs block certain ports
3. **Double NAT:** If you have multiple routers, configure both
4. **Dynamic IP:** Your public IP might change; consider dynamic DNS

### Firewall Issues
```powershell
# Check if port is open
Test-NetConnection -ComputerName "199.203.91.130" -Port 3333

# Temporarily disable Windows Firewall (for testing only)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

### Configuration Validation
The app should now start without warnings. If you see:
- ✅ `Ready in X.Xs` - Configuration is correct
- ❌ `Invalid next.config.mjs options detected` - Contact support

## Quick Start Commands

```bash
# Start the app (accessible from internet after port forwarding)
npm run dev

# Check what's using port 3333
netstat -ano | findstr :3333

# Kill process using port 3333 (if needed)
taskkill /PID <PID_NUMBER> /F
```

## Alternative Ports

If port 3333 is blocked by your ISP, try these common alternatives:
- 8080 (HTTP alternative)
- 8443 (HTTPS alternative)
- 3000-3010 (Node.js common ports)
- 5000 (Flask/Express common port)

Update your package.json and router settings accordingly.

## Production Deployment

For a permanent solution, consider:
1. **Vercel** (free, easy): https://vercel.com
2. **Netlify** (free, easy): https://netlify.com
3. **Railway** (free tier): https://railway.app
4. **Heroku** (paid): https://heroku.com

These platforms provide HTTPS, custom domains, and better security automatically. 

# לחץ ימני על PowerShell ובחר "Run as Administrator"
# אז הרץ:
cd "C:\Users\nihul yeda\Downloads\zmanim-refactored-main\zmanim-refactored-main"
.\setup-firewall.ps1 