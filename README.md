# GeoTag Studio - Custom GPS Map Camera & EXIF Stamping ????

[![Deploy Web App to GitHub Pages](https://github.com/bapanayya/GeoTag-Photo-Studio/actions/workflows/deploy.yml/badge.svg)](https://github.com/bapanayya/GeoTag-Photo-Studio/actions/workflows/deploy.yml)
[![Build Android APK & Release](https://github.com/bapanayya/GeoTag-Photo-Studio/actions/workflows/android-build.yml/badge.svg)](https://github.com/bapanayya/GeoTag-Photo-Studio/actions/workflows/android-build.yml)
[![Test Suite](https://img.shields.io/badge/tests-passing-brightgreen.svg)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Desktop%20%7C%20Android%20%7C%20Web-orange.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](#)

> **100% Privacy-First Custom GPS Map Camera & EXIF Stamping Studio for Web, Android & Windows Desktop.**  
> Add verifiable or custom geo-tags, satellite/street mini-map previews, Plus Codes, formatted coordinates, timestamps, and authentic binary EXIF GPS tags to single or batch photos without blocking the subject!  
> Powered by [The Competitive Edge](http://www.youtube.com/@TheCompetitiveEdge-b4z) YouTube Channel.

---

### ?? Live Web App (PWA): [https://bapanayya.github.io/GeoTag-Photo-Studio/](https://bapanayya.github.io/GeoTag-Photo-Studio/)
### ?? Download Android APK: [Latest Release](https://github.com/bapanayya/GeoTag-Photo-Studio/releases/latest)

---

## ?? Key Features

| Feature | Description |
|---|---|
| ?? **Photo-Friendly Placement** | Unlike traditional GPS Map Camera apps that plaster an opaque bar across 100% of the photo bottom, GeoTag Studio defaults to a **compact bottom-left card** that leaves >55% of the width and the entire photo subject completely unblocked. |
| ??? **Interactive Mini-Map** | Renders realistic satellite, street, or offline vector grid thumbnail with a red marker pin and clean attribution watermark. Reduced by 60% in Full-Width Bar mode for a sleek strip. |
| ??? **Dual-Layer Tagging** | Burns visible high-resolution typography into image pixels **AND** injects authentic binary EXIF GPS (`GPSLatitude`, `GPSLongitude`, `GPSAltitude`, `DateTimeOriginal`) into the JPEG header for portal verification. |
| ?? **1-Click GPS Acquisition** | Instantly acquires high-accuracy GPS coordinates via device sensors with automatic reverse geocoding to city, state, postal code, and Plus Code. |
| ?? **Typo-Tolerant Search** | Preloaded with regional colleges (SVA Govt College, SVVU, SVU, SVIMS, SPMVV, IIT Tirupati, Dodilamitta) and queries multi-provider map databases with automatic spelling correction. |
| ? **Favourite Places** | Save frequently visited campuses and locations directly to "My Favourite Places" with instant 1-click loading. |
| ?? **Batch Processing & ZIP Export** | Stamp dozens of photos simultaneously with identical or customized tags and download them individually or packaged as a ZIP. |
| ?? **100% Privacy & Offline** | Zero server uploads, zero cloud dependencies. Works completely offline via canvas rendering and local binary EXIF synthesis. |

---

## ??? Running on Windows Desktop

1. Double-click **`GeoTag-Desktop.bat`**.
2. The application opens immediately as a native standalone desktop app (powered by Microsoft Edge or Chrome `--app` mode, 0 installations needed).

---

## ?? Running on Android

### Option A: Direct Offline PWA (Recommended for instant use)
1. Open [https://bapanayya.github.io/GeoTag-Photo-Studio/](https://bapanayya.github.io/GeoTag-Photo-Studio/) in Chrome on any Android smartphone.
2. Tap **"Add to Home Screen"** or **"Install App"**.
3. Opens in standalone full-screen with native camera and GPS location access.

### Option B: Native Android APK via GitHub Actions
Download the latest compiled `GeoTagStudio.apk` directly from the [Releases](https://github.com/bapanayya/GeoTag-Photo-Studio/releases) tab.

---

## ?? Running Automated Tests

```bash
npm test
```
Validates:
- Coordinate math (Decimal Degrees <-> DMS)
- Plus Code (Open Location Code) generation
- Binary EXIF APP1 packing and parsing
- Resolution-dependent responsive scaling metrics

---

## ??? Default Presets
- **SVA Government College (Srikalahasti, AP)**: Coordinates `13.744088, 79.709425`, Plus Code `Ppv5+hw4`.
- **Custom User Saved Favourites**: Persisted locally in your browser/device.

---

## ?? License
MIT License. 100% Free & Open Source.
