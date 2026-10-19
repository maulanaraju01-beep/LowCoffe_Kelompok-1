// ==========================================================================
// LOW COFFE - API CLIENT
// Interacts with monolithic Express backend REST API
// ==========================================================================

const API = {
  baseUrl: '',

  async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(this.baseUrl + endpoint, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      return { success: false, message: 'Gagal menghubungi server backend: ' + err.message };
    }
  },

  // Auth
  async login(email, password, role) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
  },

  async register(data) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Menu
  async getMenu(category, search) {
    let url = '/api/menu';
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += '?' + params.toString();
    return this.request(url);
  },

  async createMenu(menuData) {
    return this.request('/api/menu', {
      method: 'POST',
      body: JSON.stringify(menuData)
    });
  },

  async updateMenu(id, menuData) {
    return this.request(`/api/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuData)
    });
  },

  async deleteMenu(id) {
    return this.request(`/api/menu/${id}`, {
      method: 'DELETE'
    });
  },

  // Favorites
  async getFavorites() {
    return this.request('/api/favorites');
  },

  async toggleFavorite(menuId) {
    return this.request('/api/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ menu_id: menuId })
    });
  },

  // Orders
  async getOrders(status, customerId) {
    let url = '/api/orders';
    const params = new URLSearchParams();
    if (status && status !== 'Semua') params.append('status', status);
    if (customerId) params.append('customer_id', customerId);
    if (params.toString()) url += '?' + params.toString();
    return this.request(url);
  },

  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async updateOrderStatus(id, status) {
    return this.request(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Reports
  async getReports() {
    return this.request('/api/reports');
  },

  // Settings
  async getSettings() {
    return this.request('/api/settings');
  },

  async updateSettings(settingsData) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  },

  async resetDB() {
    return this.request('/api/settings/reset', {
      method: 'POST'
    });
  }
};
