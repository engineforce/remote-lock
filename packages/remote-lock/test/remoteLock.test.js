import { makeRemoteLock } from '../src/remoteLock'

test('adds 1 + 2 to equal 3', () => {
  makeRemoteLock({
    getLock: () => Promise.resolve(''),
    setLock: () => Promise.resolve(),
    releaseLock: () => Promise.resolve(),
  })
  expect(3).toBe(3)
})
