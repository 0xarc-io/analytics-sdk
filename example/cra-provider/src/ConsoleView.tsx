import { Attributes, useArcxAnalytics } from '@arcxmoney/analytics'
import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { CustomRequest } from './types'

export const ConsoleView = ({ capturedRequests }: { capturedRequests: CustomRequest[] }) => {
  const [events, setEvents] = useState<CustomRequest[]>(capturedRequests)
  const sdk = useArcxAnalytics()

  useEffect(() => {
    if (!sdk) return

    const socket = sdk['socket'] as Socket

    socket.onAnyOutgoing((event, ...args) => {
      setEvents((events) => [
        ...events,
        {
          method: 'WS',
          url: socket.io['uri'],
          event,
          attributes: args[0],
        },
      ])
    })
  }, [sdk])

  const lineToString = (url: string, method: string, event?: string, attributes?: Attributes) => {
    if (event) {
      return `> ${method} ${url}: event ${event} ${
        attributes && `, attributes: ${JSON.stringify(attributes)}`
      }`
    }

    return `> ${method} ${url} ${
      attributes && `with attributes: ${JSON.stringify(attributes, null, 2)}`
    }`
  }

  return (
    <>
      <div className="mt-8 h-[30rem] overflow-auto scroll-smooth w-full bg-slate-900 p-4 font-mono flex flex-col gap-4 text-yellow-500">
        <div className="font-bold mb-4">
          Requests are being sent to {process.env.REACT_APP_ARCX_API_URL ?? 'api.arcx.money'}...
        </div>
        <div>
          {sdk && '> SDK initialized with ID: ' + sdk.identityId}
          {events.length > 0 &&
            events.map((line, i) => (
              <div key={i}>
                {line.url.includes('http') && (
                  <>
                    <br />
                    {lineToString(line.url, line.method, line.event, line.attributes)}
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
      <button
        className="rounded-full bg-white px-4 py-2 mb-4 hover:bg-gray-100 font-bold text-black"
        onClick={() => setEvents([])}
      >
        Clear console
      </button>
    </>
  )
}
