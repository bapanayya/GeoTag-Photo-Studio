import assert from 'assert';
import { calculateResponsiveMetrics, wrapText, DEFAULT_OPTIONS } from '../core/geotag-engine.js';

console.log('🧪 Testing GeoTag Engine Layout & Scaling Metrics...');

// Test 1: Metrics for User Sample Photo (1024 x 575)
const metricsSample = calculateResponsiveMetrics(1024, 575, { layout: 'compact-left' });
assert(metricsSample.cardWidth < 1024 * 0.50, `Card width should be < 50% of image width so photo is not blocked. Got ${metricsSample.cardWidth}px out of 1024px`);
assert(metricsSample.mapSize > 50, 'Map size should be sufficiently visible');
assert(metricsSample.titleFontSize >= 11, 'Title font size should be legible');

// Test 2: Metrics for Full HD (1920 x 1080)
const metricsFHD = calculateResponsiveMetrics(1920, 1080, { layout: 'compact-left' });
assert(metricsFHD.cardWidth < 1920 * 0.50, `FHD card width should not exceed 50% width. Got ${metricsFHD.cardWidth}px out of 1920px`);
assert(metricsFHD.titleFontSize > metricsSample.titleFontSize, 'FHD should scale fonts proportionally higher than 575p');

// Test 3: Metrics for 12MP Smartphone Photo (4000 x 3000)
const metrics12MP = calculateResponsiveMetrics(4000, 3000, { layout: 'compact-left' });
assert(metrics12MP.cardWidth < 4000 * 0.50, `12MP photo card width should not exceed 50%. Got ${metrics12MP.cardWidth}px out of 4000px`);
assert(metrics12MP.titleFontSize > metricsFHD.titleFontSize, '12MP photo should scale typography for ultra-sharp high-res printing');

// Test 4: Text wrapping mock test
const mockCtx = {
  measureText: (text) => ({ width: text.length * 8 }) // Mock 8px per character
};
const longAddress = "Ppv5+hw4, Srikalahasti, Andhra Pradesh 517644, India";
const wrapped = wrapText(mockCtx, longAddress, 180);
assert(wrapped.length >= 2, 'Long address should be wrapped into multiple lines');

// Test 5: Full-Width layout map thumbnail 60% reduction
const metricsFullWidth = calculateResponsiveMetrics(1024, 575, { layout: 'full-width' });
const unreducedMapSize = Math.round(metricsFullWidth.cardWidth * 0.196);
assert.strictEqual(metricsFullWidth.mapSize, Math.round(unreducedMapSize * 0.40), 'Full-width map should be reduced by 60% (retaining 40%)');

console.log('✅ All GeoTag Engine Layout & Scaling tests passed successfully!');
