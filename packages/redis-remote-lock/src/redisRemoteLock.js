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
    getLock: async () => {
      return redis.get(lockKey)
    },
    setLock: async ({ requestId, timeout }) => {
      return redis.set(lockKey, requestId, 'EX', timeout / 1000)
    },
    releaseLock: async () => {
      return redis.del(lockKey)
    },
    pollingTimeout,
    totalTimeout,
  })
}
