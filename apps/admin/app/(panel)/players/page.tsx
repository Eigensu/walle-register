"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Download, Search, X } from "lucide-react"
import { downloadPlayersCsv, getPlayer, listPlayers, type PlayerDetail, type PlayerRow } from "@/lib/api"
import { formatAmount, formatDateTime, humanize } from "@/lib/utils"
import { useSession } from "@/components/session"
import { Badge, Button, Card, ErrorBox, Input, Spinner } from "@/components/ui"

const LIMIT = 50
const STATUSES = ["", "PAID", "PENDING_PAYMENT", "FAILED", "APPROVED"]

export default function PlayersPage() {
  const { handleError } = useSession()
  const [rows, setRows] = useState<PlayerRow[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Only the newest request may update the list, so a slow earlier response can't overwrite it.
  const latestRequest = useRef(0)

  const load = useCallback(async () => {
    const request = ++latestRequest.current
    try {
      const res = await listPlayers({ page, limit: LIMIT, search, registration_status: statusFilter })
      if (request !== latestRequest.current) return
      setRows(res.players)
      setTotal(res.total)
      setError("")
    } catch (err) {
      if (request !== latestRequest.current) return
      setError(handleError(err))
    }
  }, [page, search, statusFilter, handleError])

  useEffect(() => {
    load()
  }, [load])

  async function exportCsv() {
    setExporting(true)
    try {
      await downloadPlayersCsv({ search, registration_status: statusFilter })
    } catch (err) {
      setError(handleError(err))
    } finally {
      setExporting(false)
    }
  }

  const from = total === 0 ? 0 : (page - 1) * LIMIT + 1
  const to = Math.min(page * LIMIT, total)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Players</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Everyone who has registered, newest first.</p>
        </div>
        <Button onClick={exportCsv} loading={exporting} disabled={total === 0}>
          {!exporting && <Download className="size-4" />}
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search name, email, phone or firm" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          aria-label="Filter by registration status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? humanize(s.toLowerCase()) : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <ErrorBox>{error}</ErrorBox>

      <Card className="overflow-hidden">
        {rows === null ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">No players found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Registration</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {rows.map((p, i) => (
                  <tr key={p.id} onClick={() => setOpenId(p.id)} className="cursor-pointer hover:bg-blue-50/60 dark:hover:bg-slate-700/40">
                    <td className="px-4 py-3 text-slate-400">{from + i}</td>
                    <td className="px-4 py-3 font-medium">
                      {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3">{p.email ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{p.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge status={p.registration_status} />
                    </td>
                    <td className="px-4 py-3">
                      {p.payment ? (
                        <span className="flex items-center gap-2">
                          <Badge status={p.payment.status} />
                          <span className="text-xs capitalize text-slate-500">{p.payment.gateway}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {from}–{to} of {total}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={to >= total}>
            Next
          </Button>
        </div>
      </div>

      {openId && <PlayerDrawer id={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}

const HIDDEN = new Set(["id", "revision_id"])

function PlayerDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { handleError } = useSession()
  const [detail, setDetail] = useState<PlayerDetail | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    getPlayer(id)
      .then((d) => !cancelled && setDetail(d))
      .catch((err) => !cancelled && setError(handleError(err)))
    return () => {
      cancelled = true
    }
  }, [id, handleError])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const player = detail?.player
  const photo = typeof player?.photo_url === "string" ? player.photo_url : null
  // Every stored field is shown, so a new event's extra form fields appear here without code changes.
  const fields = player ? Object.entries(player).filter(([k]) => !HIDDEN.has(k) && k !== "photo_url") : []

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-label="Player details"
        className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold">
            {player ? [player.first_name, player.last_name].filter(Boolean).join(" ") || "Player" : "Player"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-6 p-5">
          <ErrorBox>{error}</ErrorBox>
          {!detail && !error && <Spinner />}

          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Player photo" className="size-32 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
          )}

          {detail && (
            <>
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Payment</h3>
                {detail.payments.length === 0 ? (
                  <p className="text-sm text-slate-500">No payment attempts.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.payments.map((p, i) => (
                      <li key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                        <Badge status={String(p.status ?? "")} />
                        <span className="capitalize">{String(p.gateway ?? "razorpay")}</span>
                        <span className="font-medium">{formatAmount(p.amount, p.currency)}</span>
                        <span className="ml-auto text-xs text-slate-500">{formatDateTime(p.created_at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  {fields.map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs text-slate-500">{humanize(key)}</dt>
                      <dd className="mt-0.5 break-words text-sm">{renderValue(key, value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

function renderValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (key.endsWith("_at")) return formatDateTime(value)
  if (key.endsWith("status")) return <Badge status={String(value)} />
  if (typeof value === "object") return <code className="text-xs">{JSON.stringify(value)}</code>
  return String(value)
}
