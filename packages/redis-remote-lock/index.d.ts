import { IRemoteLock } from 'remote-lock'

export function makeRedisRemoteLock<TOut>(input: {
  redis: {
    get: Function
    set: Function
    del: Function
  }
  pollingTimeout?: number
  totalTimeout?: number
  lockKey?: string
}): IRemoteLock<TOut>
