import { adminAuth } from '../config/supabase'

class SecureAuthService {
  constructor() {
    this.sessionKey = 'admin_session_token'
    this.maxAttempts = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 3
    this.lockoutDuration = parseInt(import.meta.env.VITE_LOCKOUT_DURATION) || 15 * 60 * 1000
    this.sessionTimeout = parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 30 * 60 * 1000
  }

  // Check if IP is locked out due to failed attempts
  isLockedOut() {
    const lockoutData = localStorage.getItem('admin_lockout')
    if (!lockoutData) return false
    
    const { timestamp, attempts } = JSON.parse(lockoutData)
    const timeSinceLockout = Date.now() - timestamp
    
    if (timeSinceLockout > this.lockoutDuration) {
      localStorage.removeItem('admin_lockout')
      return false
    }
    
    return attempts >= this.maxAttempts
  }

  // Record failed login attempt
  recordFailedAttempt() {
    const lockoutData = localStorage.getItem('admin_lockout')
    const current = lockoutData ? JSON.parse(lockoutData) : { attempts: 0, timestamp: Date.now() }
    
    current.attempts += 1
    current.timestamp = Date.now()
    
    localStorage.setItem('admin_lockout', JSON.stringify(current))
    
    if (current.attempts >= this.maxAttempts) {
      console.warn('Admin login locked due to multiple failed attempts')
    }
  }

  // Clear failed attempts on successful login
  clearFailedAttempts() {
    localStorage.removeItem('admin_lockout')
  }

  // Login with credentials
  async login(username, password) {
    if (this.isLockedOut()) {
      const remainingTime = Math.ceil((this.lockoutDuration - (Date.now() - JSON.parse(localStorage.getItem('admin_lockout')).timestamp)) / 60000)
      return { 
        success: false, 
        message: `Account locked. Try again in ${remainingTime} minutes.` 
      }
    }

    try {
      // Temporary local credentials for testing (remove when Supabase is setup)
      const tempCredentials = {
        username: 'admin',
        password: 'admin123'
      }

      // Check temporary credentials first
      if (username === tempCredentials.username && password === tempCredentials.password) {
        this.clearFailedAttempts()
        const tempToken = `temp_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(this.sessionKey, tempToken)
        localStorage.setItem('admin_user', JSON.stringify({ id: 'temp', username: username }))
        
        this.setAutoLogoutTimer()
        
        return { success: true, user: { id: 'temp', username: username } }
      }

      // Try Supabase authentication (fallback)
      const result = await adminAuth.verifyCredentials(username, password)
      
      if (result.success) {
        this.clearFailedAttempts()
        localStorage.setItem(this.sessionKey, result.token)
        localStorage.setItem('admin_user', JSON.stringify(result.user))
        
        // Set auto-logout timer
        this.setAutoLogoutTimer()
        
        return { success: true, user: result.user }
      } else {
        this.recordFailedAttempt()
        return result
      }
    } catch (error) {
      this.recordFailedAttempt()
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = localStorage.getItem(this.sessionKey)
    if (!token) return false
    
    // Handle temporary tokens (for local testing)
    if (token.startsWith('temp_session_')) {
      return true
    }
    
    try {
      const result = await adminAuth.verifySession(token)
      
      if (!result.valid) {
        this.logout()
        return false
      }
      
      return true
    } catch (error) {
      this.logout()
      return false
    }
  }

  // Get current user
  getUser() {
    const userData = localStorage.getItem('admin_user')
    return userData ? JSON.parse(userData) : null
  }

  // Logout
  async logout() {
    const token = localStorage.getItem(this.sessionKey)
    
    if (token) {
      try {
        await adminAuth.logout(token)
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    
    localStorage.removeItem(this.sessionKey)
    localStorage.removeItem('admin_user')
    this.clearAutoLogoutTimer()
  }

  // Set auto-logout timer
  setAutoLogoutTimer() {
    this.clearAutoLogoutTimer()
    this.logoutTimer = setTimeout(() => {
      this.logout()
      alert('Session expired. Please login again.')
      window.location.href = `/${import.meta.env.VITE_ADMIN_SECRET_PATH}`
    }, this.sessionTimeout)
  }

  // Clear auto-logout timer
  clearAutoLogoutTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer)
      this.logoutTimer = null
    }
  }

  // Activity tracking to extend session
  trackActivity() {
    if (this.isAuthenticated()) {
      this.setAutoLogoutTimer()
    }
  }
}

export default new SecureAuthService()