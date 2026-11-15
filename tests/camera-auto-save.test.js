import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Testing Camera Immediate Auto-Save vs Upload Preview Flow...');

// 1. Verify app.js contains handleFiles with source parameter and immediate camera auto-save
const appJsPath = path.join(rootDir, 'web', 'js', 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

assert(appJs.includes("source = 'upload'"), 'handleFiles must accept source parameter defaulting to upload');
assert(appJs.includes("source === 'camera'"), 'handleFiles must check if source is camera');
assert(appJs.includes('generateStampedJpegBlob'), 'app.js must define generateStampedJpegBlob');
assert(appJs.includes('saveBlobToGalleryOrDevice'), 'app.js must define saveBlobToGalleryOrDevice');
assert(appJs.includes('window.AndroidBridge.saveToGallery'), 'saveBlobToGalleryOrDevice must support saveToGallery on AndroidBridge');
assert(appJs.includes("Auto-saved to Gallery / Photos"), 'app.js must provide clear auto-save indicator');

// 2. Verify all camera entrypoints pass source: 'camera'
assert(appJs.includes("handleFiles([file], { source: 'camera' })"), 'snapWebcamPhoto and native camera must pass source: camera');
assert(appJs.includes("handleFiles(e.target.files, { source: 'camera' })"), 'cameraInput must pass source: camera');

// 3. Verify upload entrypoints pass source: 'upload'
assert(appJs.includes("handleFiles(e.target.files, { source: 'upload' })"), 'fileInput must pass source: upload');
assert(appJs.includes("handleFiles(e.dataTransfer.files, { source: 'upload' })"), 'dropzone must pass source: upload');

// 4. Verify camera flow does NOT let raw EXIF GPS overwrite user selected settings
assert(appJs.includes("!isCamera && state.photos.length === 1 && exif"), 'EXIF location auto-fill must be restricted to uploaded photos only');

// 5. Verify MainActivity.java contains saveToGallery and DCIM/Camera MediaStore implementation
const mainActivityPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'java', 'com', 'geotag', 'photostudio', 'MainActivity.java');
const mainActivity = fs.readFileSync(mainActivityPath, 'utf8');

assert(mainActivity.includes('saveToGallery(String base64Data, String filename)'), 'MainActivity must expose saveToGallery on JavascriptInterface');
assert(mainActivity.includes('MediaStore.Images.Media.EXTERNAL_CONTENT_URI'), 'MainActivity must insert into MediaStore.Images.Media.EXTERNAL_CONTENT_URI');
assert(mainActivity.includes('Environment.DIRECTORY_DCIM + "/Camera"'), 'MainActivity must target DCIM/Camera directory');
assert(mainActivity.includes('MediaScannerConnection.scanFile'), 'MainActivity must trigger MediaScannerConnection');

// 6. Verify built bundle in web/js/app.bundle.js is up-to-date with camera auto-save logic
const bundlePath = path.join(rootDir, 'web', 'js', 'app.bundle.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');

assert(bundle.includes('saveBlobToGalleryOrDevice'), 'app.bundle.js must contain saveBlobToGalleryOrDevice');
assert(bundle.includes("source === 'camera'"), 'app.bundle.js must contain camera auto-save logic');

// 7. Verify synced Android assets in android/app/src/main/assets/public/js/app.bundle.js
const androidBundlePath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'js', 'app.bundle.js');
const androidBundle = fs.readFileSync(androidBundlePath, 'utf8');

assert(androidBundle.includes('saveBlobToGalleryOrDevice'), 'Android public assets app.bundle.js must contain saveBlobToGalleryOrDevice');
assert(androidBundle.includes("source === 'camera'"), 'Android public assets app.bundle.js must contain camera auto-save logic');

console.log('✅ All 7 Camera Auto-Save & Upload Preview Tests Passed Successfully! 🎉');
