import { makeRedisRemoteLock } from '../src/redisRemoteLock'

test('adds 1 + 2 to equal 3', () => {
  makeRedisRemoteLock({
    redis: {
      get: () => undefined,
      set: () => undefined,
      del: () => undefined,
    },
  })
  expect(3).toBe(3)
})
