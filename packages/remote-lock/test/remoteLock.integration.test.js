import { makeRemoteLock } from '../src/remoteLock'
import { equals } from 'ramda'

describe('given remoteLock', () => {
  describe('when calling remoteLock once with no existing lock', () => {
    it('should call getLock only once', async () => {
      let expectedRequestIds = [
        ['1', '2', '3'],
        ['1', '3', '2'],
        ['2', '1', '3'],
        ['2', '3', '1'],
        ['3', '1', '2'],
        ['3', '2', '1'],
      ]
      while (expectedRequestIds.length > 0) {
        const { requests, executedRequestIds } = await exec()

        expect(requests[0].exec).toHaveBeenCalledTimes(1)
        expect(requests[1].exec).toHaveBeenCalledTimes(1)
        expect(requests[2].exec).toHaveBeenCalledTimes(1)

        expect(requests[0].exec.mock.calls[0][0]).toEqual({ hasLock: true })
        expect(requests[1].exec.mock.calls[0][0]).toEqual({ hasLock: true })
        expect(requests[2].exec.mock.calls[0][0]).toEqual({ hasLock: true })

        expectedRequestIds = expectedRequestIds.filter(
          (requestIds) => !equals(requestIds, executedRequestIds)
        )

        // await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }, 600000)

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

      /**
       * @type {string[]}
       */
      const executedRequestIds = []

      await new Promise((resolve1, reject1) => {
        Promise.all(
          requests.map((request) => {
            return new Promise((resolve2) => {
              setTimeout(async () => {
                executedRequestIds.push(request.requestId)
                await remoteLock(request)
                resolve2()
              }, Math.ceil(Math.random() * 1000))
            })
          })
        ).then(resolve1, reject1)
      })

      return {
        requests,
        executedRequestIds,
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
