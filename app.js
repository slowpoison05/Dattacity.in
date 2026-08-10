﻿function openDattaCity() {
  const intro = document.getElementById("appIntro");
  const button = document.getElementById("introOpenBtn");

  if (!intro || intro.classList.contains("is-opening")) return;

  if (button) {
    button.disabled = true;
    button.setAttribute("aria-label", "Opening DattaCity");
  }

  intro.classList.add("is-opening");
  document.body.classList.add("app-entered");

  window.setTimeout(() => {
    intro.classList.add("hidden");
    document.body.classList.remove("intro-active");
  }, 1450);
}

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("appIntro");
  if (intro) {
    document.body.classList.add("intro-active");
  }
});

async function uploadToCloudinary(file) {
  const cloudName = "dattacity";
  const uploadPreset = "dattacity_upload";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
}


  // Firebase Configuration - FIXED databaseURL
  const firebaseConfig = {
    apiKey: "AIzaSyCvaXtUjp8xY5nRFXroL-H1ospFSgM7qQ0",
    authDomain: "superkisan-33b7e.firebaseapp.com",
    databaseURL: "https://superkisan-33b7e-default-rtdb.firebaseio.com",
    projectId: "superkisan-33b7e",
    storageBucket: "superkisan-33b7e.firebasestorage.app",
    messagingSenderId: "744234922644",
    appId: "1:744234922644:web:20b4c062d50d6265fdba81"
  };

  // Initialize Firebase defensively so the UI still renders if SDK loading fails.
  let db = null;
  let auth = null;
  let firebaseReady = false;

  function showFirebaseInitError(error) {
    const dataEl = document.getElementById("data");
    if (!dataEl) return;

    dataEl.innerHTML = `
      <div class="empty-state">
        <span>❌</span>
        <p>Firebase initialization failed</p>
        <p style="font-size:12px;">${escapeHtml(error.message || String(error))}</p>
      </div>
    `;
  }

  try {
    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK could not be loaded. Check internet connection or script URLs.");
    }

    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.database();
    auth = firebase.auth();
    firebaseReady = true;
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    showFirebaseInitError(error);
  }

  function hasDatabase(elementId) {
    if (db) return true;

    const message = "Firebase Database अभी उपलब्ध नहीं है. कृपया internet connection और Firebase setup check करें.";
    if (elementId) {
      showStatus(message, true, elementId);
    } else {
      alert(message);
    }
    return false;
  }

  // Global Variables
  let allServices = [];
  let allMarketplaceListings = [];
  let currentCategory = 'all';
  let currentMarketCategory = 'marketplace-all';
  let isAdmin = false;
  let isEditMode = false;
  let editingKey = null;
  let currentListingType = 'sell';
  
  // Multi-photo arrays
  let userPhotos = [];
  let adminPhotos = [];
  let marketPhotos = [];
  const MAX_PHOTOS = 4;
  
  // Image viewer state
  let currentViewerPhotos = [];
  let currentViewerIndex = 0;
  let currentViewerName = '';
  let currentViewerDetails = '';

  // Validity period for marketplace listings (30 days in milliseconds)
  const LISTING_VALIDITY_DAYS = 30;
  const LISTING_VALIDITY_MS = LISTING_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

  // Category Configuration
  const categories = [
    { key: 'all', label: 'सभी', icon: '🏠', type: 'service' },
    { key: 'mistri', label: 'मिस्त्री', icon: '🔧', type: 'service' },
    { key: 'sarkari', label: 'सरकारी महकमा', icon: '🏛️', type: 'service' },
    { key: 'padhayi', label: 'पढ़ाई', icon: '📚', type: 'service' },
    { key: 'shops', label: 'दुकानें', icon: '🏪', type: 'service' },
    { key: 'khetibadi', label: 'खेतीबाड़ी', icon: '🚜', type: 'service' },
    { key: 'mehnati', label: 'मेहनती', icon: '👷', type: 'service' },
    { key: 'transport', label: 'ट्रांसपोर्ट', icon: '🚛', type: 'service' },
    { key: 'medical', label: 'मेडिकल', icon: '🏥', type: 'service' },
    { key: 'other', label: 'अन्य', icon: '📦', type: 'service' }
  ];

  // Marketplace categories
  const marketplaceCategories = [
    { key: 'marketplace-all', label: 'सभी विज्ञापन', icon: '🛒', type: 'marketplace' },
    { key: 'marketplace-sell', label: 'बिक्री के लिए', icon: '🏷️', type: 'marketplace' },
    { key: 'marketplace-buy', label: 'खरीदना है', icon: '🛍️', type: 'marketplace' }
  ];

  // Product categories for marketplace
  const productCategories = {
    'electronics': '📱 इलेक्ट्रॉनिक्स',
    'vehicles': '🚗 वाहन',
    'Livestock': '🐃 पशुधन',
    'feed': '🌾 हरा चारा',
    'agriculture': '🌾 कृषि उपकरण',
    'household': '🏠 घरेलू सामान',
    'sports': '⚽ खेल-कूद',
    'books': '📚 किताबें',
    'other': '📦 अन्य'
  };

  // Condition labels
  const conditionLabels = {
    'new': '🆕 नया',
    'like-new': '✨ लगभग नया',
    'good': '👍 अच्छा',
    'fair': '👌 ठीक-ठाक',
    'used': '🔄 इस्तेमाल किया'
  };

  // Category Labels (for backward compatibility)
  const categoryLabels = {};
  const categoryIcons = {};
  categories.forEach(cat => {
    if (cat.key !== 'all') {
      categoryLabels[cat.key] = `${cat.icon} ${cat.label}`;
      categoryIcons[cat.key] = cat.icon;
    }
  });

  // ========== Utility Functions ==========
  function toggleDesktopNav() {
    const sidebar = document.getElementById('sidebar');
    if (window.matchMedia('(min-width: 900px)').matches) {
      sidebar.classList.toggle('collapsed');
      document.body.classList.toggle('nav-collapsed', sidebar.classList.contains('collapsed'));
    } else {
      toggleMobileSidebar();
    }
  }

  function getDaysRemaining(timestamp) {
    const expiryTime = timestamp + LISTING_VALIDITY_MS;
    const now = Date.now();
    const remaining = expiryTime - now;
    return Math.ceil(remaining / (24 * 60 * 60 * 1000));
  }

  function isListingExpired(timestamp) {
    return getDaysRemaining(timestamp) <= 0;
  }

  // ========== Sidebar Functions ==========
  function renderSidebarCategories() {
    const container = document.getElementById('sidebarCategories');
    const counts = getCategoryCounts();
    
    // Service categories
    let html = categories.map(cat => {
      const count = cat.key === 'all' ? counts.total : (counts[cat.key] || 0);
      return `
        <button class="sidebar-cat-btn ${currentCategory === cat.key ? 'active' : ''}" 
                data-category="${cat.key}" 
                onclick="selectCategory('${cat.key}')">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-label">${cat.label}</span>
          <span class="cat-count">${count}</span>
        </button>
      `;
    }).join('');
    
    if (container) container.innerHTML = html;
    updateCurrentCatLabel();
  }

  function renderSidebarMarketCategories() {
    const container = document.getElementById('sidebarCategoriesMarket');
    if (!container) return;
    const marketCounts = getMarketplaceCounts();

    let html = marketplaceCategories.map(cat => {
      let count = 0;
      if (cat.key === 'marketplace-all') count = marketCounts.total;
      else if (cat.key === 'marketplace-sell') count = marketCounts.sell;
      else if (cat.key === 'marketplace-buy') count = marketCounts.buy;
      
      return `
        <button class="sidebar-cat-btn marketplace-btn ${currentMarketCategory === cat.key ? 'active' : ''}" 
                data-category="${cat.key}" 
                onclick="selectMarketCategory('${cat.key}')">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-label">${cat.label}</span>
          <span class="cat-count">${count}</span>
        </button>
      `;
    }).join('');
    
    container.innerHTML = html;
    updateCurrentCatLabelMarket();
  }

  function getCategoryCounts() {
    const counts = { total: 0 };
    
    allServices.forEach(service => {
      if (!isAdmin && service.data.status === 'pending') return;
      
      counts.total++;
      const cat = service.data.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    return counts;
  }

  function getMarketplaceCounts() {
    const counts = { total: 0, sell: 0, buy: 0 };
    
    allMarketplaceListings.forEach(listing => {
      if (!isAdmin && listing.data.status === 'pending') return;
      if (!isAdmin && isListingExpired(listing.data.timestamp)) return;
      
      counts.total++;
      if (listing.data.listingType === 'sell') counts.sell++;
      else if (listing.data.listingType === 'buy') counts.buy++;
    });
    
    return counts;
  }

  function selectCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('#sidebarCategories .sidebar-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    updateCurrentCatLabel();
    renderServices();
    closeAllSidebars();
  }

  function selectMarketCategory(category) {
    currentMarketCategory = category;
    
    document.querySelectorAll('#sidebarCategoriesMarket .sidebar-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    updateCurrentCatLabelMarket();
    renderMarketplace();
    closeAllSidebars();
  }

  function updateCurrentCatLabel() {
    const cat = categories.find(c => c.key === currentCategory);
    if (cat && document.getElementById('currentCatLabel')) {
      document.getElementById('currentCatLabel').textContent = `${cat.icon} ${cat.label}`;
    }
  }

  function updateCurrentCatLabelMarket() {
    const cat = marketplaceCategories.find(c => c.key === currentMarketCategory);
    if (cat && document.getElementById('currentCatLabelMarket')) {
      document.getElementById('currentCatLabelMarket').textContent = `${cat.icon} ${cat.label}`;
    }
  }

  // Mobile Sidebar Toggle
  function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileCategoryToggle');
    
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
    if (toggle) toggle.classList.toggle('open');
  }

  function toggleMobileSidebarMarket() {
    const sidebar = document.getElementById('sidebarMarket');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('mobileCategoryToggleMarket');
    
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.add('active');
    if (toggle) toggle.classList.toggle('open');
  }

  function closeAllSidebars() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileCategoryToggle');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (toggle) toggle.classList.remove('open');
    
    const sidebarMarket = document.getElementById('sidebarMarket');
    const toggleMarket = document.getElementById('mobileCategoryToggleMarket');
    if (sidebarMarket) sidebarMarket.classList.remove('mobile-open');
    if (toggleMarket) toggleMarket.classList.remove('open');

    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  // ========== Marketplace Panel Functions ==========
  function toggleMarketplacePanel() {
    const panel = document.getElementById("marketplacePanel");
    if (panel.style.display === "none" || panel.style.display === "") {
      panel.style.display = "block";
      panel.scrollIntoView({ behavior: 'smooth' });
    } else {
      panel.style.display = "none";
      clearMarketplaceForm();
    }
  }

  function setListingType(type) {
    currentListingType = type;
    document.getElementById('sellTypeBtn').classList.toggle('active', type === 'sell');
    document.getElementById('buyTypeBtn').classList.toggle('active', type === 'buy');
  }

  function clearMarketplaceForm() {
    document.getElementById("marketProductName").value = "";
    document.getElementById("marketDescription").value = "";
    document.getElementById("marketPrice").value = "";
    document.getElementById("marketCondition").value = "";
    document.getElementById("marketCategory").value = "";
    document.getElementById("marketSellerName").value = "";
    document.getElementById("marketPhone").value = "";
    document.getElementById("marketLocation").value = "";
    marketPhotos = [];
    document.getElementById("marketPhotoInput").value = "";
    renderMarketPhotoPreview();
    setListingType('sell');
  }

  // ========== Marketplace Photo Handling ==========
  async function marketHandlePhotos(input) {
  const files = Array.from(input.files);
  const remaining = MAX_PHOTOS - marketPhotos.length;
  
  if (files.length > remaining) {
    showStatus(`⚠️ अधिकतम ${MAX_PHOTOS} फोटो ही अपलोड कर सकते हैं!`, true, "marketStatusMsg");
  }
  
  const filesToProcess = files.slice(0, remaining);
  const uploadBtn = document.getElementById("marketAddBtn");
  uploadBtn.disabled = true;
  uploadBtn.textContent = "⏳ फोटो अपलोड हो रही है...";
  
  for (const file of filesToProcess) {
    if (file.size > 5 * 1024 * 1024) {
      showStatus(`⚠️ "${file.name}" का साइज 5MB से अधिक है!`, true, "marketStatusMsg");
      continue;
    }
    
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      if (cloudinaryUrl) {
        marketPhotos.push(cloudinaryUrl);
      } else {
        showStatus(`⚠️ "${file.name}" अपलोड नहीं हो सकी!`, true, "marketStatusMsg");
      }
    } catch (error) {
      showStatus(`⚠️ "${file.name}" प्रोसेस करने में त्रुटि!`, true, "marketStatusMsg");
    }
  }
  
  input.value = '';
  uploadBtn.disabled = false;
  uploadBtn.textContent = "✅ विज्ञापन जोड़ें";
  renderMarketPhotoPreview();
}

  // ========== Add Marketplace Listing ==========
  async function addMarketplaceListing() {
    if (!hasDatabase("marketStatusMsg")) return;

    const productName = document.getElementById("marketProductName").value.trim();
    const description = document.getElementById("marketDescription").value.trim();
    const price = document.getElementById("marketPrice").value.trim();
    const condition = document.getElementById("marketCondition").value;
    const productCategory = document.getElementById("marketCategory").value;
    const sellerName = document.getElementById("marketSellerName").value.trim();
    const phone = document.getElementById("marketPhone").value.trim();
    const location = document.getElementById("marketLocation").value.trim();
    const addBtn = document.getElementById("marketAddBtn");

    // Validation
    if (!productName || !description || !price || !condition || !productCategory || !sellerName || !phone || !location) {
      showStatus("⚠️ कृपया सभी आवश्यक फ़ील्ड भरें!", true, "marketStatusMsg");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      showStatus("⚠️ कृपया सही 10 अंकों का फोन नंबर डालें!", true, "marketStatusMsg");
      return;
    }

    if (marketPhotos.length === 0 && currentListingType === 'sell') {
      showStatus("⚠️ कृपया कम से कम एक फोटो अपलोड करें!", true, "marketStatusMsg");
      return;
    }

    addBtn.disabled = true;
    addBtn.textContent = "⏳ जोड़ा जा रहा है...";

    try {
      const data = {
        productName: productName,
        description: description,
        price: parseInt(price),
        condition: condition,
        productCategory: productCategory,
        sellerName: sellerName,
        phone: phone,
        location: location,
        listingType: currentListingType,
        photos: marketPhotos,
        photoURL: marketPhotos[0] || "",
        timestamp: Date.now(),
        expiryDate: Date.now() + LISTING_VALIDITY_MS,
        status: "pending",
        submittedBy: "user",
        type: "marketplace"
      };

      await db.ref("marketplace").push(data);
      showStatus("✅ विज्ञापन सफलतापूर्वक जमा हो गया! Admin Approval के बाद 30 दिनों के लिए दिखाई देगा।", false, "marketStatusMsg");
      
      setTimeout(() => {
        clearMarketplaceForm();
      }, 2000);
      
    } catch (error) {
      console.error("Save error:", error);
      showStatus("❌ त्रुटि: " + error.message, true, "marketStatusMsg");
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = "✅ विज्ञापन जोड़ें";
    }
  }

  // ========== Enhanced Image Viewer Functions ==========
  function openImageViewer(photos, name, details, category, startIndex = 0) {
    if (typeof photos === 'string') {
      currentViewerPhotos = [photos];
    } else {
      currentViewerPhotos = photos.filter(p => p);
    }
    
    if (currentViewerPhotos.length === 0) return;
    
    currentViewerIndex = startIndex;
    currentViewerName = name;
    currentViewerDetails = `${categoryLabels[category] || productCategories[category] || category} • ${details}`;
    
    updateImageViewer();
    
    const overlay = document.getElementById('imageViewerOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function updateImageViewer() {
    const img = document.getElementById('imageViewerImg');
    const nameEl = document.getElementById('imageViewerName');
    const counterEl = document.getElementById('imageViewerCounter');
    const detailsEl = document.getElementById('imageViewerDetails');
    const thumbnailsEl = document.getElementById('imageViewerThumbnails');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    img.src = currentViewerPhotos[currentViewerIndex];
    img.classList.remove('zoomed');
    nameEl.textContent = currentViewerName;
    detailsEl.textContent = currentViewerDetails;
    
    if (currentViewerPhotos.length > 1) {
      counterEl.textContent = ` (${currentViewerIndex + 1}/${currentViewerPhotos.length})`;
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      counterEl.textContent = '';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
    
    prevBtn.disabled = currentViewerIndex === 0;
    nextBtn.disabled = currentViewerIndex === currentViewerPhotos.length - 1;
    
    if (currentViewerPhotos.length > 1) {
      thumbnailsEl.innerHTML = currentViewerPhotos.map((photo, index) => `
        <div class="thumbnail-item ${index === currentViewerIndex ? 'active' : ''}" onclick="goToImage(${index}, event)">
          <img src="${photo}" alt="Thumbnail ${index + 1}">
        </div>
      `).join('');
      thumbnailsEl.style.display = 'flex';
    } else {
      thumbnailsEl.style.display = 'none';
    }
  }
  
  function navigateImage(direction, event) {
    event.stopPropagation();
    const newIndex = currentViewerIndex + direction;
    if (newIndex >= 0 && newIndex < currentViewerPhotos.length) {
      currentViewerIndex = newIndex;
      updateImageViewer();
    }
  }
  
  function goToImage(index, event) {
    event.stopPropagation();
    currentViewerIndex = index;
    updateImageViewer();
  }
  
  function closeImageViewer(event) {
    if (event.target.id === 'imageViewerOverlay' || event.target.classList.contains('image-viewer-close')) {
      const overlay = document.getElementById('imageViewerOverlay');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      document.getElementById('imageViewerImg').classList.remove('zoomed');
    }
  }
  
  function toggleZoom(img) {
    img.classList.toggle('zoomed');
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    const overlay = document.getElementById('imageViewerOverlay');
    if (!overlay.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    } else if (e.key === 'ArrowLeft') {
      navigateImage(-1, e);
    } else if (e.key === 'ArrowRight') {
      navigateImage(1, e);
    }
  });
  
  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.getElementById('imageViewerOverlay').addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  
  document.getElementById('imageViewerOverlay').addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        if (currentViewerIndex < currentViewerPhotos.length - 1) {
          currentViewerIndex++;
          updateImageViewer();
        }
      } else {
        if (currentViewerIndex > 0) {
          currentViewerIndex--;
          updateImageViewer();
        }
      }
    }
  }

  // Show status message
  function showStatus(message, isError = false, elementId = "statusMsg") {
    const statusEl = document.getElementById(elementId);
    statusEl.textContent = message;
    statusEl.className = "status-msg " + (isError ? "error" : "success");
    
    setTimeout(() => {
      statusEl.className = "status-msg";
    }, 4000);
  }

  // ========== User Multi-Photo Functions ==========
  async function userHandlePhotos(input) {
  const files = Array.from(input.files);
  const remaining = MAX_PHOTOS - userPhotos.length;
  
  if (files.length > remaining) {
    showStatus(`⚠️ अधिकतम ${MAX_PHOTOS} फोटो ही अपलोड कर सकते हैं!`, true, "userStatusMsg");
  }
  
  const filesToProcess = files.slice(0, remaining);
  const uploadBtn = document.getElementById("userAddBtn");
  uploadBtn.disabled = true;
  uploadBtn.textContent = "⏳ फोटो अपलोड हो रही है...";
  
  for (const file of filesToProcess) {
    if (file.size > 5 * 1024 * 1024) {
      showStatus(`⚠️ "${file.name}" का साइज 5MB से अधिक है!`, true, "userStatusMsg");
      continue;
    }
    
    try {
      // Upload to Cloudinary instead of base64
      const cloudinaryUrl = await uploadToCloudinary(file);
      if (cloudinaryUrl) {
        userPhotos.push(cloudinaryUrl);
      } else {
        showStatus(`⚠️ "${file.name}" अपलोड नहीं हो सकी!`, true, "userStatusMsg");
      }
    } catch (error) {
      showStatus(`⚠️ "${file.name}" प्रोसेस करने में त्रुटि!`, true, "userStatusMsg");
    }
  }
  
  input.value = '';
  uploadBtn.disabled = false;
  uploadBtn.textContent = "✅ सेवा जोड़ें";
  renderUserPhotoPreview();
}


  // ========== Admin Multi-Photo Functions ==========
 async function adminHandlePhotos(input) {
  const files = Array.from(input.files);
  const remaining = MAX_PHOTOS - adminPhotos.length;
  
  if (files.length > remaining) {
    showStatus(`⚠️ अधिकतम ${MAX_PHOTOS} फोटो ही अपलोड कर सकते हैं!`, true);
  }
  
  const filesToProcess = files.slice(0, remaining);
  const uploadBtn = document.getElementById("addBtn");
  uploadBtn.disabled = true;
  uploadBtn.textContent = "⏳ फोटो अपलोड हो रही है...";
  
  for (const file of filesToProcess) {
    if (file.size > 5 * 1024 * 1024) {
      showStatus(`⚠️ "${file.name}" का साइज 5MB से अधिक है!`, true);
      continue;
    }
    
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      if (cloudinaryUrl) {
        adminPhotos.push(cloudinaryUrl);
      } else {
        showStatus(`⚠️ "${file.name}" अपलोड नहीं हो सकी!`, true);
      }
    } catch (error) {
      showStatus(`⚠️ "${file.name}" प्रोसेस करने में त्रुटि!`, true);
    }
  }
  
  input.value = '';
  uploadBtn.disabled = false;
  uploadBtn.textContent = isEditMode ? "💾 सेवा अपडेट करें" : "✅ सेवा जोड़ें";
  renderAdminPhotoPreview();
}

