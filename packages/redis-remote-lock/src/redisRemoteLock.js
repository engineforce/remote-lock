import { makeRemoteLock } from 'remote-lock'

/**
 *
 * @type {import('..').makeRedisRemoteLock}
 */
export const makeRedisRemoteLock = ({
  redis,
  pollingTimeout,
  totalTimeout,
  lockKey = 'redis.remote.lock',
}) => {
  console.assert(redis != undefined, 'redis cannot be empty.')

  const getAsync = promisify(redis.get).bind(redis)
  const setAsync = promisify(redis.set).bind(redis)
  const delAsync = promisify(redis.del).bind(redis)

  return makeRemoteLock({
    getLock: async () => {
      return getAsync(lockKey)
    },
    setLock: async ({ requestId, timeout }) => {
      return setAsync(lockKey, requestId, 'EX', timeout / 1000)
    },
    releaseLock: async () => {
      return delAsync(lockKey)
    },
    pollingTimeout,
    totalTimeout,
  })
}

/**
 * @param {Function} fn
 */
function promisify(fn) {
  return (
    /**
     * @param {any[]} args
     */
    function(...args) {
      return new Promise((resolve, reject) => {
        fn.call(
          //@ts-ignore
          this,
          ...args,
          /**
           * @param {any} error
           * @param {any} result
           */
          (error, result) => (error ? reject(error) : resolve(result))
        )
      })
    }
  )
}
