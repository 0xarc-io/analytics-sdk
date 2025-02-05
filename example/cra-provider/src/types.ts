import { Attributes } from '@0xarc-io/analytics'

export type CustomRequest = {
  method: string
  url: string
  event?: string
  attributes?: Attributes
}