function renderMarketPhotoPreview() {
  const preview = document.getElementById("marketPhotoPreview");

  preview.innerHTML = "";

  marketPhotos.forEach((photo, index) => {

    preview.innerHTML += `
      <div class="photo-preview-item">

        <img src="${photo}" alt="Photo ${index + 1}">

        <button class="remove-btn"
                onclick="removeMarketPhoto(${index})">
          ×
        </button>

        <div class="photo-number">
          ${index + 1}
        </div>

      </div>
    `;
  });
}

function removeMarketPhoto(index) {
  marketPhotos.splice(index, 1);

  renderMarketPhotoPreview();
}

function renderUserPhotoPreview() {
  renderPhotoPreview("userPhotoPreview", userPhotos, "removeUserPhoto");
}

function renderAdminPhotoPreview() {
  renderPhotoPreview("photoPreview", adminPhotos, "removeAdminPhoto");
}

function renderPhotoPreview(containerId, photos, removeFnName) {
  const preview = document.getElementById(containerId);
  if (!preview) return;

  preview.innerHTML = photos.map((photo, index) => `
    <div class="photo-preview-item">
      <img src="${escapeHtml(photo)}" alt="Photo ${index + 1}">
      <button class="remove-btn" type="button" onclick="${removeFnName}(${index})">×</button>
      <div class="photo-number">${index + 1}</div>
    </div>
  `).join("");
}

