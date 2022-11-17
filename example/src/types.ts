import { Attributes } from '@arcxmoney/analytics'

export type CustomRequest = {
  method: string
  url: string
  event?: string
  attributes?: Attributes
}
