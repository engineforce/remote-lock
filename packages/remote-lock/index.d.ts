export function makeRemoteLock<TOut>(
  input: IMakeRemoteLockInput
): IRemoteLock<TOut>

export interface IMakeRemoteLockInput {
  getLock: (input: IGetLockInput) => Promise<string>
  setLock: (input: ISetLockInput) => Promise<void>
  releaseLock: (input: IReleaseLockInput) => Promise<void>
  pollingTimeout?: number
  totalTimeout?: number
}

export interface IRemoteLock<TOut> {
  (input: IRemoteLockInput<TOut>): Promise<TOut>
}

export interface IRemoteLockInput<TOut> {
  lockId: string
  exec: (input: IExecInput) => Promise<TOut>
  skipLock?: () => Promise<boolean>
  pollingTimeout?: number
  totalTimeout?: number
}

export interface IGetLockInput {
  lockId: string
}

export interface ISetLockInput {
  lockId: string
  timeout: number
}

export interface IReleaseLockInput {
  lockId: string
}

export interface IExecInput {
  hasLock: boolean
}
