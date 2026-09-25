/**
 * GeoTag Studio - Application State & UI Coordinator
 * Multi-Platform Desktop & Android Support
 * 100% Privacy-First & On-Device Processing
 */

import { renderGeoTagPhoto, DEFAULT_OPTIONS } from '../core/geotag-engine.js';
import { readExif, injectExifIntoJpeg } from '../core/exif-engine.js';
import { PRESETS } from '../core/presets.js';
import {
  formatCoordinates,
  formatGpsDateTime,
  reverseGeocode,
  searchLocation,
  searchLocationLocal,
  searchLocationRemote,
  getCurrentPosition,
  encodePlusCode
} from '../core/geo-lookup.js';

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
  elements.btnClearPhoto = document.getElementById('btnClearPhoto');
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

  // Install App PWA Modal
  elements.btnInstallApp = document.getElementById('btnInstallApp');
  elements.installModal = document.getElementById('installModal');
  elements.btnCloseInstallModal = document.getElementById('btnCloseInstallModal');
  elements.btnDismissInstallModal = document.getElementById('btnDismissInstallModal');
  elements.tabDesktop = document.getElementById('tabDesktop');
  elements.tabIphone = document.getElementById('tabIphone');
  elements.guideDesktop = document.getElementById('guideDesktop');
  elements.guideIphone = document.getElementById('guideIphone');
}

/**
 * Toast Notification Utility
 */
export function showToast(message, type = 'info') {
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
 * Initial Blank State Management & Photo Removal
 */
function initInitialState() {
  state.photos = [];
  state.activePhotoIndex = 0;
  if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'flex';
  if (elements.outputCanvas) {
    elements.outputCanvas.style.display = 'none';
    const ctx = elements.outputCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, elements.outputCanvas.width, elements.outputCanvas.height);
  }
  if (elements.batchGallery) {
    elements.batchGallery.style.display = 'none';
    elements.batchGallery.innerHTML = '';
  }
  if (elements.photoMetrics) elements.photoMetrics.textContent = 'Ready for photo';
  if (elements.btnDownload) elements.btnDownload.disabled = true;
  if (elements.btnShare) elements.btnShare.disabled = true;
  if (elements.btnDownloadZip) elements.btnDownloadZip.style.display = 'none';
  if (elements.btnClearPhoto) elements.btnClearPhoto.style.display = 'none';
  syncStateToInputs();
}

