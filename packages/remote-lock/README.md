# remote-lock

A simple implementation of [mutex](https://stackoverflow.com/questions/2332765/lock-mutex-semaphore-whats-the-difference) that allow you to lock any resources across multiple processes/machines using a remote lock (e.g., redis, database, etc.).

[![Build Status][1]][2]

As we all know that [AWS Lambda](https://aws.amazon.com/lambda/) can scale out infinitely, i.e., infinite concurrency, but many resources (e.g., Relational Database, External API, etc.) cannot.

Refer to [example 2](#example-2), I have used this library to resolve a throttling issue from external API by allowing only one AWS Lambda to call external API and set the result in the cache so that other AWS Lambda can operate with the cached result.

## Example 1: Increment shared count

```javascript
const { promisify } = require('util')
const redis = = require('redis')
const client = redis.createClient()
const getAsync = promisify(client.get).bind(redis)
const setAsync = promisify(client.set).bind(redis)
const delAsync = promisify(client.del).bind(redis)

export const makeRedisRemoteLock = ({ lockKey }) => {
  return makeRemoteLock({
    getLock: async () => {
      return getAsync(lockKey)
    },
    setLock: async ({ requestId, timeout }) => {
      return setAsync(lockKey, requestId, 'EX', timeout / 1000)
    },
    releaseLock: async () => {
      return delAsync(lockKey)
    },
  })
}

// process 1
const remoteLock = makeRedisRemoteLock({ lockKey: 'redis.remote.lock' })

remoteLock({
    requestId: 'process 1',
    exec: async () => {
      const sharedCount = await getAsync('redis.sharedCount') || 0
      await setAsync('redis.sharedCount', sharedCount++)
    }
})

// process 2: same as process 1 above except the requestId
const remoteLock = makeRedisRemoteLock({ lockKey: 'redis.remote.lock' })

remoteLock({
    requestId: 'process 2',
    exec: () => {
      const sharedCount = await getAsync('redis.sharedCount') || 0
      await setAsync('redis.sharedCount', sharedCount++)
    }
})

// process n: same as process 1 above except the requestId
// ...

```

## Example 2: Limit number of calls to external API

```javascript
const { promisify } = require('util')
const redis = = require('redis')
const client = redis.createClient()
const getAsync = promisify(client.get).bind(redis)
const setAsync = promisify(client.set).bind(redis)
const delAsync = promisify(client.del).bind(redis)

export const makeRedisRemoteLock = ({ lockKey }) => {
  return makeRemoteLock({
    getLock: async () => {
      return getAsync(lockKey)
    },
    setLock: async ({ requestId, timeout }) => {
      return setAsync(lockKey, requestId, 'EX', timeout / 1000)
    },
    releaseLock: async () => {
      return delAsync(lockKey)
    },
  })
}

// process 1
const remoteLock = makeRedisRemoteLock({ lockKey: 'redis.remote.lock' })

remoteLock({
    requestId: 'process 1',
    exec: ({hasLock}) => {

      if (hasLock) {
        // The first process detected the external data is expired will
        // have the lock, and it is responsible to request the external data
        // and update the cache.
        await setAsync('redis.externalData', await callExternalApi())
      }

      // All other processes will just use the external data from the cache.
      const externalData = await getAsync('redis.externalData')
      // ...
    },
    skipLock: () => {
      const externalData = getAsync('redis.externalData')
      return externalData && !externalData.expired
    }
})

// process n: same as process 1 above except the requestId
// ...

```

## Function Signature (TypeScript syntax)

```typescript

function makeRemoteLock<TOut>({
  getLock: (input: { requestId: string }) => Promise<string>
  setLock: (input: { requestId: string, timeout: number }) => Promise<void>
  releaseLock: (input: { requestId: string }) => Promise<void>
  pollingTimeout = 1000      // specify how quickly to poll for the lock (ms)
  totalTimeout = 60000       // specify the maximum time to wait for the lock (ms)
}): IRemoteLock<TOut>


interface IRemoteLock<TOut> {
  (input: {
    requestId: string
    exec: (input: { hasLock: boolean }) => Promise<TOut>
    skipLock?: () => Promise<boolean>
  }): Promise<TOut>
}

```

## History

- 1.0.0 - Initial version

[1]: https://travis-ci.com/engineforce/remote-lock.svg?branch=master
[2]: https://travis-ci.com/engineforce/remote-lock
