import { EIP1193Provider } from './web3'

declare global {
  interface Window {
    ethereum?: EIP1193Provider
    web3?: {
      currentProvider?: EIP1193Provider
    }
  }
}
