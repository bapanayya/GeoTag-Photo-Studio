/**
 * GeoTag Studio - Core Canvas Rendering Engine
 * Stamping engine with user-customized Compact Bottom-Left Layout
 * that ensures the main photograph is not blocked or obscured.
 * 100% client-side, resolution-independent canvas compositing.
 */

import { formatCoordinates, formatGpsDateTime } from './geo-lookup.js';

/**
 * Default Stamping Configuration Options
 */
export const DEFAULT_OPTIONS = {
  // Placement & Dimensions
  layout: 'compact-left', // 'compact-left' (Default: photo not blocked), 'compact-right', 'top-left', 'top-right', 'full-width'
  scale: 1.0,            // Overall size multiplier (0.7x Mini to 1.3x Large)
  marginRatio: 0.02,     // Distance from photo edge (2% of photo min dimension)
  maxWidthRatio: 0.44,   // Max card width as fraction of photo width (leaves >55% completely open!)

  // Visual Appearance
  bgColor: 'rgba(15, 23, 42, 0.82)', // Deep slate translucent card
  textColor: '#FFFFFF',
  accentColor: '#38bdf8', // Sky blue
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  borderRadiusRatio: 0.015,
  cardBorder: '1px solid rgba(255, 255, 255, 0.2)',

  // Content Toggles
  showMap: true,
  mapStyle: 'satellite', // 'satellite', 'street', 'terrain', 'vector-offline'
  coordFormat: 'decimal', // 'decimal', 'dms'
  showAltitude: false,
  showCustomNote: true,
  showBadge: true,
  badgeText: 'Geo-Tag Camera',

  // Custom Logo
  customLogoImage: null
};

/**
 * Calculates adaptive dimensions based on image resolution
 */
export function calculateResponsiveMetrics(imageWidth, imageHeight, options = {}) {
  const minDim = Math.min(imageWidth, imageHeight);
  const maxDim = Math.max(imageWidth, imageHeight);
  const baseScale = (minDim / 720) * (options.scale || 1.0);

  // Margins
  const margin = Math.round(minDim * (options.marginRatio || 0.02));

  // Card Width
  let cardWidth;
  if (options.layout === 'full-width') {
    cardWidth = imageWidth - margin * 2;
  } else {
    // Compact layout: scale card proportionally with options.scale when scale > 1.0, bounded reasonably
    const scaleMultiplier = Math.max(1.0, options.scale || 1.0);
    const idealWidth = imageWidth * (options.maxWidthRatio || 0.44) * scaleMultiplier;
    const maxAllowedWidth = imageWidth - margin * 2;
    cardWidth = Math.round(Math.max(280 * baseScale, Math.min(idealWidth, maxAllowedWidth)));
  }

  // Map Thumbnail Dimension (square)
  // In full-width bar mode, reduced by 60% of its present size per user request (retaining 40%)
  const showMap = options.showMap !== false;
  let mapSize = 0;
  if (showMap) {
    if (options.layout === 'full-width') {
      mapSize = Math.round(cardWidth * 0.196 * 0.40);
    } else {
      mapSize = Math.round(cardWidth * 0.196);
    }
  }

  // Font Sizes
  const titleFontSize = Math.max(11, Math.round(15 * baseScale));
  const bodyFontSize = Math.max(9, Math.round(11 * baseScale));
  const subFontSize = Math.max(8, Math.round(10 * baseScale));
  const badgeFontSize = Math.max(7, Math.round(9 * baseScale));

  const padding = Math.max(8, Math.round(12 * baseScale));
  const gap = Math.max(6, Math.round(10 * baseScale));
  const borderRadius = Math.max(6, Math.round(minDim * (options.borderRadiusRatio || 0.015)));

  return {
    baseScale,
    margin,
    cardWidth,
    mapSize,
    titleFontSize,
    bodyFontSize,
    subFontSize,
    badgeFontSize,
    padding,
    gap,
    borderRadius
  };
}

/**
 * Generates an offline vector mini-map canvas when network tiles are unavailable
 */
