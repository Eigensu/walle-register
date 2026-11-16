"use client"

import { useCallback, useEffect, useState } from "react"
import { Trash2, UserPlus } from "lucide-react"
import { createAdmin, deleteAdmin, listAdmins, type AdminUser } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"
import { useSession } from "@/components/session"
import { Badge, Button, Card, CardHeader, ErrorBox, Input, Spinner } from "@/components/ui"

export default function AdminsPage() {
  const { session, handleError } = useSession()
  const [admins, setAdmins] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setAdmins((await listAdmins()).admins)
    } catch (err) {
      setError(handleError(err))
    }
  }, [handleError])

  useEffect(() => {
    load()
  }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError("")
    try {
      await createAdmin(username.trim(), password)
      setUsername("")
      setPassword("")
      await load()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setAdding(false)
    }
  }

  async function remove(name: string) {
    if (!confirm(`Remove admin "${name}"? They will be signed out straight away.`)) return
    setRemoving(name)
    setError("")
    try {
      await deleteAdmin(name)
      await load()
    } catch (err) {
      setError(handleError(err))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admins</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">People who can sign in to this panel.</p>
      </div>

      <ErrorBox>{error}</ErrorBox>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="overflow-hidden">
          <CardHeader title="All admins" description={admins ? `${admins.length} total` : undefined} />
          {admins === null ? (
            <Spinner />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {admins.map((a) => (
                <li key={a.username} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="font-medium">{a.username}</span>
                  {a.is_owner && <Badge status="APPROVED">Owner</Badge>}
                  {a.username === session.username && <Badge>You</Badge>}
                  <span className="text-xs text-slate-500">
                    {a.is_owner ? "Set by ADMIN_USERNAME / ADMIN_PASSWORD on the backend" : `Added by ${a.created_by ?? "—"} · ${formatDateTime(a.created_at)}`}
                  </span>
                  {!a.is_owner && a.username !== session.username && (
                    <Button variant="ghost" size="sm" className="ml-auto text-red-600" onClick={() => remove(a.username)} loading={removing === a.username} aria-label={`Remove ${a.username}`}>
                      {removing !== a.username && <Trash2 className="size-4" />}
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Add an admin" description="They get full access to this panel." />
          <form onSubmit={add} className="space-y-3 p-5">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Username</span>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" minLength={3} required />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
              <span className="text-xs text-slate-500">At least 8 characters. Share it with them privately.</span>
            </label>
            <Button type="submit" className="w-full" loading={adding}>
              {!adding && <UserPlus className="size-4" />}
              Add admin
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
