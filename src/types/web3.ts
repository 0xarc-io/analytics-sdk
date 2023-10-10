import EventEmitter from 'events'

export interface RequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

export interface EIP1193Provider extends EventEmitter {
  request<T>(args: RequestArguments): Promise<T | null | undefined>
  on(eventName: string | symbol, listener: (...args: unknown[]) => void): this
  removeListener(eventName: string | symbol, listener: (...args: unknown[]) => void): this
}
