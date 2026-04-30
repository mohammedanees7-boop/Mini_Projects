// tests/authService.test.js

// Standalone authService recreation for testing (no browser globals needed)
function createAuthService(seedAdmin) {
  let sessionActive = false;
  let currentUser = null;
  const admins = [{ ...seedAdmin }];

  return {
    signup(username, password) {
      const exists = admins.some(a => a.username.toLowerCase() === username.toLowerCase());
      if (exists) return { success: false, error: 'Username already exists.' };
      admins.push({ username, password });
      return { success: true };
    },
    login(username, password) {
      const admin = admins.find(a => a.username === username && a.password === password);
      if (admin) { sessionActive = true; currentUser = admin.username; return { success: true }; }
      return { success: false, error: 'Invalid credentials.' };
    },
    logout() { sessionActive = false; currentUser = null; },
    isLoggedIn() { return sessionActive; },
    getCurrentUser() { return currentUser; }
  };
}

let auth;
beforeEach(() => {
  auth = createAuthService({ username: 'hradmin', password: 'hradmin123' });
});

describe('authService — signup', () => {
  test('allows new unique username', () => {
    expect(auth.signup('newuser', 'pass123').success).toBe(true);
  });
  test('rejects duplicate username (case-insensitive)', () => {
    const res = auth.signup('Hradmin', 'anything');
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/already exists/i);
  });
  test('allows login after signup', () => {
    auth.signup('newuser', 'pass123');
    expect(auth.login('newuser', 'pass123').success).toBe(true);
  });
});

describe('authService — login', () => {
  test('succeeds with correct credentials', () => {
    expect(auth.login('hradmin', 'hradmin123').success).toBe(true);
  });
  test('fails with wrong password', () => {
    expect(auth.login('hradmin', 'wrongpass').success).toBe(false);
  });
  test('fails with wrong username', () => {
    expect(auth.login('notadmin', 'hradmin123').success).toBe(false);
  });
  test('sets session after login', () => {
    auth.login('hradmin', 'hradmin123');
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.getCurrentUser()).toBe('hradmin');
  });
});

describe('authService — logout', () => {
  test('clears session on logout', () => {
    auth.login('hradmin', 'hradmin123');
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.getCurrentUser()).toBeNull();
  });
});

describe('authService — session state', () => {
  test('not logged in initially', () => {
    expect(auth.isLoggedIn()).toBe(false);
  });
  test('getCurrentUser returns null before login', () => {
    expect(auth.getCurrentUser()).toBeNull();
  });
});
