'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AccessGate() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/travel/midautumn-2026/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        setMessage('访问口令不正确，请重新输入。')
        return
      }

      router.refresh()
    } catch {
      setMessage('暂时无法验证，请检查网络后重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.gatePage}>
      <section className={styles.gateCard} aria-labelledby="gate-title">
        <p className={styles.eyebrow}>PRIVATE RIDE NOTE</p>
        <h1 id="gate-title">中秋骑行安排</h1>
        <p className={styles.gateCopy}>
          济南奥体中心—博山—池上，三天骑游路线与出发清单。
        </p>
        <form onSubmit={handleSubmit} className={styles.gateForm}>
          <label htmlFor="ride-password">访问口令</label>
          <input
            id="ride-password"
            name="password"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入口令"
            required
            autoFocus
          />
          {message && <p className={styles.gateError} role="alert">{message}</p>}
          <button type="submit" disabled={loading}>
            {loading ? '验证中…' : '验证后查看安排'}
          </button>
        </form>
        <p className={styles.gateHint}>验证通过后，本次浏览可在 12 小时内免重复输入。</p>
      </section>
    </main>
  )
}
