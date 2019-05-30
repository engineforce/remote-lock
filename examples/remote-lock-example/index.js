import uuidv4 from 'uuid/v4'

import { makeRemoteLock } from 'remote-lock'

async function remoteLockTest() {
  const store = getStore()

  const remoteLock = makeRemoteLock({
    getLock: async () => {
      return store.get('lock')
    },
    setLock: async ({ requestId, timeout }) => {
      store.set('lock', requestId)
    },
    releaseLock: async () => {
      store.del('lock')
    },
  })
}

function getStore() {
  /**
   * @type {Record<string, string | undefined>}
   */
  const store = { key: undefined }

  return {
    /**
     * @param {string | number} key
     */
    get: (key) => {
      return store[key]
    },
    /**
     * @param {string | number} key
     * @param {string | undefined} value
     */
    set: (key, value) => {
      store[key] = value
    },
    /**
     * @param {string | number} key
     */
    del: (key) => {
      delete store[key]
    },
  }
}
