import uuidv4 from 'uuid/v4'
import { makeRemoteLock } from './remoteLock'

/**
 * @param {object} input
 * @param {*} input.redis
 * @param {number=} input.pollingTimeout
 * @param {number=} input.totalTimeout
 * @param {string=} input.lockIdPrefix
 */
export const makeRedisLock = ({
  redis,
  pollingTimeout,
  totalTimeout,
  lockIdPrefix,
}) => {
  lockIdPrefix = lockIdPrefix || 'remote.lock.redis'

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
