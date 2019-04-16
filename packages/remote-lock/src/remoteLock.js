/**
 * @type {import("..").makeRemoteLock}
 */
export const makeRemoteLock = ({
  getLock: _getLock,
  setLock: _setLock,
  releaseLock: _releaseLock,
  pollingTimeout: _pollingTimeout,
  totalTimeout: _totalTimeout,
}) => {
  return async ({
    requestId,
    exec,
    skipLock,
    pollingTimeout,
    totalTimeout,
  }) => {
    console.assert(requestId != undefined, 'Lock ID is empty.')

    pollingTimeout = pollingTimeout || _pollingTimeout || 1000
    totalTimeout = totalTimeout || _totalTimeout || 60000

    let hasLock = false

    try {
      hasLock = await pollForLock({
        getLock: _getLock,
        setLock: _setLock,
        requestId,
        pollingTimeout,
        skipLock,
        totalTimeout,
      })

      return exec({ hasLock })
    } finally {
      if (hasLock) {
        await _releaseLock({ requestId })
      }
    }
  }
}

/**
 * @param {object} input
 * @param {(input?: import("..").IGetLockInput) => Promise<string | undefined>} input.getLock
 * @param {(input: import("..").ISetLockInput) => Promise<void>} input.setLock
 * @param {() => Promise<boolean>=} input.skipLock
 * @param {string} input.requestId
 * @param {number} input.pollingTimeout
 * @param {number} input.totalTimeout
 */
async function pollForLock({
  pollingTimeout,
  totalTimeout,
  skipLock,
  requestId,
  getLock,
  setLock,
}) {
  let count = 0
  let hasLock = false
  const startTime = new Date().getTime()

  while (true) {
    count++
    if (typeof skipLock === 'function' && count > 1) {
      if (await skipLock()) {
        break
      }
    }

    const currentTime = new Date().getTime()

    if (currentTime - startTime > totalTimeout) {
      throw new Error(
        `Timeout Error: Paul Debug 3 Failed to obtain lock after ${totalTimeout} ms.`
      )
    }

    const currentRequestId = await getLock()

    if (currentRequestId == undefined) {
      await setLock({ requestId, timeout: totalTimeout })
      continue
    }

    if (currentRequestId == requestId) {
      hasLock = true
      break
    }

    await new Promise((resolve) => setTimeout(resolve, pollingTimeout))
  }

  return hasLock
}
