import { useEffect, useState } from 'react'
import { Attributes, useArcxAnalytics } from '@arcxmoney/analytics'

export const ConsoleView = () => {
  const [output, setOutput] = useState<string[]>([])
  const sdk = useArcxAnalytics()

  useEffect(() => {
    if (!sdk) return

    setOutput((output) => [...output, '> SDK initialized with ID: ' + sdk.identityId])

    // Hijack the event call to output the events to the console

    const originalEventCall = sdk.event.bind(sdk)
    sdk.event = (event: string, attributes?: Attributes) => {
      setOutput((output) => [
        ...output,
        '> Event: ' + event + '\nAttributes: ' + JSON.stringify(attributes, null, 2),
      ])

      return originalEventCall(event, attributes)
    }
  }, [sdk])

  return (
    <div className="mt-8 h-[30rem] overflow-auto scroll-smooth w-full bg-slate-900 p-4 font-mono flex flex-col gap-4 text-yellow-500">
      <div className="font-bold mb-4">
        Requests are being sent to {process.env.REACT_APP_ARCX_API_URL ?? 'api.arcx.money'}...
      </div>
      <div>
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  )
}
