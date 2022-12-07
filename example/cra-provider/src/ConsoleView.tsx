import { Attributes, useArcxAnalytics } from '@arcxmoney/analytics'
import { CustomRequest } from './types'

export const ConsoleView = ({ capturedRequests }: { capturedRequests: CustomRequest[] }) => {
  const sdk = useArcxAnalytics()

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
    <div className="mt-8 h-[30rem] overflow-auto scroll-smooth w-full bg-slate-900 p-4 font-mono flex flex-col gap-4 text-yellow-500">
      <div className="font-bold mb-4">
        Requests are being sent to {process.env.REACT_APP_ARCX_API_URL ?? 'api.arcx.money'}...
      </div>
      <div>
        {sdk && '> SDK initialized with ID: ' + sdk.identityId}
        {capturedRequests.map((line, i) => (
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
  )
}
