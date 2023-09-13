import { io } from 'socket.io-client'

interface IQueryParams {
  apiKey: string
  identityId: string
  sdkVersion: string
  // Can't put objects here
  screenWidth: number
  screenHeight: number
  viewportWidth: number
  viewportHeight: number
}

export const createClientSocket = (url: string, queryParams: IQueryParams) => {
  return io(url, {
    query: queryParams,
    transports: ['websocket'],
  })
}
