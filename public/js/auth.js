// ==========================================================================
// LOW COFFE - AUTHENTICATION CONTROLLER (SCREENS 4 & 5)
// ==========================================================================

function switchAuthTab(tab) {
  const loginForm = document.getElementById('formLogin');
  const regForm = document.getElementById('formRegister');
  const loginBtn = document.getElementById('tabLoginBtn');
  const regBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginBtn.classList.add('active');
    regBtn.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    loginBtn.classList.remove('active');
    regBtn.classList.add('active');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  showToast('Memverifikasi akun...');
  const res = await API.login(email, password);

  if (res.success && res.user) {
    currentUser = res.user;
    localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
    showToast(`Selamat datang kembali, ${currentUser.name}!`, 'success');
    
    if (currentUser.role === 'admin') {
      switchRole('admin');
      navigateTo('/admin');
    } else {
      switchRole('customer');
      navigateTo('/menu');
    }
  } else {
    showToast(res.message || 'Email atau kata sandi tidak sesuai', 'error');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;

  showToast('Mendaftarkan akun baru...');
  const res = await API.register({ name, email, phone, password });

  if (res.success && res.user) {
    currentUser = res.user;
    localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
    showToast(`Pendaftaran berhasil! Halo, ${currentUser.name}`, 'success');
    switchRole('customer');
    navigateTo('/menu');
  } else {
    showToast(res.message || 'Pendaftaran gagal', 'error');
  }
}

function handleGoogleLogin() {
  showToast('Masuk dengan Akun Google berhasil!', 'success');
  currentUser = {
    id: 'usr-google',
    name: 'Danesyya Qamrut (Google)',
    email: 'danesyya.q@gmail.com',
    phone: '0812-3456-7890',
    role: 'customer',
    avatar: '/assets/images/avatar-customer.jpg'
  };
  localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
  switchRole('customer');
  navigateTo('/menu');
}

function quickLoginAdmin() {
  showToast('Masuk sebagai Espresso Admin...', 'success');
  currentUser = {
    id: 'usr-2',
    name: 'Syahri Ramadhan',
    email: 'syahri.ramadhan@lowcoffe.com',
    phone: '0811-9876-5432',
    role: 'admin',
    avatar: '/assets/images/avatar-admin.jpg'
  };
  localStorage.setItem('lowcoffe_user', JSON.stringify(currentUser));
  switchRole('admin');
  navigateTo('/admin');
}

function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
    localStorage.removeItem('lowcoffe_user');
    currentUser = null;
    showToast('Berhasil keluar akun');
    navigateTo('/login');
  }
}
