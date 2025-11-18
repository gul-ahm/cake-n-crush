import { createToken } from '../utils/jwtUtils'

export async function login(username, password){
  const u = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
  const p = import.meta.env.VITE_ADMIN_PASSWORD || 'cakencrush2024'
  if (username === u && password === p) {
    await createToken(username)
    return { ok: true }
  }
  return { ok: false, error: 'Invalid credentials' }
}
