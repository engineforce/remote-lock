import { makeRemoteLock } from '../src/remoteLock'

describe('given remoteLock', () => {
  describe('when calling remoteLock once with no existing lock', () => {
    const request1 = {
      requestId: '1',
      exec: jest.fn(),
    }
    const {
      remoteLockMock,
      getLockMock,
      setLockMock,
      releaseLockMock,
    } = getTestContext()

    beforeAll((done) => {
      getLockMock.mockImplementation(() => {
        let callCount = getLockMock.mock.calls.length
        if (callCount === 1) {
          return undefined
        }

        return callCount - 1
      })
      Promise.all([remoteLockMock(request1)]).then(() => {
        done()
      })
    })

    it('should call getLock only once', () => {
      expect(setLockMock).toHaveBeenCalledTimes(1)
    })

    it('should call setLock only once, and with correct parameters', () => {
      expect(setLockMock).toHaveBeenCalledTimes(1)
      expect(setLockMock.mock.calls[0][0]).toMatchObject({ requestId: '1' })
    })

    it('should call releaseLockMock only once', () => {
      expect(releaseLockMock).toHaveBeenCalledTimes(1)
    })

    it('should call request1.exec only once with lock', () => {
      expect(request1.exec).toHaveBeenCalledTimes(1)
      expect(request1.exec.mock.calls[0][0]).toEqual({ hasLock: true })
    })
  })
})

function getTestContext() {
  const getLockMock = jest.fn()
  const setLockMock = jest.fn()
  const releaseLockMock = jest.fn()

  const remoteLock = makeRemoteLock({
    getLock: getLockMock,
    setLock: setLockMock,
    releaseLock: releaseLockMock,
  })

  return {
    getLockMock,
    setLockMock,
    releaseLockMock,

    /** @type {typeof remoteLock } */
    remoteLockMock: jest.fn((args) => {
      return remoteLock({
        ...args,
      })
    }),
  }
}
