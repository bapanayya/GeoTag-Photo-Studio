import assert from 'assert';
import {
  decimalToDms,
  dmsToDecimal,
  formatCoordinates,
  encodePlusCode,
  formatGpsDateTime
} from '../core/geo-lookup.js';

console.log('🧪 Testing Core Geo-Lookup & Coordinate Math...');

// Test 1: Decimal to DMS
const dmsLat = decimalToDms(13.744088, true);
assert.strictEqual(dmsLat.startsWith("13°44'"), true, `Latitude DMS mismatch: ${dmsLat}`);
assert.strictEqual(dmsLat.endsWith('N'), true, `Latitude direction mismatch: ${dmsLat}`);

const dmsLng = decimalToDms(79.709425, false);
assert.strictEqual(dmsLng.startsWith("79°42'"), true, `Longitude DMS mismatch: ${dmsLng}`);
assert.strictEqual(dmsLng.endsWith('E'), true, `Longitude direction mismatch: ${dmsLng}`);

// Test 2: DMS to Decimal round-trip
const roundLat = dmsToDecimal(dmsLat);
assert(Math.abs(roundLat - 13.744088) < 0.001, `DMS round-trip latitude failed: ${roundLat}`);

// Test 3: formatCoordinates
const formattedDec = formatCoordinates(13.744088, 79.709425, 'decimal');
assert.strictEqual(formattedDec, 'Lat 13.744088° Long 79.709425°');

const formattedDms = formatCoordinates(13.744088, 79.709425, 'dms');
assert(formattedDms.includes('N') && formattedDms.includes('E'), 'DMS formatting failed');

// Test 4: Plus Code generation
const plusCode = encodePlusCode(13.744088, 79.709425);
assert(plusCode.length >= 8, 'Plus code should have at least 8 characters');
assert(plusCode.includes('+'), 'Plus code must contain + symbol');

// Test 5: formatGpsDateTime
const testDate = new Date('2026-09-21T12:21:00+05:30');
const formattedDate = formatGpsDateTime(testDate, 330);
assert(formattedDate.includes('21/09/2026'), 'Date formatting failed day/month/year');
assert(formattedDate.includes('12:21 PM') || formattedDate.includes(':21'), 'Time formatting failed');
assert(formattedDate.includes('GMT +05:30'), 'Timezone formatting failed');

console.log('✅ All Geo-Lookup tests passed successfully!');
