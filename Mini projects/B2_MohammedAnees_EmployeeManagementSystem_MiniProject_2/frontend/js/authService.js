// authService.js — Calls real API. Stores JWT in memory only (never localStorage).

const authService = (() => {
  let _session = null; // { username, role, token }

  return {
    async login(username, password) {
      try {
        const result = await storageService.login({ username, password });
        if (result && result.success) {
          _session = { username: result.username, role: result.role, token: result.token };
          return { success: true };
        }
        return { success: false, error: result?.message || 'Login failed.' };
      } catch (err) {
        return { success: false, error: err.message || 'Invalid credentials.' };
      }
    },

    async signup(username, password, role = 'Viewer') {
      try {
        const result = await storageService.register({ username, password, role });
        if (result && result.success) return { success: true };
        return { success: false, error: result?.message || 'Registration failed.' };
      } catch (err) {
        return { success: false, error: err.message || 'Registration failed.' };
      }
    },

    logout()        { _session = null; },
    isLoggedIn()    { return _session !== null; },
    getCurrentUser(){ return _session?.username || null; },
    getRole()       { return _session?.role     || null; },
    isAdmin()       { return _session?.role === 'Admin'; },
    getToken()      { return _session?.token    || null; }
  };
})();
