import { RequestArguments } from '@metamask/providers/dist/BaseProvider'
import { EventEmitter } from 'events'

export class MockEthereum extends EventEmitter {
  request(_args: RequestArguments) {
    return Promise.resolve()
  }
}
