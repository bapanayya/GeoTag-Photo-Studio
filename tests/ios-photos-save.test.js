import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Testing iOS Photos Library Save & Action Banner Integration...');

// 1. Verify isIOSDevice in app.js
const appJsPath = path.join(rootDir, 'web', 'js', 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

assert(appJs.includes('export function isIOSDevice()'), 'app.js must export isIOSDevice()');
assert(appJs.includes('/iPad|iPhone|iPod/'), 'isIOSDevice must check iPad/iPhone/iPod user agent');
assert(appJs.includes('MacIntel') && appJs.includes('maxTouchPoints'), 'isIOSDevice must handle iPadOS desktop Safari mode');
assert(appJs.includes('triggerIosSaveToPhotos'), 'app.js must define triggerIosSaveToPhotos');
assert(appJs.includes('iosPhotosBanner'), 'app.js must reference iosPhotosBanner');
assert(appJs.includes('btnIosSaveToPhotos'), 'app.js must wire btnIosSaveToPhotos');
assert(appJs.includes('btnIosDownloadFiles'), 'app.js must wire btnIosDownloadFiles');
assert(appJs.includes('outputImg'), 'app.js must sync outputImg for iOS long-press Save to Photos');
assert(appJs.includes('iosSaveModal'), 'app.js must reference iosSaveModal');
assert(appJs.includes('btnIosModalSave'), 'app.js must wire btnIosModalSave');
assert(appJs.includes('pregenerateStampedFile'), 'app.js must pregenerate stamped file to preserve user gestures');

// 2. Verify web/index.html markup
const indexHtmlPath = path.join(rootDir, 'web', 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

assert(indexHtml.includes('id="iosPhotosBanner"'), 'index.html must include #iosPhotosBanner');
assert(indexHtml.includes('id="btnIosSaveToPhotos"'), 'index.html must include #btnIosSaveToPhotos');
assert(indexHtml.includes('id="btnIosDownloadFiles"'), 'index.html must include #btnIosDownloadFiles');
assert(indexHtml.includes('id="outputImg"'), 'index.html must include #outputImg');
assert(indexHtml.includes('id="iosSaveModal"'), 'index.html must include #iosSaveModal');
assert(indexHtml.includes('id="btnIosModalSave"'), 'index.html must include #btnIosModalSave');

// 3. Verify web/sw.js cache configuration
const swJsPath = path.join(rootDir, 'web', 'sw.js');
const swJs = fs.readFileSync(swJsPath, 'utf8');

assert(swJs.includes('geotag-studio-v3'), 'sw.js must bump cache version to geotag-studio-v3');
assert(swJs.includes("navigate") && swJs.includes(".js"), 'sw.js must use network-first for immediate updates');

// 3. Verify web/css/styles.css styling
const stylesCssPath = path.join(rootDir, 'web', 'css', 'styles.css');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

assert(stylesCss.includes('.ios-photos-banner'), 'styles.css must style .ios-photos-banner');
assert(stylesCss.includes('.btn-ios-save'), 'styles.css must style .btn-ios-save');
assert(stylesCss.includes('.btn-ios-files'), 'styles.css must style .btn-ios-files');
assert(stylesCss.includes('-webkit-touch-callout: default !important;'), 'styles.css must enable native iOS long-press menu on output photo');

// 4. Verify standalone bundle web/js/app.bundle.js contains iOS logic
const bundlePath = path.join(rootDir, 'web', 'js', 'app.bundle.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');

assert(bundle.includes('isIOSDevice'), 'app.bundle.js must contain isIOSDevice');
assert(bundle.includes('triggerIosSaveToPhotos'), 'app.bundle.js must contain triggerIosSaveToPhotos');
assert(bundle.includes('iosPhotosBanner'), 'app.bundle.js must contain iosPhotosBanner');

// 5. Verify synced Android public assets
const androidBundlePath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'js', 'app.bundle.js');
const androidBundle = fs.readFileSync(androidBundlePath, 'utf8');

assert(androidBundle.includes('isIOSDevice'), 'Android public assets must be synced with iOS logic');

console.log('✅ All 5 iOS Photos Library Save & Action Banner Tests Passed Successfully! 🍎📸');
