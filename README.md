# DailyPlate

A personal diet planning and adherence tracking web application featuring meal scheduling, eating punctuality evaluation, dual-metric adherence analytics, body weight tracking, and Google Sheets integration.

---

## 📋 Prerequisites

Before running the application locally, ensure you have the following installed:

- **Node.js**: `v18.0.0` or higher (`v20.x` LTS or `v22.x` recommended)
  - Verify with: `node -v`
- **npm**: `v9.0.0` or higher (comes bundled with Node.js)
  - Verify with: `npm -v`
- **Git** (optional, if cloning from a repository)

---

## 🚀 Quickstart Guide (Step-by-Step)

Follow these exact shell commands in order to get DailyPlate running on `http://localhost:3000`:

### Step 1: Open Terminal and Navigate to Project Directory

```bash
cd /path/to/DailyPlate
```

### Step 2: Install Project Dependencies

Install all required frontend and backend dependencies defined in `package.json`:

```bash
npm install
```

### Step 3: (Optional) Set Up Environment Variables

If you plan to use server-side Gemini AI features, copy the example environment file and set your key:

```bash
cp .env.example .env
```

*Note: DailyPlate operates completely without external keys out-of-the-box using local seed data and browser storage.*

### Step 4: Start the Local Development Server

Run the development server using `tsx` and Vite:

```bash
npm run dev
```

You will see terminal output similar to:
```text
DailyPlate server running on http://0.0.0.0:3000
```

### Step 5: Open in Your Browser

Open your browser and navigate to:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Production Build & Launch

To verify and run the optimized production bundle locally:

### Step 1: Build the Client and Server Bundles

```bash
npm run build
```
This runs `vite build` to generate static assets in `dist/` and bundles `server.ts` into a CommonJS production file `dist/server.cjs` via `esbuild`.

### Step 2: Start the Production Server

```bash
npm start
```

Open `http://localhost:3000` to verify the production build.

---

## 🛠️ Useful Command Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Boots the development server with Vite hot middleware on port 3000 |
| `npm run build` | Compiles the TypeScript frontend and backend for production |
| `npm start` | Launches the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) without emitting files |
| `npm run clean` | Deletes compiled artifacts (`dist/` directory) |
| `npm run preview` | Runs Vite's local static preview server |

---

## 📊 Connecting Google Sheets (Optional Persistent Database)

DailyPlate can synchronize all meals, punctuality logs, weight history, and user settings into your own private Google Spreadsheet:

1. Open [Google Sheets](https://sheets.new) and create a new sheet named **DailyPlate Database**.
2. Go to **Extensions** > **Apps Script**.
3. Copy the script from `gas/Code.gs` and paste it into the editor.
4. Click **Deploy** > **New deployment** > Select type: **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize access and copy your deployment URL (ends in `/exec`).
6. In DailyPlate, click **Google Sheets Sync** in the top navigation or in **Profile**, paste the URL, and click **Test & Connect**.

For complete step-by-step instructions, see [`gas/README.md`](./gas/README.md).

---

## ❓ Troubleshooting

### Port 3000 is already in use
If another application is running on port 3000:
- **macOS / Linux**: Find and terminate the process:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```
- **Windows (PowerShell)**:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
  ```

### TypeScript or Stale Cache Issues
If you encounter caching or dependency mismatch issues:
```bash
npm run clean
npm install
npm run dev
```
