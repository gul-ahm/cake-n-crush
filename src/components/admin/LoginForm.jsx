import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LoginForm({ onSubmit, error }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  return (
    <motion.form onSubmit={(e)=>{e.preventDefault(); onSubmit(username, password)}} className="max-w-sm mx-auto space-y-4 p-6 rounded-xl border bg-white/60 backdrop-blur">
      <h2 className="text-xl font-semibold">Admin Login</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm mb-1">Username</label>
        <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
      </div>
      <button className="w-full py-2 rounded bg-black text-white">Sign in</button>
    </motion.form>
  )
}