export function generateOfflineVectorMap(width, height, lat, lng) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background earth/satellite tone
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#2e4033'); // Forest/satellite green
  grad.addColorStop(0.5, '#3b4d40');
  grad.addColorStop(1, '#27382d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Stylized road/river vectors
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = Math.max(1, width * 0.025);
  ctx.beginPath();
  ctx.moveTo(0, height * 0.3);
  ctx.bezierCurveTo(width * 0.4, height * 0.35, width * 0.6, height * 0.15, width, height * 0.2);
  ctx.stroke();

  ctx.strokeStyle = '#4a90e2'; // River
  ctx.lineWidth = Math.max(1.5, width * 0.035);
  ctx.beginPath();
  ctx.moveTo(width * 0.15, 0);
  ctx.bezierCurveTo(width * 0.25, height * 0.5, width * 0.75, height * 0.6, width * 0.9, height);
  ctx.stroke();

  // Street grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  const step = width / 5;
  for (let x = step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Red Location Marker Pin in Center
  const cx = width / 2;
  const cy = height / 2;
  const pinRadius = Math.max(4, width * 0.09);

  // Pin shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + pinRadius * 1.3, pinRadius * 0.7, pinRadius * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pin body
  ctx.fillStyle = '#ef4444'; // Bright red
  ctx.beginPath();
  ctx.arc(cx, cy - pinRadius * 0.3, pinRadius, 0, Math.PI, true);
  ctx.lineTo(cx, cy + pinRadius * 1.1);
  ctx.closePath();
  ctx.fill();

  // Pin center dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy - pinRadius * 0.3, pinRadius * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Watermark text at bottom of map
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `bold ${Math.max(7, Math.round(width * 0.09))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Google', cx, height - 3);

  return canvas;
}

/**
 * Fetch online static map tiles via Esri Satellite or OpenStreetMap
 */
export async function fetchStaticMapTile(lat, lng, size = 180, mapStyle = 'satellite') {
  return new Promise((resolve) => {
    // Compute standard slippy map tile coordinates
    const zoom = 16;
    const n = Math.pow(2, zoom);
    const xtile = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const ytile = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

    let tileUrl;
    if (mapStyle === 'street') {
      tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${ytile}/${xtile}`;
    } else {
      tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ytile}/${xtile}`;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // 2.5s network timeout with graceful vector fallback
    const timer = setTimeout(() => {
      resolve(generateOfflineVectorMap(size, size, lat, lng));
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);

      // Add Red Pin Marker to downloaded tile
      const cx = size / 2;
      const cy = size / 2;
      const pinRadius = Math.max(4, size * 0.09);

      // Pin Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + pinRadius * 1.3, pinRadius * 0.7, pinRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pin Body
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy - pinRadius * 0.3, pinRadius, 0, Math.PI, true);
      ctx.lineTo(cx, cy + pinRadius * 1.1);
      ctx.closePath();
      ctx.fill();

      // White Center Dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - pinRadius * 0.3, pinRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Attribution
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = `bold ${Math.max(7, Math.round(size * 0.08))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Google', cx, size - 4);

      resolve(canvas);
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(generateOfflineVectorMap(size, size, lat, lng));
    };

    img.src = tileUrl;
  });
}

/**
 * Wrap text lines to fit within a specific pixel width
 */
export function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draw a rounded rectangle on canvas
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Main Rendering Function:
 * Stamps the source image with the custom Geo-tag details.
 * Specifically honors user requirement:
 * "stamp to be small and placed on left bottom corner, so that the photo is not blocked"
 */
