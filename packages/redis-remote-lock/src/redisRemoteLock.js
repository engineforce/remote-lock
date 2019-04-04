import { makeRemoteLock } from 'remote-lock'

/**
 *
 * @type {import('..').makeRedisRemoteLock}
 */
export const makeRedisRemoteLock = ({
  redis,
  pollingTimeout,
  totalTimeout,
  lockIdPrefix: _lockIdPrefix,
}) => {
  const lockIdPrefix = _lockIdPrefix || 'remote.lock.redis'

  return makeRemoteLock({
    getLock: async () => {
      return redis.get(lockIdPrefix)
    },
    setLock: async ({ lockId, timeout }) => {
      return redis.set(lockIdPrefix, lockId, 'EX', timeout / 1000)
    },
    releaseLock: async () => {
      return redis.del(lockIdPrefix)
    },
    pollingTimeout,
    totalTimeout,
  })
}
