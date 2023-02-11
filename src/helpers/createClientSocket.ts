import { io } from 'socket.io-client'

interface IQueryParams {
  apiKey: string
  identityId: string
  sdkVersion: string
}

export const createClientSocket = (url: string, queryParams: IQueryParams) => {
  return io(url, {
    query: queryParams,
    transports: ['websocket'],
  })
}
