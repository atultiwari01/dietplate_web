# DailyPlate - Google Apps Script & Google Sheets Setup Guide

DailyPlate uses Google Sheets as its primary source of truth and Google Apps Script as the lightweight, serverless HTTPS API backend.

## Quick 2-Minute Setup

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name your spreadsheet **"DailyPlate Database"**.

### Step 2: Add the Apps Script Code
1. In the Google Sheet top menu, go to **Extensions** > **Apps Script**.
2. Delete any boilerplate code inside `Code.gs`.
3. Copy and paste the entire contents of `gas/Code.gs` into the editor.
4. Click the **Save** icon (diskette).

### Step 3: Deploy as Web App
1. Click the blue **Deploy** button at the top right, then select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description**: `DailyPlate API v1`
   - **Execute as**: `Me (<your-email>)`
   - **Who has access**: `Anyone` *(Allows DailyPlate to interact securely with your sheet)*
4. Click **Deploy**.
5. Google will prompt you to **Authorize Access**:
   - Click *Review permissions*
   - Select your Google account
   - Click *Advanced* (if shown) > *Go to DailyPlate API (unsafe)*
   - Click *Allow*
6. Copy the resulting **Web App URL** (it ends in `/exec`).

### Step 4: Link in DailyPlate
1. Open DailyPlate and click the **Google Sheets Sync** badge (or go to **Profile** > **Google Sheets Connection**).
2. Paste your Web App URL into the field.
3. Click **Test & Connect**.
4. DailyPlate will verify the connection and automatically provision the 5 sheets:
   - `User Profile`
   - `Meals`
   - `Meal Tracking`
   - `Weight History`
   - `Daily Statistics`

All changes made in DailyPlate will immediately sync directly into your Google Sheets spreadsheet!
