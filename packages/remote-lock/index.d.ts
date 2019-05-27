export function makeRemoteLock<TOut>(
  input: IMakeRemoteLockInput
): IRemoteLock<TOut>

export interface IMakeRemoteLockInput {
  getLock: (input: IGetLockInput) => Promise<string | undefined>
  setLock: (input: ISetLockInput) => Promise<void>
  releaseLock: (input: IReleaseLockInput) => Promise<void>
  pollingTimeout?: number
  totalTimeout?: number
}

export interface IRemoteLock<TOut> {
  (input: IRemoteLockInput<TOut>): Promise<TOut>
}

export interface IRemoteLockInput<TOut> {
  requestId: string
  exec: (input: IExecInput) => Promise<TOut>
  skipLock?: () => Promise<boolean>
  pollingTimeout?: number
  totalTimeout?: number
}

export interface IGetLockInput {
  requestId: string
}

export interface ISetLockInput {
  requestId: string
  timeout: number
}

export interface IReleaseLockInput {
  requestId: string
}

export interface IExecInput {
  hasLock: boolean
}
