// ==========================================================================
// LOW COFFE - CORE SPA ROUTER & APPLICATION ENTRY POINT
// ==========================================================================

let currentUser = null;
let currentRole = 'customer'; // 'customer' or 'admin'

// Route Definitions matching Slide 8
const ROUTES = {
  // Pelanggan
  '/': { viewId: 'view-onboarding', role: 'customer', title: 'Onboarding • Low Coffe' },
  '/onboarding': { viewId: 'view-onboarding', role: 'customer', title: 'Onboarding • Low Coffe' },
  '/login': { viewId: 'view-login', role: 'customer', title: 'Masuk / Daftar • Low Coffe' },
  '/menu': { viewId: 'view-customer-menu', role: 'customer', title: 'Daftar Menu • Low Coffe' },
  '/favorit': { viewId: 'view-customer-favorites', role: 'customer', title: 'Menu Favorit • Low Coffe' },
  '/keranjang': { viewId: 'view-customer-cart', role: 'customer', title: 'Keranjang Pesanan • Low Coffe' },
  '/akun': { viewId: 'view-customer-profile', role: 'customer', title: 'Akun Pelanggan • Low Coffe' },

  // Admin (Espresso Admin)
  '/admin': { viewId: 'view-admin-dashboard', role: 'admin', title: 'Dashboard • Espresso Admin' },
  '/admin/orders': { viewId: 'view-admin-orders', role: 'admin', title: 'Kelola Pesanan • Espresso Admin' },
  '/admin/menu': { viewId: 'view-admin-menu', role: 'admin', title: 'Product Management • Espresso Admin' },
  '/admin/reports': { viewId: 'view-admin-reports', role: 'admin', title: 'Sales Reports • Espresso Admin' },
  '/admin/settings': { viewId: 'view-admin-settings', role: 'admin', title: 'Pengaturan Kedai • Espresso Admin' }
};

// --------------------------------------------------------------------------
// ROUTER & NAVIGATION
// --------------------------------------------------------------------------

function navigateTo(path, pushState = true) {
  // Normalize path
  const normalized = path.replace(/\/$/, '') || '/';
  const route = ROUTES[normalized] || ROUTES['/menu'];

  // Update URL in browser bar
  if (pushState && window.location.pathname !== normalized) {
    window.history.pushState({ path: normalized }, '', normalized);
  }

  // Update Page Title
  document.title = route.title || 'Low Coffe';

  // Hide all views
  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  // Activate target view
  const targetEl = document.getElementById(route.viewId);
  if (targetEl) {
    targetEl.classList.add('active');
  }

  // Auto switch role bar
  if (route.role !== currentRole) {
    switchRole(route.role, false);
  }

  // Update Bottom Navs & Active States
  updateBottomNavs(normalized, route.role);

  // Trigger View Lifecycle Initializers
  onViewActivated(normalized);

  // Close Quick Nav dropdown if open
  closeQuickNav();
}

function updateBottomNavs(path, role) {
  const custNav = document.getElementById('customerBottomNav');
  const adminNav = document.getElementById('adminBottomNav');

  // Onboarding & Login do not show bottom navigation
  if (path === '/' || path === '/onboarding' || path === '/login') {
    if (custNav) custNav.style.display = 'none';
    if (adminNav) adminNav.style.display = 'none';
    return;
  }

  if (role === 'admin') {
    if (custNav) custNav.style.display = 'none';
    if (adminNav) {
      adminNav.style.display = 'flex';
      adminNav.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.getAttribute('data-target') === path) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  } else {
    if (adminNav) adminNav.style.display = 'none';
    if (custNav) {
      custNav.style.display = 'flex';
      custNav.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.getAttribute('data-target') === path) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }
}

function onViewActivated(path) {
  // Scroll phone screen to top
  const screen = document.getElementById('appRoot');
  if (screen) screen.scrollTop = 0;

  switch (path) {
    case '/':
    case '/onboarding':
      resetOnboarding();
      break;
    case '/menu':
      loadMenuCatalog();
      break;
    case '/favorit':
      loadFavoritesView();
      break;
    case '/keranjang':
      loadCartView();
      break;
    case '/akun':
      loadCustomerProfileView();
      break;
    case '/admin':
      loadAdminDashboard();
      break;
    case '/admin/orders':
      loadAdminOrders();
      break;
    case '/admin/menu':
      loadAdminMenu();
      break;
    case '/admin/reports':
      loadAdminReports();
      break;
    case '/admin/settings':
      loadAdminSettings();
      break;
  }
}

