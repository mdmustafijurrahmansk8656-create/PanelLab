# PanelLab v0.1 — Electrical Panel Designer prototype

This is a responsive React + TypeScript + Vite web app starter intended to run on desktop and mobile browsers. It can later be packaged as an Android app with Capacitor.

## Requirements
- Node.js 20+ (recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite. On the same Wi-Fi, a phone can open the computer's LAN URL if the firewall allows it.

## Build
```bash
npm run build
```

## Current prototype features
- Responsive device palette
- Add/select/delete basic visual devices
- Rename project and edit device tags/positions
- Draft device-to-device wire lines
- Save project to a local JSON download
- Export canvas using browser Print → Save as PDF

## Not implemented yet
- Terminal-to-terminal wiring and wire snapping
- IEC-complete symbols/terminal definitions
- Electrical simulation engine (voltage/current paths, NO/NC, coil logic, overload trips, three-phase power)
- Custom device editor and persistent library
- Project auto-save/cloud sync
- Full PDF export with title block and parts list

This is a UI prototype, not a certified electrical design or safety tool. Validate real designs with qualified engineering review.

## Build an Android APK with GitHub Actions
1. Upload all project files and folders to a GitHub repository (keep `.github/workflows/android-apk.yml` and `src/` folders intact).
2. Open the repository's **Actions** tab and select **Build PanelLab Android APK**.
3. Tap **Run workflow** if it is not already running from a push, then open the completed run.
4. In **Artifacts**, download `PanelLab-debug-apk`, unzip it, and install `app-debug.apk` on Android. You may need to allow installation from that file manager/browser.

This creates a debug/testing APK, not a Play Store release. The prototype does not yet include a complete electrical simulation engine or certified IEC symbol library.