function clearPhotos() {
  state.photos = [];
  state.activePhotoIndex = 0;
  if (elements.fileInput) elements.fileInput.value = '';
  if (elements.cameraInput) elements.cameraInput.value = '';
  initInitialState();
  showToast('Photo removed. Ready for new photo.', 'info');
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

  // Completely reset photos on new selection so previous/test photos never linger in background
  state.photos = [];
  state.activePhotoIndex = 0;

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
  if (state.photos.length > 0) {
    if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'none';
    if (elements.outputCanvas) elements.outputCanvas.style.display = 'block';
    if (elements.btnDownload) elements.btnDownload.disabled = false;
    if (elements.btnShare) elements.btnShare.disabled = false;
    if (elements.btnClearPhoto) elements.btnClearPhoto.style.display = 'inline-flex';

    syncStateToInputs();
    triggerRender();
    showToast(`${validFiles.length} photo(s) ready!`, 'success');
  } else {
    initInitialState();
  }
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
  if (state.photos.length === 0) {
    if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'flex';
    if (elements.outputCanvas) {
      elements.outputCanvas.style.display = 'none';
      const ctx = elements.outputCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, elements.outputCanvas.width, elements.outputCanvas.height);
    }
    if (elements.photoMetrics) elements.photoMetrics.textContent = 'Ready for photo';
    if (elements.btnDownload) elements.btnDownload.disabled = true;
    if (elements.btnShare) elements.btnShare.disabled = true;
    if (elements.btnClearPhoto) elements.btnClearPhoto.style.display = 'none';
    return;
  }
  const currentPhoto = state.photos[state.activePhotoIndex];
  if (!currentPhoto || !currentPhoto.img) {
    if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'flex';
    if (elements.outputCanvas) {
      elements.outputCanvas.style.display = 'none';
      const ctx = elements.outputCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, elements.outputCanvas.width, elements.outputCanvas.height);
    }
    return;
  }

  syncInputsToState();

  try {
    state.isRendering = true;
    const canvas = await renderGeoTagPhoto(currentPhoto.img, state.tagData, state.options);

    // Show output canvas, hide empty placeholder, and enable download/share
    if (elements.emptyPlaceholder) elements.emptyPlaceholder.style.display = 'none';
    if (elements.outputCanvas) elements.outputCanvas.style.display = 'block';
    if (elements.btnDownload) elements.btnDownload.disabled = false;
    if (elements.btnShare) elements.btnShare.disabled = false;
    if (elements.btnClearPhoto) elements.btnClearPhoto.style.display = 'inline-flex';

    // Update Output Canvas - clear completely before drawing new stamped photo
    elements.outputCanvas.width = canvas.width;
    elements.outputCanvas.height = canvas.height;
    const ctx = elements.outputCanvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    const safeTitle = (state.tagData.title || 'Photo').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `GeoTag_${safeTitle}_${Date.now()}.jpg`;

    if (window.AndroidBridge && window.AndroidBridge.saveFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.AndroidBridge.saveFile(reader.result, filename, 'image/jpeg');
      };
      reader.readAsDataURL(outputBlob);
      return;
    }

    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.download = filename;
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
  const filename = `GeoTag_Photos_Batch_${Date.now()}.zip`;

  if (window.AndroidBridge && window.AndroidBridge.saveFile) {
    const reader = new FileReader();
    reader.onloadend = () => {
      window.AndroidBridge.saveFile(reader.result, filename, 'application/zip');
    };
    reader.readAsDataURL(zipBlob);
    return;
  }

  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.download = filename;
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

    const safeTitle = (state.tagData.title || 'Photo').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `GeoTag_${safeTitle}_${Date.now()}.jpg`;
    const outputBlob = new Blob([stampedBuffer], { type: 'image/jpeg' });

    if (window.AndroidBridge && window.AndroidBridge.shareFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        window.AndroidBridge.shareFile(reader.result, filename, 'image/jpeg');
      };
      reader.readAsDataURL(outputBlob);
      return;
    }

    const file = new File([stampedBuffer], filename, { type: 'image/jpeg' });

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
  if (window.AndroidBridge && window.AndroidBridge.openCamera) {
    window.AndroidBridge.openCamera();
    return;
  }

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
  let remoteAbortController = null;

  const renderSearchResults = (results, isSearchingRemote = false) => {
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
        const selectItem = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
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
        item.addEventListener('mousedown', (e) => e.preventDefault());
        item.addEventListener('click', selectItem);
        elements.searchResults.appendChild(item);
      });

      if (isSearchingRemote) {
        const status = document.createElement('div');
        status.className = 'search-status-bar';
        status.innerHTML = `<span class="search-status-spinner">🔄</span><span>Searching online map for more places...</span>`;
        elements.searchResults.appendChild(status);
      }
      elements.searchResults.style.display = 'block';
    } else if (isSearchingRemote) {
      elements.searchResults.innerHTML = `
        <div class="search-status-bar">
          <span class="search-status-spinner">🔄</span>
          <span>Searching colleges, landmarks & places for "<strong>${elements.inputSearch.value.trim()}</strong>"...</span>
        </div>
      `;
      elements.searchResults.style.display = 'block';
    }
  };

  const executeSearch = async () => {
    const q = elements.inputSearch.value.trim();
    if (elements.btnClearSearch) {
      elements.btnClearSearch.style.display = q.length > 0 ? 'block' : 'none';
    }

    if (q.length < 2) {
      elements.searchResults.style.display = 'none';
      if (remoteAbortController) remoteAbortController.abort();
      return;
    }

    const searchId = ++currentSearchId;
    if (remoteAbortController) remoteAbortController.abort();
    remoteAbortController = new AbortController();

    // 1. Instant 0ms local search
    const localMatches = searchLocationLocal(q);
    renderSearchResults(localMatches, true);

    try {
      const remoteMatches = await searchLocationRemote(q, remoteAbortController.signal);
      if (searchId !== currentSearchId) return;

      const combined = [...localMatches];
      remoteMatches.forEach((rm) => {
        const isDup = combined.some(cm => Math.abs(cm.lat - rm.lat) < 0.0015 && Math.abs(cm.lng - rm.lng) < 0.0015);
        if (!isDup) combined.push(rm);
      });

      if (combined.length > 0) {
        renderSearchResults(combined, false);
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
      if (localMatches.length > 0) {
        renderSearchResults(localMatches, false);
      } else {
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

  // Download & Share & Clear
  if (elements.btnClearPhoto) elements.btnClearPhoto.addEventListener('click', clearPhotos);
  if (elements.btnDownload) elements.btnDownload.addEventListener('click', downloadActivePhoto);
  if (elements.btnDownloadZip) elements.btnDownloadZip.addEventListener('click', downloadAllZip);
  if (elements.btnShare) elements.btnShare.addEventListener('click', shareActivePhoto);

  // Install App PWA Handlers
  if (elements.btnInstallApp) elements.btnInstallApp.addEventListener('click', openInstallModal);
  if (elements.btnCloseInstallModal) elements.btnCloseInstallModal.addEventListener('click', closeInstallModal);
  if (elements.btnDismissInstallModal) elements.btnDismissInstallModal.addEventListener('click', closeInstallModal);

  if (elements.tabDesktop && elements.tabIphone) {
    elements.tabDesktop.addEventListener('click', () => {
      elements.tabDesktop.classList.add('active');
      elements.tabIphone.classList.remove('active');
      if (elements.guideDesktop) elements.guideDesktop.style.display = 'block';
      if (elements.guideIphone) elements.guideIphone.style.display = 'none';
    });
    elements.tabIphone.addEventListener('click', () => {
      elements.tabIphone.classList.add('active');
      elements.tabDesktop.classList.remove('active');
      if (elements.guideIphone) elements.guideIphone.style.display = 'block';
      if (elements.guideDesktop) elements.guideDesktop.style.display = 'none';
    });
  }
}

// PWA Install Prompt Tracking
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (elements.btnInstallApp) {
    elements.btnInstallApp.innerHTML = '<span>📲</span> <span>Install App</span>';
  }
});

function openInstallModal() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Installing GeoTag Studio...', 'success');
      }
      deferredPrompt = null;
    });
    return;
  }
  if (elements.installModal) elements.installModal.classList.add('active');
}

