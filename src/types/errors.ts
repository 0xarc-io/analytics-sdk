export class InvalidChainIdError extends Error {
  constructor(chainId: unknown) {
    super(`Invalid chainId "${chainId}"`)

    Object.setPrototypeOf(this, InvalidChainIdError.prototype)
  }
}
