import { describe, expect, it, vi } from "vitest"
import { withRetry } from "./retry"

const noWait = async (ms?: number) => void ms

describe("withRetry", () => {
  it("returns the first success without waiting", async () => {
    const sleep = vi.fn(noWait)
    expect(await withRetry(async () => "ok", { sleep })).toBe("ok")
    expect(sleep).not.toHaveBeenCalled()
  })

  it("retries after each delay until it succeeds", async () => {
    let calls = 0
    const sleep = vi.fn(noWait)
    const result = await withRetry(
      async () => {
        if (++calls < 3) throw new Error("Load failed")
        return "ok"
      },
      { delays: [10, 20, 30], sleep },
    )
    expect(result).toBe("ok")
    expect(calls).toBe(3)
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([10, 20])
  })

  it("gives up after the last delay and rejects with the last error", async () => {
    let calls = 0
    const run = async () => {
      throw new Error(`attempt ${++calls}`)
    }
    await expect(withRetry(run, { delays: [1, 1], sleep: noWait })).rejects.toThrow("attempt 3")
    expect(calls).toBe(3) // delays.length + 1 attempts
  })

  it("does not retry an error that retryIf rejects", async () => {
    let calls = 0
    const run = async () => {
      calls++
      throw new Error("Payment record not found")
    }
    await expect(withRetry(run, { delays: [1, 1], retryIf: () => false, sleep: noWait })).rejects.toThrow("not found")
    expect(calls).toBe(1)
  })

  it("stops retrying once cancelled, including while waiting", async () => {
    let calls = 0
    let cancelled = false
    const run = async () => {
      calls++
      throw new Error("Load failed")
    }
    const sleep = async () => {
      cancelled = true // the page went away during the wait
    }
    await expect(withRetry(run, { delays: [1, 1, 1], isCancelled: () => cancelled, sleep })).rejects.toThrow("Load failed")
    expect(calls).toBe(1)
  })
})
