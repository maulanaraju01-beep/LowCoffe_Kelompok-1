const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const initialData = {
  users: [
    {
      id: 'usr-1',
      name: 'Danesyya Qamrut',
      email: 'danesyya.q@email.com',
      phone: '0812-3456-7890',
      password: 'user123',
      role: 'customer',
      avatar: '/assets/images/avatar-customer.jpg'
    },
    {
      id: 'usr-2',
      name: 'Syahri Ramadhan',
      email: 'syahri.ramadhan@lowcoffe.com',
      phone: '0811-9876-5432',
      password: 'admin123',
      role: 'admin',
      avatar: '/assets/images/avatar-admin.jpg'
    }
  ],
  categories: [
    { id: 'all', name: 'Semua', icon: 'coffee' },
    { id: 'kopi', name: 'Kopi', icon: 'cup-straw' },
    { id: 'non-kopi', name: 'Non-Kopi', icon: 'glass-water' },
    { id: 'makanan', name: 'Makanan', icon: 'utensils' },
    { id: 'snack', name: 'Snack', icon: 'cookie' }
  ],
  menu: [
    {
      id: 'm-1',
      name: 'Sanger',
      category: 'kopi',
      price: 18000,
      description: 'Kopi khas Aceh legendaris dengan paduan espresso robusta dan susu kental manis berbusa lembut.',
      image: '/assets/images/sanger.jpg',
      in_stock: true,
      popular: true,
      rating: 4.9,
      sold_count: 142
    },
    {
      id: 'm-2',
      name: 'Caffe Latte',
      category: 'kopi',
      price: 22000,
      description: 'Espresso arabika dipadukan dengan steamed fresh milk lembut dan sentuhan latte art cantik.',
      image: '/assets/images/latte.jpg',
      in_stock: true,
      popular: true,
      rating: 4.8,
      sold_count: 98
    },
    {
      id: 'm-3',
      name: 'Sanger Dingin',
      category: 'kopi',
      price: 20000,
      description: 'Sensasi kesegaran sanger dingin dengan es batu kristal yang pas melepas dahaga di siang hari.',
      image: '/assets/images/sanger-dingin.jpg',
      in_stock: true,
      popular: true,
      rating: 4.9,
      sold_count: 125
    },
    {
      id: 'm-4',
      name: 'Americano',
      category: 'kopi',
      price: 18000,
      description: 'Double shot espresso murni diseduh air segar pilihan. Kaya rasa dan berkarakter kuat.',
      image: '/assets/images/americano.jpg',
      in_stock: true,
      popular: false,
      rating: 4.7,
      sold_count: 65
    },
    {
      id: 'm-5',
      name: 'Mochaccino',
      category: 'kopi',
      price: 24000,
      description: 'Perpaduan sempurna antara rasa cokelat Belgia pekat, espresso harum, dan busa susu lembut.',
      image: '/assets/images/mochaccino.jpg',
      in_stock: true,
      popular: false,
      rating: 4.8,
      sold_count: 54
    },
    {
      id: 'm-6',
      name: 'Espresso Single / Double',
      category: 'kopi',
      price: 15000,
      description: 'Ekstraksi murni biji kopi Arabika Gayo pilihan dengan krema tebal berwarna keemasan.',
      image: '/assets/images/espresso.jpg',
      in_stock: true,
      popular: false,
      rating: 4.6,
      sold_count: 32
    },
    {
      id: 'm-7',
      name: 'Caramel Latte',
      category: 'kopi',
      price: 28000,
      description: 'Latte lembut istimewa dengan saus sirup karamel bakar manis gurih yang memanjakan lidah.',
      image: '/assets/images/caramel-latte.jpg',
      in_stock: true,
      popular: true,
      rating: 4.9,
      sold_count: 88
    },
    {
      id: 'm-8',
      name: 'Matcha Latte',
      category: 'non-kopi',
      price: 24000,
      description: 'Matcha asli dari Kyoto dengan rasa teh hijau autentik yang lembut dipadu susu gurih.',
      image: '/assets/images/matcha-latte.jpg',
      in_stock: true,
      popular: true,
      rating: 4.8,
      sold_count: 76
    },
    {
      id: 'm-9',
      name: 'Red Velvet Latte',
      category: 'non-kopi',
      price: 24000,
      description: 'Minuman khas red velvet manis creamy dengan aroma vanila menyenangkan dan warna memikat.',
      image: '/assets/images/red-velvet.jpg',
      in_stock: true,
      popular: false,
      rating: 4.7,
      sold_count: 42
    },
    {
      id: 'm-10',
      name: 'Taro Milk',
      category: 'non-kopi',
      price: 22000,
      description: 'Ekstrak umbi talas manis legit berpadu susu creamy, disajikan dingin atau hangat.',
      image: '/assets/images/taro-milk.jpg',
      in_stock: true,
      popular: false,
      rating: 4.7,
      sold_count: 38
    },
    {
      id: 'm-11',
      name: 'Dark Chocolate Classic',
      category: 'non-kopi',
      price: 22000,
      description: 'Cokelat hitam murni premium dengan kekentalan pas, tidak terlalu manis dan kaya antioksidan.',
      image: '/assets/images/chocolate.jpg',
      in_stock: true,
      popular: false,
      rating: 4.8,
      sold_count: 51
    },
    {
      id: 'm-12',
      name: 'Fresh Lemon Tea',
      category: 'non-kopi',
      price: 16000,
      description: 'Teh melati pilihan diseduh segar dengan perasan lemon asli dan daun mint sejuk.',
      image: '/assets/images/lemon-tea.jpg',
      in_stock: true,
      popular: false,
      rating: 4.6,
      sold_count: 49
    },
    {
      id: 'm-13',
      name: 'French Fries Crispy',
      category: 'snack',
      price: 18000,
      description: 'Kentang potong import digoreng keemasan dengan taburan bumbu gurih, saus cabai dan mayones.',
      image: '/assets/images/french-fries.jpg',
      in_stock: true,
      popular: true,
      rating: 4.9,
      sold_count: 87
    },
    {
      id: 'm-14',
      name: 'Spaghetti Bolognese',
      category: 'makanan',
      price: 28000,
      description: 'Pasta spaghetti al dente disiram saus daging sapi cincang, tomat segar, herba oregano dan parmesan.',
      image: '/assets/images/spaghetti.jpg',
      in_stock: true,
      popular: true,
      rating: 4.8,
      sold_count: 64
    },
    {
      id: 'm-15',
      name: 'Chicken Croissant Sandwich',
      category: 'makanan',
      price: 25000,
      description: 'Croissant renyah mentega Prancis diisi fillet ayam panggang gurih, selada, keju cheddar dan saus madu.',
      image: '/assets/images/croissant.jpg',
      in_stock: true,
      popular: true,
      rating: 4.8,
      sold_count: 59
    },
    {
      id: 'm-16',
      name: 'Crispy Chicken Wings',
      category: 'snack',
      price: 26000,
      description: 'Sayap ayam goreng garing dilumuri saus barbekyu pedas manis dengan taburan wijen sangrai.',
      image: '/assets/images/chicken-wings.jpg',
      in_stock: true,
      popular: false,
      rating: 4.7,
      sold_count: 45
    },
    {
      id: 'm-17',
      name: 'Nasi Goreng Spesial Low Coffe',
      category: 'makanan',
      price: 25000,
      description: 'Nasi goreng bumbu racikan khas dengan potongan sosis, ayam suwir, telur mata sapi dan kerupuk.',
      image: '/assets/images/nasi-goreng.jpg',
      in_stock: true,
      popular: true,
      rating: 4.9,
      sold_count: 73
    },
    {
      id: 'm-18',
      name: 'Roti Bakar Coklat Keju',
      category: 'snack',
      price: 20000,
      description: 'Roti bakar empuk berbalut mentega gurih, taburan melimpah cokelat meises dan keju cheddar parut.',
      image: '/assets/images/roti-bakar.jpg',
      in_stock: true,
      popular: false,
      rating: 4.8,
      sold_count: 52
    }
  ],
  favorites: ['m-1', 'm-2', 'm-3', 'm-13'],
  orders: [
    {
      id: 'ORD-1024',
      order_number: 'LC-1024',
      customer_id: 'usr-1',
      customer_name: 'Danesyya Qamrut',
      customer_phone: '0812-3456-7890',
      order_type: 'Dine-in',
      table_number: '05',
      payment_method: 'QRIS',
      status: 'Baru', // Baru, Diproses, Selesai, Dibatalkan
      created_at: '2026-10-19T18:45:00.000Z',
      items: [
        {
          menu_id: 'm-3',
          name: 'Sanger Dingin',
          price: 20000,
          quantity: 1,
          customization: { suhu: 'Dingin', susu: 'Fresh Milk', gula: 'Normal', biji: 'Arabika Gayo', ekstra_shot: false, notes: 'Banyak es batu' }
        },
        {
          menu_id: 'm-13',
          name: 'French Fries Crispy',
          price: 18000,
          quantity: 1,
          customization: { notes: 'Saus mayones dipisah' }
        }
      ],
      subtotal: 38000,
      tax: 2000,
      total: 40000
    },
    {
      id: 'ORD-1023',
      order_number: 'LC-1023',
      customer_id: 'usr-guest-1',
      customer_name: 'Kaisar Nahara Akbar',
      customer_phone: '0852-1122-3344',
      order_type: 'Dine-in',
      table_number: '03',
      payment_method: 'Tunai di Kasir',
      status: 'Diproses',
      created_at: '2026-10-19T18:15:00.000Z',
      items: [
        {
          menu_id: 'm-7',
          name: 'Caramel Latte',
          price: 28000,
          quantity: 2,
          customization: { suhu: 'Panas', susu: 'Oat Milk (+Rp 5.000)', gula: 'Less Sugar', biji: 'Arabika Gayo', ekstra_shot: true, notes: '' }
        },
        {
          menu_id: 'm-15',
          name: 'Chicken Croissant Sandwich',
          price: 25000,
          quantity: 1,
          customization: { notes: 'Hangatkan croissant' }
        }
      ],
      subtotal: 81000,
      tax: 2000,
      total: 83000
    },
    {
      id: 'ORD-1022',
      order_number: 'LC-1022',
      customer_id: 'usr-guest-2',
      customer_name: 'Annisa Sri Mentari',
      customer_phone: '0813-7788-9900',
      order_type: 'Takeaway',
      table_number: '-',
      payment_method: 'QRIS',
      status: 'Selesai',
      created_at: '2026-10-19T17:30:00.000Z',
      items: [
        {
          menu_id: 'm-8',
          name: 'Matcha Latte',
          price: 24000,
          quantity: 1,
          customization: { suhu: 'Dingin', susu: 'Fresh Milk', gula: 'Normal', notes: '' }
        },
        {
          menu_id: 'm-18',
          name: 'Roti Bakar Coklat Keju',
          price: 20000,
          quantity: 1,
          customization: { notes: 'Keju banyak' }
        }
      ],
      subtotal: 44000,
      tax: 2000,
      total: 46000
    },
    {
      id: 'ORD-1021',
      order_number: 'LC-1021',
      customer_id: 'usr-guest-3',
      customer_name: 'Maulana Raju',
      customer_phone: '0821-4455-6677',
      order_type: 'Dine-in',
      table_number: '08',
      payment_method: 'Tunai di Kasir',
      status: 'Selesai',
      created_at: '2026-10-19T16:50:00.000Z',
      items: [
        {
          menu_id: 'm-4',
          name: 'Americano',
          price: 18000,
          quantity: 2,
          customization: { suhu: 'Panas', biji: 'Arabika Gayo', notes: '' }
        }
      ],
      subtotal: 36000,
      tax: 2000,
      total: 38000
    },
    {
      id: 'ORD-1020',
      order_number: 'LC-1020',
      customer_id: 'usr-guest-4',
      customer_name: 'Latifah Annum HSB',
      customer_phone: '0878-9900-1122',
      order_type: 'Dine-in',
      table_number: '02',
      payment_method: 'QRIS',
      status: 'Selesai',
      created_at: '2026-10-19T15:40:00.000Z',
      items: [
        {
          menu_id: 'm-14',
          name: 'Spaghetti Bolognese',
          price: 28000,
          quantity: 1,
          customization: { notes: 'Pedas sedang' }
        },
        {
          menu_id: 'm-12',
          name: 'Fresh Lemon Tea',
          price: 16000,
          quantity: 1,
          customization: { suhu: 'Dingin', gula: 'Normal', notes: '' }
        }
      ],
      subtotal: 44000,
      tax: 2000,
      total: 46000
    },
    {
      id: 'ORD-1019',
      order_number: 'LC-1019',
      customer_id: 'usr-guest-5',
      customer_name: 'Putroe Balqis',
      customer_phone: '0853-2233-4455',
      order_type: 'Takeaway',
      table_number: '-',
      payment_method: 'QRIS',
      status: 'Selesai',
      created_at: '2026-10-19T14:20:00.000Z',
      items: [
        {
          menu_id: 'm-2',
          name: 'Caffe Latte',
          price: 22000,
          quantity: 1,
          customization: { suhu: 'Dingin', susu: 'Fresh Milk', gula: 'Less Sugar', notes: '' }
        }
      ],
      subtotal: 22000,
      tax: 2000,
      total: 24000
    }
  ],
  settings: {
    shop_name: 'Low Coffe',
    tagline: 'premium coffee for you',
    is_open: true,
    open_hours: '08:00 - 22:00',
    address: 'Jl. Teuku Umar No. 45, Banda Aceh',
    phone: '0811-9876-5432',
    email: 'kontak@lowcoffe.com',
    tables_count: 20,
    notification_sound: true,
    service_tax: 2000,
    payment_methods: ['Tunai di Kasir', 'QRIS', 'Transfer Bank'],
    owner: {
      name: 'Syahri Ramadhan',
      nim: '240705090',
      role: 'Manager & Owner Low Coffe',
      email: 'syahri.ramadhan@lowcoffe.com'
    },
    team: [
      { nim: '240705049', name: 'Annisa Sri Mentari', task: 'Setup Frontend, Design System, Onboarding & Auth' },
      { nim: '240705090', name: 'Syahri Ramadhan', task: 'Daftar Menu, Filter Kategori, Pencarian & Favorit' },
      { nim: '240705103', name: 'Putroe Balqis', task: 'Keranjang, Profil Akun & Bottom Navigation' },
      { nim: '240705114', name: 'Latifah Annum HSB', task: 'Dashboard Admin & Manajemen Pesanan' },
      { nim: '240705128', name: 'Kaisar Nahara Akbar', task: 'Laporan Penjualan & Manajemen Produk' },
      { nim: '240705166', name: 'Maulana Raju', task: 'Pengaturan & Uji Responsif HP/Laptop' }
    ]
  },
  reports: {
    today_orders: 24,
    today_revenue: 1548000,
    today_customers: 12,
    total_sales_month: 12450000,
    avg_order_value: 48500,
    sales_growth: 12.5,
    top_selling: [
      { name: 'Sanger', category: 'Kopi', sold: 142, revenue: 2556000 },
      { name: 'Sanger Dingin', category: 'Kopi', sold: 125, revenue: 2500000 },
      { name: 'Caffe Latte', category: 'Kopi', sold: 98, revenue: 2156000 },
      { name: 'Caramel Latte', category: 'Kopi', sold: 88, revenue: 2464000 },
      { name: 'French Fries Crispy', category: 'Snack', sold: 87, revenue: 1566000 },
      { name: 'Matcha Latte', category: 'Non-Kopi', sold: 76, revenue: 1824000 },
      { name: 'Nasi Goreng Spesial', category: 'Makanan', sold: 73, revenue: 1825000 }
    ],
    trend_labels: ['01 Okt', '03 Okt', '05 Okt', '07 Okt', '09 Okt', '11 Okt', '13 Okt', '15 Okt', '17 Okt', '19 Okt'],
    trend_revenue: [920000, 1150000, 1080000, 1340000, 1220000, 1450000, 1380000, 1620000, 1490000, 1548000],
    category_distribution: {
      'Kopi': 52,
      'Non-Kopi': 18,
      'Makanan': 16,
      'Snack': 14
    }
  }
};

fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
console.log('Database seeded successfully to:', DB_FILE);
