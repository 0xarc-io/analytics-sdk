import { EventEmitter } from 'events'
import { TEST_CHAIN_ID } from './fixture'

export class MockEthereum extends EventEmitter {
  chainId = TEST_CHAIN_ID
}
