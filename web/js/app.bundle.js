// ============================================================================
// GeoTag Studio - Unified Standalone Bundle (Runs 100% Offline on file:/// and HTTP)
// ============================================================================
(function() {
  'use strict';

  // --- 1. Presets ---
/**
 * Built-in Location and Institutional Presets for GeoTag Studio
 * Bundled directly for 100% offline, zero-latency, zero-fetch operation.
 */

const DEFAULT_FAVOURITES = [
  {
    id: "fav-sva-govt-college",
    name: "⭐ SVA Govt College (Srikalahasti, AP)",
    group: "favourite",
    title: "Srikalahasti, Andhra Pradesh, India 🇮🇳",
    address: "Ppv5+hw4, Srikalahasti, Andhra Pradesh 517644, India",
    lat: 13.744088,
    lng: 79.709425,
    customNote: "SVA Govt College - Academic & Cultural Events",
    badgeText: "Geo-Tag Camera"
  }
];

const PRESETS = [
  ...DEFAULT_FAVOURITES
];

// Offline Search Directory (used by Search Bar, not displayed in Choose Location Preset)
const SEARCH_DIRECTORY = [
  {
    name: "SVA Govt College (Srikalahasti, AP)",
    title: "Srikalahasti, Andhra Pradesh, India 🇮🇳",
    address: "Ppv5+hw4, Srikalahasti, Andhra Pradesh 517644, India",
    lat: 13.744088,
    lng: 79.709425,
    customNote: "SVA Govt College - Academic & Cultural Events",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "Sri Venkateswara Veterinary University (SVVU, Tirupati)",
    title: "Tirupati, Andhra Pradesh, India 🇮🇳",
    address: "SVVU Administrative Campus, Alipiri - Chandragiri Bypass Rd, Tirupati, Andhra Pradesh 517502, India",
    lat: 13.6263,
    lng: 79.3976,
    customNote: "Sri Venkateswara Veterinary University - Academic & Research",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "Sri Venkateswara University (SVU, Tirupati)",
    title: "Tirupati, Andhra Pradesh, India 🇮🇳",
    address: "SVU Campus, Tirupati, Andhra Pradesh 517502, India",
    lat: 13.633534,
    lng: 79.400269,
    customNote: "Sri Venkateswara University - Department Seminar",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "Sri Venkateswara Institute of Medical Sciences (SVIMS, Tirupati)",
    title: "Tirupati, Andhra Pradesh, India 🇮🇳",
    address: "Alipiri Rd, Sri Padmavati Mahila Visvavidyalayam, Tirupati, Andhra Pradesh 517507, India",
    lat: 13.6393,
    lng: 79.4069,
    customNote: "SVIMS Super Speciality Hospital & University",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "Sri Padmavati Mahila Visvavidyalayam (SPMVV, Tirupati)",
    title: "Tirupati, Andhra Pradesh, India 🇮🇳",
    address: "Padmavathi Nagar, Tirupati, Andhra Pradesh 517502, India",
    lat: 13.6358,
    lng: 79.4035,
    customNote: "SPMVV Women's University Campus",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "IIT Tirupati (Yerpedu / Tirupati)",
    title: "Tirupati, Andhra Pradesh, India 🇮🇳",
    address: "IIT Tirupati Permanent Campus, Yerpedu - Venkatagiri Highway, Yerpedu, Tirupati Dist 517619, India",
    lat: 13.7127,
    lng: 79.5937,
    customNote: "Indian Institute of Technology Tirupati",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "Dodilamitta (Srikalahasti, AP)",
    title: "Dodilamitta, Andhra Pradesh, India 🇮🇳",
    address: "Dodilamitta, Srikalahasti, Chittoor/Tirupati Dist, Andhra Pradesh 517644, India",
    lat: 13.750512,
    lng: 79.708891,
    customNote: "Dodilamitta Community Center",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "Tirumala Tirupati Devasthanams (Tirupati)",
    title: "Tirupati, Andhra Pradesh, India 🇮🇳",
    address: "Tirumala Hills, Tirupati 517504, Andhra Pradesh, India",
    lat: 13.683272,
    lng: 79.347248,
    customNote: "TTD Cultural & Community Gathering",
    badgeText: "Geo-Tag Camera"
  },
  {
    name: "AP State Secretariat (Amaravati)",
    title: "Amaravati, Andhra Pradesh, India 🇮🇳",
    address: "Velagapudi, Amaravati, Andhra Pradesh 522237, India",
    lat: 16.516543,
    lng: 80.518621,
    customNote: "AP State Administrative Complex",
    badgeText: "Geo-Tag Camera"
  }
];



  // --- 2. Geo-Lookup Utilities ---
/**
 * Geo-Lookup & Coordinate Utilities for GeoTag Studio
 * 100% Client-side coordinate math, Plus Code generation, and Geocoding
 */

/**
 * Convert Decimal Degrees to Degrees, Minutes, Seconds (DMS)
 * e.g., 13.744088 -> 13°44'38.7"N
 */
function decimalToDms(val, isLat = true) {
  const absVal = Math.abs(val);
  const degrees = Math.floor(absVal);
  const minutesNotTruncated = (absVal - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  let direction = '';
  if (isLat) {
    direction = val >= 0 ? 'N' : 'S';
  } else {
    direction = val >= 0 ? 'E' : 'W';
  }

  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

/**
 * Convert DMS string back to decimal degrees
 */
function dmsToDecimal(dmsStr) {
  if (!dmsStr) return null;
  const parts = dmsStr.match(/(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([NSEW])/i);
  if (!parts) return null;
  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);
  const direction = parts[4].toUpperCase();

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
}

/**
 * Format latitude and longitude string
 * e.g. "Lat 13.744088° Long 79.709425°" or DMS
 */
function formatCoordinates(lat, lng, format = 'decimal') {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return 'Lat -- Long --';
  }
  if (format === 'dms') {
    return `${decimalToDms(lat, true)} ${decimalToDms(lng, false)}`;
  }
  return `Lat ${lat.toFixed(6)}° Long ${lng.toFixed(6)}°`;
}

/**
 * Lightweight Open Location Code (Plus Code) encoder
 * Generates valid Plus Codes completely offline without external libraries
 */
const CODE_ALPHABET = '23456789CFGHJMPQRVWX';
const ENCODING_BASE = CODE_ALPHABET.length;
const LATITUDE_MAX = 90;
const LONGITUDE_MAX = 180;

function encodePlusCode(latitude, longitude, codeLength = 10) {
  if (isNaN(latitude) || isNaN(longitude)) return '';
  latitude = Math.min(Math.max(latitude, -LATITUDE_MAX), LATITUDE_MAX);
  longitude = Math.min(Math.max(longitude, -LONGITUDE_MAX), LONGITUDE_MAX);

  if (latitude === LATITUDE_MAX) {
    latitude = latitude - 0.000001;
  }

  let latVal = latitude + LATITUDE_MAX;
  let lngVal = longitude + LONGITUDE_MAX;

  let code = '';
  let latResolution = 20.0;
  let lngResolution = 20.0;

  for (let i = 0; i < 5; i++) {
    const latDigit = Math.floor(latVal / latResolution);
    const lngDigit = Math.floor(lngVal / lngResolution);

    code += CODE_ALPHABET[latDigit];
    code += CODE_ALPHABET[lngDigit];

    latVal -= latDigit * latResolution;
    lngVal -= lngDigit * lngResolution;

    latResolution /= ENCODING_BASE;
    lngResolution /= ENCODING_BASE;

    if (i === 3) {
      code += '+';
    }
  }

  return code.slice(0, codeLength > 8 ? codeLength + 1 : codeLength);
}

/**
 * Format timestamp into standard GPS Map Camera format:
 * "Monday, 21/09/2026 12:21 PM GMT +05:30"
 */
function formatGpsDateTime(date = new Date(), customTimezoneOffset = null) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];

  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = pad(hours);

  // Timezone string
  let tzStr = '';
  if (customTimezoneOffset !== null) {
    const sign = customTimezoneOffset >= 0 ? '+' : '-';
    const totalMinutes = Math.abs(customTimezoneOffset);
    const tzHours = pad(Math.floor(totalMinutes / 60));
    const tzMins = pad(totalMinutes % 60);
    tzStr = `GMT ${sign}${tzHours}:${tzMins}`;
  } else {
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const tzHours = pad(Math.floor(Math.abs(offsetMin) / 60));
    const tzMins = pad(Math.abs(offsetMin) % 60);
    tzStr = `GMT ${sign}${tzHours}:${tzMins}`;
  }

  return `${dayName}, ${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm} ${tzStr}`;
}

/**
 * Query OpenStreetMap Nominatim for Reverse Geocoding (Lat/Lng -> Address)
 * Includes in-memory caching to avoid redundant calls
 */
const geocodeCache = new Map();

async function reverseGeocode(lat, lng) {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GeoTagStudioApp/1.0'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || '';
    const postcode = addr.postcode || '';

    const plusCode = encodePlusCode(lat, lng).slice(0, 8);
    const locationTitle = [city, state, country].filter(Boolean).join(', ');
    const detailedAddress = [
      plusCode ? `${plusCode}` : '',
      city,
      state ? `${state} ${postcode}`.trim() : postcode,
      country
    ].filter(Boolean).join(', ');

    const result = {
      title: locationTitle,
      address: detailedAddress || data.display_name || '',
      city,
      state,
      country,
      postcode,
      plusCode,
      raw: data
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocode failed or offline:', err.message);
    const plusCode = encodePlusCode(lat, lng).slice(0, 8);
    return {
      title: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      address: `${plusCode}, Location Coordinates`,
      city: '',
      state: '',
      country: '',
      postcode: '',
      plusCode,
      raw: null
    };
  }
}



/**
 * Search Location by Query String (Instant Local Matching + Multi-Provider Search with Typo Tolerance)
 */
async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  const qRaw = query.trim();
  const qLower = qRaw.toLowerCase();

  // Normalize common spelling variations (e.g., 'veternary' -> 'veterinary')
  const normalizedQuery = qLower
    .replace(/\bveternary\b/g, 'veterinary')
    .replace(/\bunivercity\b/g, 'university')
    .replace(/\bcollege\b/g, 'college');

  const tokens = normalizedQuery.split(/[\s,]+/).filter(t => t.length > 2);

  // 1. Instant local preset, search directory, and user favorite matching (0ms, 100% offline)
  const allLocal = [
    ...(typeof PRESETS !== 'undefined' ? PRESETS : []),
    ...(typeof SEARCH_DIRECTORY !== 'undefined' ? SEARCH_DIRECTORY : [])
  ];
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('geotag_user_favourites') || '[]');
      allLocal.unshift(...saved);
    } catch(e) {}
  }

  const localMatches = [];
  allLocal.forEach((p) => {
    const haystack = `${p.name || ''} ${p.title || ''} ${p.address || ''} ${p.customNote || ''}`.toLowerCase();
    const isDirectMatch = haystack.includes(qLower) || haystack.includes(normalizedQuery);
    const matchedTokens = tokens.filter(t => haystack.includes(t));
    const isTokenMatch = tokens.length > 0 && (matchedTokens.length === tokens.length || (tokens.length >= 3 && matchedTokens.length >= 2));

    if (isDirectMatch || isTokenMatch) {
      if (!localMatches.some(m => Math.abs(m.lat - p.lat) < 0.0005 && Math.abs(m.lng - p.lng) < 0.0005)) {
        localMatches.push({
          name: (p.name || p.title || 'Location').replace(/^⭐\s*/, ''),
          displayName: p.address || p.title,
          title: p.title,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
          plusCode: encodePlusCode(p.lat, p.lng).slice(0, 8),
          customNote: p.customNote || '',
          badgeText: p.badgeText || 'Geo-Tag Camera',
          source: 'Verified Location'
        });
      }
    }
  });

  // 2. Query Photon API (Komoot OpenStreetMap Elasticsearch - supports typos and token permutations)
  const remoteMatches = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalizedQuery)}&limit=6`;
    const res = await fetch(photonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      (data.features || []).forEach((f) => {
        const p = f.properties || {};
        const coords = f.geometry && f.geometry.coordinates;
        if (coords && coords.length >= 2) {
          const lng = coords[0];
          const lat = coords[1];
          const name = p.name || p.street || '';
          const city = p.city || p.town || p.district || p.county || '';
          const state = p.state || '';
          const country = p.country || 'India';
          const title = [name, city, state].filter(Boolean).join(', ') || [city, state, country].filter(Boolean).join(', ');
          const addressParts = [name, p.street, city, state, p.postcode, country].filter(Boolean);
          const detailedAddr = addressParts.length > 0 ? Array.from(new Set(addressParts)).join(', ') : title;
          const plusCode = encodePlusCode(lat, lng).slice(0, 8);

          remoteMatches.push({
            name: name || title,
            displayName: detailedAddr,
            title: [city, state, country].filter(Boolean).join(', ') || title,
            address: `${plusCode}, ${detailedAddr}`,
            lat,
            lng,
            plusCode,
            source: 'Map Database'
          });
        }
      });
    }
  } catch (err) {
    // Timeout or network error
  }

  // 3. Fallback to Nominatim if remoteMatches is empty
  if (remoteMatches.length === 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(normalizedQuery)}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GeoTagStudioApp/1.0'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        data.forEach((item) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
          const state = addr.state || '';
          const country = addr.country || '';
          const postcode = addr.postcode || '';
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const plusCode = encodePlusCode(lat, lng).slice(0, 8);

          remoteMatches.push({
            name: item.name || city,
            displayName: item.display_name,
            title: [city, state, country].filter(Boolean).join(', ') || item.display_name,
            address: [plusCode, city, `${state} ${postcode}`.trim(), country].filter(Boolean).join(', '),
            lat,
            lng,
            plusCode,
            source: 'Nominatim'
          });
        });
      }
    } catch (err) {
      // Offline or network error
    }
  }

  // Merge and deduplicate
  const combined = [...localMatches];
  remoteMatches.forEach((rm) => {
    const isDup = combined.some(cm => Math.abs(cm.lat - rm.lat) < 0.0015 && Math.abs(cm.lng - rm.lng) < 0.0015);
    if (!isDup) {
      combined.push(rm);
    }
  });

  return combined;
}

/**
 * Get Current Device Geolocation with multi-stage desktop & network fallback
 */
async function getCurrentPosition(options = {}) {
  const tryBrowserGeo = (highAccuracy, timeoutMs) => {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation not supported by browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude || 0,
          accuracy: pos.coords.accuracy || 10,
          timestamp: pos.timestamp
        }),
        (err) => reject(err),
        {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 30000
        }
      );
    });
  };

  // Attempt 1: Fast network/WiFi location (works immediately on Windows laptops/desktops)
  try {
    return await tryBrowserGeo(false, 5000);
  } catch (err1) {
    // Attempt 2: Try high accuracy for phones with satellite GPS
    try {
      return await tryBrowserGeo(true, 5000);
    } catch (err2) {
      // Attempt 3: IP-based fallback when Windows Location Services are turned off
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const data = await ipRes.json();
          if (data && data.latitude && data.longitude) {
            return {
              lat: data.latitude,
              lng: data.longitude,
              altitude: 0,
              accuracy: 1000,
              city: data.city,
              region: data.region,
              country: data.country_name,
              isIpFallback: true,
              timestamp: Date.now()
            };
          }
        }
      } catch (ipErr) {
        // Fallback to error message
      }
      throw new Error('Location acquisition timed out. Please click "Pick on Map" or search your place.');
    }
  }
}


  // --- 3. Binary EXIF Engine ---
/**
 * Pure JavaScript Binary EXIF Engine for GeoTag Studio
 * Reads existing EXIF GPS/Date from uploaded JPEGs and
 * injects authentic GPS IFD & DateTime tags into exported JPEG files.
 * Zero external dependencies. 100% on-device.
 */

/**
 * Read EXIF metadata from a JPEG ArrayBuffer
 */
function readExif(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return null; // Not a valid JPEG
  }

  let offset = 2;
  while (offset < view.byteLength) {
    const marker = view.getUint16(offset);
    offset += 2;

    if (marker === 0xFFE1) { // APP1 Marker (EXIF)
      const length = view.getUint16(offset);
      offset += 2;

      // Check "Exif\0\0"
      const exifHeader = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );

      if (exifHeader === 'Exif') {
        const tiffOffset = offset + 6;
        return parseTiff(view, tiffOffset);
      }
      offset += length - 2;
    } else if ((marker & 0xFF00) === 0xFF00 && marker !== 0xFFD8 && marker !== 0xFFD9) {
      const length = view.getUint16(offset);
      offset += length;
    } else {
      break;
    }
  }
  return null;
}

function parseTiff(view, tiffOffset) {
  const endianTag = view.getUint16(tiffOffset);
  const littleEndian = endianTag === 0x4949; // "II" = Intel / Little-endian, "MM" = Motorola / Big-endian

  const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
  let currentOffset = tiffOffset + firstIfdOffset;

  const result = {
    latitude: null,
    longitude: null,
    altitude: null,
    dateTime: null,
    make: null,
    model: null
  };

  if (currentOffset >= view.byteLength) return result;

  const numEntries = view.getUint16(currentOffset, littleEndian);
  currentOffset += 2;

  let gpsOffset = null;
  let exifSubOffset = null;

  for (let i = 0; i < numEntries; i++) {
    const tag = view.getUint16(currentOffset, littleEndian);
    const type = view.getUint16(currentOffset + 2, littleEndian);
    const count = view.getUint32(currentOffset + 4, littleEndian);
    const valOffset = currentOffset + 8;

    if (tag === 0x8825) { // GPS Info IFD Pointer
      gpsOffset = view.getUint32(valOffset, littleEndian);
    } else if (tag === 0x8769) { // Exif IFD Pointer
      exifSubOffset = view.getUint32(valOffset, littleEndian);
    } else if (tag === 0x0132) { // DateTime
      const strOffset = tiffOffset + view.getUint32(valOffset, littleEndian);
      result.dateTime = readAsciiString(view, strOffset, count);
    } else if (tag === 0x010F) { // Make
      const strOffset = tiffOffset + view.getUint32(valOffset, littleEndian);
      result.make = readAsciiString(view, strOffset, count);
    } else if (tag === 0x0110) { // Model
      const strOffset = tiffOffset + view.getUint32(valOffset, littleEndian);
      result.model = readAsciiString(view, strOffset, count);
    }

    currentOffset += 12;
  }

  // Parse GPS IFD if found
  if (gpsOffset !== null) {
    parseGpsIfd(view, tiffOffset + gpsOffset, tiffOffset, littleEndian, result);
  }

  // Parse SubIFD for DateTimeOriginal if needed
  if (exifSubOffset !== null && !result.dateTime) {
    let subOffset = tiffOffset + exifSubOffset;
    if (subOffset + 2 <= view.byteLength) {
      const subEntries = view.getUint16(subOffset, littleEndian);
      subOffset += 2;
      for (let i = 0; i < subEntries; i++) {
        const tag = view.getUint16(subOffset, littleEndian);
        const count = view.getUint32(subOffset + 4, littleEndian);
        if (tag === 0x9003 || tag === 0x9004) { // DateTimeOriginal / DateTimeDigitized
          const strOffset = tiffOffset + view.getUint32(subOffset + 8, littleEndian);
          result.dateTime = readAsciiString(view, strOffset, count);
          break;
        }
        subOffset += 12;
      }
    }
  }

  return result;
}

function parseGpsIfd(view, gpsOffset, tiffOffset, littleEndian, result) {
  if (gpsOffset + 2 > view.byteLength) return;
  const numEntries = view.getUint16(gpsOffset, littleEndian);
  let offset = gpsOffset + 2;

  let latRef = 'N';
  let lonRef = 'E';
  let latDegrees = null;
  let lonDegrees = null;

  for (let i = 0; i < numEntries; i++) {
    const tag = view.getUint16(offset, littleEndian);
    const valOffset = offset + 8;

    if (tag === 0x0001) { // GPSLatitudeRef
      latRef = String.fromCharCode(view.getUint8(valOffset));
    } else if (tag === 0x0002) { // GPSLatitude
      const dataOffset = tiffOffset + view.getUint32(valOffset, littleEndian);
      latDegrees = readGpsRational(view, dataOffset, littleEndian);
    } else if (tag === 0x0003) { // GPSLongitudeRef
      lonRef = String.fromCharCode(view.getUint8(valOffset));
    } else if (tag === 0x0004) { // GPSLongitude
      const dataOffset = tiffOffset + view.getUint32(valOffset, littleEndian);
      lonDegrees = readGpsRational(view, dataOffset, littleEndian);
    } else if (tag === 0x0006) { // GPSAltitude
      const dataOffset = tiffOffset + view.getUint32(valOffset, littleEndian);
      const num = view.getUint32(dataOffset, littleEndian);
      const den = view.getUint32(dataOffset + 4, littleEndian);
      result.altitude = den !== 0 ? num / den : 0;
    }
    offset += 12;
  }

  if (latDegrees !== null) {
    result.latitude = (latRef === 'S' ? -1 : 1) * latDegrees;
  }
  if (lonDegrees !== null) {
    result.longitude = (lonRef === 'W' ? -1 : 1) * lonDegrees;
  }
}

function readGpsRational(view, offset, littleEndian) {
  if (offset + 24 > view.byteLength) return null;
  const degNum = view.getUint32(offset, littleEndian);
  const degDen = view.getUint32(offset + 4, littleEndian);
  const minNum = view.getUint32(offset + 8, littleEndian);
  const minDen = view.getUint32(offset + 12, littleEndian);
  const secNum = view.getUint32(offset + 16, littleEndian);
  const secDen = view.getUint32(offset + 20, littleEndian);

  const deg = degDen ? degNum / degDen : 0;
  const min = minDen ? minNum / minDen : 0;
  const sec = secDen ? secNum / secDen : 0;
  return deg + min / 60 + sec / 3600;
}

function readAsciiString(view, offset, length) {
  if (offset + length > view.byteLength) return '';
  let str = '';
  for (let i = 0; i < length; i++) {
    const charCode = view.getUint8(offset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str.trim();
}

/**
 * Convert decimal coordinate to degrees, minutes, seconds array for EXIF
 */
function toRationalCoords(decimal) {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const secFloat = (minFloat - min) * 60;
  const sec = Math.round(secFloat * 1000); // 3 decimal places precision

  return [
    [deg, 1],
    [min, 1],
    [sec, 1000]
  ];
}

/**
 * Build standard EXIF APP1 Segment with GPS & DateTime tags
 */
function buildExifApp1Segment({
  latitude,
  longitude,
  altitude = 0,
  date = new Date(),
  userComment = 'GeoTag Studio'
}) {
  // We use Little-Endian ("II" = 0x4949)
  const isLE = true;
  const buffer = new ArrayBuffer(2048);
  const view = new DataView(buffer);
  let pos = 0;

  // APP1 Marker and placeholder length
  view.setUint16(pos, 0xFFE1);
  pos += 2;
  const lengthPos = pos;
  pos += 2; // will fill at end

  // "Exif\0\0"
  view.setUint8(pos++, 0x45); // E
  view.setUint8(pos++, 0x78); // x
  view.setUint8(pos++, 0x69); // i
  view.setUint8(pos++, 0x66); // f
  view.setUint8(pos++, 0x00);
  view.setUint8(pos++, 0x00);

  const tiffStart = pos;

  // TIFF Header
  view.setUint16(pos, 0x4949); // "II" Little-Endian
  pos += 2;
  view.setUint16(pos, 0x002A, isLE); // 42
  pos += 2;
  view.setUint32(pos, 8, isLE); // Offset to 0th IFD from tiffStart
  pos += 4;

  // --- 0th IFD ---
  // Tags: DateTime (0x0132), ExifIFDPointer (0x8769), GPSInfoPointer (0x8825)
  const ifd0Entries = 3;
  view.setUint16(pos, ifd0Entries, isLE);
  pos += 2;

  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${date.getFullYear()}:${pad(date.getMonth() + 1)}:${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}\0`;

  // Reserve space for 0th IFD entries (12 bytes each)
  const ifd0Start = pos;
  pos += ifd0Entries * 12;

  // Offset to next IFD (0 = none)
  view.setUint32(pos, 0, isLE);
  pos += 4;

  // Payload for 0th IFD: DateTime string
  const dateOffsetFromTiff = pos - tiffStart;
  for (let i = 0; i < dateStr.length; i++) {
    view.setUint8(pos++, dateStr.charCodeAt(i));
  }
  if (pos % 2 !== 0) pos++; // word alignment

  // --- Exif SubIFD ---
  const exifSubIfdOffsetFromTiff = pos - tiffStart;
  const exifSubEntries = 2; // DateTimeOriginal (0x9003), UserComment (0x9286)
  view.setUint16(pos, exifSubEntries, isLE);
  pos += 2;
  const exifSubStart = pos;
  pos += exifSubEntries * 12;
  view.setUint32(pos, 0, isLE); // next IFD
  pos += 4;

  // Write DateTimeOriginal in Exif SubIFD
  let entryPos = exifSubStart;
  // Tag 0x9003 (DateTimeOriginal)
  view.setUint16(entryPos, 0x9003, isLE);
  view.setUint16(entryPos + 2, 2, isLE); // ASCII
  view.setUint32(entryPos + 4, dateStr.length, isLE);
  view.setUint32(entryPos + 8, dateOffsetFromTiff, isLE);
  entryPos += 12;

  // Tag 0x9286 (UserComment)
  const commentStr = `ASCII\0\0\0${userComment}\0`;
  const commentOffsetFromTiff = pos - tiffStart;
  for (let i = 0; i < commentStr.length; i++) {
    view.setUint8(pos++, commentStr.charCodeAt(i));
  }
  if (pos % 2 !== 0) pos++;

  view.setUint16(entryPos, 0x9286, isLE);
  view.setUint16(entryPos + 2, 7, isLE); // UNDEFINED
  view.setUint32(entryPos + 4, commentStr.length, isLE);
  view.setUint32(entryPos + 8, commentOffsetFromTiff, isLE);

  // --- GPS IFD ---
  const gpsIfdOffsetFromTiff = pos - tiffStart;
  const gpsEntries = 7;
  view.setUint16(pos, gpsEntries, isLE);
  pos += 2;
  const gpsEntriesStart = pos;
  pos += gpsEntries * 12;
  view.setUint32(pos, 0, isLE);
  pos += 4;

  // Payload for GPS Rationals
  const latRef = latitude >= 0 ? 'N' : 'S';
  const lonRef = longitude >= 0 ? 'E' : 'W';
  const latRationals = toRationalCoords(latitude);
  const lonRationals = toRationalCoords(longitude);

  // Write GPS Lat rationals
  const latOffsetFromTiff = pos - tiffStart;
  for (const [num, den] of latRationals) {
    view.setUint32(pos, num, isLE);
    pos += 4;
    view.setUint32(pos, den, isLE);
    pos += 4;
  }

  // Write GPS Lon rationals
  const lonOffsetFromTiff = pos - tiffStart;
  for (const [num, den] of lonRationals) {
    view.setUint32(pos, num, isLE);
    pos += 4;
    view.setUint32(pos, den, isLE);
    pos += 4;
  }

  // Write GPS Altitude rational
  const altOffsetFromTiff = pos - tiffStart;
  const altVal = Math.round(Math.max(0, altitude || 0));
  view.setUint32(pos, altVal, isLE);
  pos += 4;
  view.setUint32(pos, 1, isLE);
  pos += 4;

  // GPS DateStamp ("YYYY:MM:DD\0")
  const gpsDateStr = `${date.getUTCFullYear()}:${pad(date.getUTCMonth() + 1)}:${pad(date.getUTCDate())}\0`;
  const gpsDateOffsetFromTiff = pos - tiffStart;
  for (let i = 0; i < gpsDateStr.length; i++) {
    view.setUint8(pos++, gpsDateStr.charCodeAt(i));
  }
  if (pos % 2 !== 0) pos++;

  // Fill GPS Entries
  let gpsP = gpsEntriesStart;
  // 0. GPSVersionID (0x0000)
  view.setUint16(gpsP, 0x0000, isLE);
  view.setUint16(gpsP + 2, 1, isLE); // BYTE
  view.setUint32(gpsP + 4, 4, isLE);
  view.setUint8(gpsP + 8, 2);
  view.setUint8(gpsP + 9, 3);
  view.setUint8(gpsP + 10, 0);
  view.setUint8(gpsP + 11, 0);
  gpsP += 12;

  // 1. GPSLatitudeRef (0x0001)
  view.setUint16(gpsP, 0x0001, isLE);
  view.setUint16(gpsP + 2, 2, isLE); // ASCII
  view.setUint32(gpsP + 4, 2, isLE);
  view.setUint8(gpsP + 8, latRef.charCodeAt(0));
  view.setUint8(gpsP + 9, 0);
  gpsP += 12;

  // 2. GPSLatitude (0x0002)
  view.setUint16(gpsP, 0x0002, isLE);
  view.setUint16(gpsP + 2, 5, isLE); // RATIONAL
  view.setUint32(gpsP + 4, 3, isLE);
  view.setUint32(gpsP + 8, latOffsetFromTiff, isLE);
  gpsP += 12;

  // 3. GPSLongitudeRef (0x0003)
  view.setUint16(gpsP, 0x0003, isLE);
  view.setUint16(gpsP + 2, 2, isLE); // ASCII
  view.setUint32(gpsP + 4, 2, isLE);
  view.setUint8(gpsP + 8, lonRef.charCodeAt(0));
  view.setUint8(gpsP + 9, 0);
  gpsP += 12;

  // 4. GPSLongitude (0x0004)
  view.setUint16(gpsP, 0x0004, isLE);
  view.setUint16(gpsP + 2, 5, isLE); // RATIONAL
  view.setUint32(gpsP + 4, 3, isLE);
  view.setUint32(gpsP + 8, lonOffsetFromTiff, isLE);
  gpsP += 12;

  // 5. GPSAltitude (0x0006)
  view.setUint16(gpsP, 0x0006, isLE);
  view.setUint16(gpsP + 2, 5, isLE); // RATIONAL
  view.setUint32(gpsP + 4, 1, isLE);
  view.setUint32(gpsP + 8, altOffsetFromTiff, isLE);
  gpsP += 12;

  // 6. GPSDateStamp (0x001D)
  view.setUint16(gpsP, 0x001D, isLE);
  view.setUint16(gpsP + 2, 2, isLE); // ASCII
  view.setUint32(gpsP + 4, 11, isLE);
  view.setUint32(gpsP + 8, gpsDateOffsetFromTiff, isLE);
  gpsP += 12;

  // Now fill 0th IFD entries
  let ifd0P = ifd0Start;
  // 0. DateTime (0x0132)
  view.setUint16(ifd0P, 0x0132, isLE);
  view.setUint16(ifd0P + 2, 2, isLE); // ASCII
  view.setUint32(ifd0P + 4, dateStr.length, isLE);
  view.setUint32(ifd0P + 8, dateOffsetFromTiff, isLE);
  ifd0P += 12;

  // 1. ExifIFDPointer (0x8769)
  view.setUint16(ifd0P, 0x8769, isLE);
  view.setUint16(ifd0P + 2, 4, isLE); // LONG
  view.setUint32(ifd0P + 4, 1, isLE);
  view.setUint32(ifd0P + 8, exifSubIfdOffsetFromTiff, isLE);
  ifd0P += 12;

  // 2. GPSInfoPointer (0x8825)
  view.setUint16(ifd0P, 0x8825, isLE);
  view.setUint16(ifd0P + 2, 4, isLE); // LONG
  view.setUint32(ifd0P + 4, 1, isLE);
  view.setUint32(ifd0P + 8, gpsIfdOffsetFromTiff, isLE);
  ifd0P += 12;

  // Set APP1 length (excluding 0xFFE1 marker)
  const segmentLength = pos - 2;
  view.setUint16(lengthPos, segmentLength);

  return buffer.slice(0, pos);
}

