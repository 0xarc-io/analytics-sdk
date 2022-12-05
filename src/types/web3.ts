export interface InpageProvider {
  request<T>(args: RequestArguments): Promise<T | null | undefined>
  on(eventName: string | symbol, listener: (...args: unknown[]) => void): this
  removeAllListeners(event?: string | symbol): this
  emit(type: string, ...args: unknown[]): boolean
}

export interface RequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}
