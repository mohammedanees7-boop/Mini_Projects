// authService.js — All authentication logic. Session state as in-memory variables.

const authService = (() => {
  let sessionActive = false;
  let currentUser = null;
  let admins = [{ username: 'admin', password: 'admin123' }];

  return {
    signup(username, password) {
      const exists = admins.some(a => a.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        return { success: false, error: 'Username already exists. Please choose a different username.' };
      }
      admins.push({ username, password });
      return { success: true };
    },

    login(username, password) {
      const admin = admins.find(a => a.username === username && a.password === password);
      if (admin) {
        sessionActive = true;
        currentUser = admin.username;
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials. Please check your username and password.' };
    },

    logout() {
      sessionActive = false;
      currentUser = null;
    },

    isLoggedIn() {
      return sessionActive;
    },

    getCurrentUser() {
      return currentUser;
    }
  };
})();