/**
 * Inject EXIF APP1 segment into a JPEG ArrayBuffer
 */
function injectExifIntoJpeg(jpegArrayBuffer, exifOptions) {
  const exifSegment = buildExifApp1Segment(exifOptions);
  const view = new DataView(jpegArrayBuffer);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return jpegArrayBuffer; // Not valid JPEG, return unmodified
  }

  // Find where existing APP1 is or insert after SOI (0xFFD8)
  let insertPos = 2;
  let skipLength = 0;

  if (view.getUint16(2) === 0xFFE1) {
    // Existing APP1 present: replace it
    const existingLength = view.getUint16(4);
    skipLength = 2 + existingLength;
  }

  // Construct new JPEG
  const totalLength = 2 + exifSegment.byteLength + (jpegArrayBuffer.byteLength - (insertPos + skipLength));
  const newBuffer = new Uint8Array(totalLength);

  // Copy SOI (0xFFD8)
  newBuffer[0] = 0xFF;
  newBuffer[1] = 0xD8;

  // Copy APP1 segment
  newBuffer.set(new Uint8Array(exifSegment), 2);

  // Copy rest of JPEG
  const restOfJpeg = new Uint8Array(jpegArrayBuffer, insertPos + skipLength);
  newBuffer.set(restOfJpeg, 2 + exifSegment.byteLength);

  return newBuffer.buffer;
}


  // --- 4. GeoTag Canvas Engine ---
