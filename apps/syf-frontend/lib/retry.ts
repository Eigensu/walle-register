export type RetryOptions = {
  /** Wait (ms) before each retry, so there are delays.length + 1 attempts in all. */
  delays: number[]
  /** Whether this error is worth another attempt. */
  retryIf: (err: unknown) => boolean
  /** Stop retrying, e.g. once the page that wanted the answer has gone. */
  isCancelled: () => boolean
  sleep: (ms: number) => Promise<void>
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** About 27 seconds of waiting across six attempts: long enough for a phone to get its network back. */
export const patientDelays = [1000, 2000, 4000, 8000, 12000]

/** Runs `run`, and on a retryable error tries again after each delay. Rejects with the last error. */
export async function withRetry<T>(run: () => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
  const { delays = patientDelays, retryIf = () => true, isCancelled = () => false, sleep = wait } = options
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    } catch (err) {
      if (attempt >= delays.length || !retryIf(err) || isCancelled()) throw err
      await sleep(delays[attempt])
      if (isCancelled()) throw err
    }
  }
}
