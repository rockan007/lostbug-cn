'use client'

import { useState } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
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
        setAuthed(true)
      } else {
        setError('密码错误')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <h1 className="text-xl font-bold text-center mb-6">管理员登录</h1>
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
      </div>
    )
  }

  return <>{children}</>
}
