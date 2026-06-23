'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        setError('密码错误')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="输入管理密码"
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
      >
        {loading ? '验证中...' : '登录'}
      </button>
    </form>
  )
}
