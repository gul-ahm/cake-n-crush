import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'cnc_admin_token_v1'

function base64url(input) {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function sign(payload, secret) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  const sigB64 = base64url(String.fromCharCode(...new Uint8Array(sig)))
  return `${data}.${sigB64}`
}

export async function createToken(username) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 30 // 30 min
  const secret = import.meta.env.VITE_JWT_SECRET || 'dev_secret'
  const token = await sign({ sub: username, exp }, secret)
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthed() {
  try {
    const token = getToken()
    if (!token) return false
    const { exp } = jwtDecode(token)
    return exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function RequireAuth({ children }) {
  if (!isAuthed()) {
    window.location.href = '/admin'
    return null
  }
  return children
}