// --------------------------------------------------------------------------
// ROLE SWITCHER
// --------------------------------------------------------------------------

function switchRole(role, redirect = true) {
  currentRole = role;

  const btnCust = document.getElementById('btnRoleCustomer');
  const btnAdmin = document.getElementById('btnRoleAdmin');

  if (role === 'admin') {
    if (btnCust) btnCust.classList.remove('active');
    if (btnAdmin) btnAdmin.classList.add('active');

    // Set demo admin session if not admin
    if (!currentUser || currentUser.role !== 'admin') {
      currentUser = {
        id: 'usr-2',
        name: 'Syahri Ramadhan',
        email: 'syahri.ramadhan@lowcoffe.com',
        phone: '0811-9876-5432',
        role: 'admin',
        avatar: '/assets/images/avatar-admin.jpg'
      };
      localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
    }

    if (redirect) navigateTo('/admin');
  } else {
    if (btnCust) btnCust.classList.add('active');
    if (btnAdmin) btnAdmin.classList.remove('active');

    // Set demo customer session if not customer
    if (!currentUser || currentUser.role !== 'customer') {
      currentUser = {
        id: 'usr-1',
        name: 'Danesyya Qamrut',
        email: 'danesyya.q@email.com',
        phone: '0812-3456-7890',
        role: 'customer',
        avatar: '/assets/images/avatar-customer.jpg'
      };
      localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
    }

    if (redirect) navigateTo('/menu');
  }
}

// --------------------------------------------------------------------------
// VIEWPORT TOGGLE (iPhone Frame vs Full Web)
// --------------------------------------------------------------------------

function initViewportToggle() {
  const btn = document.getElementById('btnToggleView');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isPhone = document.body.classList.contains('mode-phone');
    if (isPhone) {
      document.body.classList.remove('mode-phone');
      document.body.classList.add('mode-full');
      btn.innerHTML = '<i class="fa-solid fa-laptop"></i> <span class="btn-text">Mode Web</span>';
      showToast('Beralih ke tampilan Web Penuh (Laptop / Desktop)');
    } else {
      document.body.classList.remove('mode-full');
      document.body.classList.add('mode-phone');
      btn.innerHTML = '<i class="fa-solid fa-mobile-screen-button"></i> <span class="btn-text">Mode HP</span>';
      showToast('Beralih ke mockup iPhone (Figma Prototype)');
    }
  });
}

// --------------------------------------------------------------------------
// QUICK NAVIGATION DROPDOWN
// --------------------------------------------------------------------------

function initQuickNav() {
  const btn = document.getElementById('btnQuickNav');
  const dropdown = document.querySelector('.quick-nav-dropdown');

  if (btn && dropdown) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });
  }
}

function closeQuickNav() {
  const dropdown = document.querySelector('.quick-nav-dropdown');
  if (dropdown) dropdown.classList.remove('active');
}

// --------------------------------------------------------------------------
// TOAST NOTIFICATIONS
// --------------------------------------------------------------------------

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check text-success"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation text-danger"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

// --------------------------------------------------------------------------
// TEAM CREDITS MODAL
// --------------------------------------------------------------------------

function openTeamModal() {
  document.getElementById('teamModal').style.display = 'flex';
}

function closeTeamModal() {
  document.getElementById('teamModal').style.display = 'none';
}

// --------------------------------------------------------------------------
// APP INITIALIZATION
// --------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  // Load saved user or default customer
  try {
    const savedUser = localStorage.getItem('lowcoffe_user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    currentUser = null;
  }

  if (!currentUser) {
    currentUser = {
      id: 'usr-1',
      name: 'Danesyya Qamrut',
      email: 'danesyya.q@email.com',
      phone: '0812-3456-7890',
      role: 'customer',
      avatar: '/assets/images/avatar-customer.jpg'
    };
    localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
  }

  // Sync greeting name
  const greetingEl = document.getElementById('menuGreetingName');
  if (greetingEl && currentUser) {
    greetingEl.textContent = currentUser.name;
  }

  // Initialize features
  initCart();
  initViewportToggle();
  initQuickNav();

  // Listen to browser forward/back buttons
  window.addEventListener('popstate', (e) => {
    const path = window.location.pathname;
    navigateTo(path, false);
  });

  // Initial Route Dispatch
  const initialPath = window.location.pathname;
  if (initialPath && ROUTES[initialPath]) {
    navigateTo(initialPath, false);
  } else {
    // If opened on root, default to /onboarding for first experience or /menu
    navigateTo('/menu', true);
  }
});
