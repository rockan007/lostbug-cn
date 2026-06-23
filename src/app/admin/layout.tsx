import { isAdmin } from '@/lib/auth'
import AdminLoginForm from './AdminLoginForm'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin()

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <h1 className="text-xl font-bold text-center mb-6">管理员登录</h1>
        <AdminLoginForm />
      </div>
    )
  }

  return <>{children}</>
}
