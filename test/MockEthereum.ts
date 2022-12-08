import { EventEmitter } from 'events'
import { EIP1193Provider, RequestArguments } from '../src'

export class MockEthereum extends EventEmitter implements EIP1193Provider {
  async request(_args: RequestArguments) {
    return undefined
  }
}
