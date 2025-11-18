import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/admin/LoginForm'
import useAuth from '../hooks/useAuth'

export default function AdminLogin(){
  const nav = useNavigate()
  const { login, error } = useAuth()
  const onSubmit = async (u,p) => {
    const ok = await login(u,p)
    if (ok) nav('/admin/dashboard')
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <LoginForm onSubmit={onSubmit} error={error} />
    </div>
  )
}