function removeUserPhoto(index) {
  userPhotos.splice(index, 1);
  renderUserPhotoPreview();
}

function removeAdminPhoto(index) {
  adminPhotos.splice(index, 1);
  renderAdminPhotoPreview();
}


  // Toggle User Add Panel
  function toggleUserAddPanel() {
    const panel = document.getElementById("userAddPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
      panel.style.display = "block";
      panel.scrollIntoView({ behavior: 'smooth' });
    } else {
      panel.style.display = "none";
      clearUserForm();
    }
  }

  // Clear User Form
  function clearUserForm() {
    document.getElementById("userName").value = "";
    document.getElementById("userPhone").value = "";
    document.getElementById("userCategory").value = "";
    document.getElementById("userDetails").value = "";
    document.getElementById("userPrice").value = "";
    document.getElementById("userAddress").value = "";
    userPhotos = [];
    document.getElementById("userPhotoInput").value = "";
    renderUserPhotoPreview();
  }

  // User Add Data (submits as pending)
  async function userAddData() {
    if (!hasDatabase("userStatusMsg")) return;

    const name = document.getElementById("userName").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const category = document.getElementById("userCategory").value;
    const details = document.getElementById("userDetails").value.trim();
    const price = document.getElementById("userPrice").value.trim();
    const address = document.getElementById("userAddress").value.trim();
    const addBtn = document.getElementById("userAddBtn");

    if (!name || !phone || !category || !details) {
      showStatus("⚠️ कृपया नाम, फोन, श्रेणी और सेवा विवरण भरें!", true, "userStatusMsg");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      showStatus("⚠️ कृपया सही 10 अंकों का फोन नंबर डालें!", true, "userStatusMsg");
      return;
    }

    const existingService = allServices.find(service => service.data.phone === phone);
    if (existingService) {
      const existingCategory = categoryLabels[existingService.data.category] || existingService.data.category;
      const existingName = existingService.data.name;
      showStatus(`⚠️ यह मोबाइल नंबर पहले से "${existingName}" (${existingCategory}) के साथ पंजीकृत है!`, true, "userStatusMsg");
      return;
    }

    addBtn.disabled = true;
    addBtn.textContent = "⏳ जोड़ा जा रहा है...";

    try {
      const data = {
        name: name,
        phone: phone,
        category: category,
        details: details,
        price: price,
        address: address,
        photos: userPhotos,
        photoURL: userPhotos[0] || "",
        timestamp: Date.now(),
        status: "pending",
        submittedBy: "user",
        type: "service"
      };

      await db.ref("services").push(data);
      showStatus("✅ सेवा सफलतापूर्वक जमा हो गई! Admin Approval के बाद दिखाई देगी।", false, "userStatusMsg");
      
      setTimeout(() => {
        clearUserForm();
      }, 2000);
      
    } catch (error) {
      console.error("Save error:", error);
      showStatus("❌ त्रुटि: " + error.message, true, "userStatusMsg");
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = "✅ सेवा जोड़ें";
    }
  }

  // Admin Login
  async function adminLogin() {
    if (!firebaseReady || !auth) {
      alert("Firebase अभी initialize नहीं हुआ है. कृपया internet connection और Firebase script loading check करें.");
      return;
    }

    const email = prompt("Admin Email:");
    const pass = prompt("Admin Password:");

    if (!email || !pass) return;
    
    try {
      await auth.signInWithEmailAndPassword(email, pass);
      document.getElementById("adminPanel").style.display = "block";
      isAdmin = true;
      renderSidebarCategories();
      renderSidebarMarketCategories();
      renderServices();
      renderMarketplace();
      alert("✅ Admin Login सफल!");
    } catch (error) {
      alert("❌ Login Error: " + error.message);
    }
  }

  function logoutAdmin() {
    if (auth) {
      auth.signOut();
    }
    document.getElementById("adminPanel").style.display = "none";
    isAdmin = false;
    cancelEdit();
    renderSidebarCategories();
    renderSidebarMarketCategories();
    renderServices();
    renderMarketplace();
  }

  // Listen for auth state changes
  if (auth) {
    auth.onAuthStateChanged(user => {
      if (user) {
        isAdmin = true;
        document.getElementById("adminPanel").style.display = "block";
      } else {
        isAdmin = false;
        document.getElementById("adminPanel").style.display = "none";
      }
      renderSidebarCategories();
      renderSidebarMarketCategories();
      renderServices();
      renderMarketplace();
    });
  }

  // Approve pending service
  async function approveService(key) {
    if (!hasDatabase()) return;

    if (confirm("क्या आप इस सेवा को Approve करना चाहते हैं?")) {
      try {
        await db.ref("services/" + key).update({
          status: "approved",
          approvedAt: Date.now()
        });
        alert("✅ सेवा Approve हो गई!");
      } catch (error) {
        alert("❌ त्रुटि: " + error.message);
      }
    }
  }

  // Approve marketplace listing
  async function approveMarketplaceListing(key) {
    if (!hasDatabase()) return;

    if (confirm("क्या आप इस विज्ञापन को Approve करना चाहते हैं?")) {
      try {
        await db.ref("marketplace/" + key).update({
          status: "approved",
          approvedAt: Date.now(),
          timestamp: Date.now(), // Reset timestamp on approval for fresh 30 days
          expiryDate: Date.now() + LISTING_VALIDITY_MS
        });
        alert("✅ विज्ञापन Approve हो गया! 30 दिनों के लिए दिखाई देगा।");
      } catch (error) {
        alert("❌ त्रुटि: " + error.message);
      }
    }
  }

  // Delete marketplace listing
  async function deleteMarketplaceListing(key) {
    if (!hasDatabase()) return;

    if (confirm("क्या आप वाकई इस विज्ञापन को हटाना चाहते हैं?")) {
      try {
        await db.ref("marketplace/" + key).remove();
        alert("✅ विज्ञापन हटा दिया गया!");
      } catch (error) {
        alert("❌ त्रुटि: " + error.message);
      }
    }
  }

  // Start Edit Mode
  function startEdit(key) {
    const service = allServices.find(s => s.key === key);
    if (!service) {
      alert("❌ सेवा नहीं मिली!");
      return;
    }
    
    const d = service.data;
    
    document.getElementById("name").value = d.name || '';
    document.getElementById("phone").value = d.phone || '';
    document.getElementById("category").value = d.category || '';
    document.getElementById("details").value = d.details || '';
    document.getElementById("price").value = d.price || '';
    document.getElementById("address").value = d.address || '';
    document.getElementById("editKey").value = key;
    
    if (d.photos && Array.isArray(d.photos)) {
      adminPhotos = [...d.photos];
    } else if (d.photoURL) {
      adminPhotos = [d.photoURL];
    } else {
      adminPhotos = [];
    }
    renderAdminPhotoPreview();
    
    isEditMode = true;
    editingKey = key;
    document.getElementById("formTitle").textContent = "✏️ सेवा संपादित करें";
    document.getElementById("editModeIndicator").classList.add("active");
    document.getElementById("addBtn").textContent = "💾 सेवा अपडेट करें";
    document.getElementById("cancelBtn").style.display = "block";
    
    document.getElementById("adminPanel").scrollIntoView({ behavior: 'smooth' });
  }

  // Cancel Edit Mode
  function cancelEdit() {
    isEditMode = false;
    editingKey = null;
    
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("category").value = "";
    document.getElementById("details").value = "";
    document.getElementById("price").value = "";
    document.getElementById("address").value = "";
    document.getElementById("editKey").value = "";
    adminPhotos = [];
    renderAdminPhotoPreview();
    
    document.getElementById("formTitle").textContent = "➕ नई सेवा जोड़ें (Admin)";
    document.getElementById("editModeIndicator").classList.remove("active");
    document.getElementById("addBtn").textContent = "✅ सेवा जोड़ें";
    document.getElementById("cancelBtn").style.display = "none";
  }

  // Add or Update Data (Admin)
  async function addData() {
    if (!hasDatabase()) return;

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const category = document.getElementById("category").value;
    const details = document.getElementById("details").value.trim();
    const price = document.getElementById("price").value.trim();
    const address = document.getElementById("address").value.trim();
    const addBtn = document.getElementById("addBtn");

    if (!name || !phone || !category) {
      showStatus("⚠️ कृपया नाम, फोन और श्रेणी भरें!", true);
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      showStatus("⚠️ कृपया सही 10 अंकों का फोन नंबर डालें!", true);
      return;
    }

    addBtn.disabled = true;
    addBtn.textContent = isEditMode ? "⏳ अपडेट हो रहा है..." : "⏳ जोड़ा जा रहा है...";

    try {
      const data = {
        name: name,
        phone: phone,
        category: category,
        details: details || categoryLabels[category],
        price: price,
        address: address,
        photos: adminPhotos,
        photoURL: adminPhotos[0] || "",
        timestamp: isEditMode ? (allServices.find(s => s.key === editingKey)?.data?.timestamp || Date.now()) : Date.now(),
        updatedAt: Date.now(),
        status: "approved",
        submittedBy: "admin",
        type: "service"
      };

      if (isEditMode && editingKey) {
        await db.ref("services/" + editingKey).update(data);
        showStatus("✅ सेवा सफलतापूर्वक अपडेट हो गई!");
      } else {
        await db.ref("services").push(data);
        showStatus("✅ सेवा सफलतापूर्वक जोड़ी गई!");
      }
      
      cancelEdit();
      
    } catch (error) {
      console.error("Save error:", error);
      showStatus("❌ त्रुटि: " + error.message, true);
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = isEditMode ? "💾 सेवा अपडेट करें" : "✅ सेवा जोड़ें";
    }
  }

  // Delete Data (Admin only)
  async function deleteData(key) {
    if (!hasDatabase()) return;

    if (confirm("क्या आप वाकई इस सेवा को हटाना चाहते हैं?")) {
      try {
        await db.ref("services/" + key).remove();
        
        if (editingKey === key) {
          cancelEdit();
        }
        
        alert("✅ हटा दिया गया!");
      } catch (error) {
        alert("❌ त्रुटि: " + error.message);
      }
    }
  }

  // Search Services
  function searchServices() {
    renderContent();
  }

  // Helper to get photos array from service data
  function getPhotos(data) {
    if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
      return data.photos.filter(p => p);
    }
    if (data.photoURL) {
      return [data.photoURL];
    }
    return [];
  }

  // Render Content (Services or Marketplace)
  function renderContent() {
    if (currentCategory.startsWith('marketplace')) {
      currentCategory = 'all';
    }
    renderServices();
  }

  // Render Services
  function renderServices() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    
    const filtered = allServices.filter(service => {
      if (!isAdmin && service.data.status === "pending") {
        return false;
      }

      if (currentCategory !== 'all' && service.data.category !== currentCategory) {
        return false;
      }
      
      if (searchTerm) {
        const searchIn = `${service.data.name} ${service.data.details} ${service.data.category} ${service.data.address || ''}`.toLowerCase();
        if (!searchIn.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });

    let html = "";
    
    if (filtered.length === 0) {
      html = `
        <div class="empty-state">
          <span>🔍</span>
          <p>कोई सेवा नहीं मिली</p>
          <p style="font-size:12px;">कोई और श्रेणी या खोज शब्द आज़माएं</p>
        </div>
      `;
    } else {
      filtered.forEach(service => {
        const d = service.data;
        const isPending = d.status === "pending";
        const photos = getPhotos(d);
        
        let adminButtons = '';
        if (isAdmin) {
          adminButtons = `
            <div class="action-buttons">
              ${isPending ? `<button class="approve-btn" onclick="approveService('${service.key}')">✅ अनुमोदित</button>` : ''}
              <button class="edit-btn" onclick="startEdit('${service.key}')">✏️ संपादित</button>
              <button class="delete-btn" onclick="deleteData('${service.key}')">🗑️ हटाएं</button>
            </div>
          `;
        }
        
        let photoHTML;
        if (photos.length > 0) {
          const photosJson = JSON.stringify(photos).replace(/'/g, "\\'").replace(/"/g, '&quot;');
          photoHTML = `
            <div class="card-photo-container">
              <img class="card-photo" src="${escapeHtml(photos[0])}" alt="${escapeHtml(d.name)}" 
                onclick="openImageViewer(${photosJson}, '${escapeHtml(d.name)}', '${escapeHtml(d.details || '')}', '${escapeHtml(d.category)}')" 
                onerror="this.parentElement.innerHTML='<div class=\\'card-photo-placeholder\\'>${categoryIcons[d.category] || '👤'}</div>'">
              ${photos.length > 1 ? `<span class="photo-count-badge">${photos.length} 📷</span>` : ''}
            </div>
          `;
        } else {
          photoHTML = `<div class="card-photo-placeholder">${categoryIcons[d.category] || '👤'}</div>`;
        }
        
        const pendingTag = isPending && isAdmin ? `<span class="pending-tag">⏳ अनुमोदन बाकी</span>` : '';
        
        html += `
          <div class="card" style="${isPending && isAdmin ? 'border: 2px dashed #ff9800; background: #fffde7;' : ''}">
            <div class="card-left">
              ${photoHTML}
              <div class="card-info">
                <h3>${escapeHtml(d.name)} ${pendingTag}</h3>
                <p>${escapeHtml(d.details || '')}</p>
                ${d.price ? `<p class="price">₹${escapeHtml(d.price)}</p>` : ''}
                ${d.address ? `<p>📍 ${escapeHtml(d.address)}</p>` : ''}
                <span class="category-tag">${categoryLabels[d.category] || d.category}</span>
              </div>
            </div>
            <div class="card-actions">
              <a class="call-btn" href="tel:${escapeHtml(d.phone)}">📞 कॉल करें</a>
              ${adminButtons}
            </div>
          </div>
        `;
      });
    }

    document.getElementById("data").innerHTML = html;
  }

  // Render Marketplace
  function renderMarketplace() {
    const searchInput = document.getElementById("searchInputMarket");
    const marketSearchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    
    const filtered = allMarketplaceListings.filter(listing => {
      const d = listing.data;
      
      // Hide pending for non-admin
      if (!isAdmin && d.status === "pending") {
        return false;
      }

      // Hide expired for non-admin (admin can see expired)
      const expired = isListingExpired(d.timestamp);
      if (!isAdmin && expired) {
        return false;
      }

      // Filter by listing type
      if (currentMarketCategory === 'marketplace-sell' && d.listingType !== 'sell') {
        return false;
      }
      if (currentMarketCategory === 'marketplace-buy' && d.listingType !== 'buy') {
        return false;
      }
      
      // Search filter
      if (marketSearchTerm) {
        const searchIn = `${d.productName} ${d.description} ${d.sellerName} ${d.location || ''} ${productCategories[d.productCategory] || ''}`.toLowerCase();
        if (!searchIn.includes(marketSearchTerm)) {
          return false;
        }
      }
      
      return true;
    });

    let html = "";
    
    if (filtered.length === 0) {
      html = `
        <div class="empty-state">
          <span>🛒</span>
          <p>कोई विज्ञापन नहीं मिला</p>
          <p style="font-size:12px;">नया विज्ञापन जोड़ने के लिए "नया विज्ञापन दें" बटन दबाएं</p>
        </div>
      `;
    } else {
      filtered.forEach(listing => {
        const d = listing.data;
        const isPending = d.status === "pending";
        const expired = isListingExpired(d.timestamp);
        const daysLeft = getDaysRemaining(d.timestamp);
        const photos = getPhotos(d);
        
        let adminButtons = '';
        if (isAdmin) {
          adminButtons = `
            <div class="action-buttons">
              ${isPending ? `<button class="approve-btn" onclick="approveMarketplaceListing('${listing.key}')">✅ अनुमोदित</button>` : ''}
              <button class="delete-btn" onclick="deleteMarketplaceListing('${listing.key}')">🗑️ हटाएं</button>
            </div>
          `;
        }
        
        let photoHTML;
        if (photos.length > 0) {
          const photosJson = JSON.stringify(photos).replace(/'/g, "\\'").replace(/"/g, '&quot;');
          photoHTML = `
            <div class="card-photo-container">
              <img class="card-photo" src="${escapeHtml(photos[0])}" alt="${escapeHtml(d.productName)}" 
                onclick="openImageViewer(${photosJson}, '${escapeHtml(d.productName)}', '${escapeHtml(d.description || '')}', '${escapeHtml(d.productCategory)}')" 
                onerror="this.parentElement.innerHTML='<div class=\\'card-photo-placeholder\\'>🛒</div>'">
              ${photos.length > 1 ? `<span class="photo-count-badge">${photos.length} 📷</span>` : ''}
            </div>
          `;
        } else {
          photoHTML = `<div class="card-photo-placeholder">🛒</div>`;
        }
        
        const pendingTag = isPending && isAdmin ? `<span class="pending-tag">⏳ अनुमोदन बाकी</span>` : '';
        const listingTypeTag = d.listingType === 'sell' 
          ? `<span class="category-tag sell-tag">🏷️ बिक्री के लिए</span>`
          : `<span class="category-tag buy-tag">🛍️ खरीदना है</span>`;
        
        let expiryTag = '';
        if (expired) {
          expiryTag = `<span class="expiry-tag">❌ समाप्त</span>`;
        } else if (daysLeft <= 7) {
          expiryTag = `<span class="expiry-tag">⏰ ${daysLeft} दिन बाकी</span>`;
        } else {
          expiryTag = `<span class="days-left">✅ ${daysLeft} दिन बाकी</span>`;
        }
        
        const cardClass = `card marketplace-card${expired ? ' expired-card' : ''}`;
        const cardStyle = isPending && isAdmin ? 'border: 2px dashed #ff9800; background: #fffde7;' : '';
        
        const whatsappMsg = encodeURIComponent(`नमस्ते! मुझे आपका "${d.productName}" में रुचि है। क्या यह अभी भी उपलब्ध है?`);
        
        html += `
          <div class="${cardClass}" style="${cardStyle}">
            <div class="card-left">
              ${photoHTML}
              <div class="card-info">
                <h3>${escapeHtml(d.productName)} ${pendingTag}</h3>
                <p class="marketplace-price">₹${d.price.toLocaleString('en-IN')}</p>
                <p>${escapeHtml(d.description)}</p>
                <p>👤 ${escapeHtml(d.sellerName)} • 📍 ${escapeHtml(d.location)}</p>
                ${listingTypeTag}
                <span class="category-tag">${productCategories[d.productCategory] || d.productCategory}</span>
                <span class="condition-tag">${conditionLabels[d.condition] || d.condition}</span>
                ${expiryTag}
              </div>
            </div>
            <div class="card-actions">
              <a class="call-btn" href="tel:${escapeHtml(d.phone)}">📞 कॉल करें</a>
              <a class="whatsapp-btn" href="https://wa.me/91${escapeHtml(d.phone)}?text=${whatsappMsg}" target="_blank" rel="noopener">WhatsApp</a>
              ${adminButtons}
            </div>
          </div>
        `;
      });
    }

    const dataContainer = document.getElementById("dataMarket") || document.getElementById("data");
    if (dataContainer) dataContainer.innerHTML = html;
  }

  // Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Load Data from Firebase
  if (db) {
    // Load Services
    db.ref("services").on("value", snapshot => {
      allServices = [];
      
      snapshot.forEach(child => {
        allServices.push({
          key: child.key,
          data: child.val()
        });
      });
      
      allServices.sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
      
      renderSidebarCategories();
      renderServices();
    }, error => {
      console.error("Database read error:", error);
      document.getElementById("data").innerHTML = `
        <div class="empty-state">
          <span>❌</span>
          <p>डेटा लोड करने में त्रुटि</p>
          <p style="font-size:12px;">${error.message}</p>
        </div>
      `;
    });

    // Load Marketplace Listings
    db.ref("marketplace").on("value", snapshot => {
      allMarketplaceListings = [];
      
      snapshot.forEach(child => {
        allMarketplaceListings.push({ key: child.key, data: child.val() });
      });
      
      allMarketplaceListings.sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
      
      renderSidebarMarketCategories();
      renderMarketplace();
    });
  } else {
    renderSidebarCategories();
    renderSidebarMarketCategories();
  }

  // ========== Weather API Integration (Open-Meteo) ==========
  let weatherDataCache = null;

  function getWeatherCondition(code) {
    // WMO Weather interpretation codes
    if (code === 0) return '☀️ साफ़';
    if (code <= 3) return '⛅ आंशिक बादल';
    if (code <= 48) return '🌫️ धुंध';
    if (code <= 67 || (code >= 80 && code <= 82)) return '🌧️ बारिश';
    if (code >= 71 && code <= 77) return '❄️ बर्फबारी';
    if (code >= 95) return '⛈️ आंधी-तूफान';
    return '☀️ साफ़';
  }

  async function fetchWeather() {
    try {
      // Using free Open-Meteo API for Hisar, Haryana region
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=29.15&longitude=75.72&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata');
      weatherDataCache = await response.json();
      renderWeatherWidget();
    } catch (error) {
      console.error("Weather API Error:", error);
      document.getElementById('weatherWidgetContent').innerHTML = `<span style="color: var(--danger); font-size: 14px;">मौसम डेटा लोड नहीं हो सका</span>`;
    }
  }

  function renderWeatherWidget() {
    const container = document.getElementById('weatherWidgetContent');
    if (!container || !weatherDataCache) return;

    const currentTemp = Math.round(weatherDataCache.current.temperature_2m);
    const condition = getWeatherCondition(weatherDataCache.current.weather_code);

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 800; color: var(--ink);">
        ${currentTemp}°C <span style="font-size: 14px; font-weight: 600; color: var(--muted);">${condition}</span>
      </div>
    `;
  }

  function toggleWeatherPanel() {
    const panel = document.getElementById("weatherPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
      panel.style.display = "block";
      panel.scrollIntoView({ behavior: 'smooth' });
      if (!weatherDataCache) fetchWeather(); // Fetch if missing
      renderDetailedWeather();
    } else {
      panel.style.display = "none";
    }
  }

  function renderDetailedWeather() {
    const container = document.getElementById('detailedWeatherContainer');
    if (!container) return;

    if (!weatherDataCache) {
      container.innerHTML = "डेटा उपलब्ध नहीं है...";
      return;
    }
    
    let html = '';
    const daily = weatherDataCache.daily;
    
    for (let i = 0; i < 5; i++) {
      const dateStr = daily.time[i];
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const condition = getWeatherCondition(daily.weather_code[i]);
      
      const dateObj = new Date(dateStr);
      const dateDisplay = i === 0 ? 'आज' : dateObj.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'short' });
      
      html += `
        <div class="weather-day-card">
          <div class="weather-date">${dateDisplay} <span style="display:block; font-size: 12px; color: var(--muted); font-weight: 600;">${condition}</span></div>
          <div class="weather-temps">
            <span style="color: var(--danger);">${maxTemp}°</span>
            <span style="color: #1976D2;">${minTemp}°</span>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // ========== Mandi Rates API Integration ==========
  let mandiDataCache = null;

  async function fetchMandiRates() {
    // To get real live data, register at https://data.gov.in to get a free API key
    // and paste it below.
    const DATA_GOV_API_KEY = ""; 

    if (!DATA_GOV_API_KEY) {
      // Fall back to logic generator if no API key is provided
      generateMockMandiRates();
      return;
    }

    try {
      // Fetching Mandi prices for Haryana state from Open Govt Data API
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_API_KEY}&format=json&filters[state]=Haryana&limit=500`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        throw new Error("No data found from Mandi API");
      }

      const targetMandis = ['Hisar', 'Barwala', 'Hansi'];
      const cropNames = {
        'Wheat': 'गेहूं (Wheat)',
        'Cotton': 'कपास (Cotton)',
        'Bajra(Pearl Millet/Cumbu)': 'बाजरा (Bajra)',
        'Mustard': 'सरसों (Mustard)',
        'Paddy(Dhan)(Common)': 'धान (Paddy)'
      };

      const locationMap = {};
      targetMandis.forEach(m => locationMap[m] = { name: m + ' मंडी (' + m + ')', crops: [] });

      data.records.forEach(record => {
        if (targetMandis.includes(record.market) && cropNames[record.commodity]) {
           // Only push if not already added to prevent duplicates
           if (!locationMap[record.market].crops.find(c => c.name === cropNames[record.commodity])) {
             locationMap[record.market].crops.push({
               name: cropNames[record.commodity],
               currentPrice: parseInt(record.modal_price),
               prevPrice: parseInt(record.min_price) // using min_price as prev reference for trend
             });
           }
        }
      });

      mandiDataCache = {
        widgetCrops: locationMap['Hisar'].crops.length > 0 ? locationMap['Hisar'].crops : locationMap['Barwala'].crops,
        locations: Object.values(locationMap).filter(loc => loc.crops.length > 0)
      };

      renderMandiRatesWidget();
    } catch (error) {
      console.error("Mandi API Error:", error);
      generateMockMandiRates(); // Fallback on error
    }
  }

  // Fallback generator used until actual Mandi API URL is provided
  function generateMockMandiRates() {
    const today = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < today.length; i++) { hash = ((hash << 5) - hash) + today.charCodeAt(i); hash |= 0; }

    const crops = [
      { name: 'गेहूं (Wheat)', base: 2350 },
      { name: 'कपास (Cotton)', base: 7200 },
      { name: 'बाजरा (Bajra)', base: 2400 },
      { name: 'सरसों (Mustard)', base: 5800 },
      { name: 'धान (Paddy)', base: 2200 }
    ];
    const mandis = [
      { id: 'hisar', name: 'हिसार मंडी (Hisar)' },
      { id: 'barwala', name: 'बरवाला मंडी (Barwala)' },
      { id: 'hansi', name: 'हांसी मंडी (Hansi)' }
    ];

    mandiDataCache = {
      widgetCrops: crops.map((crop, index) => {
        const variation = (Math.abs(Math.sin(hash + index)) * 0.05) - 0.025;
        const prevVariation = (Math.abs(Math.sin(hash - 1 + index)) * 0.05) - 0.025;
        return { name: crop.name, currentPrice: Math.round(crop.base * (1 + variation)), prevPrice: Math.round(crop.base * (1 + prevVariation)) };
      }),
      locations: mandis.map((mandi, mIndex) => {
        return {
          name: mandi.name,
          crops: crops.map((crop, cIndex) => {
            const variation = (Math.abs(Math.sin(hash + mIndex * 10 + cIndex)) * 0.06) - 0.03;
            const prevVariation = (Math.abs(Math.sin(hash - 1 + mIndex * 10 + cIndex)) * 0.06) - 0.03;
            return { name: crop.name, currentPrice: Math.round(crop.base * (1 + variation)), prevPrice: Math.round(crop.base * (1 + prevVariation)) };
          })
        };
      })
    };
    renderMandiRatesWidget();
  }

  function renderMandiRatesWidget() {
    const container = document.getElementById('mandiRatesList');
    if (!container || !mandiDataCache) return;

    container.innerHTML = mandiDataCache.widgetCrops.map(crop => {
      const trendIcon = crop.currentPrice >= crop.prevPrice ? '▲' : '▼';
      const trendColor = crop.currentPrice >= crop.prevPrice ? 'var(--green)' : 'var(--danger)';
      
      return `<div class="mandi-item">
        <span style="color: var(--muted);">${crop.name}</span>
        <strong>₹${crop.currentPrice} <span style="color: ${trendColor}; font-size: 10px; margin-left: 2px;">${trendIcon}</span></strong>
      </div>`;
    }).join('');
  }

  function toggleMandiPanel() {
    const panel = document.getElementById("mandiPanel");
    if (panel.style.display === "none" || panel.style.display === "") {
      panel.style.display = "block";
      panel.scrollIntoView({ behavior: 'smooth' });
      renderDetailedMandiRates();
    } else {
      panel.style.display = "none";
    }
  }

  function renderDetailedMandiRates() {
    const container = document.getElementById('detailedMandiRatesContainer');
    if (!container || !mandiDataCache) return;

    container.innerHTML = mandiDataCache.locations.map(location => {
      const cropRows = location.crops.map(crop => {
        const trendIcon = crop.currentPrice >= crop.prevPrice ? '▲' : '▼';
        const trendColor = crop.currentPrice >= crop.prevPrice ? 'var(--green)' : 'var(--danger)';

        return `<div class="mandi-crop-row"><span class="mandi-crop-name">${crop.name}</span><span class="mandi-crop-price">₹${crop.currentPrice} <span style="color: ${trendColor}; font-size: 10px; margin-left: 4px;">${trendIcon}</span></span></div>`;
      }).join('');

      return `<div class="mandi-location-card"><div class="mandi-location-header">📍 ${location.name}</div><div class="mandi-crop-list">${cropRows}</div></div>`;
    }).join('');
  }

  // Initialize Data Fetchers
  fetchWeather();
  fetchMandiRates();
