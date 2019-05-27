import { makeRemoteLock } from '../src/remoteLock'
import { equals } from 'ramda'

describe('given remoteLock', () => {
  describe('when calling remoteLock 3 times in random order without skipLock', () => {
    it('should call remoteLock.exec() in all order combinations', async () => {
      let expectedRequests = [
        [
          { requestId: '1', hasLock: true },
          { requestId: '2', hasLock: true },
          { requestId: '3', hasLock: true },
        ],
        [
          { requestId: '1', hasLock: true },
          { requestId: '3', hasLock: true },
          { requestId: '2', hasLock: true },
        ],
        [
          { requestId: '2', hasLock: true },
          { requestId: '1', hasLock: true },
          { requestId: '3', hasLock: true },
        ],
        [
          { requestId: '2', hasLock: true },
          { requestId: '3', hasLock: true },
          { requestId: '1', hasLock: true },
        ],
        [
          { requestId: '3', hasLock: true },
          { requestId: '1', hasLock: true },
          { requestId: '2', hasLock: true },
        ],
        [
          { requestId: '3', hasLock: true },
          { requestId: '2', hasLock: true },
          { requestId: '1', hasLock: true },
        ],
      ]
      while (expectedRequests.length > 0) {
        const { requests, executedRequests } = await exec()

        expect(requests[0].exec).toHaveBeenCalledTimes(1)
        expect(requests[1].exec).toHaveBeenCalledTimes(1)
        expect(requests[2].exec).toHaveBeenCalledTimes(1)

        expectedRequests = expectedRequests.filter(
          (requests) => !equals(requests, executedRequests)
        )

        console.log('expectedRequests', expectedRequests.length)
      }
    }, 60000)

    async function exec() {
      const { remoteLock } = getTestContext()

      /**
       * @type {{ requestId: string, hasLock: boolean }[]}
       */
      const executedRequests = []

      /**
       * @param {string} requestId
       */
      const makeExec = (requestId) =>
        jest.fn().mockImplementation(({ hasLock }) => {
          executedRequests.push({ requestId, hasLock })
        })

      const requests = [
        {
          requestId: '1',
          exec: makeExec('1'),
        },
        {
          requestId: '2',
          exec: makeExec('2'),
        },
        {
          requestId: '3',
          exec: makeExec('3'),
        },
      ]

      await Promise.all(
        requests.map((request) => {
          return new Promise((resolve) => {
            setTimeout(async () => {
              await remoteLock(request)
              resolve()
            }, Math.ceil(Math.random() * 1000))
          })
        })
      )

      return {
        requests,
        executedRequests,
      }
    }
  })

  describe('when calling remoteLock 3 times in random order with skipLock', () => {
    it('should call remoteLock.exec() in all order combinations', async () => {
      let expectedRequests = [
        [
          { requestId: '1', hasLock: true },
          { requestId: '2', hasLock: false },
          { requestId: '3', hasLock: false },
        ],
        [
          { requestId: '1', hasLock: true },
          { requestId: '3', hasLock: false },
          { requestId: '2', hasLock: false },
        ],
        [
          { requestId: '2', hasLock: true },
          { requestId: '1', hasLock: false },
          { requestId: '3', hasLock: false },
        ],
        [
          { requestId: '2', hasLock: true },
          { requestId: '3', hasLock: false },
          { requestId: '1', hasLock: false },
        ],
        [
          { requestId: '3', hasLock: true },
          { requestId: '1', hasLock: false },
          { requestId: '2', hasLock: false },
        ],
        [
          { requestId: '3', hasLock: true },
          { requestId: '2', hasLock: false },
          { requestId: '1', hasLock: false },
        ],
      ]
      while (expectedRequests.length > 0) {
        const { requests, executedRequests } = await exec()

        expect(requests[0].exec).toHaveBeenCalledTimes(1)
        expect(requests[1].exec).toHaveBeenCalledTimes(1)
        expect(requests[2].exec).toHaveBeenCalledTimes(1)

        expectedRequests = expectedRequests.filter(
          (requests) => !equals(requests, executedRequests)
        )

        console.log('expectedRequests', expectedRequests.length)
      }
    }, 60000)

    async function exec() {
      const { remoteLock, store } = getTestContext()

      /**
       * @type {{ requestId: string, hasLock: boolean }[]}
       */
      const executedRequests = []

      /**
       * @param {string} requestId
       */
      const makeExec = (requestId) =>
        jest.fn().mockImplementation(({ hasLock }) => {
          executedRequests.push({ requestId, hasLock })
          store.set('shared-resource', requestId)
        })

      /**
       * @param {string} requestId
       */
      const makeSkipLock = (requestId) =>
        jest.fn().mockImplementation(() => {
          return store.get('shared-resource') != undefined
        })

      /**
       * @type {{ requestId: string, exec: jest.Mock<any, any>, skipLock: jest.Mock<any, any>}[]}
       */
      const requests = [
        {
          requestId: '1',
          exec: makeExec('1'),
          skipLock: makeSkipLock('1'),
        },
        {
          requestId: '2',
          exec: makeExec('2'),
          skipLock: makeSkipLock('2'),
        },
        {
          requestId: '3',
          exec: makeExec('3'),
          skipLock: makeSkipLock('3'),
        },
      ]

      await Promise.all(
        requests.map((request) => {
          return new Promise((resolve) => {
            setTimeout(async () => {
              await remoteLock(request)
              resolve()
            }, Math.ceil(Math.random() * 1000))
          })
        })
      )

      return {
        requests,
        executedRequests,
      }
    }
  })
})

function getTestContext() {
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

  return { store, remoteLock }
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
