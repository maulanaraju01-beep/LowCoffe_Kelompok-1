const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// DB helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      require('./data/seed');
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { users: [], menu: [], orders: [], favorites: [], settings: {}, reports: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// ==========================================
// API ROUTES
// ==========================================

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = readDB();

  // If specific role switcher requested
  if (role) {
    const user = db.users.find(u => u.role === role);
    if (user) {
      return res.json({ success: true, user });
    }
  }

  // Normal credential check
  const user = db.users.find(u => 
    (u.email.toLowerCase() === (email || '').toLowerCase() || u.phone === email) && 
    u.password === password
  );

  if (!user) {
    // If no exact match, allow friendly demo login
    if (email && email.includes('admin')) {
      const admin = db.users.find(u => u.role === 'admin');
      return res.json({ success: true, user: admin });
    }
    const customer = db.users.find(u => u.role === 'customer');
    return res.json({ success: true, user: customer });
  }

  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ success: true, user: existing, message: 'Akun sudah terdaftar, berhasil masuk' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name,
    email,
    phone: phone || '0812-' + Math.floor(10000000 + Math.random() * 90000000),
    password: password || 'user123',
    role: 'customer',
    avatar: '/assets/images/avatar-customer.jpg'
  };

  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, user: newUser });
});

// --- MENU ---
app.get('/api/menu', (req, res) => {
  const { category, search, stock } = req.query;
  const db = readDB();
  let items = [...(db.menu || [])];

  if (category && category !== 'all') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    items = items.filter(i => 
      i.name.toLowerCase().includes(term) || 
      (i.description && i.description.toLowerCase().includes(term))
    );
  }

  if (stock !== undefined) {
    const isStock = stock === 'true';
    items = items.filter(i => i.in_stock === isStock);
  }

  res.json({ success: true, data: items });
});

app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.categories || [] });
});

app.post('/api/menu', (req, res) => {
  const db = readDB();
  const { name, category, price, description, image, in_stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Nama dan harga menu wajib diisi' });
  }

  const newItem = {
    id: 'm-' + Date.now(),
    name,
    category: category || 'kopi',
    price: Number(price) || 0,
    description: description || 'Menu pilihan istimewa dari Low Coffe.',
    image: image || '/assets/images/latte.jpg',
    in_stock: in_stock !== undefined ? Boolean(in_stock) : true,
    popular: false,
    rating: 4.8,
    sold_count: 0
  };

  db.menu.unshift(newItem);
  writeDB(db);
  res.json({ success: true, data: newItem });
});

app.put('/api/menu/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const idx = db.menu.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
  }

  const current = db.menu[idx];
  db.menu[idx] = {
    ...current,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    in_stock: req.body.in_stock !== undefined ? Boolean(req.body.in_stock) : current.in_stock
  };

  writeDB(db);
  res.json({ success: true, data: db.menu[idx] });
});

app.delete('/api/menu/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const idx = db.menu.findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
  }

  const deleted = db.menu.splice(idx, 1);
  writeDB(db);
  res.json({ success: true, data: deleted[0] });
});

// --- FAVORITES ---
app.get('/api/favorites', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.favorites || [] });
});

app.post('/api/favorites/toggle', (req, res) => {
  const { menu_id } = req.body;
  if (!menu_id) return res.status(400).json({ success: false, message: 'menu_id wajib diisi' });

  const db = readDB();
  db.favorites = db.favorites || [];
  const idx = db.favorites.indexOf(menu_id);
  let isFavorite = false;

  if (idx > -1) {
    db.favorites.splice(idx, 1);
    isFavorite = false;
  } else {
    db.favorites.push(menu_id);
    isFavorite = true;
  }

  writeDB(db);
  res.json({ success: true, is_favorite: isFavorite, favorites: db.favorites });
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  const { status, customer_id } = req.query;
  const db = readDB();
  let orders = [...(db.orders || [])];

  if (status && status !== 'Semua') {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  if (customer_id) {
    orders = orders.filter(o => o.customer_id === customer_id);
  }

  // Sort descending by created_at
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, data: orders });
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const { customer_name, customer_phone, order_type, table_number, payment_method, items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Keranjang belanja tidak boleh kosong' });
  }

  const orderNum = 'LC-' + (1025 + (db.orders.length || 0));
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = db.settings.service_tax || 2000;
  const total = subtotal + tax;

  const newOrder = {
    id: 'ORD-' + Date.now(),
    order_number: orderNum,
    customer_id: req.body.customer_id || 'usr-1',
    customer_name: customer_name || 'Danesyya Qamrut',
    customer_phone: customer_phone || '0812-3456-7890',
    order_type: order_type || 'Dine-in',
    table_number: table_number || (order_type === 'Takeaway' ? '-' : '07'),
    payment_method: payment_method || 'QRIS',
    status: 'Baru',
    created_at: new Date().toISOString(),
    items: items,
    subtotal: subtotal,
    tax: tax,
    total: total
  };

  db.orders.unshift(newOrder);

  // Update menu sold count
  items.forEach(it => {
    const menuItem = db.menu.find(m => m.id === it.menu_id);
    if (menuItem) {
      menuItem.sold_count = (menuItem.sold_count || 0) + it.quantity;
    }
  });

  // Update reports
  if (db.reports) {
    db.reports.today_orders = (db.reports.today_orders || 24) + 1;
    db.reports.today_revenue = (db.reports.today_revenue || 1548000) + total;
  }

  writeDB(db);
  res.json({ success: true, data: newOrder });
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body;

  const order = db.orders.find(o => o.id === id || o.order_number === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  order.status = status;
  writeDB(db);
  res.json({ success: true, data: order });
});

// --- REPORTS & DASHBOARD ---
app.get('/api/reports', (req, res) => {
  const db = readDB();
  const orders = db.orders || [];

  // Calculate live stats
  const todayOrders = orders.length;
  const todayRevenue = orders
    .filter(o => o.status !== 'Dibatalkan')
    .reduce((sum, o) => sum + o.total, 0);

  const reportsData = {
    ...db.reports,
    today_orders: todayOrders > 0 ? todayOrders : db.reports.today_orders,
    today_revenue: todayRevenue > 0 ? todayRevenue : db.reports.today_revenue,
    recent_orders: orders.slice(0, 5)
  };

  res.json({ success: true, data: reportsData });
});

// --- SETTINGS ---
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, data: db.settings });
});

app.post('/api/settings/reset', (req, res) => {
  require('./data/seed');
  res.json({ success: true, message: 'Data berhasil direset ke setelan awal pabrik' });
});

// ==========================================
// SPA ROUTING FALLBACK
// ==========================================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`☕ Low Coffe Monolithic Web Application is RUNNING!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Customer App: http://localhost:${PORT}/menu`);
  console.log(`💻 Espresso Admin: http://localhost:${PORT}/admin`);
  console.log(`=======================================================`);
});
