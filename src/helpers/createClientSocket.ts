import { io } from 'socket.io-client'

interface IQueryParams {
  apiKey: string
  identityId: string
  sdkVersion: string
}

export const createClientSocket = (url: string, queryParams: IQueryParams) => {
  console.log('creating socket :>>>>>>>')
  return io(url, {
    query: queryParams,
  })
}
