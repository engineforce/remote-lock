import { IRemoteLock } from 'remote-lock'

export function makeRedisRemoteLock<TOut>(input: {
  redis: any
  pollingTimeout?: number
  totalTimeout?: number
  lockIdPrefix?: string
}): IRemoteLock<TOut>
