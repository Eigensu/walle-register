import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearPendingPayment, loadPendingPayment, savePendingPayment } from "./pending-payment"

const DAY = 24 * 60 * 60 * 1000

function stubStorage(overrides: Partial<Storage> = {}) {
  const data = new Map<string, string>()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    ...overrides,
  }
  vi.stubGlobal("window", { localStorage: storage })
  return data
}

describe("pending payment storage", () => {
  beforeEach(() => void stubStorage())
  afterEach(() => vi.unstubAllGlobals())

  it("round-trips an order", () => {
    savePendingPayment({ orderId: "cf_1", playerId: "p1" }, 1_000)
    expect(loadPendingPayment(2_000)).toEqual({ orderId: "cf_1", playerId: "p1", startedAt: 1_000 })
  })

  it("is empty until something is saved, and after it is cleared", () => {
    expect(loadPendingPayment()).toBeNull()
    savePendingPayment({ orderId: "cf_1", playerId: "p1" })
    clearPendingPayment()
    expect(loadPendingPayment()).toBeNull()
  })

  it("keeps only the latest order", () => {
    savePendingPayment({ orderId: "cf_1", playerId: "p1" }, 1_000)
    savePendingPayment({ orderId: "cf_2", playerId: "p1" }, 2_000)
    expect(loadPendingPayment(3_000)?.orderId).toBe("cf_2")
  })

  it("drops an order older than a day", () => {
    const data = stubStorage()
    savePendingPayment({ orderId: "cf_1", playerId: "p1" }, 0)
    expect(loadPendingPayment(DAY - 1)).not.toBeNull()
    expect(loadPendingPayment(DAY)).toBeNull()
    expect(data.size).toBe(0) // and removes it
  })

  it("ignores corrupt or malformed records", () => {
    const data = stubStorage()
    data.set("syf:pending-cashfree-payment", "{not json")
    expect(loadPendingPayment()).toBeNull()
    data.set("syf:pending-cashfree-payment", JSON.stringify({ orderId: 5 }))
    expect(loadPendingPayment()).toBeNull()
  })

  it("never throws when storage is unavailable", () => {
    const blocked = () => {
      throw new DOMException("denied", "SecurityError")
    }
    stubStorage({ getItem: blocked, setItem: blocked, removeItem: blocked })
    expect(() => savePendingPayment({ orderId: "cf_1", playerId: "p1" })).not.toThrow()
    expect(loadPendingPayment()).toBeNull()
    expect(() => clearPendingPayment()).not.toThrow()
  })
})
