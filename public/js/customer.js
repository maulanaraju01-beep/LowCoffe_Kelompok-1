// ==========================================================================
// LOW COFFE - CUSTOMER CONTROLLER
// Handles Menu Catalog, Favorites, Customization Modal, Cart, Checkout, Profile
// ==========================================================================

let allMenuItems = [];
let favoriteItemIds = new Set();
let currentCategory = 'all';
let searchQuery = '';
let cartItems = [];
let currentCustomItem = null;
let customModalQty = 1;

// Load Cart from LocalStorage
function initCart() {
  try {
    const saved = localStorage.getItem('lowcoffe_cart');
    cartItems = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cartItems = [];
  }
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('lowcoffe_cart', JSON.stringify(cartItems));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartNavBadge');
  if (!badge) return;
  const count = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// --------------------------------------------------------------------------
// MENU CATALOG
// --------------------------------------------------------------------------

async function loadMenuCatalog() {
  const container = document.getElementById('menuListContainer');
  if (!container) return;

  const [menuRes, favRes] = await Promise.all([
    API.getMenu(currentCategory, searchQuery),
    API.getFavorites()
  ]);

  if (favRes && favRes.success) {
    favoriteItemIds = new Set(favRes.data || []);
  }

  if (menuRes && menuRes.success) {
    allMenuItems = menuRes.data || [];
    renderMenuList(allMenuItems, container);
    
    // Update count badge
    const countBadge = document.getElementById('menuCountBadge');
    if (countBadge) countBadge.textContent = `${allMenuItems.length} Menu`;
  } else {
    container.innerHTML = `<div class="empty-state"><p class="text-danger">Gagal memuat menu</p></div>`;
  }
}

function renderMenuList(items, container) {
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-mug-hot empty-icon"></i>
        <h4 class="empty-title">Menu Tidak Ditemukan</h4>
        <p class="empty-desc">Coba gunakan kata kunci pencarian lain atau pilih kategori berbeda.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const isFav = favoriteItemIds.has(item.id);
    const formattedPrice = 'Rp ' + Number(item.price).toLocaleString('id-ID');
    const isOutOfStock = item.in_stock === false;

    return `
      <div class="menu-card ${isOutOfStock ? 'out-of-stock' : ''}">
        <div class="menu-thumb-wrap" onclick="openProductCustomization('${item.id}')">
          <img src="${item.image || '/assets/images/latte.jpg'}" alt="${item.name}" class="menu-thumb" onerror="this.src='/assets/images/latte.jpg'">
        </div>
        <div class="menu-info" onclick="openProductCustomization('${item.id}')">
          <div class="menu-title-row">
            <h4 class="menu-name">${item.name}</h4>
            ${isOutOfStock ? '<span class="out-of-stock-badge">Habis</span>' : ''}
          </div>
          <span class="menu-cat-tag"><i class="fa-solid fa-tag"></i> ${item.category}</span>
          <p class="menu-desc-short">${item.description || 'Menu pilihan istimewa dari Low Coffe.'}</p>
          <div class="menu-price">${formattedPrice}</div>
        </div>
        <div class="menu-actions">
          <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFav('${item.id}', this)" title="Simpan ke Favorit">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          ${!isOutOfStock ? `
            <button class="btn-add-cart" onclick="openProductCustomization('${item.id}')" title="Kustomisasi & Tambah">
              <i class="fa-solid fa-plus"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function selectCategory(cat, btn) {
  currentCategory = cat;
  
  // Highlight active pill
  const pills = document.querySelectorAll('#categoryPills .cat-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Update title
  const title = document.getElementById('currentCategoryTitle');
  if (title) {
    if (cat === 'all') title.textContent = 'Daftar Menu Kopi & Makanan';
    else if (cat === 'kopi') title.textContent = 'Aneka Menu Kopi Pilihan';
    else if (cat === 'non-kopi') title.textContent = 'Pilihan Menu Non-Kopi';
    else if (cat === 'makanan') title.textContent = 'Menu Makanan & Hidangan Utama';
    else if (cat === 'snack') title.textContent = 'Camilan & Snack Santai';
  }

  loadMenuCatalog();
}

let searchDebounceTimer;
function handleMenuSearch(val) {
  clearTimeout(searchDebounceTimer);
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';

  searchDebounceTimer = setTimeout(() => {
    searchQuery = val.trim();
    loadMenuCatalog();
  }, 250);
}

function clearSearch() {
  const input = document.getElementById('menuSearchInput');
  if (input) input.value = '';
  searchQuery = '';
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';
  loadMenuCatalog();
}

async function toggleFav(menuId, btn) {
  const res = await API.toggleFavorite(menuId);
  if (res.success) {
    if (res.is_favorite) {
      favoriteItemIds.add(menuId);
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      }
      showToast('Ditambahkan ke menu favorit ❤️');
    } else {
      favoriteItemIds.delete(menuId);
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
      showToast('Dihapus dari menu favorit');
    }
  }
}

// --------------------------------------------------------------------------
// FAVORITES PAGE (SCREEN 15)
// --------------------------------------------------------------------------

async function loadFavoritesView() {
  const container = document.getElementById('favoritesListContainer');
  if (!container) return;

  const [menuRes, favRes] = await Promise.all([
    API.getMenu('all'),
    API.getFavorites()
  ]);

  if (favRes && favRes.success && menuRes && menuRes.success) {
    const favSet = new Set(favRes.data || []);
    favoriteItemIds = favSet;
    const favoriteItems = (menuRes.data || []).filter(item => favSet.has(item.id));
    
    if (!favoriteItems.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-heart empty-icon"></i>
          <h4 class="empty-title">Belum Ada Menu Favorit</h4>
          <p class="empty-desc">Tekan ikon hati pada menu kopi atau makanan yang kamu sukai untuk melihatnya di sini.</p>
          <button class="btn-primary" onclick="navigateTo('/menu')">Jelajahi Menu</button>
        </div>
      `;
      return;
    }

    renderMenuList(favoriteItems, container);
  }
}

// --------------------------------------------------------------------------
// PRODUCT CUSTOMIZATION MODAL (PPT Slide 2, 3, 4, 5)
// --------------------------------------------------------------------------

function openProductCustomization(menuId) {
  const item = allMenuItems.find(m => m.id === menuId);
  if (!item) return;

  currentCustomItem = item;
  customModalQty = 1;

  document.getElementById('modalProductName').textContent = 'Kustomisasi ' + item.name;
  document.getElementById('modalProductTitle').textContent = item.name;
  document.getElementById('modalProductDesc').textContent = item.description || 'Pilihan terbaik dari Low Coffe.';
  document.getElementById('modalProductImg').src = item.image || '/assets/images/latte.jpg';
  document.getElementById('modalProductBasePrice').textContent = 'Rp ' + Number(item.price).toLocaleString('id-ID');
  document.getElementById('modalQtyVal').textContent = '1';
  document.getElementById('modalCustomNotes').value = '';

  // Show/Hide customization groups depending on category
  const isCoffee = item.category === 'kopi';
  const isDrink = item.category === 'kopi' || item.category === 'non-kopi';

  const groupSuhu = document.getElementById('groupSuhu');
  const groupBiji = document.getElementById('groupBiji');
  const groupSusu = document.getElementById('groupSusu');
  const groupShot = document.getElementById('groupShot');
  const groupGula = document.getElementById('groupGula');

  if (groupSuhu) groupSuhu.style.display = isDrink ? 'block' : 'none';
  if (groupBiji) groupBiji.style.display = isCoffee ? 'block' : 'none';
  if (groupSusu) groupSusu.style.display = isDrink ? 'block' : 'none';
  if (groupShot) groupShot.style.display = isCoffee ? 'block' : 'none';
  if (groupGula) groupGula.style.display = isDrink ? 'block' : 'none';

  // Reset defaults
  const resetRadio = (name, val) => {
    const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
    if (el) el.checked = true;
  };
  resetRadio('optSuhu', 'Dingin');
  resetRadio('optBiji', 'Arabika Gayo');
  resetRadio('optSusu', 'Fresh Milk');
  resetRadio('optShot', 'None');
  resetRadio('optGula', 'Normal');

  updateCustomPrice();
  document.getElementById('customizationModal').style.display = 'flex';
}

function closeCustomizationModal() {
  document.getElementById('customizationModal').style.display = 'none';
  currentCustomItem = null;
}

function updateCustomPrice() {
  if (!currentCustomItem) return;

  let unitPrice = currentCustomItem.price;
  const isDrink = currentCustomItem.category === 'kopi' || currentCustomItem.category === 'non-kopi';

  if (isDrink) {
    const selectedSusu = document.querySelector('input[name="optSusu"]:checked');
    if (selectedSusu && selectedSusu.dataset.extra) {
      unitPrice += Number(selectedSusu.dataset.extra);
    }

    const selectedShot = document.querySelector('input[name="optShot"]:checked');
    if (selectedShot && selectedShot.dataset.extra) {
      unitPrice += Number(selectedShot.dataset.extra);
    }
  }

  const finalTotal = unitPrice * customModalQty;
  document.getElementById('modalFinalPrice').textContent = 'Rp ' + finalTotal.toLocaleString('id-ID');
}

function changeModalQty(delta) {
  const newQty = customModalQty + delta;
  if (newQty >= 1 && newQty <= 50) {
    customModalQty = newQty;
    document.getElementById('modalQtyVal').textContent = newQty;
    updateCustomPrice();
  }
}

function confirmAddToCart() {
  if (!currentCustomItem) return;

  const isDrink = currentCustomItem.category === 'kopi' || currentCustomItem.category === 'non-kopi';
  let unitPrice = currentCustomItem.price;

  let customDetails = {
    notes: document.getElementById('modalCustomNotes').value.trim()
  };

  if (isDrink) {
    const suhu = document.querySelector('input[name="optSuhu"]:checked')?.value || 'Dingin';
    const susu = document.querySelector('input[name="optSusu"]:checked')?.value || 'Fresh Milk';
    const gula = document.querySelector('input[name="optGula"]:checked')?.value || 'Normal';
    
    customDetails.suhu = suhu;
    customDetails.susu = susu;
    customDetails.gula = gula;

    const extraSusu = document.querySelector('input[name="optSusu"]:checked')?.dataset.extra;
    if (extraSusu) unitPrice += Number(extraSusu);

    if (currentCustomItem.category === 'kopi') {
      const biji = document.querySelector('input[name="optBiji"]:checked')?.value || 'Arabika Gayo';
      const shot = document.querySelector('input[name="optShot"]:checked')?.value;
      customDetails.biji = biji;
      customDetails.ekstra_shot = shot === 'Extra';
      if (shot === 'Extra') unitPrice += 6000;
    }
  }

  // Create unique cart item key
  const customKey = `${currentCustomItem.id}_${customDetails.suhu || ''}_${customDetails.susu || ''}_${customDetails.biji || ''}_${customDetails.ekstra_shot ? 'shot' : ''}`;
  
  const existingIdx = cartItems.findIndex(it => it.cartKey === customKey);
  if (existingIdx > -1) {
    cartItems[existingIdx].quantity += customModalQty;
  } else {
    cartItems.push({
      cartKey: customKey,
      menu_id: currentCustomItem.id,
      name: currentCustomItem.name,
      price: unitPrice,
      quantity: customModalQty,
      image: currentCustomItem.image,
      customization: customDetails
    });
  }

  saveCart();
  closeCustomizationModal();
  showToast(`${currentCustomItem.name} ditambahkan ke keranjang! ☕`, 'success');
}

// --------------------------------------------------------------------------
// CART & CHECKOUT (SCREEN 16)
// --------------------------------------------------------------------------

function loadCartView() {
  const container = document.getElementById('cartItemsContainer');
  const prefsCard = document.getElementById('orderPrefsCard');
  const billCard = document.getElementById('billSummaryCard');
  if (!container) return;

  if (!cartItems.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-bag-shopping empty-icon"></i>
        <h4 class="empty-title">Keranjangmu Masih Kosong</h4>
        <p class="empty-desc">Yuk pesan kopi favorit dan cemilan lezat untuk menemanimu hari ini.</p>
        <button class="btn-primary" onclick="navigateTo('/menu')">Pilih Menu Sekarang</button>
      </div>
    `;
    if (prefsCard) prefsCard.style.display = 'none';
    if (billCard) billCard.style.display = 'none';
    return;
  }

  if (prefsCard) prefsCard.style.display = 'block';
  if (billCard) billCard.style.display = 'block';

  container.innerHTML = cartItems.map((item, idx) => {
    let customSummary = [];
    if (item.customization) {
      if (item.customization.suhu) customSummary.push(item.customization.suhu);
      if (item.customization.biji) customSummary.push(item.customization.biji);
      if (item.customization.susu && item.customization.susu !== 'Fresh Milk') customSummary.push(item.customization.susu);
      if (item.customization.ekstra_shot) customSummary.push('+1 Shot');
      if (item.customization.gula && item.customization.gula !== 'Normal') customSummary.push(item.customization.gula);
      if (item.customization.notes) customSummary.push(`"${item.customization.notes}"`);
    }

    const itemTotal = item.price * item.quantity;

    return `
      <div class="cart-item-card">
        <img src="${item.image || '/assets/images/latte.jpg'}" alt="${item.name}" class="cart-item-img" onerror="this.src='/assets/images/latte.jpg'">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          ${customSummary.length ? `<div class="cart-item-custom-tags">${customSummary.join(' • ')}</div>` : ''}
          <div class="cart-item-price">Rp ${itemTotal.toLocaleString('id-ID')}</div>
        </div>
        <div class="cart-stepper">
          <button class="btn-step" onclick="changeCartItemQty(${idx}, -1)"><i class="fa-solid fa-minus"></i></button>
          <span class="step-qty">${item.quantity}</span>
          <button class="btn-step" onclick="changeCartItemQty(${idx}, 1)"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    `;
  }).join('');

  updateCartTotals();
}

function changeCartItemQty(idx, delta) {
  if (cartItems[idx]) {
    cartItems[idx].quantity += delta;
    if (cartItems[idx].quantity <= 0) {
      cartItems.splice(idx, 1);
      showToast('Item dihapus dari keranjang');
    }
    saveCart();
    loadCartView();
  }
}

function clearCart() {
  if (!cartItems.length) return;
  if (confirm('Kosongkan semua pesanan dalam keranjang?')) {
    cartItems = [];
    saveCart();
    loadCartView();
    showToast('Keranjang telah dikosongkan');
  }
}

function handleOrderTypeChange(val) {
  const tableWrap = document.getElementById('tableSelectWrap');
  if (tableWrap) {
    tableWrap.style.display = val === 'Dine-in' ? 'block' : 'none';
  }
}

function updateCartTotals() {
  const subtotal = cartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const tax = 2000;
  const total = subtotal > 0 ? subtotal + tax : 0;

  const subtotalEl = document.getElementById('cartSubtotalText');
  const totalEl = document.getElementById('cartTotalText');

  if (subtotalEl) subtotalEl.textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
  if (totalEl) totalEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
}

async function submitOrderCheckout() {
  if (!cartItems.length) {
    showToast('Keranjang belanja masih kosong', 'error');
    return;
  }

  const orderType = document.querySelector('input[name="orderType"]:checked')?.value || 'Dine-in';
  const tableNumber = orderType === 'Dine-in' ? (document.getElementById('cartTableNumber')?.value || '05') : '-';
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'QRIS';

  const orderData = {
    customer_id: currentUser ? currentUser.id : 'usr-1',
    customer_name: currentUser ? currentUser.name : 'Danesyya Qamrut',
    customer_phone: currentUser ? currentUser.phone : '0812-3456-7890',
    order_type: orderType,
    table_number: tableNumber,
    payment_method: paymentMethod,
    items: cartItems
  };

  const btn = document.getElementById('btnCheckout');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses Pesanan...';
  }

  const res = await API.createOrder(orderData);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Pesan Sekarang';
  }

  if (res.success && res.data) {
    // Clear cart
    cartItems = [];
    saveCart();

    // Show Success Modal
    document.getElementById('successOrderNumber').textContent = '#' + res.data.order_number;
    const summaryBox = document.getElementById('receiptSummaryBox');
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Pelanggan:</span> <strong>${res.data.customer_name}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Layanan:</span> <strong>${res.data.order_type} ${res.data.table_number !== '-' ? `(Meja ${res.data.table_number})` : ''}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Pembayaran:</span> <strong>${res.data.payment_method}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:1px dashed #d3c6c0; padding-top:6px; font-weight:800;">
          <span>Total:</span> <span>Rp ${Number(res.data.total).toLocaleString('id-ID')}</span>
        </div>
      `;
    }
    document.getElementById('orderSuccessModal').style.display = 'flex';
  } else {
    showToast(res.message || 'Gagal membuat pesanan', 'error');
  }
}

function closeOrderSuccessModal() {
  document.getElementById('orderSuccessModal').style.display = 'none';
  navigateTo('/menu');
}

function viewMyOrdersAfterCheckout() {
  document.getElementById('orderSuccessModal').style.display = 'none';
  navigateTo('/akun');
}

// --------------------------------------------------------------------------
// CUSTOMER PROFILE & ORDER HISTORY (SCREEN 17)
// --------------------------------------------------------------------------

async function loadCustomerProfileView() {
  if (currentUser) {
    const nameEl = document.getElementById('profileNameText');
    const emailEl = document.getElementById('profileEmailText');
    const phoneEl = document.getElementById('profilePhoneText');
    const avatarEl = document.getElementById('profileAvatarImg');

    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
    if (phoneEl) phoneEl.innerHTML = `<i class="fa-solid fa-phone"></i> ${currentUser.phone || '0812-3456-7890'}`;
    if (avatarEl && currentUser.avatar) avatarEl.src = currentUser.avatar;
  }

  loadCustomerOrders();
}

async function loadCustomerOrders() {
  const container = document.getElementById('customerOrdersList');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat riwayat pesanan...</div>`;

  const res = await API.getOrders(null, currentUser ? currentUser.id : 'usr-1');
  if (res.success && res.data && res.data.length) {
    container.innerHTML = res.data.map(order => {
      const itemsListText = (order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');
      const statusClass = 'status-' + (order.status || 'baru').toLowerCase();
      const dateText = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="cust-order-card">
          <div class="order-top-row">
            <span class="order-id-tag">#${order.order_number}</span>
            <span class="status-badge ${statusClass}">${order.status}</span>
          </div>
          <div class="order-items-summary">${itemsListText}</div>
          <div class="order-bottom-row">
            <span>${order.order_type} • ${dateText} WIB</span>
            <span class="order-total-bold">Rp ${Number(order.total).toLocaleString('id-ID')}</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `
      <div style="background:#fff; padding:16px; border-radius:12px; text-align:center; font-size:0.8rem; color:#786b66; border:1px solid #e8dfda;">
        Belum ada transaksi pesanan sebelumnya.
      </div>
    `;
  }
}

function openProfileEditModal() {
  if (currentUser) {
    document.getElementById('editProfName').value = currentUser.name || '';
    document.getElementById('editProfEmail').value = currentUser.email || '';
    document.getElementById('editProfPhone').value = currentUser.phone || '';
  }
  document.getElementById('editProfileModal').style.display = 'flex';
}

function closeProfileEditModal() {
  document.getElementById('editProfileModal').style.display = 'none';
}

function handleSaveProfile(e) {
  e.preventDefault();
  if (!currentUser) return;

  currentUser.name = document.getElementById('editProfName').value.trim();
  currentUser.email = document.getElementById('editProfEmail').value.trim();
  currentUser.phone = document.getElementById('editProfPhone').value.trim();

  localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
  closeProfileEditModal();
  loadCustomerProfileView();
  showToast('Profil akun berhasil diperbarui!', 'success');
}