function closeInstallModal() {
  if (elements.installModal) elements.installModal.classList.remove('active');
}

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// Convert dataURL to Blob safely without network fetch
function dataURLtoBlob(dataurl) {
  try {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error decoding dataURLtoBlob:', e);
    return null;
  }
}

// Initial Bootstrapping
window.addEventListener('DOMContentLoaded', () => {
  initDom();
  setupEvents();
  loadPresets();
  initInitialState();
  registerServiceWorker();

  // Native camera callback from AndroidBridge
  window.__handleNativePhoto = (dataUrl) => {
    try {
      if (!dataUrl && window.AndroidBridge && window.AndroidBridge.getLatestCapturedPhoto) {
        dataUrl = window.AndroidBridge.getLatestCapturedPhoto();
      }
      if (!dataUrl) return;
      const blob = dataURLtoBlob(dataUrl);
      if (blob) {
        const file = new File([blob], `Camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFiles([file]);
      } else {
        showToast('Could not decode camera photo', 'error');
      }
    } catch (err) {
      console.error('Error handling native camera capture:', err);
      showToast('Could not load camera photo', 'error');
    }
  };

  // Check for any photo that finished while activity was paused or recreated
  const checkPendingPhoto = () => {
    if (window.AndroidBridge && window.AndroidBridge.getLatestCapturedPhoto) {
      const pending = window.AndroidBridge.getLatestCapturedPhoto();
      if (pending && pending.length > 50) {
        window.__handleNativePhoto(pending);
      }
    }
  };
  setTimeout(checkPendingPhoto, 300);
  window.addEventListener('focus', checkPendingPhoto);

  console.log('🚀 GeoTag Studio Ready!');
});
