/**
 * Pure JavaScript Binary EXIF Engine for GeoTag Studio
 * Reads existing EXIF GPS/Date from uploaded JPEGs and
 * injects authentic GPS IFD & DateTime tags into exported JPEG files.
 * Zero external dependencies. 100% on-device.
 */

/**
 * Read EXIF metadata from a JPEG ArrayBuffer
 */
export function readExif(arrayBuffer) {
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
export function buildExifApp1Segment({
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
export function injectExifIntoJpeg(jpegArrayBuffer, exifOptions) {
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
