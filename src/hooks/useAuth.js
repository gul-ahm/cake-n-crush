import { useState } from 'react'
import { createToken } from '../utils/jwtUtils'

export default function useAuth(){
  const [error, setError] = useState(null)
  const login = async (username, password) => {
    setError(null)
    const u = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
    const p = import.meta.env.VITE_ADMIN_PASSWORD || 'cakencrush2024'
    if (username === u && password === p) {
      await createToken(username)
      return true
    }
    setError('Invalid credentials')
    return false
  }
  return { login, error }
}
