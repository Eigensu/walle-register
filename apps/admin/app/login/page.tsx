"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import { ADMIN_TITLE } from "@/lib/utils"
import { Button, Card, ErrorBox, Input } from "@/components/ui"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(username, password)
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-bold">{ADMIN_TITLE}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage registrations.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Username</span>
            <Input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} autoFocus />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Password</span>
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </label>
          <ErrorBox>{error}</ErrorBox>
          <Button type="submit" className="w-full" loading={loading} disabled={!username || !password}>
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  )
}
