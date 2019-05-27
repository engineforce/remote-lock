import redis from 'redis'
import { equals } from 'ramda'

import { makeRedisRemoteLock } from '../src/redisRemoteLock'

describe('given redisRemoteLock', () => {
  describe('when calling redisRemoteLock 3 times in random order without skipLock', () => {
    it('should call redisRemoteLock.exec() in all order combinations', async () => {
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
        const { requests, executedRequests, ga } = await exec()

        // all requests should be executed
        expect(requests[0].exec).toHaveBeenCalledTimes(1)
        expect(requests[1].exec).toHaveBeenCalledTimes(1)
        expect(requests[2].exec).toHaveBeenCalledTimes(1)

        // ga should be set by the last request
        expect(ga).toBe(executedRequests[2].requestId)

        // should call redisRemoteLock.exec() in all order combinations
        expectedRequests = expectedRequests.filter(
          (requests) => !equals(requests, executedRequests)
        )

        console.log('expectedRequests', expectedRequests.length)
      }
    }, 60000)

    async function exec() {
      const { redisRemoteLock, redisClient } = getTestContext()

      try {
        await new Promise((resolve, reject) => {
          redisClient.del('ga1', (error) => (error ? reject(error) : resolve()))
        })

        /**
         * @type {{ requestId: string, hasLock: boolean }[]}
         */
        const executedRequests = []

        /**
         * @param {string} requestId
         */
        const makeExec = (requestId) =>
          jest.fn().mockImplementation(async ({ hasLock }) => {
            executedRequests.push({ requestId, hasLock })
            if (hasLock) {
              await new Promise((resolve, reject) => {
                redisClient.set('ga1', requestId, (error) =>
                  error ? reject(error) : resolve()
                )
              })
            }
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
                await redisRemoteLock(request)
                resolve()
              }, Math.ceil(Math.random() * 1000))
            })
          })
        )

        return {
          requests,
          executedRequests,
          ga: await new Promise((resolve, reject) => {
            redisClient.get('ga1', (error, result) => {
              if (error) {
                return reject(error)
              }

              return resolve(result)
            })
          }),
        }
      } finally {
        await new Promise((resolve, reject) => {
          redisClient.quit((error) => {
            if (error) {
              return reject(error)
            }

            return resolve()
          })
        })
      }
    }
  })

  describe('when calling redisRemoteLock 3 times in random order with skipLock', () => {
    it('should call redisRemoteLock.exec() in all order combinations', async () => {
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
        const { requests, executedRequests, ga } = await exec()

        // all requests should be executed
        expect(requests[0].exec).toHaveBeenCalledTimes(1)
        expect(requests[1].exec).toHaveBeenCalledTimes(1)
        expect(requests[2].exec).toHaveBeenCalledTimes(1)

        // ga should be set by the first request
        expect(ga).toBe(executedRequests[0].requestId)

        // should call redisRemoteLock.exec() in all order combinations
        expectedRequests = expectedRequests.filter(
          (requests) => !equals(requests, executedRequests)
        )

        console.log('expectedRequests', expectedRequests.length)
      }
    }, 60000)

    async function exec() {
      const { redisRemoteLock, redisClient } = getTestContext()

      try {
        await new Promise((resolve, reject) => {
          redisClient.del('ga2', (error) => (error ? reject(error) : resolve()))
        })

        /**
         * @type {{ requestId: string, hasLock: boolean }[]}
         */
        const executedRequests = []

        /**
         * @param {string} requestId
         */
        const makeExec = (requestId) =>
          jest.fn().mockImplementation(async ({ hasLock }) => {
            executedRequests.push({ requestId, hasLock })
            if (hasLock) {
              await new Promise((resolve, reject) => {
                redisClient.set('ga2', requestId, (error) =>
                  error ? reject(error) : resolve()
                )
              })
            }
          })

        /**
         * @param {string} requestId
         */
        const makeSkipLock = (requestId) =>
          jest.fn().mockImplementation(async () => {
            return await new Promise((resolve, reject) => {
              redisClient.get('ga2', (error, gaValue) => {
                if (error) {
                  return reject(error)
                }

                return resolve(gaValue != undefined)
              })
            })
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
                await redisRemoteLock(request)
                resolve()
              }, Math.ceil(Math.random() * 1000))
            })
          })
        )

        return {
          requests,
          executedRequests,
          ga: await new Promise((resolve, reject) => {
            redisClient.get('ga2', (error, result) => {
              if (error) {
                return reject(error)
              }

              return resolve(result)
            })
          }),
        }
      } finally {
        await new Promise((resolve, reject) => {
          redisClient.quit((error) => {
            if (error) {
              return reject(error)
            }

            return resolve()
          })
        })
      }
    }
  })
})

function getTestContext() {
  const redisClient = redis.createClient({
    port: 6399,
  })

  const redisRemoteLock = makeRedisRemoteLock({
    redis: redisClient,
  })

  return {
    redisClient,
    redisRemoteLock,
  }
}
