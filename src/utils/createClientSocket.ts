import { io } from 'socket.io-client'

interface Dimensions {
  width: number
  height: number
}

interface IQueryParams {
  apiKey: string
  identityId: string
  sdkVersion: string
  screen: Dimensions
  viewport: Dimensions
}

export const createClientSocket = (url: string, queryParams: IQueryParams) => {
  return io(url, {
    query: queryParams,
    transports: ['websocket'],
  })
}
