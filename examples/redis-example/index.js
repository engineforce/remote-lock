import redis from 'redis'
import uuidv4 from 'uuid/v4'

import { makeRedisLock } from 'redis-remote-lock'

async function redisLockTest() {
  const redisClient = redis.createClient()

  const redisLock = makeRedisLock({
    redis: redisClient,
  })

  await redisLock({
    lockId: uuidv4(),
    exec: async (hasLock) => {
      if (hasLock) {
        await updateCache(redis)
      }
    },
    skipLock: async () => !(await isCacheExpired(redis)),
  })
}

async function isCacheExpired(redisClient) {
  return true
}

async function updateCache(redisClient) {
  return true
}
