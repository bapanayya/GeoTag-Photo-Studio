import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function stripImportsAndExports(code) {
  return code
    // Remove multi-line and single-line imports
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+['"][^'"]+['"];?/g, '')
    // Replace export keywords
    .replace(/export\s+default\s+/g, '')
    .replace(/export\s+async\s+function\s+/g, 'async function ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+let\s+/g, 'let ')
    .replace(/export\s+class\s+/g, 'class ')
    .replace(/export\s*\{[\s\S]*?\};?/g, '');
}

const presetsCode = stripImportsAndExports(fs.readFileSync(path.join(rootDir, 'core', 'presets.js'), 'utf8'));
const geoLookupCode = stripImportsAndExports(fs.readFileSync(path.join(rootDir, 'core', 'geo-lookup.js'), 'utf8'));
const exifEngineCode = stripImportsAndExports(fs.readFileSync(path.join(rootDir, 'core', 'exif-engine.js'), 'utf8'));
const geotagEngineCode = stripImportsAndExports(fs.readFileSync(path.join(rootDir, 'core', 'geotag-engine.js'), 'utf8'));
const appCode = stripImportsAndExports(fs.readFileSync(path.join(rootDir, 'web', 'js', 'app.js'), 'utf8'));

const bundle = [
  '// ============================================================================',
  '// GeoTag Studio - Unified Standalone Bundle (Runs 100% Offline on file:/// and HTTP)',
  '// ============================================================================',
  '(function() {',
  "  'use strict';",
  '',
  '  // --- 1. Presets ---',
  presetsCode,
  '',
  '  // --- 2. Geo-Lookup Utilities ---',
  geoLookupCode,
  '',
  '  // --- 3. Binary EXIF Engine ---',
  exifEngineCode,
  '',
  '  // --- 4. GeoTag Canvas Engine ---',
  geotagEngineCode,
  '',
  '  // --- 5. Application Coordinator ---',
  appCode,
  '',
  '})();'
].join('\n');

const outPath = path.join(rootDir, 'web', 'js', 'app.bundle.js');
fs.writeFileSync(outPath, bundle);
console.log('✅ Generated standalone app.bundle.js at:', outPath);
console.log('📦 File size:', (bundle.length / 1024).toFixed(1), 'KB');
