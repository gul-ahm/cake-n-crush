import { createClient } from '@supabase/supabase-js'

// These will be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin authentication service
export const adminAuth = {
  // Verify admin credentials against Supabase
  async verifyCredentials(username, password) {
    try {
      // Check against admin_credentials table
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('id, username, password_hash, is_active')
        .eq('username', username)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        return { success: false, message: 'Invalid credentials' }
      }

      // In production, use proper password hashing (bcrypt)
      // For now, using simple hash comparison
      const expectedHash = await this.hashPassword(password)
      
      if (data.password_hash === expectedHash) {
        // Generate session token
        const sessionToken = await this.generateSessionToken(data.id)
        
        // Store session in Supabase
        await supabase
          .from('admin_sessions')
          .insert({
            admin_id: data.id,
            session_token: sessionToken,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent
          })
        
        return { 
          success: true, 
          token: sessionToken,
          user: { id: data.id, username: data.username }
        }
      }
      
      return { success: false, message: 'Invalid credentials' }
    } catch (error) {
      console.error('Auth error:', error)
      return { success: false, message: 'Authentication failed' }
    }
  },

  // Verify session token
  async verifySession(token) {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('id, admin_id, expires_at')
        .eq('session_token', token)
        .eq('is_valid', true)
        .single()
      
      if (error || !data) {
        return { valid: false }
      }
      
      // Check if session is expired
      if (new Date() > new Date(data.expires_at)) {
        // Invalidate expired session
        await supabase
          .from('admin_sessions')
          .update({ is_valid: false })
          .eq('id', data.id)
        
        return { valid: false, message: 'Session expired' }
      }
      
      return { valid: true, adminId: data.admin_id }
    } catch (error) {
      console.error('Session verification error:', error)
      return { valid: false }
    }
  },

  // Logout and invalidate session
  async logout(token) {
    try {
      await supabase
        .from('admin_sessions')
        .update({ is_valid: false })
        .eq('session_token', token)
      
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  },

  // Simple password hashing (use bcrypt in production)
  async hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'cake_n_crush_salt')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  },

  // Generate secure session token
  async generateSessionToken(adminId) {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    return `${adminId}_${token}_${Date.now()}`
  },

  // Get client IP (fallback for localhost)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'localhost'
    }
  }
}