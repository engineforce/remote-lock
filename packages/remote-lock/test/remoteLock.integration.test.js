import { makeRemoteLock } from '../src/remoteLock'

describe('given remoteLock', () => {
  describe('when calling remoteLock once with no existing lock', () => {
    it('should call getLock only once', async () => {
      await exec()
    })

    async function exec() {
      const requests = [
        {
          requestId: '1',
          exec: jest.fn().mockReturnValue('Pass 1'),
        },
        {
          requestId: '2',
          exec: jest.fn().mockReturnValue('Pass 2'),
        },
        {
          requestId: '3',
          exec: jest.fn().mockReturnValue('Pass 3'),
        },
      ]

      const { remoteLock } = getTestContext()

      await new Promise((resolve, reject) => {
        Promise.all(requests.map((request) => remoteLock(request))).then(
          resolve,
          reject
        )
      })

      return {
        requests,
      }
    }
  })
})

function getTestContext() {
  /**
   * @type {Record<string, string | undefined>}
   */
  const store = { key: undefined }

  const remoteLock = makeRemoteLock({
    getLock: async () => {
      return store.key
    },
    setLock: async ({ requestId, timeout }) => {
      store.key = requestId
    },
    releaseLock: async () => {
      delete store.key
    },
  })

  return { remoteLock }
}
