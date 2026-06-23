'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
  slug: string
}

export default function SubmitForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      title: formData.get('title'),
      url: formData.get('url'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      tags: (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean),
      submitterName: formData.get('submitterName'),
    }

    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || '提交失败')
      } else {
        setSuccess(true)
        form.reset()
        setTimeout(() => router.push('/'), 2000)
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-green-600 text-lg">提交成功！等待管理员审核。</p>
        <p className="text-gray-400 text-sm mt-2">即将返回首页...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">网站名称 *</label>
        <input name="title" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="例如：Figma" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">网址 *</label>
        <input name="url" type="url" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="https://" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
        <select name="categoryId" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white">
          <option value="">选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
        <input name="tags" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="多个标签用逗号分隔，例如：UI, 原型" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
        <textarea name="description" rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="一句话描述这个网站" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">你的名字（可选）</label>
        <input name="submitterName" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="匿名" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? '提交中...' : '提交审核'}
      </button>
    </form>
  )
}
