import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiError, isTransientError, verifyCashfreePayment, verifyCashfreePaymentWithRetry } from "./registration-api"

const noWait = () => Promise.resolve()
const verified = { status: "CAPTURED", message: "Payment verified", player_id: "p1" }

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })
const failure = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status })

afterEach(() => vi.unstubAllGlobals())

describe("API errors", () => {
  it("a request that gets no response is a transient ApiError with no status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Load failed")))
    const err = await verifyCashfreePayment("cf_1").catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBeNull()
    expect(err.message).toMatch(/Couldn't reach the registration server/)
    expect(isTransientError(err)).toBe(true)
  })

  it("keeps the server's message and status for an HTTP error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(failure(404, { detail: "Payment record not found" })))
    const err = await verifyCashfreePayment("cf_1").catch((e) => e)
    expect(err.message).toBe("Payment record not found")
    expect(err.status).toBe(404)
    expect(isTransientError(err)).toBe(false)
  })

  it("treats server errors and throttling as transient, other client errors and plain errors as final", () => {
    expect(isTransientError(new ApiError("x", 502))).toBe(true)
    expect(isTransientError(new ApiError("x", 503))).toBe(true)
    expect(isTransientError(new ApiError("x", 429))).toBe(true)
    expect(isTransientError(new ApiError("x", 400))).toBe(false)
    expect(isTransientError(new ApiError("x", 409))).toBe(false)
    expect(isTransientError(new Error("x"))).toBe(false)
  })
})

describe("verifyCashfreePaymentWithRetry", () => {
  it("recovers when the first request after a UPI app fails to get through", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Load failed"))
      .mockRejectedValueOnce(new TypeError("Load failed"))
      .mockResolvedValueOnce(ok(verified))
    vi.stubGlobal("fetch", fetchMock)

    const result = await verifyCashfreePaymentWithRetry("cf_1", "p1", { sleep: noWait })

    expect(result).toEqual(verified)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ order_id: "cf_1", player_id: "p1" })
  })

  it("retries a 502 from the backend", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(failure(502, { detail: "Cashfree unreachable" })).mockResolvedValueOnce(ok(verified))
    vi.stubGlobal("fetch", fetchMock)
    expect(await verifyCashfreePaymentWithRetry("cf_1", "p1", { sleep: noWait })).toEqual(verified)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("does not retry a definite answer such as 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue(failure(404, { detail: "Payment record not found" }))
    vi.stubGlobal("fetch", fetchMock)
    await expect(verifyCashfreePaymentWithRetry("cf_1", "p1", { sleep: noWait })).rejects.toThrow("Payment record not found")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects with a transient error once every attempt has failed", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Load failed"))
    vi.stubGlobal("fetch", fetchMock)
    const err = await verifyCashfreePaymentWithRetry("cf_1", "p1", { delays: [1, 1], sleep: noWait }).catch((e) => e)
    expect(isTransientError(err)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
