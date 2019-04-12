import { makeRemoteLock } from '../src/remoteLock'

describe('given remoteLock', () => {
  describe('when ', () => {
    const sut = getSut()

    beforeAll(() => {
      // sut.remoteLockMock({})
    })

    it('should', () => {
      const remoteLock = makeRemoteLock({
        getLock: jest.fn(),
        setLock: jest.fn(),
        releaseLock: jest.fn(),
      })
      console.log('******** 1')
      expect(3).toBe(3)
    })
  })
})

function getSut() {
  const remoteLock = makeRemoteLock({
    getLock: jest.fn(),
    setLock: jest.fn(),
    releaseLock: jest.fn(),
  })

  return {
    /** @type {typeof remoteLock } */
    remoteLockMock: jest.fn(async (args) => {
      await remoteLock({
        ...args,
      })
    }),
  }
}
