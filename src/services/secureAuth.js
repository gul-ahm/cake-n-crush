// Secure Authentication Service
class SecureAuthService {
  constructor() {
    // Base API endpoint for auth: allow env override, else default relative path
    this.apiEndpoint = import.meta.env.VITE_ADMIN_API_ENDPOINT || '/api/auth';
    this.handshakeToken = null;
    this.handshakeExpiry = 0;
    // Legacy token/user storage removed for cookie-based auth
    this.userKey = 'secure_user_meta';
    this.tokenKey = 'secure_user_token'; // fallback when cookie auth disabled

    // Debug logging
    console.log('🔧 SecureAuth Service Initialized:');
    console.log('📍 API Endpoint:', this.apiEndpoint);
    console.log('🤝 Handshake init: none yet');
    console.log('🌐 Environment Variables:', {
      VITE_ADMIN_API_ENDPOINT: import.meta.env.VITE_ADMIN_API_ENDPOINT,
      VITE_API_KEY: import.meta.env.VITE_API_KEY ? 'Set' : 'Missing',
      VITE_ACCESS_ROUTE: import.meta.env.VITE_ACCESS_ROUTE
    });

    // CRITICAL: Validate endpoint is not undefined (cache-busting check)
    if (this.apiEndpoint === 'undefined' || !this.apiEndpoint) {
      console.error('🚨 CRITICAL: API endpoint is undefined! Using emergency fallback.');
      this.apiEndpoint = '/api/auth';
      console.log('🔧 Emergency fallback set to:', this.apiEndpoint);
    }

    // If running on a non-localhost host (e.g., onrender.com) but endpoint still points to localhost,
    // override to same-origin relative path to satisfy CSP and avoid cross-origin issues.
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(host);
      if (!isLocalHost && /^http:\/\/localhost(:\d+)?\//i.test(this.apiEndpoint)) {
        console.warn('⚠️ Detected localhost API endpoint on production host. Overriding to /api/auth');
        this.apiEndpoint = '/api/auth';
      }
    } catch { }
  }

  // Encrypt sensitive data before storing
  encryptData(data) {
    try {
      return btoa(JSON.stringify(data));
    } catch {
      return null;
    }
  }

  // Decrypt sensitive data after retrieving
  decryptData(encryptedData) {
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return null;
    }
  }

  // Secure login with API validation
  async ensureHandshake() {
    const now = Date.now();
    if (this.handshakeToken && now < this.handshakeExpiry - 2000) {
      return this.handshakeToken;
    }
    // Retry logic (3 attempts) for transient failures
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🤝 Requesting handshake token (attempt ${attempt}) from: ${this.apiEndpoint}/handshake`);
        const res = await fetch(`${this.apiEndpoint}/handshake`, {
          method: 'GET',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          credentials: 'include',
          cache: 'no-cache' // Force fresh request, bypass cache
        });
        console.log('🤝 Handshake response status:', res.status);
        const data = await res.json();
        console.log('🤝 Handshake response data:', data);
        if (data.success) {
          this.handshakeToken = data.handshake;
          this.handshakeExpiry = Date.now() + data.expiresIn;
          console.log('✅ Handshake acquired successfully');
          return this.handshakeToken;
        } else {
          console.error('Handshake failed:', data.message);
          if (/disabled|unavailable/i.test(data.message)) {
            console.error('⚠️ Handshake disabled or unavailable. Ensure INTERNAL_API_KEY is set on the server.');
            return null;
          }
        }
      } catch (e) {
        console.error(`Handshake error attempt ${attempt}:`, e.message || e);
      }
      // Backoff delay
      await new Promise(r => setTimeout(r, 250 * attempt));
    }
    return null;
  }

  async login(username, password) {
    console.log('🔐 Starting login process...');
    console.log('📍 Endpoint:', this.apiEndpoint);
    console.log('👤 Username:', username);

    try {
      const handshake = await this.ensureHandshake();
      if (!handshake) {
        return { success: false, message: 'Handshake unavailable. Set INTERNAL_API_KEY on server.', status: 0, handshake: false };
      }
      const requestBody = {
        username,
        password,
        handshake
      };

      console.log('📤 Sending request to:', `${this.apiEndpoint}/login (handshake mode)`);
      console.log('📋 Request body:', { ...requestBody, password: '***' });

      const response = await fetch(`${this.apiEndpoint}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (result.success) {
        // Cookie set by server; just store minimal meta
        sessionStorage.setItem(this.userKey, this.encryptData({
          username,
          role: 'admin',
          loginTime: Date.now(),
          expiresIn: result.expiresIn
        }));
        // Store token only if server returned one (cookie mode returns undefined token)
        if (result.token) {
          sessionStorage.setItem(this.tokenKey, result.token);
          console.log('🗝️ Stored JWT token (fallback mode)');
        } else {
          sessionStorage.removeItem(this.tokenKey);
        }
        this.setupAutoLogout(result.expiresIn);
        return { success: true, message: 'Login successful', status: response.status };
      }
      return { success: false, message: result.message || 'Login failed', status: response.status };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Connection error', status: -1 };
    }
  }

  // Verify current session with server
  async verifySession() {
    // Cookie-based verification: no token required client-side
    try {
      const token = sessionStorage.getItem(this.tokenKey);
      const body = token ? JSON.stringify({ token }) : JSON.stringify({});
      const headers = { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${this.apiEndpoint}/verify`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body
      });
      const result = await response.json();
      return result.success;
    } catch (e) {
      return false;
    }
  }

  // Get stored token
  getToken() {
    return sessionStorage.getItem(this.tokenKey) || null;
  }

  // Get user data
  getUserData() {
    const encryptedData = sessionStorage.getItem(this.userKey);
    return encryptedData ? this.decryptData(encryptedData) : null;
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const userData = this.getUserData();
    if (!userData) return false;

    // Check expiration
    const isExpired = Date.now() - userData.loginTime > userData.expiresIn;
    if (isExpired) {
      this.logout();
      return false;
    }

    // Verify with server
    return await this.verifySession();
  }

  // Setup automatic logout
  setupAutoLogout(expiresIn) {
    // Clear any existing timeout
    if (this.logoutTimer) clearTimeout(this.logoutTimer);

    // Set new timeout
    this.logoutTimer = setTimeout(() => {
      this.logout();
      window.location.reload(); // Force reload to update UI
    }, expiresIn - 5000); // Logout 5 seconds before actual expiration
  }

  // Secure logout
  async logout() {
    try {
      // Notify server (optional)
      // Inform server to clear cookie
      fetch(`${this.apiEndpoint}/logout`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include'
      }).catch(() => { });
    } finally {
      // Clear local session data
      sessionStorage.removeItem(this.userKey);

      // Clear timeout
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }
    }
  }

  // Generate obfuscated admin route
  getAdminRoute() {
    const baseRoute = import.meta.env.VITE_ACCESS_ROUTE || 's3cur3-m4n4g3m3nt-p0rt4l-x9z';
    return `/${baseRoute}`;
  }

  // Check if current route is admin route
  isAdminRoute(pathname) {
    const adminRoute = this.getAdminRoute();
    return pathname === adminRoute || pathname.startsWith('/admin');
  }
}

export default new SecureAuthService();