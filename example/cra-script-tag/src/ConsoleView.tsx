import { useState, useEffect } from 'react';
import { ArcxAnalyticsSdk, CustomRequest } from './types/types'

export const ConsoleView = ({ capturedRequests }: { capturedRequests: CustomRequest[] }) => {
  const [sdk, setSdk] = useState<ArcxAnalyticsSdk | null>(null);

    useEffect(() => {
        if (window.arcx !== undefined) {
            setSdk(window.arcx);
        } else {
            const interval = setInterval(() => {
                if (window.arcx !== undefined) {
                    setSdk(window.arcx);
                    clearInterval(interval);
                }
            }, 100); // check every 100ms
            return () => clearInterval(interval); // cleanup the interval on unmount
        }
    }, []);

    useEffect(() => {
        if (sdk) {
            console.log('SDK Loaded:', window.arcx);
            // Do other things you want after the SDK is loaded
        }
    }, [sdk]);

  const lineToString = (url: string, method: string, event?: string, attributes?: any) => {
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
        {sdk
          ? `Requests are being sent to ${
              process.env.REACT_APP_ARCX_API_URL ?? 'api.arcx.money'
            }...`
          : 'SDK not initialized'}
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
