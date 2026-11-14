"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { getOverview, updateConfig, type Overview } from "@/lib/api"
import { humanize } from "@/lib/utils"
import { useSession } from "@/components/session"
import { Badge, Button, Card, CardHeader, ErrorBox, Input, Spinner } from "@/components/ui"

export default function OverviewPage() {
  const { handleError } = useSession()
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState("")
  const [toggling, setToggling] = useState(false)
  const [capInput, setCapInput] = useState("")
  const [savingCap, setSavingCap] = useState(false)
  const [capSaved, setCapSaved] = useState(false)

  const apply = (o: Overview) => {
    setData(o)
    setCapInput(String(o.registration_cap))
  }

  const load = useCallback(async () => {
    try {
      apply(await getOverview())
      setError("")
    } catch (err) {
      setError(handleError(err))
    }
  }, [handleError])

  useEffect(() => {
    load()
  }, [load])

  async function toggle() {
    if (!data) return
    const next = !data.registration_open
    if (!confirm(next ? "Open the registration form to the public?" : "Close the registration form? New players won't be able to register.")) return
    setToggling(true)
    try {
      apply(await updateConfig({ registration_open: next }))
      setError("")
    } catch (err) {
      setError(handleError(err))
    } finally {
      setToggling(false)
    }
  }

  async function saveCap(e: React.FormEvent) {
    e.preventDefault()
    const cap = Number(capInput)
    if (!Number.isInteger(cap) || cap < 0) {
      setError("The cap must be a whole number, 0 or more")
      return
    }
    setSavingCap(true)
    try {
      apply(await updateConfig({ registration_cap: cap }))
      setError("")
      setCapSaved(true)
      setTimeout(() => setCapSaved(false), 2000)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setSavingCap(false)
    }
  }

  if (!data) return error ? <ErrorBox>{error}</ErrorBox> : <Spinner />

  const paid = (data.by_status.PAID ?? 0) + (data.by_status.APPROVED ?? 0)
  const pct = data.registration_cap > 0 ? Math.min(100, (data.current_registrations / data.registration_cap) * 100) : 100
  const acceptingNow = data.registration_open && !data.registration_cap_reached

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Registration form is{" "}
          <strong className={acceptingNow ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            {acceptingNow ? "accepting players" : data.registration_open ? "full (cap reached)" : "closed"}
          </strong>
          .
        </p>
      </div>

      <ErrorBox>{error}</ErrorBox>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total registrations" value={data.current_registrations} tone="text-blue-600 dark:text-blue-400" />
        <Stat label="Paid" value={paid} tone="text-green-600 dark:text-green-400" />
        <Stat label="Spots left" value={Math.max(0, data.registration_cap - data.current_registrations)} tone="text-slate-900 dark:text-white" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Registration form"
            description="Start or stop new registrations. Players who already registered can still finish paying."
            action={<Badge status={data.registration_open ? "PAID" : "FAILED"}>{data.registration_open ? "Open" : "Closed"}</Badge>}
          />
          <div className="p-5">
            <Button variant={data.registration_open ? "danger" : "success"} onClick={toggle} loading={toggling}>
              {data.registration_open ? <X className="size-4" /> : <Check className="size-4" />}
              {data.registration_open ? "Close form" : "Open form"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Registration cap"
            description="The form stops accepting new players once this many have registered (paid or not)."
            action={data.registration_cap_reached ? <Badge status="FAILED">Cap reached</Badge> : undefined}
          />
          <div className="space-y-4 p-5">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>
                  {data.current_registrations} / {data.registration_cap}
                </span>
                <span className="text-slate-500">{Math.round(pct)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className={`h-full ${data.registration_cap_reached ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <form onSubmit={saveCap} className="flex gap-2">
              <Input type="number" min={0} step={1} value={capInput} onChange={(e) => setCapInput(e.target.value)} className="max-w-40" aria-label="Registration cap" />
              <Button type="submit" loading={savingCap} disabled={capInput === String(data.registration_cap)}>
                {capSaved ? "Saved" : "Save cap"}
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="By status" />
        <div className="flex flex-wrap gap-6 p-5">
          {Object.entries(data.by_status).length === 0 && <span className="text-sm text-slate-500">No registrations yet.</span>}
          {Object.entries(data.by_status).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <Badge status={status}>{humanize(status.toLowerCase())}</Badge>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone}`}>{value}</p>
    </Card>
  )
}
