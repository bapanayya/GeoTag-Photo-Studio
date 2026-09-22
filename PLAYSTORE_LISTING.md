# 🚀 Google Play Store Listing & Submission Guide: GeoTag Studio

**App Title**: `GeoTag Studio: GPS Map Camera`  
**Package Name**: `com.geotag.photostudio`  
**Publisher**: The Competitive Edge  
**Category**: Photography / Tools  
**Content Rating**: Everyone (PEGI 3 / IARC 3+)  
**Privacy Policy URL**: [https://bapanayya.github.io/GeoTag-Photo-Studio/privacy-policy.html](https://bapanayya.github.io/GeoTag-Photo-Studio/privacy-policy.html)  

---

## 📝 Store Metadata (Ready to Copy-Paste)

### 1. App Title (Max 30 characters)
```text
GeoTag Studio: GPS Map Camera
```
*(Length: 29 characters)*

---

### 2. Short Description (Max 80 characters)
```text
Add GPS map stamp, address, coordinates & EXIF metadata to photos on-device.
```
*(Length: 78 characters)*

---

### 3. Full Description (Max 4000 characters)
```text
GeoTag Studio: GPS Map Camera is a professional, privacy-first photo geotagging application engineered by The Competitive Edge. It allows educational institutions, college faculty, field inspectors, civil engineers, surveyors, and event organizers to add authentic visual GPS map stamps and binary EXIF metadata to photos with 100% on-device processing.

Unlike conventional GIS map camera tools that stretch heavy dark bars across the entire bottom of your image and block essential subjects, GeoTag Studio features an intelligent, compact bottom-left stamp card that leaves more than 56% of the frame completely unobstructed.

🌟 KEY FEATURES:

📍 Dual-Layer Geotagging
• Visible High-Resolution Stamp: Burns crystal-clear typography onto your photo, displaying location name, full physical address, latitude/longitude (in decimal and DMS degrees), date & time stamp, and Plus Codes.
• Authentic Binary EXIF Injection: Writes genuine GPS metadata (GPSLatitude, GPSLongitude, GPSAltitude, DateTimeOriginal) directly into the JPEG file header for automatic verification on institutional portals and audit platforms.

🗺️ Interactive Mini-Map Preview
• Live Satellite & Street Map: Embeds a sleek mini-map thumbnail centered at your exact coordinates with a high-visibility marker pin.
• 100% Offline Vector Fallback: If you are working in remote field areas without internet connectivity, the app automatically synthesizes an offline vector grid and compass map so stamping never fails.

🛡️ 100% On-Device Privacy & Zero Server Uploads
• All photo editing, EXIF injection, coordinate reverse geocoding, and map rendering happen entirely within your device memory.
• Zero cloud uploads, zero account registration, zero tracking SDKs, and zero telemetry. Your field inspection photos remain 100% confidential.

🏛️ Institutional & Field Inspection Presets
• Preloaded with popular college and field presets (including Sri Venkateswara Anantapuramu Govt College - SVA Govt College, Srikalahasti, AP).
• Save your favorite custom locations (campuses, laboratories, site project offices) to your Favorites list with 1-click persistence.
• Compliant with NAAC, UGC, NIRF documentation, NSS/NCC outreach programs, and civil engineering verification reports.

🔍 Smart Multi-Provider GPS & Typo-Tolerant Search
• 1-Click "My Current GPS": Instant high-accuracy location acquisition combining GPS satellites and network triangulation.
• Interactive Map Picker: Drag and drop the location marker anywhere on the map or tap to set exact coordinates.
• Typo-Tolerant Search: Find universities, campuses, landmarks, and addresses even with misspellings.

⏰ Flexible Timestamps
• Stamp with "Now" (real-time timestamp), restore original "Photo EXIF Time", or customize date and time with GMT offset.

📦 Batch Stamping & Multi-Photo Workflow
• Load single photos or batches, apply consistent or customized geotags across your entire album, and export instantly.

Developed with pride by The Competitive Edge.
Official Channel: youtube.com/@TheCompetitiveEdge-b4z
```

---

## 🎨 Google Play Graphic Assets Location

All required store graphics have been generated and are located in your workspace:

| Asset | Dimensions | File Path |
|---|---|---|
| **App Icon** | 512 x 512 px (PNG) | `assets/playstore/app-icon-512x512.png` |
| **Feature Graphic** | 1024 x 500 px (PNG) | `assets/playstore/feature-graphic-1024x500.png` |
| **Phone Screenshot 1** | 1080 x 1920 px (PNG) | `assets/playstore/screenshots/screenshot1-compact-card.png` |
| **Phone Screenshot 2** | 1080 x 1920 px (PNG) | `assets/playstore/screenshots/screenshot2-dual-layer-exif.png` |
| **Phone Screenshot 3** | 1080 x 1920 px (PNG) | `assets/playstore/screenshots/screenshot3-interactive-map-search.png` |
| **Phone Screenshot 4** | 1080 x 1920 px (PNG) | `assets/playstore/screenshots/screenshot4-private-offline-presets.png` |

---

## 📋 Google Play Console: Answers for 11 Policy Declarations

When filling out **Policy & Programs** &rarr; **App content** in Google Play Console:

1. **Privacy Policy**:
   - URL: `https://bapanayya.github.io/GeoTag-Photo-Studio/privacy-policy.html`
2. **App Access**:
   - Select: **All functionality is available without restrictions** (No login, credentials, or membership required).
3. **Ads**:
   - Select: **No, my app does not contain ads**.
4. **Content Rating (IARC Questionnaire)**:
   - Category: **Utility, Productivity, Communication, or other**
   - Violence, Sexual Content, Language, Controlled Substances: Select **No** to all.
   - Result: **PEGI 3 / Everyone / IARC 3+**.
5. **Target Audience & Content**:
   - Target age groups: Select **18 and over** (or 13+).
   - Could your store listing appeal to children?: Select **No**.
6. **News Apps**:
   - Select: **No**.
7. **COVID-19 Contact Tracing & Status Apps**:
   - Select: **My app is not a COVID-19 contact tracing or status app**.
8. **Data Safety**:
   - Does your app collect or share any of the required user data types?: Select **No**.
   - Is all user data handled locally on the device?: Select **Yes**.
   - Note: Location and camera permissions are requested at runtime for on-device geotagging only; no data is transmitted or collected.
9. **Government Apps**:
   - Select: **No, this app is not developed by or on behalf of a government**.
10. **Financial Features**:
    - Select: **My app does not provide any financial features**.
11. **Health Apps**:
    - Select: **My app does not provide health-related features**.

---

## 📦 Android App Bundle (.aab) & Keystore Information

- **Release Keystore**: `android/app/upload-keystore.jks`
- **Keystore Alias**: `geotag`
- **Store / Key Password**: `geotag123`
- **Validity**: Until **February 7, 2054** (10,000 days)
- **Target SDK**: `34` (Android 14)
- **Permissions**: Strict zero-storage permission model (`CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `INTERNET`) completely bypassing Google's broad media access reviews.
