import { EventEmitter } from 'events'
import { InpageProvider, RequestArguments } from '../src'

export class MockEthereum extends EventEmitter implements InpageProvider {
  async request(_args: RequestArguments) {
    return undefined
  }
}
