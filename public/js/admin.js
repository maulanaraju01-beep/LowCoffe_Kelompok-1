// ==========================================================================
// LOW COFFE - ESPRESSO ADMIN CONTROLLER
// Handles Dashboard, Order Management, Product CRUD, Reports & Settings
// ==========================================================================

let currentAdminOrderFilter = 'Semua';
let currentAdminCatFilter = 'all';
let adminMenuItems = [];

// --------------------------------------------------------------------------
// SCREEN 6: ADMIN DASHBOARD OVERVIEW
// --------------------------------------------------------------------------

async function loadAdminDashboard() {
  const [reportsRes, ordersRes] = await Promise.all([
    API.getReports(),
    API.getOrders()
  ]);

  if (reportsRes && reportsRes.success && reportsRes.data) {
    const rep = reportsRes.data;

    // KPI Cards
    const kpiOrders = document.getElementById('kpiOrdersCount');
    const kpiRev = document.getElementById('kpiRevenue');
    const kpiCust = document.getElementById('kpiCustomers');
    const monthRev = document.getElementById('dashMonthRevenue');
    const avgOrder = document.getElementById('dashAvgOrder');

    if (kpiOrders) kpiOrders.textContent = rep.today_orders || 24;
    if (kpiRev) kpiRev.textContent = 'Rp ' + Number(rep.today_revenue || 1548000).toLocaleString('id-ID');
    if (kpiCust) kpiCust.textContent = rep.today_customers || 12;
    if (monthRev) monthRev.textContent = 'Rp ' + Number(rep.total_sales_month || 12450000).toLocaleString('id-ID');
    if (avgOrder) avgOrder.textContent = 'Rp ' + Number(rep.avg_order_value || 48500).toLocaleString('id-ID');

    // Mini Chart
    if (rep.trend_labels && rep.trend_revenue) {
      Charts.renderMiniTrend('miniTrendChart', rep.trend_labels, rep.trend_revenue);
    }
  }

  // Recent Orders List (Top 4)
  const recentContainer = document.getElementById('dashboardRecentOrders');
  if (recentContainer && ordersRes && ordersRes.success && ordersRes.data) {
    const recent = ordersRes.data.slice(0, 4);
    if (!recent.length) {
      recentContainer.innerHTML = '<div style="padding:10px; font-size:0.8rem; color:#786b66;">Belum ada pesanan terbaru.</div>';
      return;
    }

    recentContainer.innerHTML = recent.map(o => {
      const itemsText = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');
      const statusClass = 'status-' + (o.status || 'baru').toLowerCase();
      return `
        <div class="recent-order-item" onclick="navigateTo('/admin/orders')">
          <div class="ro-info">
            <div class="ro-top">
              <span class="ro-id">#${o.order_number}</span>
              <span class="ro-customer">${o.customer_name}</span>
            </div>
            <div class="ro-items-text">${itemsText}</div>
          </div>
          <div class="ro-right">
            <span class="ro-total">Rp ${Number(o.total).toLocaleString('id-ID')}</span>
            <span class="status-badge ${statusClass}">${o.status}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// --------------------------------------------------------------------------
// SCREEN 7: ADMIN ORDERS MANAGEMENT
// --------------------------------------------------------------------------

async function loadAdminOrders() {
  const container = document.getElementById('adminOrdersContainer');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat daftar pesanan...</div>`;

  const res = await API.getOrders(currentAdminOrderFilter);

  // Update badge for "Baru" orders
  const allOrdersRes = await API.getOrders();
  if (allOrdersRes.success && allOrdersRes.data) {
    const baruCount = allOrdersRes.data.filter(o => o.status === 'Baru').length;
    const badgeEl = document.getElementById('countBaruBadge');
    const navBadgeEl = document.getElementById('adminOrdersNavBadge');
    
    if (badgeEl) badgeEl.textContent = baruCount;
    if (navBadgeEl) {
      navBadgeEl.textContent = baruCount;
      navBadgeEl.style.display = baruCount > 0 ? 'block' : 'none';
    }
  }

  if (res.success && res.data) {
    if (!res.data.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-receipt empty-icon"></i>
          <h4 class="empty-title">Tidak Ada Pesanan</h4>
          <p class="empty-desc">Belum ada pesanan dengan status '${currentAdminOrderFilter}'.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = res.data.map(order => {
      const statusClass = 'status-' + (order.status || 'baru').toLowerCase();
      const timeStr = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const itemsListHtml = (order.items || []).map(it => {
        let notes = '';
        if (it.customization) {
          const parts = [];
          if (it.customization.suhu) parts.push(it.customization.suhu);
          if (it.customization.susu && it.customization.susu !== 'Fresh Milk') parts.push(it.customization.susu);
          if (it.customization.biji) parts.push(it.customization.biji);
          if (it.customization.ekstra_shot) parts.push('+1 Shot');
          if (it.customization.notes) parts.push(`Note: ${it.customization.notes}`);
          if (parts.length) notes = ` <span style="color:#786b66; font-size:0.72rem;">(${parts.join(', ')})</span>`;
        }
        return `<div><strong>${it.quantity}x</strong> ${it.name}${notes}</div>`;
      }).join('');

      // Status action buttons
      let actionButtons = '';
      if (order.status === 'Baru') {
        actionButtons = `
          <button class="btn-status-action btn-status-process" onclick="changeOrderStatus('${order.id}', 'Diproses')">
            <i class="fa-solid fa-kitchen-set"></i> Proses
          </button>
          <button class="btn-status-action btn-status-cancel" onclick="changeOrderStatus('${order.id}', 'Dibatalkan')">
            <i class="fa-solid fa-xmark"></i> Batal
          </button>
        `;
      } else if (order.status === 'Diproses') {
        actionButtons = `
          <button class="btn-status-action btn-status-done" onclick="changeOrderStatus('${order.id}', 'Selesai')">
            <i class="fa-solid fa-check-double"></i> Tandai Selesai
          </button>
        `;
      } else {
        actionButtons = `
          <span style="font-size:0.75rem; color:#786b66;"><i class="fa-solid fa-circle-check text-success"></i> Selesai Ditangani</span>
        `;
      }

      return `
        <div class="admin-order-card">
          <div class="aoc-header">
            <div>
              <span class="aoc-num">#${order.order_number}</span>
              <span class="aoc-time"> • ${timeStr} WIB</span>
            </div>
            <span class="status-badge ${statusClass}">${order.status}</span>
          </div>

          <div class="aoc-cust-info">
            <span class="aoc-cust-name"><i class="fa-regular fa-user"></i> ${order.customer_name}</span>
            <span class="aoc-type">${order.order_type} ${order.table_number !== '-' ? `(Meja ${order.table_number})` : ''} • ${order.payment_method}</span>
          </div>

          <div class="aoc-items-box">
            ${itemsListHtml}
          </div>

          <div class="aoc-footer">
            <div class="aoc-total-box">
              <span>Total Pembayaran</span>
              <strong>Rp ${Number(order.total).toLocaleString('id-ID')}</strong>
            </div>
            <div class="aoc-actions">
              ${actionButtons}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function filterAdminOrders(status, btn) {
  currentAdminOrderFilter = status;
  const pills = document.querySelectorAll('#adminOrderFilters .filter-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadAdminOrders();
}

async function changeOrderStatus(orderId, newStatus) {
  showToast(`Mengubah status pesanan ke '${newStatus}'...`);
  const res = await API.updateOrderStatus(orderId, newStatus);
  if (res.success) {
    showToast(`Status pesanan berhasil diubah menjadi '${newStatus}'`, 'success');
    loadAdminOrders();
    loadAdminDashboard();
  } else {
    showToast(res.message || 'Gagal mengubah status', 'error');
  }
}

// --------------------------------------------------------------------------
// SCREEN 9: ADMIN PRODUCT / MENU CRUD
// --------------------------------------------------------------------------

async function loadAdminMenu() {
  const container = document.getElementById('adminMenuContainer');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat katalog menu...</div>`;

  const res = await API.getMenu(currentAdminCatFilter);
  if (res.success && res.data) {
    adminMenuItems = res.data;
    if (!adminMenuItems.length) {
      container.innerHTML = '<div class="empty-state"><p class="text-muted">Belum ada menu dalam kategori ini.</p></div>';
      return;
    }

    container.innerHTML = adminMenuItems.map(m => {
      const isStock = m.in_stock !== false;
      return `
        <div class="admin-prod-card">
          <img src="${m.image || '/assets/images/latte.jpg'}" alt="${m.name}" class="apc-thumb" onerror="this.src='/assets/images/latte.jpg'">
          <div class="apc-info">
            <h4 class="apc-title">${m.name}</h4>
            <span class="apc-cat">${m.category} • Terjual: ${m.sold_count || 0}</span>
            <div class="apc-price">Rp ${Number(m.price).toLocaleString('id-ID')}</div>
          </div>
          <div class="apc-actions">
            <label class="switch" title="Status Stok Tersedia/Habis">
              <input type="checkbox" ${isStock ? 'checked' : ''} onchange="toggleMenuStock('${m.id}', this.checked)">
              <span class="slider round"></span>
            </label>
            <div class="apc-btn-group">
              <button class="btn-icon-edit" onclick="openEditMenuModal('${m.id}')" title="Edit Menu"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon-del" onclick="deleteMenuPrompt('${m.id}', '${m.name}')" title="Hapus Menu"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function filterAdminMenu(cat, btn) {
  currentAdminCatFilter = cat;
  const pills = document.querySelectorAll('#adminCatPills .cat-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadAdminMenu();
}

async function toggleMenuStock(menuId, inStock) {
  const res = await API.updateMenu(menuId, { in_stock: inStock });
  if (res.success) {
    showToast(`Stok ${res.data.name} diubah menjadi: ${inStock ? 'Tersedia' : 'Habis'}`);
  }
}

function openAddMenuModal() {
  document.getElementById('adminMenuModalTitle').textContent = 'Tambah Menu Baru';
  document.getElementById('editMenuId').value = '';
  document.getElementById('adminMenuName').value = '';
  document.getElementById('adminMenuCategory').value = 'kopi';
  document.getElementById('adminMenuPrice').value = '';
  document.getElementById('adminMenuDesc').value = '';
  document.getElementById('adminMenuImage').value = '/assets/images/latte.jpg';
  document.getElementById('adminMenuStock').checked = true;
  document.getElementById('adminMenuModal').style.display = 'flex';
}

function openEditMenuModal(menuId) {
  const item = adminMenuItems.find(m => m.id === menuId);
  if (!item) return;

  document.getElementById('adminMenuModalTitle').textContent = 'Edit Menu: ' + item.name;
  document.getElementById('editMenuId').value = item.id;
  document.getElementById('adminMenuName').value = item.name;
  document.getElementById('adminMenuCategory').value = item.category || 'kopi';
  document.getElementById('adminMenuPrice').value = item.price;
  document.getElementById('adminMenuDesc').value = item.description || '';
  document.getElementById('adminMenuImage').value = item.image || '/assets/images/latte.jpg';
  document.getElementById('adminMenuStock').checked = item.in_stock !== false;
  document.getElementById('adminMenuModal').style.display = 'flex';
}

function closeAdminMenuModal() {
  document.getElementById('adminMenuModal').style.display = 'none';
}

async function handleAdminSaveMenu(e) {
  e.preventDefault();
  const menuId = document.getElementById('editMenuId').value;
  const name = document.getElementById('adminMenuName').value.trim();
  const category = document.getElementById('adminMenuCategory').value;
  const price = document.getElementById('adminMenuPrice').value;
  const description = document.getElementById('adminMenuDesc').value.trim();
  const image = document.getElementById('adminMenuImage').value.trim();
  const in_stock = document.getElementById('adminMenuStock').checked;

  const payload = { name, category, price, description, image, in_stock };

  let res;
  if (menuId) {
    res = await API.updateMenu(menuId, payload);
  } else {
    res = await API.createMenu(payload);
  }

  if (res.success) {
    showToast(`Menu ${name} berhasil disimpan!`, 'success');
    closeAdminMenuModal();
    loadAdminMenu();
  } else {
    showToast(res.message || 'Gagal menyimpan menu', 'error');
  }
}

async function deleteMenuPrompt(menuId, name) {
  if (confirm(`Yakin ingin menghapus menu '${name}' dari katalog?`)) {
    const res = await API.deleteMenu(menuId);
    if (res.success) {
      showToast(`Menu ${name} telah dihapus`);
      loadAdminMenu();
    }
  }
}

// --------------------------------------------------------------------------
// SCREEN 8: ADMIN SALES REPORTS
// --------------------------------------------------------------------------

async function loadAdminReports() {
  const res = await API.getReports();
  if (res.success && res.data) {
    const rep = res.data;

    const totalSalesEl = document.getElementById('repTotalSales');
    const avgOrderEl = document.getElementById('repAvgOrder');
    if (totalSalesEl) totalSalesEl.textContent = 'Rp ' + Number(rep.total_sales_month || 12450000).toLocaleString('id-ID');
    if (avgOrderEl) avgOrderEl.textContent = 'Rp ' + Number(rep.avg_order_value || 48500).toLocaleString('id-ID');

    // Render Trend Chart
    if (rep.trend_labels && rep.trend_revenue) {
      Charts.renderSalesTrend('salesTrendChart', rep.trend_labels, rep.trend_revenue);
    }

    // Top Selling List
    const topContainer = document.getElementById('reportTopSellingList');
    if (topContainer && rep.top_selling) {
      const maxSold = Math.max(...rep.top_selling.map(s => s.sold));
      topContainer.innerHTML = rep.top_selling.map((item, idx) => {
        const pct = Math.round((item.sold / maxSold) * 100);
        return `
          <div class="rank-item">
            <span class="rank-badge">${idx + 1}</span>
            <div class="rank-info">
              <div class="rank-name">
                <span>${item.name} <small style="color:#a39691;">(${item.category})</small></span>
                <strong>${item.sold} Porsi</strong>
              </div>
              <div class="rank-bar-bg">
                <div class="rank-bar-fill" style="width: ${pct}%"></div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function printReport() {
  window.print();
}

// --------------------------------------------------------------------------
// SCREEN 10: ADMIN SETTINGS & TEAM
// --------------------------------------------------------------------------

async function loadAdminSettings() {
  const res = await API.getSettings();
  if (res.success && res.data) {
    const set = res.data;

    if (set.owner) {
      document.getElementById('setOwnerName').textContent = set.owner.name;
      document.getElementById('setOwnerRole').textContent = set.owner.role;
      document.getElementById('setOwnerNim').textContent = 'NIM: ' + set.owner.nim;
    }

    document.getElementById('setStoreOpen').checked = set.is_open !== false;
    document.getElementById('setSoundNotify').checked = set.notification_sound !== false;
    document.getElementById('setOpenHours').value = set.open_hours || '08:00 - 22:00';
    document.getElementById('setAddress').value = set.address || 'Jl. Teuku Umar No. 45, Banda Aceh';
    document.getElementById('setTablesCount').value = set.tables_count || 20;

    // Render Team Members
    const teamContainer = document.getElementById('adminTeamList');
    if (teamContainer && set.team) {
      teamContainer.innerHTML = set.team.map(m => `
        <div class="team-member-item">
          <span class="t-nim">${m.nim}</span>
          <strong>${m.name}</strong>
          <span class="t-task">${m.task}</span>
        </div>
      `).join('');
    }
  }
}

async function handleStoreStatusToggle(isOpen) {
  const res = await API.updateSettings({ is_open: isOpen });
  if (res.success) {
    showToast(`Status kedai diubah: ${isOpen ? 'BUKA (Menerima Pesanan)' : 'TUTUP'}`);
  }
}

async function saveShopSettings() {
  const open_hours = document.getElementById('setOpenHours').value.trim();
  const address = document.getElementById('setAddress').value.trim();
  const tables_count = Number(document.getElementById('setTablesCount').value) || 20;
  const notification_sound = document.getElementById('setSoundNotify').checked;
  const is_open = document.getElementById('setStoreOpen').checked;

  const payload = { open_hours, address, tables_count, notification_sound, is_open };
  const res = await API.updateSettings(payload);

  if (res.success) {
    showToast('Pengaturan kedai berhasil disimpan!', 'success');
  } else {
    showToast('Gagal menyimpan pengaturan', 'error');
  }
}

async function confirmResetData() {
  if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke setelan awal presentasi? Semua pesanan baru akan dikembalikan ke data awal.')) {
    const res = await API.resetDB();
    if (res.success) {
      showToast('Database berhasil direset ke setelan awal pabrik!', 'success');
      loadAdminDashboard();
      loadAdminOrders();
      loadAdminMenu();
    }
  }
}
