// storageService.js — All API calls using fetch(). The only file that talks to the backend.

const storageService = (() => {

  function _headers(withAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth) {
      const token = authService.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async function _handleResponse(res) {
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || data?.title || 'An error occurred.';
      const err     = new Error(message);
      err.status    = res.status;
      err.data      = data;
      throw err;
    }
    return data;
  }

  return {

    async getAll(params = {}) {
      const qs = new URLSearchParams();
      if (params.search)     qs.set('search',     params.search);
      if (params.department) qs.set('department', params.department);
      if (params.status)     qs.set('status',     params.status);
      if (params.sortBy)     qs.set('sortBy',     params.sortBy);
      if (params.sortDir)    qs.set('sortDir',    params.sortDir);
      qs.set('page',     params.page     || 1);
      qs.set('pageSize', params.pageSize || PAGE_SIZE);
      const res = await fetch(`${API_BASE_URL}/employees?${qs}`, { headers: _headers() });
      return _handleResponse(res);
    },

    async getById(id) {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, { headers: _headers() });
      return _handleResponse(res);
    },

    async add(data) {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST', headers: _headers(), body: JSON.stringify(data)
      });
      return _handleResponse(res);
    },

    async update(id, data) {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT', headers: _headers(), body: JSON.stringify(data)
      });
      return _handleResponse(res);
    },

    async remove(id) {
      const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE', headers: _headers()
      });
      return _handleResponse(res);
    },

    async getDashboard() {
      const res = await fetch(`${API_BASE_URL}/employees/dashboard`, { headers: _headers() });
      return _handleResponse(res);
    },

    async login(credentials) {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', headers: _headers(false), body: JSON.stringify(credentials)
      });
      return _handleResponse(res);
    },

    async register(credentials) {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST', headers: _headers(false), body: JSON.stringify(credentials)
      });
      return _handleResponse(res);
    }
  };
})();
