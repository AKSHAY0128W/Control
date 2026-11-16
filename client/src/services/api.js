const API_BASE = '/api/v1';

async function request(path, options = {}) {
  try {
    const token = localStorage.getItem('smp_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    if (res.status === 401 && !path.includes('/auth/login')) {
      // Token might be invalid or expired
      localStorage.removeItem('smp_auth_token');
      localStorage.removeItem('smp_user');
      window.dispatchEvent(new Event('smp_auth_logout'));
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Error on ${path}:`, err);
    return { success: false, error: err.message };
  }
}

export const api = {
  // Authentication & Profile
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Server Status
  getServerStatus: () => request('/server/status'),
  pollServer: () => request('/server/poll', { method: 'POST' }),

  // Bots Management & Render Sync
  getBots: () => request('/bots'),
  getBot: (id) => request(`/bots/${id}`),
  registerBot: (data) => request('/bots', { method: 'POST', body: JSON.stringify(data) }),
  updateBot: (id, data) => request(`/bots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleBot: (id) => request(`/bots/${id}/toggle`, { method: 'POST' }),
  teleportBot: (id, customCoords = null) => request(`/bots/${id}/teleport`, { method: 'POST', body: JSON.stringify({ customCoords }) }),
  deleteBot: (id) => request(`/bots/${id}`, { method: 'DELETE' }),

  // Farms
  getFarms: () => request('/farms'),
  createFarm: (data) => request('/farms', { method: 'POST', body: JSON.stringify(data) }),
  updateFarm: (id, data) => request(`/farms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Settings & Console
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),
  testPterodactyl: () => request('/settings/test-pterodactyl', { method: 'POST' }),
  testRender: () => request('/settings/test-render', { method: 'POST' }),
  sendConsoleCommand: (command) => request('/settings/command', { method: 'POST', body: JSON.stringify({ command }) }),

  // Render Service Operations
  syncRender: () => request('/agent/render/sync', { method: 'POST' }),
  pingRender: () => request('/agent/render/ping', { method: 'POST' }),
  deployRender: () => request('/agent/render/deploy', { method: 'POST' }),

  // Activity Logs
  getActivity: (limit = 50) => request(`/activity?limit=${limit}`),
};
