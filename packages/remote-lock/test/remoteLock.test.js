import { makeRemoteLock } from '../src/remoteLock'
import lolex from 'lolex'

describe('given remoteLock', () => {
  describe('when calling remoteLock once with no existing lock', () => {
    it('should call getLock only once', async () => {
      const { getLockMock } = await exec()
      expect(getLockMock).toHaveBeenCalledTimes(2)
    })

    it('should call setLock only once, and with correct parameters', async () => {
      const { setLockMock } = await exec()
      expect(setLockMock).toHaveBeenCalledTimes(1)
      expect(setLockMock.mock.calls[0][0]).toMatchObject({
        requestId: '1',
        timeout: 60000,
      })
    })

    it('should call releaseLockMock only once', async () => {
      const { releaseLockMock } = await exec()
      expect(releaseLockMock).toHaveBeenCalledTimes(1)
    })

    it('should call requests[0].exec only once with lock', async () => {
      const { requests } = await exec()
      expect(requests[0].exec).toHaveBeenCalledTimes(1)
      expect(requests[0].exec.mock.calls[0][0]).toEqual({ hasLock: true })
    })

    it('should return the result of exec', async () => {
      const { remoteLockMock } = await exec()

      expect((await remoteLockMock.mock.results[0].value).result).toEqual(
        'Pass'
      )
    })

    async function exec() {
      const requests = [
        {
          requestId: '1',
          exec: jest.fn().mockReturnValue('Pass'),
        },
      ]

      const {
        remoteLockMock,
        getLockMock,
        setLockMock,
        releaseLockMock,
      } = getTestContext()

      await new Promise((resolve, reject) => {
        getLockMock.mockImplementation(() => {
          let callCount = getLockMock.mock.calls.length
          if (callCount <= 1) {
            return undefined
          }
          return callCount - 1
        })

        Promise.all(requests.map((request) => remoteLockMock(request))).then(
          resolve,
          reject
        )
      })

      return {
        remoteLockMock,
        getLockMock,
        setLockMock,
        releaseLockMock,
        requests,
      }
    }
  })

  describe('when calling remoteLock once with existing lock which is released later', () => {
    it('should call getLock four times', async () => {
      const { getLockMock } = await exec()
      expect(getLockMock).toHaveBeenCalledTimes(4)
    })

    it('should call setLock only once, and with correct parameters', async () => {
      const { setLockMock } = await exec()
      expect(setLockMock).toHaveBeenCalledTimes(1)
      expect(setLockMock.mock.calls[0][0]).toMatchObject({
        requestId: '1',
        timeout: 60000,
      })
    })
    it('should call releaseLockMock only once', async () => {
      const { releaseLockMock } = await exec()
      expect(releaseLockMock).toHaveBeenCalledTimes(1)
    })
    it('should call requests[0].exec only once with lock', async () => {
      const { requests } = await exec()
      expect(requests[0].exec).toHaveBeenCalledTimes(1)
      expect(requests[0].exec.mock.calls[0][0]).toEqual({ hasLock: true })
    })

    it('should return the result of exec', async () => {
      const { remoteLockMock } = await exec()
      expect((await remoteLockMock.mock.results[0].value).result).toEqual(
        'Pass'
      )
    })

    async function exec() {
      const requests = [
        {
          requestId: '1',
          exec: jest.fn().mockReturnValue('Pass'),
        },
      ]

      const {
        remoteLockMock,
        getLockMock,
        setLockMock,
        releaseLockMock,
      } = getTestContext()

      const _setImmediate = setImmediate

      const clock = lolex.install()

      await new Promise((resolve, reject) => {
        getLockMock.mockImplementation(() => {
          let callCount = getLockMock.mock.calls.length
          if (callCount <= 2) {
            return '-1'
          }
          if (callCount === 3) {
            return undefined
          }
          return callCount - 3
        })

        Promise.all(requests.map((request) => remoteLockMock(request))).then(
          resolve,
          reject
        )

        _setImmediate(() => {
          clock.tick(1000)

          _setImmediate(() => {
            clock.tick(1000)
          })
        })
      })

      clock.uninstall()

      return {
        remoteLockMock,
        getLockMock,
        setLockMock,
        releaseLockMock,
        requests,
      }
    }
  })

  describe.only('when calling remoteLock once but never get the lock', () => {
    it('should call getLock four times', async () => {
      const { getLockMock } = await exec()
      expect(getLockMock).toHaveBeenCalledTimes(2)
    })
    it('should not call setLock', async () => {
      const { setLockMock } = await exec()
      expect(setLockMock).toHaveBeenCalledTimes(0)
    })

    it('should not call releaseLockMock', async () => {
      const { releaseLockMock } = await exec()
      expect(releaseLockMock).toHaveBeenCalledTimes(0)
    })

    it('should not call requests[0].exec', async () => {
      const { requests } = await exec()
      expect(requests[0].exec).toHaveBeenCalledTimes(0)
    })

    async function exec() {
      const requests = [
        {
          requestId: '1',
          exec: jest.fn().mockReturnValue('Pass'),
        },
      ]

      const {
        remoteLockMock,
        getLockMock,
        setLockMock,
        releaseLockMock,
      } = getTestContext()

      const _setImmediate = setImmediate

      const clock = lolex.install()

      await new Promise((resolve, reject) => {
        getLockMock.mockImplementation(() => {
          return '-1'
        })

        Promise.all(requests.map((request) => remoteLockMock(request))).then(
          resolve,
          reject
        )

        _setImmediate(() => {
          clock.tick(1000)

          _setImmediate(() => {
            clock.tick(59001)
          })
        })
      })

      clock.uninstall()

      return {
        remoteLockMock,
        getLockMock,
        setLockMock,
        releaseLockMock,
        requests,
      }
    }
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
    remoteLockMock: jest.fn(async (args) => {
      try {
        return {
          result: await remoteLock({ ...args }),
        }
      } catch (error) {
        return { error }
      }
    }),
  }
}
