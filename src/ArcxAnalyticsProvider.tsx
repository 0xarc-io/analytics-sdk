import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { ArcxAnalyticsSdk } from './ArcxAnalyticsSdk'
import { ArcxAnalyticsProviderProps } from './types/types'

export const ArcxAnalyticxContext = createContext<ArcxAnalyticsSdk | undefined>(undefined)

export const ArcxAnalyticsProvider = ({ apiKey, config, children }: ArcxAnalyticsProviderProps) => {
  const [sdk, setSdk] = useState<ArcxAnalyticsSdk | undefined>()
  const initializedStartedRef = useRef(false)

  useEffect(() => {
    if (!apiKey) {
      throw new Error('ArcxAnalyticxProvider: No API key provided')
    }
    if (initializedStartedRef.current) return
    initializedStartedRef.current = true

    ArcxAnalyticsSdk.init(apiKey, config).then((sdk) => setSdk(sdk))
  }, [apiKey])

  return <ArcxAnalyticxContext.Provider value={sdk}>{children}</ArcxAnalyticxContext.Provider>
}

export const useArcxAnalytics = () => {
  return useContext(ArcxAnalyticxContext)
}