export async function renderGeoTagPhoto(sourceImage, tagData = {}, userOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  const canvas = document.createElement('canvas');
  const imgW = sourceImage.naturalWidth || sourceImage.width;
  const imgH = sourceImage.naturalHeight || sourceImage.height;
  canvas.width = imgW;
  canvas.height = imgH;

  const ctx = canvas.getContext('2d');

  // 1. Draw original photograph in full native resolution
  ctx.drawImage(sourceImage, 0, 0, imgW, imgH);

  // 2. Calculate responsive metrics
  const m = calculateResponsiveMetrics(imgW, imgH, options);

  // 3. Prepare texts
  const titleText = tagData.title || 'Location Name, India 🇮🇳';
  const addressText = tagData.address || '';
  const coordsText = formatCoordinates(tagData.lat, tagData.lng, options.coordFormat);
  const dateTimeText = tagData.dateTimeStr || formatGpsDateTime(tagData.date || new Date());
  const customNote = options.showCustomNote && tagData.customNote ? tagData.customNote : '';

  // 4. Calculate content heights & line wrapping
  // Text area width
  const contentWidth = options.showMap
    ? m.cardWidth - (m.padding * 2 + m.mapSize + m.gap)
    : m.cardWidth - (m.padding * 2);

  ctx.font = `bold ${m.titleFontSize}px ${options.fontFamily}`;
  const titleLines = wrapText(ctx, titleText, contentWidth);

  ctx.font = `normal ${m.subFontSize}px ${options.fontFamily}`;
  const addressLines = wrapText(ctx, addressText, contentWidth).slice(0, 2); // Max 2 lines for compact height

  // Safeguard: Dynamic font downscaling & line splitting so Coordinates never overflow card width
  let coordsFontSize = m.bodyFontSize;
  ctx.font = `normal ${coordsFontSize}px ${options.fontFamily}`;
  let coordsLines = [coordsText];
  if (ctx.measureText(coordsText).width > contentWidth) {
    const minCoordsFont = Math.max(8, Math.round(m.bodyFontSize * 0.75));
    while (ctx.measureText(coordsText).width > contentWidth && coordsFontSize > minCoordsFont) {
      coordsFontSize -= 0.5;
      ctx.font = `normal ${coordsFontSize}px ${options.fontFamily}`;
    }
    if (ctx.measureText(coordsText).width > contentWidth) {
      coordsLines = coordsText.includes(',')
        ? coordsText.split(',').map((s) => s.trim())
        : wrapText(ctx, coordsText, contentWidth);
    }
  }

  // Safeguard: Dynamic font downscaling & line wrapping for Date & Time
  let dateTimeFontSize = m.bodyFontSize;
  ctx.font = `normal ${dateTimeFontSize}px ${options.fontFamily}`;
  let dateTimeLines = [dateTimeText];
  if (ctx.measureText(dateTimeText).width > contentWidth) {
    const minDateFont = Math.max(8, Math.round(m.bodyFontSize * 0.75));
    while (ctx.measureText(dateTimeText).width > contentWidth && dateTimeFontSize > minDateFont) {
      dateTimeFontSize -= 0.5;
      ctx.font = `normal ${dateTimeFontSize}px ${options.fontFamily}`;
    }
    if (ctx.measureText(dateTimeText).width > contentWidth) {
      dateTimeLines = wrapText(ctx, dateTimeText, contentWidth);
    }
  }

  // Safeguard: Dynamic line wrapping for Custom Note
  let noteLines = [];
  if (customNote) {
    ctx.font = `italic 600 ${m.subFontSize}px ${options.fontFamily}`;
    noteLines = wrapText(ctx, customNote, contentWidth);
  }

  const lineSpacing = Math.round(m.bodyFontSize * 0.35);

  let textTotalHeight = 0;
  textTotalHeight += titleLines.length * (m.titleFontSize + lineSpacing);
  textTotalHeight += addressLines.length * (m.subFontSize + lineSpacing);
  textTotalHeight += coordsLines.length * (coordsFontSize + lineSpacing);
  textTotalHeight += dateTimeLines.length * (dateTimeFontSize + lineSpacing);
  if (noteLines.length > 0) {
    textTotalHeight += noteLines.length * (m.subFontSize + lineSpacing);
  }

  // Card total height
  const contentHeight = Math.max(m.mapSize, textTotalHeight);
  const cardHeight = contentHeight + m.padding * 2;

  // 5. Determine Card Coordinates (X, Y) based on Layout
  let cardX = m.margin;
  let cardY = imgH - cardHeight - m.margin;

  if (options.layout === 'compact-left') {
    // Default: Small compact card in bottom-left corner
    cardX = m.margin;
    cardY = imgH - cardHeight - m.margin;
  } else if (options.layout === 'compact-right') {
    cardX = imgW - m.cardWidth - m.margin;
    cardY = imgH - cardHeight - m.margin;
  } else if (options.layout === 'top-left') {
    cardX = m.margin;
    cardY = m.margin;
  } else if (options.layout === 'top-right') {
    cardX = imgW - m.cardWidth - m.margin;
    cardY = m.margin;
  } else if (options.layout === 'full-width') {
    cardX = m.margin;
    cardY = imgH - cardHeight - m.margin;
  }

  // 6. Draw Card Background (Clean frameless translucent rounded card)
  ctx.save();
  ctx.fillStyle = options.bgColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = Math.round(12 * m.baseScale);
  ctx.shadowOffsetY = Math.round(4 * m.baseScale);

  drawRoundedRect(ctx, cardX, cardY, m.cardWidth, cardHeight, m.borderRadius);
  ctx.fill();
  ctx.restore();

  // 7. Draw Map Thumbnail if enabled (bottom-aligned)
  let textStartX = cardX + m.padding;
  const contentStartY = cardY + m.padding;

  if (options.showMap && m.mapSize > 0) {
    const mapCanvas = await fetchStaticMapTile(
      tagData.lat || 13.744088,
      tagData.lng || 79.709425,
      m.mapSize,
      options.mapStyle
    );

    ctx.save();
    // Clip map to rounded rectangle, bottom-aligned
    const mapX = cardX + m.padding;
    const mapY = contentStartY + Math.max(0, contentHeight - m.mapSize);
    const mapRadius = Math.max(4, Math.round(m.borderRadius * 0.7));

    drawRoundedRect(ctx, mapX, mapY, m.mapSize, m.mapSize, mapRadius);
    ctx.clip();
    ctx.drawImage(mapCanvas, mapX, mapY, m.mapSize, m.mapSize);
    ctx.restore();

    textStartX += m.mapSize + m.gap;
  }

  // 8. Render Metadata Text on Right Side (bottom-aligned per user request)
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Bottom alignment: align text vertically to bottom edge beside map
  const textOffsetY = Math.max(0, contentHeight - textTotalHeight);
  let currentY = contentStartY + textOffsetY;

  // Title
  ctx.fillStyle = options.textColor;
  ctx.font = `bold ${m.titleFontSize}px ${options.fontFamily}`;
  titleLines.forEach((line) => {
    ctx.fillText(line, textStartX, currentY);
    currentY += m.titleFontSize + lineSpacing;
  });

  // Address
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = `normal ${m.subFontSize}px ${options.fontFamily}`;
  addressLines.forEach((line) => {
    ctx.fillText(line, textStartX, currentY);
    currentY += m.subFontSize + lineSpacing;
  });

  // Coordinates (guaranteed to fit within contentWidth)
  ctx.fillStyle = options.textColor;
  ctx.font = `normal ${coordsFontSize}px ${options.fontFamily}`;
  coordsLines.forEach((line) => {
    ctx.fillText(line, textStartX, currentY);
    currentY += coordsFontSize + lineSpacing;
  });

  // Date & Time (guaranteed to fit within contentWidth)
  ctx.fillStyle = options.textColor;
  ctx.font = `normal ${dateTimeFontSize}px ${options.fontFamily}`;
  dateTimeLines.forEach((line) => {
    ctx.fillText(line, textStartX, currentY);
    currentY += dateTimeFontSize + lineSpacing;
  });

  // Custom Note / Organization (guaranteed to fit within contentWidth)
  if (noteLines.length > 0) {
    ctx.fillStyle = options.accentColor;
    ctx.font = `italic 600 ${m.subFontSize}px ${options.fontFamily}`;
    noteLines.forEach((line) => {
      ctx.fillText(line, textStartX, currentY);
      currentY += m.subFontSize + lineSpacing;
    });
  }

  ctx.restore();

  // 9. Draw Top-Left Badge ("GPS Map Camera" or Custom Logo, positioned top-left per user request)
  if (options.showBadge && options.badgeText) {
    ctx.save();
    const badgePadX = Math.round(8 * m.baseScale);
    const badgePadY = Math.round(3 * m.baseScale);
    ctx.font = `bold ${m.badgeFontSize}px ${options.fontFamily}`;
    const badgeMetrics = ctx.measureText(options.badgeText);
    const badgeW = badgeMetrics.width + badgePadX * 2 + Math.round(14 * m.baseScale);
    const badgeH = m.badgeFontSize + badgePadY * 2;

    // Top-left alignment with the stamp card
    const badgeX = cardX + Math.round(4 * m.baseScale);
    const badgeY = cardY - badgeH - Math.round(4 * m.baseScale);

    // Only draw if within image bounds
    if (badgeY >= 0) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, Math.round(4 * m.baseScale));
      ctx.fill();

      // Camera icon dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(badgeX + badgePadX + Math.round(3 * m.baseScale), badgeY + badgeH / 2, Math.round(3 * m.baseScale), 0, Math.PI * 2);
      ctx.fill();

      // Badge text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(options.badgeText, badgeX + badgePadX + Math.round(10 * m.baseScale), badgeY + badgeH / 2);
    }
    ctx.restore();
  }

  return canvas;
}
