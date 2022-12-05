import { InpageProvider } from './web3'

declare global {
  interface Window {
    ethereum?: InpageProvider
    web3?: {
      currentProvider?: InpageProvider
    }
  }
}
