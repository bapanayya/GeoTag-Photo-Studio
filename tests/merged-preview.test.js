import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Testing Merged Immediate Live Preview into Photo Capture Area...');

// 1. Verify web/index.html markup has Section 1 merged preview and NO bottom preview-panel
const indexHtmlPath = path.join(rootDir, 'web', 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

assert(indexHtml.includes('id="photoWorkspacePanel"'), 'index.html must include #photoWorkspacePanel in Section 1');
assert(indexHtml.includes('id="dropzone"'), 'index.html must include #dropzone in Section 1');
assert(indexHtml.includes('id="previewStageWrapper"'), 'index.html must include #previewStageWrapper in Section 1');
assert(indexHtml.includes('id="btnRetakePhoto"'), 'index.html must include #btnRetakePhoto');
assert(indexHtml.includes('id="btnChangePhoto"'), 'index.html must include #btnChangePhoto');
assert(indexHtml.includes('id="btnAcceptPhoto"'), 'index.html must include #btnAcceptPhoto');
assert(indexHtml.includes('id="cameraStreamContainer"'), 'index.html must include #cameraStreamContainer');
assert(indexHtml.includes('id="liveCameraVideo"'), 'index.html must include #liveCameraVideo');
assert(indexHtml.includes('id="liveCameraStampOverlay"'), 'index.html must include #liveCameraStampOverlay');
assert(!indexHtml.includes('id="toggleShowNote" checked'), 'toggleShowNote must not be checked by default');
assert(indexHtml.includes('id="toggleShowNote"'), 'toggleShowNote must exist in index.html');
assert(!indexHtml.includes('<main class="preview-panel">'), 'index.html must NOT contain bottom preview-panel');

// Check there are no duplicate IDs for canvas / download / outputImg in index.html
const countId = (id) => (indexHtml.match(new RegExp(`id="${id}"`, 'g')) || []).length;
assert.strictEqual(countId('outputCanvas'), 1, '#outputCanvas must only exist once in index.html');
assert.strictEqual(countId('outputImg'), 1, '#outputImg must only exist once in index.html');
assert.strictEqual(countId('btnDownload'), 1, '#btnDownload must only exist once in index.html');
assert.strictEqual(countId('photoMetrics'), 1, '#photoMetrics must only exist once in index.html');
assert.strictEqual(countId('canvasViewport'), 1, '#canvasViewport must only exist once in index.html');

// 2. Verify web/css/styles.css styling
const stylesCssPath = path.join(rootDir, 'web', 'css', 'styles.css');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

assert(stylesCss.includes('.photo-workspace-panel'), 'styles.css must style .photo-workspace-panel');
assert(stylesCss.includes('.preview-stage-wrapper'), 'styles.css must style .preview-stage-wrapper');
assert(stylesCss.includes('.photo-panel-title'), 'styles.css must style .photo-panel-title');

// 3. Verify web/js/app.js logic
const appJsPath = path.join(rootDir, 'web', 'js', 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

assert(appJs.includes('elements.previewStageWrapper'), 'app.js must reference previewStageWrapper');
assert(appJs.includes('elements.btnAcceptPhoto'), 'app.js must reference btnAcceptPhoto');
assert(appJs.includes('openLiveCamera'), 'app.js must define openLiveCamera');
assert(appJs.includes('acceptAndSaveActivePhoto'), 'app.js must define acceptAndSaveActivePhoto');
assert(appJs.includes('showCustomNote: false'), 'app.js must default showCustomNote to false');
assert(appJs.includes('elements.btnRetakePhoto'), 'app.js must reference btnRetakePhoto');
assert(appJs.includes('elements.btnChangePhoto'), 'app.js must reference btnChangePhoto');
assert(appJs.includes("elements.dropzone.style.display = 'none'"), 'app.js must hide dropzone on render');
assert(appJs.includes("elements.previewStageWrapper.style.display = 'flex'"), 'app.js must show previewStageWrapper on render');
assert(appJs.includes("elements.dropzone.style.display = 'flex'"), 'app.js must show dropzone on blank/clear');
assert(appJs.includes("elements.previewStageWrapper.style.display = 'none'"), 'app.js must hide previewStageWrapper on blank/clear');

// 4. Verify web/js/app.bundle.js contains the compiled logic
const bundlePath = path.join(rootDir, 'web', 'js', 'app.bundle.js');
const bundle = fs.readFileSync(bundlePath, 'utf8');

assert(bundle.includes('previewStageWrapper'), 'app.bundle.js must contain previewStageWrapper');
assert(bundle.includes('btnAcceptPhoto'), 'app.bundle.js must contain btnAcceptPhoto');
assert(bundle.includes('btnRetakePhoto'), 'app.bundle.js must contain btnRetakePhoto');
assert(bundle.includes('btnChangePhoto'), 'app.bundle.js must contain btnChangePhoto');

// 5. Verify Android public assets are synchronized
const androidIndexPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html');
const androidIndex = fs.readFileSync(androidIndexPath, 'utf8');
assert(androidIndex.includes('id="photoWorkspacePanel"'), 'Android public index.html must have #photoWorkspacePanel');
assert(androidIndex.includes('id="btnAcceptPhoto"'), 'Android public index.html must have #btnAcceptPhoto');
assert(!androidIndex.includes('<main class="preview-panel">'), 'Android public index.html must not have bottom preview-panel');

console.log('✅ All Merged Immediate Live Preview Tests Passed Successfully! 🚀📷');
