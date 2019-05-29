import { makeRemoteLock } from 'remote-lock'
import uuidv4 from 'uuid/v4'
import { promisify } from 'util'

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
  const lockKey = `${_lockKey || 'remote.lock'}.${uuidv4()}`

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
