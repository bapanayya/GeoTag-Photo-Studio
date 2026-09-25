/**
 * Geo-Lookup & Coordinate Utilities for GeoTag Studio
 * 100% Client-side coordinate math, Plus Code generation, and Geocoding
 */

/**
 * Convert Decimal Degrees to Degrees, Minutes, Seconds (DMS)
 * e.g., 13.744088 -> 13°44'38.7"N
 */
export function decimalToDms(val, isLat = true) {
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
export function dmsToDecimal(dmsStr) {
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
export function formatCoordinates(lat, lng, format = 'decimal') {
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

export function encodePlusCode(latitude, longitude, codeLength = 10) {
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
export function formatGpsDateTime(date = new Date(), customTimezoneOffset = null) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }

  const pad = (n) => String(n).padStart(2, '0');

  // If customTimezoneOffset is provided (in minutes), adjust date to that timezone
  let targetDate = date;
  let tzStr = '';
  if (customTimezoneOffset !== null) {
    targetDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000) + (customTimezoneOffset * 60000));
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

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[targetDate.getDay()];

  const day = pad(targetDate.getDate());
  const month = pad(targetDate.getMonth() + 1);
  const year = targetDate.getFullYear();

  let hours = targetDate.getHours();
  const minutes = pad(targetDate.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = pad(hours);

  return `${dayName}, ${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm} ${tzStr}`;
}

/**
 * Query OpenStreetMap Nominatim for Reverse Geocoding (Lat/Lng -> Address)
 * Includes in-memory caching to avoid redundant calls
 */
const geocodeCache = new Map();

export async function reverseGeocode(lat, lng) {
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

import { PRESETS, SEARCH_DIRECTORY } from './presets.js';

/**
 * Instant Local Search (0ms latency, 100% offline)
 * Searches presets, verified institutions, and custom favorites
 */
export function searchLocationLocal(query) {
  if (!query || query.trim().length < 2) return [];
  const qRaw = query.trim();
  const qLower = qRaw.toLowerCase();

  // Normalize common spelling variations
  const normalizedQuery = qLower
    .replace(/\bveternary\b/g, 'veterinary')
    .replace(/\bunivercity\b/g, 'university')
    .replace(/\bcollege\b/g, 'college');

  const tokens = normalizedQuery.split(/[\s,]+/).filter(t => t.length >= 2);

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

  return localMatches;
}

/**
 * Remote Map Search (Photon / OpenStreetMap Elasticsearch with timeout)
 */
export async function searchLocationRemote(query, signal = null) {
  if (!query || query.trim().length < 2) return [];
  const qRaw = query.trim();
  const qLower = qRaw.toLowerCase();

  const normalizedQuery = qLower
    .replace(/\bveternary\b/g, 'veterinary')
    .replace(/\bunivercity\b/g, 'university')
    .replace(/\bcollege\b/g, 'college');

  const remoteMatches = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const effectiveSignal = signal || controller.signal;

    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalizedQuery)}&limit=6`;
    const res = await fetch(photonUrl, { signal: effectiveSignal });
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

  // Fallback to Nominatim if remoteMatches is empty
  if (remoteMatches.length === 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const effectiveSignal = signal || controller.signal;

      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(normalizedQuery)}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        signal: effectiveSignal,
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

  return remoteMatches;
}

/**
 * Search Location by Query String (Instant Local Matching + Multi-Provider Search with Typo Tolerance)
 */
export async function searchLocation(query) {
  const localMatches = searchLocationLocal(query);
  const remoteMatches = await searchLocationRemote(query);

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
export async function getCurrentPosition(options = {}) {
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
