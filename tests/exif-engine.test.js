import assert from 'assert';
import { buildExifApp1Segment, readExif, injectExifIntoJpeg } from '../core/exif-engine.js';

console.log('🧪 Testing Binary EXIF & GPS Tag Generator...');

// Test 1: Build EXIF APP1 Segment
const testDate = new Date('2026-09-21T12:21:00Z');
const app1Segment = buildExifApp1Segment({
  latitude: 13.744088,
  longitude: 79.709425,
  altitude: 45,
  date: testDate,
  userComment: 'GeoTag Studio Unit Test'
});

assert(app1Segment instanceof ArrayBuffer, 'APP1 Segment must be an ArrayBuffer');
assert(app1Segment.byteLength > 100, 'APP1 Segment too small');

const view = new DataView(app1Segment);
assert.strictEqual(view.getUint16(0), 0xFFE1, 'First two bytes must be 0xFFE1 (APP1 marker)');
const markerLength = view.getUint16(2);
assert.strictEqual(markerLength + 2, app1Segment.byteLength, 'APP1 length field must match buffer size - 2');

// Check "Exif\0\0"
const exifHeader = String.fromCharCode(view.getUint8(4), view.getUint8(5), view.getUint8(6), view.getUint8(7));
assert.strictEqual(exifHeader, 'Exif', 'Header must be Exif');

// Test 2: Inject into a mock JPEG
// Create minimum valid JPEG: SOI (0xFFD8) + EOI (0xFFD9)
const mockJpeg = new Uint8Array([0xFF, 0xD8, 0xFF, 0xD9]);
const injectedBuffer = injectExifIntoJpeg(mockJpeg.buffer, {
  latitude: 13.744088,
  longitude: 79.709425,
  altitude: 45,
  date: testDate
});

assert(injectedBuffer.byteLength > mockJpeg.byteLength, 'Injected JPEG must be larger than original');
const injView = new DataView(injectedBuffer);
assert.strictEqual(injView.getUint16(0), 0xFFD8, 'Injected JPEG must start with SOI 0xFFD8');
assert.strictEqual(injView.getUint16(2), 0xFFE1, 'APP1 marker must follow SOI');

// Test 3: Read back EXIF metadata from injected JPEG
const parsed = readExif(injectedBuffer);
assert(parsed !== null, 'Failed to parse EXIF from injected JPEG');
assert(Math.abs(parsed.latitude - 13.744088) < 0.001, `Latitude mismatch: expected 13.744, got ${parsed.latitude}`);
assert(Math.abs(parsed.longitude - 79.709425) < 0.001, `Longitude mismatch: expected 79.709, got ${parsed.longitude}`);
assert.strictEqual(Math.round(parsed.altitude), 45, `Altitude mismatch: ${parsed.altitude}`);

console.log('✅ All Binary EXIF tests passed successfully!');