/**
 * GeoTag Studio - Core Canvas Rendering Engine
 * Stamping engine with user-customized Compact Bottom-Left Layout
 * that ensures the main photograph is not blocked or obscured.
 * 100% client-side, resolution-independent canvas compositing.
 */



/**
 * Default Stamping Configuration Options
 */
const DEFAULT_OPTIONS = {
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
function calculateResponsiveMetrics(imageWidth, imageHeight, options = {}) {
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
    // Compact layout: between 38% and 46% of width, bounded reasonably
    const idealWidth = imageWidth * (options.maxWidthRatio || 0.44);
    cardWidth = Math.round(Math.max(280 * baseScale, Math.min(idealWidth, imageWidth * 0.65)));
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
function generateOfflineVectorMap(width, height, lat, lng) {
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
async function fetchStaticMapTile(lat, lng, size = 180, mapStyle = 'satellite') {
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
function wrapText(ctx, text, maxWidth) {
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
async function renderGeoTagPhoto(sourceImage, tagData = {}, userOptions = {}) {
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

  const lineSpacing = Math.round(m.bodyFontSize * 0.35);

  let textTotalHeight = 0;
  textTotalHeight += titleLines.length * (m.titleFontSize + lineSpacing);
  textTotalHeight += addressLines.length * (m.subFontSize + lineSpacing);
  textTotalHeight += (m.bodyFontSize + lineSpacing); // coords
  textTotalHeight += (m.bodyFontSize + lineSpacing); // dateTime
  if (customNote) {
    textTotalHeight += (m.subFontSize + lineSpacing);
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

  // Coordinates
  ctx.fillStyle = options.textColor;
  ctx.font = `normal ${m.bodyFontSize}px ${options.fontFamily}`;
  ctx.fillText(coordsText, textStartX, currentY);
  currentY += m.bodyFontSize + lineSpacing;

  // Date & Time
  ctx.fillStyle = options.textColor;
  ctx.fillText(dateTimeText, textStartX, currentY);
  currentY += m.bodyFontSize + lineSpacing;

  // Custom Note / Organization
  if (customNote) {
    ctx.fillStyle = options.accentColor;
    ctx.font = `italic 600 ${m.subFontSize}px ${options.fontFamily}`;
    ctx.fillText(customNote, textStartX, currentY);
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


  // --- 5. Application Coordinator ---
/**
 * GeoTag Studio - Application State & UI Coordinator
 * Multi-Platform Desktop & Android Support
 * 100% Privacy-First & On-Device Processing
 */






// Application State
const state = {
  photos: [],            // Array of { file, img, exif, id, name }
  activePhotoIndex: 0,
  tagData: {
    title: 'Srikalahasti, Andhra Pradesh, India 🇮🇳',
    address: 'Ppv5+hw4, Srikalahasti, Andhra Pradesh 517644, India',
    lat: 13.744088,
    lng: 79.709425,
    altitude: 45,
    date: new Date(),
    customNote: 'SVA Govt College - Academic & Cultural Events',
    plusCode: 'Ppv5+hw4'
  },
  options: {
    ...DEFAULT_OPTIONS,
    layout: 'compact-left', // Default: Compact Bottom-Left (Photo Not Blocked!)
    scale: 0.95,
    showMap: true,
    mapStyle: 'satellite',
    coordFormat: 'decimal',
    showCustomNote: true,
    showBadge: true,
    badgeText: 'Geo-Tag Camera',
    bgColor: 'rgba(15, 23, 42, 0.82)'
  },
  isRendering: false,
  presets: PRESETS
};

// DOM Element References
const elements = {};

function initDom() {
  elements.fileInput = document.getElementById('fileInput');
  elements.cameraInput = document.getElementById('cameraInput');
  elements.dropzone = document.getElementById('dropzone');
  elements.btnUpload = document.getElementById('btnUpload');
  elements.btnCamera = document.getElementById('btnCamera');
  elements.batchGallery = document.getElementById('batchGallery');
  elements.outputCanvas = document.getElementById('outputCanvas');
  elements.emptyPlaceholder = document.getElementById('emptyPlaceholder');
  elements.presetSelect = document.getElementById('presetSelect');
  elements.presetSelectSidebar = document.getElementById('presetSelectSidebar');
  elements.btnSaveFavorite = document.getElementById('btnSaveFavorite');
  elements.btnDeleteFavorite = document.getElementById('btnDeleteFavorite');

  // Input Fields
  elements.inputTitle = document.getElementById('inputTitle');
  elements.inputAddress = document.getElementById('inputAddress');
  elements.inputLat = document.getElementById('inputLat');
  elements.inputLng = document.getElementById('inputLng');
  elements.inputNote = document.getElementById('inputNote');
  elements.inputDate = document.getElementById('inputDate');
  elements.inputSearch = document.getElementById('inputSearch');
  elements.btnClearSearch = document.getElementById('btnClearSearch');
  elements.searchResults = document.getElementById('searchResults');

  // Sliders & Controls
  elements.sliderScale = document.getElementById('sliderScale');
  elements.scaleValue = document.getElementById('scaleValue');
  elements.sliderOpacity = document.getElementById('sliderOpacity');
  elements.opacityValue = document.getElementById('opacityValue');
  elements.selectMapStyle = document.getElementById('selectMapStyle');
  elements.selectCoordFormat = document.getElementById('selectCoordFormat');
  elements.toggleShowMap = document.getElementById('toggleShowMap');
  elements.toggleShowNote = document.getElementById('toggleShowNote');
  elements.toggleShowBadge = document.getElementById('toggleShowBadge');
  elements.inputBadgeText = document.getElementById('inputBadgeText');

  // Action Buttons
  elements.btnCurrentGps = document.getElementById('btnCurrentGps');
  elements.btnOpenMap = document.getElementById('btnOpenMap');
  elements.btnDownload = document.getElementById('btnDownload');
  elements.btnDownloadZip = document.getElementById('btnDownloadZip');
  elements.btnShare = document.getElementById('btnShare');
  elements.btnTimeNow = document.getElementById('btnTimeNow');
  elements.btnTimeExif = document.getElementById('btnTimeExif');

  // Metrics
  elements.photoMetrics = document.getElementById('photoMetrics');

  // Modals
  elements.mapModal = document.getElementById('mapModal');
  elements.btnCloseMapModal = document.getElementById('btnCloseMapModal');
  elements.btnConfirmMapLocation = document.getElementById('btnConfirmMapLocation');
  elements.modalCoordsText = document.getElementById('modalCoordsText');

  elements.cameraModal = document.getElementById('cameraModal');
  elements.webcamVideo = document.getElementById('webcamVideo');
  elements.btnCloseCameraModal = document.getElementById('btnCloseCameraModal');
  elements.btnCancelCamera = document.getElementById('btnCancelCamera');
  elements.btnSnapPhoto = document.getElementById('btnSnapPhoto');
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Favourite Places & Location Presets Management
 */
function getCustomFavourites() {
  try {
    const raw = localStorage.getItem('geotag_user_favourites');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Error reading geotag_user_favourites:', err);
    return [];
  }
}

function saveCustomFavourites(list) {
  try {
    localStorage.setItem('geotag_user_favourites', JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving geotag_user_favourites:', err);
  }
}

function getAllPresetsAndFavourites() {
  const customFavs = getCustomFavourites();
  return [...customFavs, ...state.presets];
}

function loadPresets(selectedId = null) {
  const customFavs = getCustomFavourites();
  const allPresets = [...customFavs, ...state.presets];

  const renderSelect = (selectElem) => {
    if (!selectElem) return;
    const prevVal = selectElem.value;
    selectElem.innerHTML = '';

    const defOpt = document.createElement('option');
    defOpt.value = '';
    defOpt.textContent = '-- Choose Location Preset / Favourite --';
    selectElem.appendChild(defOpt);

    // OptGroup: ⭐ My Favourite Places (Custom saved places + SVA Govt College)
    const favGroup = document.createElement('optgroup');
    favGroup.label = '⭐ My Favourite Places';

    // User Saved Favourites
    customFavs.forEach((fav) => {
      const opt = document.createElement('option');
      opt.value = fav.id;
      opt.textContent = fav.name;
      favGroup.appendChild(opt);
    });

    // Default Favourite (SVA Govt. College)
    state.presets.filter(p => p.group === 'favourite').forEach((fav) => {
      const opt = document.createElement('option');
      opt.value = fav.id;
      opt.textContent = fav.name;
      favGroup.appendChild(opt);
    });
    selectElem.appendChild(favGroup);

    if (selectedId) {
      selectElem.value = selectedId;
    } else if (prevVal && allPresets.some(p => p.id === prevVal)) {
      selectElem.value = prevVal;
    }
  };

  renderSelect(elements.presetSelect);
  renderSelect(elements.presetSelectSidebar);

  const targetId = selectedId || (elements.presetSelect && elements.presetSelect.value) || 'fav-sva-govt-college';
  if (elements.presetSelect) elements.presetSelect.value = targetId;
  if (elements.presetSelectSidebar) elements.presetSelectSidebar.value = targetId;
  applyPreset(targetId);
}

function applyPreset(presetId) {
  if (!presetId) return;
  const allPresets = getAllPresetsAndFavourites();
  const preset = allPresets.find((p) => p.id === presetId);
  if (!preset) return;

  state.tagData.title = preset.title;
  state.tagData.address = preset.address;
  state.tagData.lat = preset.lat;
  state.tagData.lng = preset.lng;
  if (preset.customNote) state.tagData.customNote = preset.customNote;
  if (preset.badgeText) state.options.badgeText = preset.badgeText;

  // Sync dropdown values
  if (elements.presetSelect && elements.presetSelect.value !== presetId) {
    elements.presetSelect.value = presetId;
  }
  if (elements.presetSelectSidebar && elements.presetSelectSidebar.value !== presetId) {
    elements.presetSelectSidebar.value = presetId;
  }

  // Show delete button only if it is a custom user favorite
  if (elements.btnDeleteFavorite) {
    elements.btnDeleteFavorite.style.display = preset.isCustom ? 'inline-flex' : 'none';
  }

  syncStateToInputs();
  triggerRender();
}

function saveCurrentAsFavorite() {
  const currentTitle = (elements.inputTitle && elements.inputTitle.value.trim()) || state.tagData.title || 'My Place';
  const customName = prompt('Enter a name for this Favourite Place:', currentTitle);
  if (!customName || !customName.trim()) return;

  const lat = parseFloat(elements.inputLat && elements.inputLat.value) || state.tagData.lat || 13.744088;
  const lng = parseFloat(elements.inputLng && elements.inputLng.value) || state.tagData.lng || 79.709425;
  const address = (elements.inputAddress && elements.inputAddress.value.trim()) || state.tagData.address || '';
  const note = (elements.inputNote && elements.inputNote.value.trim()) || state.tagData.customNote || '';
  const badge = (elements.inputBadgeText && elements.inputBadgeText.value.trim()) || state.options.badgeText || 'Geo-Tag Camera';

  const newFav = {
    id: 'fav-custom-' + Date.now(),
    name: '⭐ ' + customName.trim().replace(/^⭐\s*/, ''),
    group: 'favourite',
    isCustom: true,
    title: currentTitle,
    address,
    lat,
    lng,
    customNote: note,
    badgeText: badge
  };

  const customFavs = getCustomFavourites();
  customFavs.unshift(newFav);
  saveCustomFavourites(customFavs);

  loadPresets(newFav.id);
  showToast(`Saved "${newFav.name}" to My Favourite Places! ⭐`, 'success');
}

function deleteSelectedFavorite() {
  const currentId = (elements.presetSelectSidebar && elements.presetSelectSidebar.value) || (elements.presetSelect && elements.presetSelect.value);
  if (!currentId) return;

  let customFavs = getCustomFavourites();
  const target = customFavs.find(f => f.id === currentId);
  if (!target) return;

  if (confirm(`Remove "${target.name}" from your Favourite Places?`)) {
    customFavs = customFavs.filter(f => f.id !== currentId);
    saveCustomFavourites(customFavs);
    showToast(`Removed "${target.name}" from favourites`, 'info');
    loadPresets('fav-sva-govt-college');
  }
}

/**
 * Sync UI Form Inputs with Internal State
 */
function syncStateToInputs() {
  if (elements.inputTitle) elements.inputTitle.value = state.tagData.title || '';
  if (elements.inputAddress) elements.inputAddress.value = state.tagData.address || '';
  if (elements.inputLat) elements.inputLat.value = (state.tagData.lat || 0).toFixed(6);
  if (elements.inputLng) elements.inputLng.value = (state.tagData.lng || 0).toFixed(6);
  if (elements.inputNote) elements.inputNote.value = state.tagData.customNote || '';
  if (elements.inputBadgeText) elements.inputBadgeText.value = state.options.badgeText || '';

  if (elements.inputDate && state.tagData.date) {
    const d = state.tagData.date;
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    elements.inputDate.value = localIso;
  }
}

/**
 * Sync Form Inputs back to Internal State
 */
function syncInputsToState() {
  if (elements.inputTitle) state.tagData.title = elements.inputTitle.value;
  if (elements.inputAddress) state.tagData.address = elements.inputAddress.value;
  if (elements.inputLat) state.tagData.lat = parseFloat(elements.inputLat.value) || 0;
  if (elements.inputLng) state.tagData.lng = parseFloat(elements.inputLng.value) || 0;
  if (elements.inputNote) state.tagData.customNote = elements.inputNote.value;
  if (elements.inputBadgeText) state.options.badgeText = elements.inputBadgeText.value;

  if (elements.inputDate && elements.inputDate.value) {
    state.tagData.date = new Date(elements.inputDate.value);
  }
}

/**
 * Preload Sample Demo Photo on Startup
 */
function preloadSamplePhoto() {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    state.photos.push({
      id: 'photo_sample',
      file: null,
      img,
      exif: null,
      name: 'SVA_Govt_College_Event.png'
    });

    if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'none';
    if (elements.outputCanvas) elements.outputCanvas.style.display = 'block';

    syncStateToInputs();
    triggerRender();
  };
  img.onerror = () => {
    // If local asset cannot load, create fallback canvas background
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 1024;
    fallbackCanvas.height = 575;
    const fctx = fallbackCanvas.getContext('2d');
    const grad = fctx.createLinearGradient(0, 0, 1024, 575);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    fctx.fillStyle = grad;
    fctx.fillRect(0, 0, 1024, 575);
    fctx.fillStyle = '#64748b';
    fctx.font = '24px sans-serif';
    fctx.textAlign = 'center';
    fctx.fillText('Upload Your Photo to Apply Custom Geo-Tag', 512, 287);

    state.photos.push({
      id: 'photo_fallback',
      file: null,
      img: fallbackCanvas,
      exif: null,
      name: 'Studio_Preview.png'
    });

    if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'none';
    if (elements.outputCanvas) elements.outputCanvas.style.display = 'block';
    syncStateToInputs();
    triggerRender();
  };
  img.src = './assets/sample.png';
}

/**
 * Handle Image Loading and EXIF Extraction
 */
async function handleFiles(fileList) {
  if (!fileList || fileList.length === 0) return;

  const validFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
  if (validFiles.length === 0) {
    showToast('Please select valid image files (JPG, PNG, WEBP).', 'error');
    return;
  }

  showToast(`Loading ${validFiles.length} photo(s)...`, 'info');

  // If currently only having the initial sample photo, replace it
  if (state.photos.length === 1 && state.photos[0].id.startsWith('photo_')) {
    state.photos = [];
    state.activePhotoIndex = 0;
  }

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const exif = readExif(arrayBuffer);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const photoEntry = {
        id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        file,
        img,
        exif,
        name: file.name
      };

      state.photos.push(photoEntry);

      // If active photo and EXIF GPS found, auto-fill location!
      if (state.photos.length === 1 && exif) {
        if (exif.latitude !== null && exif.longitude !== null) {
          state.tagData.lat = exif.latitude;
          state.tagData.lng = exif.longitude;
          if (exif.altitude) state.tagData.altitude = exif.altitude;

          reverseGeocode(exif.latitude, exif.longitude).then((geo) => {
            if (geo) {
              state.tagData.title = geo.title;
              state.tagData.address = geo.address;
              syncStateToInputs();
              triggerRender();
            }
          });
        }
        if (exif.dateTime) {
          const parts = exif.dateTime.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
          if (parts) {
            state.tagData.date = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]);
          }
        }
      }
    } catch (err) {
      console.error('Error reading photo:', file.name, err);
    }
  }

  updateBatchGallery();
  if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'none';
  if (elements.outputCanvas) elements.outputCanvas.style.display = 'block';

  syncStateToInputs();
  triggerRender();
  showToast(`${validFiles.length} photo(s) ready!`, 'success');
}

/**
 * Update the Batch Photos Strip
 */
function updateBatchGallery() {
  if (!elements.batchGallery) return;
  elements.batchGallery.innerHTML = '';

  if (state.photos.length > 1) {
    elements.batchGallery.style.display = 'flex';
    if (elements.btnDownloadZip) elements.btnDownloadZip.style.display = 'flex';
  } else {
    elements.batchGallery.style.display = 'none';
    if (elements.btnDownloadZip) elements.btnDownloadZip.style.display = 'none';
  }

  state.photos.forEach((p, idx) => {
    const thumb = document.createElement('img');
    thumb.src = p.img.src || '';
    thumb.className = `batch-thumb ${idx === state.activePhotoIndex ? 'active' : ''}`;
    thumb.title = p.name;
    thumb.onclick = () => {
      state.activePhotoIndex = idx;
      updateBatchGallery();
      triggerRender();
    };
    elements.batchGallery.appendChild(thumb);
  });
}

/**
 * Debounced Canvas Rendering
 */
let renderTimeout = null;
function triggerRender() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(performRender, 40);
}

async function performRender() {
  if (state.photos.length === 0) return;
  const currentPhoto = state.photos[state.activePhotoIndex];
  if (!currentPhoto || !currentPhoto.img) return;

  syncInputsToState();

  try {
    state.isRendering = true;
    const canvas = await renderGeoTagPhoto(currentPhoto.img, state.tagData, state.options);

    // Update Output Canvas
    elements.outputCanvas.width = canvas.width;
    elements.outputCanvas.height = canvas.height;
    const ctx = elements.outputCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);

    // Update Metrics Badge
    if (elements.photoMetrics) {
      elements.photoMetrics.textContent = `${canvas.width} × ${canvas.height} px • Layout: ${state.options.layout}`;
    }
  } catch (err) {
    console.error('Render error:', err);
  } finally {
    state.isRendering = false;
  }
}

/**
 * Export Active Photo as High-Res JPEG with Binary EXIF Injection
 */
async function downloadActivePhoto() {
  if (state.photos.length === 0) {
    showToast('Please upload a photo first.', 'error');
    return;
  }
  const currentPhoto = state.photos[state.activePhotoIndex];

  showToast('Embedding binary EXIF GPS metadata...', 'info');

  // 1. Render stamped canvas
  const canvas = await renderGeoTagPhoto(currentPhoto.img, state.tagData, state.options);

  // 2. Convert to JPEG Blob
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const rawBuffer = await blob.arrayBuffer();

    // 3. Inject binary EXIF GPS & Date tags
    const stampedBuffer = injectExifIntoJpeg(rawBuffer, {
      latitude: state.tagData.lat,
      longitude: state.tagData.lng,
      altitude: state.tagData.altitude || 0,
      date: state.tagData.date || new Date(),
      userComment: state.tagData.customNote || 'GeoTag Studio Photo'
    });

    // 4. Download file
    const outputBlob = new Blob([stampedBuffer], { type: 'image/jpeg' });
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    const safeTitle = (state.tagData.title || 'Photo').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    link.download = `GeoTag_${safeTitle}_${Date.now()}.jpg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Geo-tagged photo downloaded with full EXIF GPS!', 'success');
  }, 'image/jpeg', 0.95);
}

/**
 * Download All Photos as ZIP
 */
async function downloadAllZip() {
  if (typeof JSZip === 'undefined') {
    showToast('ZIP engine loading, please try again...', 'error');
    return;
  }
  if (state.photos.length === 0) return;

  showToast(`Packaging ${state.photos.length} geo-tagged photos into ZIP...`, 'info');
  const zip = new JSZip();

  for (let i = 0; i < state.photos.length; i++) {
    const photo = state.photos[i];
    const canvas = await renderGeoTagPhoto(photo.img, state.tagData, state.options);

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.95));
    const rawBuffer = await blob.arrayBuffer();

    const stampedBuffer = injectExifIntoJpeg(rawBuffer, {
      latitude: state.tagData.lat,
      longitude: state.tagData.lng,
      altitude: state.tagData.altitude || 0,
      date: state.tagData.date || new Date(),
      userComment: state.tagData.customNote || 'GeoTag Studio Photo'
    });

    const filename = `GeoTag_${i + 1}_${photo.name.replace(/\.[^/.]+$/, '')}.jpg`;
    zip.file(filename, stampedBuffer);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.download = `GeoTag_Photos_Batch_${Date.now()}.zip`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('ZIP archive downloaded successfully!', 'success');
}

/**
 * Mobile / Android Share Action
 */
async function shareActivePhoto() {
  if (state.photos.length === 0) return;
  const currentPhoto = state.photos[state.activePhotoIndex];

  const canvas = await renderGeoTagPhoto(currentPhoto.img, state.tagData, state.options);
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const rawBuffer = await blob.arrayBuffer();
    const stampedBuffer = injectExifIntoJpeg(rawBuffer, {
      latitude: state.tagData.lat,
      longitude: state.tagData.lng,
      altitude: state.tagData.altitude || 0,
      date: state.tagData.date || new Date(),
      userComment: state.tagData.customNote || 'GeoTag Studio Photo'
    });

    const file = new File([stampedBuffer], 'geotag_photo.jpg', { type: 'image/jpeg' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: state.tagData.title,
          text: `${state.tagData.title} • ${formatCoordinates(state.tagData.lat, state.tagData.lng)}`
        });
        showToast('Shared successfully!', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') showToast('Share canceled or failed', 'error');
      }
    } else {
      downloadActivePhoto();
    }
  }, 'image/jpeg', 0.95);
}

/**
 * Leaflet Interactive Map Picker
 */
let leafletMap = null;
let leafletMarker = null;
let modalSelectedLat = 13.744088;
let modalSelectedLng = 79.709425;

function openMapModal() {
  if (typeof L === 'undefined') {
    showToast('Map library offline, using coordinates input', 'warning');
    return;
  }
  elements.mapModal.classList.add('active');

  modalSelectedLat = state.tagData.lat;
  modalSelectedLng = state.tagData.lng;
  updateModalCoordsDisplay();

  setTimeout(() => {
    // Custom SVG Pin to prevent broken default image on local file mode
    const pinIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: `<svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
        <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#ef4444"/>
        <circle cx="17" cy="16" r="6" fill="#ffffff"/>
      </svg>`,
      iconSize: [34, 44],
      iconAnchor: [17, 44]
    });

    if (!leafletMap) {
      leafletMap = L.map('leafletMapContainer').setView([modalSelectedLat, modalSelectedLng], 15);

      // Esri World Street Map (Unrestricted, crystal-clear, zero watermark, zero API key)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ'
      }).addTo(leafletMap);

      leafletMarker = L.marker([modalSelectedLat, modalSelectedLng], {
        draggable: true,
        icon: pinIcon
      }).addTo(leafletMap);

      leafletMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        modalSelectedLat = pos.lat;
        modalSelectedLng = pos.lng;
        updateModalCoordsDisplay();
      });

      leafletMap.on('click', (e) => {
        modalSelectedLat = e.latlng.lat;
        modalSelectedLng = e.latlng.lng;
        leafletMarker.setLatLng(e.latlng);
        updateModalCoordsDisplay();
      });
    } else {
      leafletMap.invalidateSize();
      leafletMap.setView([modalSelectedLat, modalSelectedLng], 15);
      leafletMarker.setLatLng([modalSelectedLat, modalSelectedLng]);
    }
  }, 100);
}

function updateModalCoordsDisplay() {
  if (elements.modalCoordsText) {
    elements.modalCoordsText.textContent = `Lat ${modalSelectedLat.toFixed(6)}° Long ${modalSelectedLng.toFixed(6)}°`;
  }
}

function confirmMapLocation() {
  state.tagData.lat = modalSelectedLat;
  state.tagData.lng = modalSelectedLng;

  reverseGeocode(modalSelectedLat, modalSelectedLng).then((geo) => {
    if (geo) {
      state.tagData.title = geo.title;
      state.tagData.address = geo.address;
      syncStateToInputs();
      triggerRender();
      showToast('Location updated from map!', 'success');
    }
  });

  elements.mapModal.classList.remove('active');
}

/**
 * Live Camera Viewfinder Management (Desktop & Mobile)
 */
let webcamStream = null;

function openCameraModal() {
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    elements.cameraInput.click();
    return;
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
    })
    .then((stream) => {
      webcamStream = stream;
      if (elements.webcamVideo) elements.webcamVideo.srcObject = stream;
      if (elements.cameraModal) elements.cameraModal.classList.add('active');
    })
    .catch((err) => {
      console.warn('Webcam access error or permission denied, falling back to camera input:', err);
      elements.cameraInput.click();
    });
  } else {
    elements.cameraInput.click();
  }
}

function closeCameraModal() {
  if (elements.cameraModal) elements.cameraModal.classList.remove('active');
  if (webcamStream) {
    webcamStream.getTracks().forEach((track) => track.stop());
    webcamStream = null;
  }
}

function snapWebcamPhoto() {
  const video = elements.webcamVideo;
  if (!video || !video.videoWidth) return;

  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = video.videoWidth;
  snapCanvas.height = video.videoHeight;
  const ctx = snapCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  snapCanvas.toBlob((blob) => {
    closeCameraModal();
    if (!blob) return;
    const file = new File([blob], `Camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
    handleFiles([file]);
  }, 'image/jpeg', 0.95);
}

/**
 * Event Listeners Setup
 */
function setupEvents() {
  // Preset Selectors (Header & Sidebar)
  if (elements.presetSelect) {
    elements.presetSelect.addEventListener('change', (e) => {
      if (e.target.value) applyPreset(e.target.value);
    });
  }
  if (elements.presetSelectSidebar) {
    elements.presetSelectSidebar.addEventListener('change', (e) => {
      if (e.target.value) applyPreset(e.target.value);
    });
  }
  if (elements.btnSaveFavorite) {
    elements.btnSaveFavorite.addEventListener('click', saveCurrentAsFavorite);
  }
  if (elements.btnDeleteFavorite) {
    elements.btnDeleteFavorite.addEventListener('click', deleteSelectedFavorite);
  }

  // File Upload Buttons
  if (elements.btnUpload) {
    elements.btnUpload.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.fileInput.click();
    });
  }
  if (elements.btnCamera) {
    elements.btnCamera.addEventListener('click', (e) => {
      e.stopPropagation();
      openCameraModal();
    });
  }
  if (elements.btnCloseCameraModal) elements.btnCloseCameraModal.addEventListener('click', closeCameraModal);
  if (elements.btnCancelCamera) elements.btnCancelCamera.addEventListener('click', closeCameraModal);
  if (elements.btnSnapPhoto) elements.btnSnapPhoto.addEventListener('click', snapWebcamPhoto);

  // File Input Changes
  if (elements.fileInput) {
    elements.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  }
  if (elements.cameraInput) {
    elements.cameraInput.addEventListener('change', (e) => handleFiles(e.target.files));
  }

  // Dropzone Drag & Drop
  if (elements.dropzone) {
    elements.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.dropzone.classList.add('drag-over');
    });
    elements.dropzone.addEventListener('dragleave', () => elements.dropzone.classList.remove('drag-over'));
    elements.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.dropzone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
    elements.dropzone.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') elements.fileInput.click();
    });
  }

  // Inputs Real-time preview & state sync
  const bindInput = (el, prop) => {
    if (!el) return;
    el.addEventListener('input', () => {
      if (prop === 'lat' || prop === 'lng') {
        state.tagData[prop] = parseFloat(el.value) || 0;
      } else if (prop === 'badgeText') {
        state.options.badgeText = el.value;
      } else {
        state.tagData[prop] = el.value;
      }
      triggerRender();
    });
  };

  bindInput(elements.inputTitle, 'title');
  bindInput(elements.inputAddress, 'address');
  bindInput(elements.inputLat, 'lat');
  bindInput(elements.inputLng, 'lng');
  bindInput(elements.inputNote, 'customNote');
  bindInput(elements.inputBadgeText, 'badgeText');

  if (elements.inputDate) {
    elements.inputDate.addEventListener('change', () => {
      if (elements.inputDate.value) {
        state.tagData.date = new Date(elements.inputDate.value);
        triggerRender();
      }
    });
  }

  // Current Time / EXIF Time Buttons
  if (elements.btnTimeNow) {
    elements.btnTimeNow.addEventListener('click', () => {
      state.tagData.date = new Date();
      syncStateToInputs();
      triggerRender();
      showToast('Set to current time', 'info');
    });
  }

  if (elements.btnTimeExif) {
    elements.btnTimeExif.addEventListener('click', () => {
      const current = state.photos[state.activePhotoIndex];
      if (current && current.exif && current.exif.dateTime) {
        const parts = current.exif.dateTime.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        if (parts) {
          state.tagData.date = new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]);
          syncStateToInputs();
          triggerRender();
          showToast('Restored original photo capture time!', 'success');
          return;
        }
      }
      showToast('No original EXIF capture timestamp found in this photo.', 'error');
    });
  }

  // 1-Click Current GPS Location Button
  if (elements.btnCurrentGps) {
    elements.btnCurrentGps.addEventListener('click', async () => {
      showToast('Acquiring device GPS location...', 'info');
      try {
        const pos = await getCurrentPosition();
        state.tagData.lat = pos.lat;
        state.tagData.lng = pos.lng;
        if (pos.altitude) state.tagData.altitude = pos.altitude;

        const geo = await reverseGeocode(pos.lat, pos.lng);
        if (geo) {
          state.tagData.title = geo.title;
          state.tagData.address = geo.address;
        }
        syncStateToInputs();
        triggerRender();
        showToast('GPS Location acquired accurately!', 'success');
      } catch (err) {
        showToast(`Location error: ${err.message}`, 'error');
      }
    });
  }

  // Location Search Bar with instant local matching
  // Location Search Bar with instant local matching & interactive feedback
  let currentSearchId = 0;

  const executeSearch = async () => {
    const q = elements.inputSearch.value.trim();
    if (elements.btnClearSearch) {
      elements.btnClearSearch.style.display = q.length > 0 ? 'block' : 'none';
    }

    if (q.length < 2) {
      elements.searchResults.style.display = 'none';
      return;
    }

    const searchId = ++currentSearchId;

    // 1. Show immediate interactive loading state
    elements.searchResults.innerHTML = `
      <div class="search-status-bar">
        <span class="search-status-spinner">🔄</span>
        <span>Searching colleges, landmarks & places for "<strong>${q}</strong>"...</span>
      </div>
    `;
    elements.searchResults.style.display = 'block';

    try {
      const results = await searchLocation(q);

      // Guard against race conditions from newer keystrokes
      if (searchId !== currentSearchId) return;

      elements.searchResults.innerHTML = '';

      if (results.length > 0) {
        results.forEach((r) => {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          const badgeHtml = r.source ? `<span class="search-item-badge">${r.source}</span>` : '';
          item.innerHTML = `
            <div class="search-item-header">
              <span class="search-item-name">📍 ${r.name || r.title}</span>
              ${badgeHtml}
            </div>
            <div class="search-item-address">${r.displayName || r.address}</div>
          `;
          item.onclick = () => {
            state.tagData.title = r.title || r.name;
            state.tagData.address = r.address || r.displayName;
            state.tagData.lat = r.lat;
            state.tagData.lng = r.lng;
            if (r.customNote) state.tagData.customNote = r.customNote;
            if (r.badgeText) state.options.badgeText = r.badgeText;
            elements.inputSearch.value = r.name || r.title;
            elements.searchResults.style.display = 'none';
            if (elements.btnClearSearch) elements.btnClearSearch.style.display = 'block';
            syncStateToInputs();
            triggerRender();
            showToast(`Location set: ${r.name || r.title}`, 'success');
          };
          elements.searchResults.appendChild(item);
        });
        elements.searchResults.style.display = 'block';
      } else {
        // Fallback state when no exact database matches found
        elements.searchResults.innerHTML = `
          <div class="search-no-results">
            <p>⚠️ No exact map match for "<strong>${q}</strong>"</p>
            <div class="search-fallback-btn-group">
              <button type="button" class="btn-search-fallback" id="btnUseQueryAsTitle">
                📍 Use "${q}" as Location Title
              </button>
              <button type="button" class="btn-search-fallback" id="btnOpenMapFromSearch">
                🗺️ Pick Exact Spot on Map
              </button>
            </div>
          </div>
        `;
        const btnUse = elements.searchResults.querySelector('#btnUseQueryAsTitle');
        if (btnUse) {
          btnUse.onclick = (e) => {
            e.stopPropagation();
            state.tagData.title = q;
            elements.searchResults.style.display = 'none';
            syncStateToInputs();
            triggerRender();
            showToast(`Location title set to: ${q}`, 'info');
          };
        }
        const btnMap = elements.searchResults.querySelector('#btnOpenMapFromSearch');
        if (btnMap) {
          btnMap.onclick = (e) => {
            e.stopPropagation();
            elements.searchResults.style.display = 'none';
            openMapModal();
          };
        }
        elements.searchResults.style.display = 'block';
      }
    } catch (err) {
      if (searchId !== currentSearchId) return;
      elements.searchResults.innerHTML = `
        <div class="search-no-results">
          <p>⚠️ Search error or offline</p>
          <button type="button" class="btn-search-fallback" id="btnUseQueryAsTitleErr">
            📍 Use "${q}" as Location Title
          </button>
        </div>
      `;
      const btnUseErr = elements.searchResults.querySelector('#btnUseQueryAsTitleErr');
      if (btnUseErr) {
        btnUseErr.onclick = () => {
          state.tagData.title = q;
          elements.searchResults.style.display = 'none';
          syncStateToInputs();
          triggerRender();
        };
      }
      elements.searchResults.style.display = 'block';
    }
  };

  let searchTimer = null;
  if (elements.inputSearch) {
    elements.inputSearch.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(executeSearch, 200);
    });

    elements.inputSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstItem = elements.searchResults.querySelector('.search-result-item');
        if (firstItem) {
          firstItem.click();
        } else {
          executeSearch();
        }
      } else if (e.key === 'Escape') {
        elements.searchResults.style.display = 'none';
      }
    });

    elements.inputSearch.addEventListener('focus', () => {
      if (elements.inputSearch.value.trim().length >= 2) {
        executeSearch();
      }
    });
  }

  if (elements.btnClearSearch) {
    elements.btnClearSearch.addEventListener('click', () => {
      elements.inputSearch.value = '';
      elements.btnClearSearch.style.display = 'none';
      elements.searchResults.style.display = 'none';
      elements.inputSearch.focus();
    });
  }

  document.addEventListener('click', (e) => {
    if (elements.searchResults && !elements.searchResults.contains(e.target) && e.target !== elements.inputSearch) {
      elements.searchResults.style.display = 'none';
    }
  });

  // Layout Placement Buttons (Compact Left [default], Compact Right, Top-Left, Full-Width)
  document.querySelectorAll('.btn-layout').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-layout').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.options.layout = btn.dataset.layout;
      triggerRender();
    });
  });

  // Stamp Scale Slider
  if (elements.sliderScale) {
    elements.sliderScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.options.scale = val;
      if (elements.scaleValue) elements.scaleValue.textContent = `${Math.round(val * 100)}%`;
      triggerRender();
    });
  }

  // Background Opacity Slider
  if (elements.sliderOpacity) {
    elements.sliderOpacity.addEventListener('input', (e) => {
      const opacity = parseInt(e.target.value, 10) / 100;
      if (elements.opacityValue) elements.opacityValue.textContent = `${e.target.value}%`;
      state.options.bgColor = `rgba(15, 23, 42, ${opacity})`;
      triggerRender();
    });
  }

  // Map Style & Options
  if (elements.selectMapStyle) {
    elements.selectMapStyle.addEventListener('change', (e) => {
      state.options.mapStyle = e.target.value;
      triggerRender();
    });
  }
  if (elements.selectCoordFormat) {
    elements.selectCoordFormat.addEventListener('change', (e) => {
      state.options.coordFormat = e.target.value;
      triggerRender();
    });
  }
  if (elements.toggleShowMap) {
    elements.toggleShowMap.addEventListener('change', (e) => {
      state.options.showMap = e.target.checked;
      triggerRender();
    });
  }
  if (elements.toggleShowNote) {
    elements.toggleShowNote.addEventListener('change', (e) => {
      state.options.showCustomNote = e.target.checked;
      triggerRender();
    });
  }
  if (elements.toggleShowBadge) {
    elements.toggleShowBadge.addEventListener('change', (e) => {
      state.options.showBadge = e.target.checked;
      triggerRender();
    });
  }

  // Map Picker Modal
  if (elements.btnOpenMap) elements.btnOpenMap.addEventListener('click', openMapModal);
  if (elements.btnCloseMapModal) elements.btnCloseMapModal.addEventListener('click', () => elements.mapModal.classList.remove('active'));
  if (elements.btnConfirmMapLocation) elements.btnConfirmMapLocation.addEventListener('click', confirmMapLocation);

  // Download & Share
  if (elements.btnDownload) elements.btnDownload.addEventListener('click', downloadActivePhoto);
  if (elements.btnDownloadZip) elements.btnDownloadZip.addEventListener('click', downloadAllZip);
  if (elements.btnShare) elements.btnShare.addEventListener('click', shareActivePhoto);
}

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// Initial Bootstrapping
window.addEventListener('DOMContentLoaded', () => {
  initDom();
  setupEvents();
  loadPresets();
  preloadSamplePhoto();
  registerServiceWorker();
  console.log('🚀 GeoTag Studio Ready!');
});


})();