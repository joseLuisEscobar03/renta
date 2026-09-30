const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('rentafacil_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if ((res.status === 401 || res.status === 403) && endpoint !== '/auth/login') {
        localStorage.removeItem('rentafacil_token');
        localStorage.removeItem('rentafacil_user');
        window.location.reload();
      }
      throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
    }
    return data;
  } catch (err) {
    console.error(`Error en API ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    me: () => request('/auth/me')
  },
  stats: {
    getDashboard: () => request('/stats/dashboard')
  },
  properties: {
    getAll: () => request('/properties'),
    getById: (id) => request(`/properties/${id}`),
    create: (data) => request('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/properties/${id}`, {
      method: 'DELETE'
    })
  },
  tenants: {
    getAll: () => request('/tenants'),
    getById: (id) => request(`/tenants/${id}`),
    create: (data) => request('/tenants', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/tenants/${id}`, {
      method: 'DELETE'
    })
  },
  payments: {
    getLedger: (filter = 'all') => request(`/payments/ledger?filter=${filter}`),
    getTransactions: () => request('/payments'),
    create: (data) => request('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/payments/${id}`, {
      method: 'DELETE'
    })
  },
  reminders: {
    getAll: () => request('/reminders'),
    markSent: (payload) => request('/reminders/mark-sent', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    markUnsent: (payload) => request('/reminders/mark-unsent', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    saveCustom: (payload) => request('/reminders/save-custom', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
};
