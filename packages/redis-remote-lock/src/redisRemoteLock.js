import { makeRemoteLock } from 'remote-lock'

/**
 *
 * @type {import('..').makeRedisRemoteLock}
 */
export const makeRedisRemoteLock = ({
  redis,
  pollingTimeout,
  totalTimeout,
  lockKey: _lockKey,
}) => {
  const lockKey = _lockKey || 'remote.lock.redis'

  return makeRemoteLock({
    getLock: async ({ requestId }) => {
      return new Promise((resolve, reject) => {
        redis.get(
          lockKey,
          /**
           * @param {any} error
           * @param {string} lockValue
           */
          (error, lockValue) => {
            if (error) {
              return reject(error)
            }

            return resolve(lockValue)
          }
        )
      })
    },
    setLock: async ({ requestId, timeout }) => {
      return new Promise((resolve, reject) => {
        redis.set(
          lockKey,
          requestId,
          'EX',
          timeout / 1000,
          /**
           * @param {any} error
           */
          (error) => {
            if (error) {
              return reject(error)
            }

            return resolve()
          }
        )
      })
    },
    releaseLock: async ({ requestId }) => {
      return new Promise((resolve, reject) => {
        redis.del(
          lockKey,
          /**
           * @param {any} error
           */
          (error) => {
            if (error) {
              return reject(error)
            }

            return resolve()
          }
        )
      })
    },
    pollingTimeout,
    totalTimeout,
  })
}
