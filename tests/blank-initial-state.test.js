import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Testing Blank Initial State & Test Photo Elimination...');

// 1. Check sample.png does not exist on disk in assets
const webSampleExists = fs.existsSync(path.join(rootDir, 'web', 'assets', 'sample.png'));
const androidSampleExists = fs.existsSync(path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public', 'assets', 'sample.png'));

assert.strictEqual(webSampleExists, false, 'web/assets/sample.png must not exist');
assert.strictEqual(androidSampleExists, false, 'android/app/src/main/assets/public/assets/sample.png must not exist');

// 2. Check web/sw.js does not cache sample.png
const swContent = fs.readFileSync(path.join(rootDir, 'web', 'sw.js'), 'utf8');
assert(!swContent.includes('sample.png'), 'web/sw.js must not reference sample.png');

// 3. Check web/js/app.js does not contain preloadSamplePhoto or sample.png
const appContent = fs.readFileSync(path.join(rootDir, 'web', 'js', 'app.js'), 'utf8');
assert(!appContent.includes('preloadSamplePhoto'), 'web/js/app.js must not contain preloadSamplePhoto');
assert(!appContent.includes('sample.png'), 'web/js/app.js must not contain sample.png');

// 4. Check web/js/app.bundle.js does not contain preloadSamplePhoto or sample.png
const bundleContent = fs.readFileSync(path.join(rootDir, 'web', 'js', 'app.bundle.js'), 'utf8');
assert(!bundleContent.includes('preloadSamplePhoto'), 'web/js/app.bundle.js must not contain preloadSamplePhoto');
assert(!bundleContent.includes('sample.png'), 'web/js/app.bundle.js must not contain sample.png');

// 5. Verify initInitialState and clearPhotos exist in app.js
assert(appContent.includes('function initInitialState('), 'app.js must define initInitialState()');
assert(appContent.includes('function clearPhotos('), 'app.js must define clearPhotos()');
assert(appContent.includes('ctx.clearRect(0, 0, canvas.width, canvas.height)'), 'performRender must explicitly clear canvas context before drawing');

console.log('✅ Blank Initial State & Canvas Hygiene tests passed 100%!');
