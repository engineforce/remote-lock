import redis from 'redis'
import uuidv4 from 'uuid/v4'

import { makeRedisRemoteLock } from 'redis-remote-lock'

async function redisRemoteLockTest() {
  const redisClient = redis.createClient()

  const redisRemoteLock = makeRedisRemoteLock({
    redis: redisClient,
  })

  await redisRemoteLock({
    requestId: uuidv4(),
    exec: async (hasLock) => {
      if (hasLock) {
        await updateCache()
      }
    },
    skipLock: async () => !(await isCacheExpired()),
  })
}

async function isCacheExpired() {
  return true
}

async function updateCache() {
  return true
}
