# DailyPlate - Personal Diet Planning & Tracking (Android & Web)

A personal diet planning and adherence tracking application designed for single-user wellness tracking on **Android phones**, tablets, and desktops.

Featuring meal scheduling, eating punctuality tracking, dual-metric adherence analytics, body weight logs, and optional private Google Sheets synchronization.

---

## 🔒 Personal Use & Privacy Guarantee (Zero Intrusive Permissions)

DailyPlate is created strictly for **personal, private health tracking**:
- **0 Device Control Permissions**: DailyPlate does **NOT** request camera, microphone, contacts, location/GPS, phone calls, background sensors, or file system control.
- **No Ads or Telemetry**: No third-party ad networks, tracking pixels, or data harvesting scripts.
- **Your Data Stays Yours**: All meal plans, weight records, and goals are stored in your device's browser/app storage, and only sync to **your own personal Google Spreadsheet** if you choose to connect Google Apps Script.

---

## 📱 Android Phone Setup Guide

DailyPlate is built as an installable **Progressive Web App (PWA)** that runs on Android as a full-screen, native-feeling app (standalone display, splash screen, offline caching, and bottom touch navigation).

There are two primary ways to set it up on your Android phone for personal use:

---

### Option 1: Access from your Phone over Home Wi-Fi (Local Network)

Use this method when running the app locally on your computer:

#### Step 1: Start the Server on your Computer
In your project directory, launch the development server:
```bash
npm install
npm run dev
```
The server binds to `0.0.0.0:3000`, making it accessible to any device on the same local Wi-Fi network.

#### Step 2: Find your Computer's Local IP Address
- **Windows (Command Prompt / PowerShell)**:
  ```cmd
  ipconfig
  ```
  Look for **IPv4 Address** under your active Wi-Fi adapter (e.g., `192.168.1.45`).
- **macOS (Terminal)**:
  ```bash
  ipconfig getifaddr en0
  ```
- **Linux (Terminal)**:
  ```bash
  hostname -I
  ```

#### Step 3: Open in Chrome on your Android Phone
1. Ensure your Android phone is connected to the **same Wi-Fi network** as your computer.
2. Open **Google Chrome** (or Samsung Internet, Brave, Edge) on your phone.
3. In the URL bar, type:
   ```text
   http://<YOUR_COMPUTER_IP>:3000
   ```
   *(Example: `http://192.168.1.45:3000`)*

#### Step 4: Install to Android Home Screen
1. Chrome will show the in-app **"Use DailyPlate on Android"** banner at the top — tap **Install**.
2. Alternatively, tap the Chrome **three dots menu (⋮)** in the top-right corner.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Confirm by tapping **Install**.
5. DailyPlate is now added to your Android app drawer and home screen with its custom green icon. It opens in full-screen standalone mode with no browser address bar!

---

### Option 2: Access Remotely on Android from Anywhere (Free Cloud Tunnel)

To access DailyPlate on your Android phone when you are away from home (on cellular mobile data or work Wi-Fi):

#### Using Cloudflare Quick Tunnel (Free, No Signup, HTTPS)
On your computer while `npm run dev` is running, open a second terminal:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
This generates a secure HTTPS link (e.g. `https://random-subdomain.trycloudflare.com`).
1. Open this link on your Android phone.
2. Tap the Chrome menu (⋮) -> **"Install app"**.
3. DailyPlate now runs anywhere in the world on your phone.

---

## 🖥️ Localhost Quickstart Guide (Step-by-Step Commands)

If you are running the app on your computer:

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` recommended) — check with `node -v`
- **npm**: `v9.0.0` or higher — check with `npm -v`

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Production Build & Execution
To compile optimized bundles for production:
```bash
npm run build
npm start
```

---

## 🛠️ CLI Command Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Boots dev server with Vite and Express on `http://0.0.0.0:3000` |
| `npm run build` | Builds client static assets and bundles `server.ts` into `dist/` |
| `npm start` | Launches the production Node.js server |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Removes build output directories |

---

## 📊 Connecting Personal Google Sheets (Optional)

DailyPlate works completely standalone without any external accounts. If you want seamless cloud persistence into a Google Spreadsheet:

1. Create a new Google Spreadsheet in Google Drive: [sheets.new](https://sheets.new).
2. Click **Extensions** > **Apps Script**.
3. Replace the contents of `Code.gs` with the script found in `gas/Code.gs` in this repository.
4. Click **Deploy** > **New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize access and copy your Web App URL (ends with `/exec`).
6. In DailyPlate, click **Connect Sheets** in the header or in **Profile**, paste the URL, and click **Test & Connect**.

---

## 💡 Android Phone Tips

- **Quick Weight Updates**: In the Profile tab, use the `+` and `-` stepper to log your daily morning weight in seconds.
- **Meal Punctuality Status**:
  - `✓ Completed` (Green): Eaten within your scheduled punctuality window (e.g., ±30 mins).
  - `⏱ Late` (Orange): Eaten outside the scheduled window.
  - `✕ Missed` (Red): Skipped or unconsumed.
  - `○ Upcoming` (Gray): Scheduled for later.
- **Offline Reliability**: Even if your phone enters airplane mode or loses mobile signal, cached meal plans and previous entries remain visible and functional.
