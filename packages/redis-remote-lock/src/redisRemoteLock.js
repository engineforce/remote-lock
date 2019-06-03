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
  const lockKey = `${_lockKey || 'remote.lock'}.${generateUUID()}`

  const getAsync = promisify(redis.get).bind(redis)
  const setAsync = promisify(redis.set).bind(redis)
  const delAsync = promisify(redis.del).bind(redis)

  return makeRemoteLock({
    getLock: async ({ requestId }) => {
      return getAsync(lockKey)
    },
    setLock: async ({ requestId, timeout }) => {
      return setAsync(lockKey, requestId, 'EX', timeout / 1000)
    },
    releaseLock: async ({ requestId }) => {
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

function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime()
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now() //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
