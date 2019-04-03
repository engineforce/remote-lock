/**
 * @param {object} input
 * @param {(input: IGetLockInput) => Promise<string>} input.getLock
 * @param {(input: ISetLockInput) => Promise<void>} input.setLock
 * @param {(input: IReleaseLockInput) => Promise<void>} input.releaseLock
 * @param {number} input.pollingTimeout
 * @param {number} input.totalTimeout
 */
export const remoteLock = ({
  getLock,
  setLock,
  releaseLock,
  pollingTimeout,
  totalTimeout
}) => {
  pollingTimeout = pollingTimeout || 1000;
  totalTimeout = totalTimeout || 30000;

  return (
    /**
     * @param {object} input
     * @param {string} input.lockId
     * @param {(input: IExecInput) => Promise<any>} input.exec
     * @param {() => Promise<boolean>} input.skipLock
     */
    async ({ lockId, exec, skipLock }) => {
      console.assert(lockId != undefined, 'Lock ID is empty.');

      let hasLock = false;

      try {
        hasLock = await pollForLock({
          getLock,
          setLock,
          lockId,
          pollingTimeout,
          skipLock,
          totalTimeout
        });

        return exec({ hasLock });
      } finally {
        if (hasLock) {
          await releaseLock({ lockId });
        }
      }
    }
  );
};

/**
 * @param {object} input
 * @param {(input: IGetLockInput) => Promise<string>} input.getLock
 * @param {(input: ISetLockInput) => Promise<void>} input.setLock
 * @param {() => Promise<boolean>} input.skipLock
 * @param {string} input.lockId
 * @param {number} input.pollingTimeout
 * @param {number} input.totalTimeout
 */
async function pollForLock({
  pollingTimeout,
  totalTimeout,
  skipLock,
  lockId,
  getLock,
  setLock
}) {
  let count = 0;
  let hasLock = false;
  const startTime = new Date().getTime();

  while (true) {
    count++;
    if (typeof skipLock === 'function' && count > 1) {
      if (await skipLock()) {
        break;
      }
    }

    const currentTime = new Date().getTime();
    if (currentTime - startTime > totalTimeout) {
      throw new Error(`Failed to obtain lock after ${totalTimeout} ms.`);
    }

    const currentLockId = await getLock({ lockId });

    if (currentLockId == undefined) {
      await setLock({ lockId, timeout: totalTimeout });
      continue;
    }

    if (currentLockId == lockId) {
      hasLock = true;
      break;
    }

    await new Promise(resolve => setTimeout(resolve, pollingTimeout));
  }

  return hasLock;
}

/**
 * @typedef {object} IGetLockInput
 * @property {string} lockId
 *
 * @typedef {object} ISetLockInput
 * @property {string} lockId
 * @property {number} timeout - timeout in ms
 *
 * @typedef {object} IReleaseLockInput
 * @property {string} lockId
 *
 * @typedef {object} IExecInput
 * @property {boolean} hasLock
 */
