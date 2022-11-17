import { ConsoleView } from './ConsoleView'
import { TestEventButtons } from './TestEventButtons'
import { TestPageButtons } from './TestPageButtons'
import { ArcxAnalyticsProvider } from '@arcxmoney/analytics'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { CustomRequest } from './types'

function App() {
  const [isInitialized, setInitialized] = useState(false)
  const [capturedRequests, setCapturedRequests] = useState<CustomRequest[]>([])
  const hasModifiedFetchRef = useRef(false)
  const API_KEY = process.env.REACT_APP_ARCX_API_KEY
  if (!API_KEY) {
    throw new Error('REACT_APP_ARCX_API_KEY is not set')
  }
  const url = process.env.REACT_APP_ARCX_API_URL

  useEffect(() => {
    if (hasModifiedFetchRef.current) return

    hasModifiedFetchRef.current = true

    // Hijack global fetch to capture the initial events
    const originalFetch = window.fetch
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      console.log('captured', input, init)
      setCapturedRequests((capturedRequests) => {
        let body: any

        if (init?.body) {
          body = JSON.parse(init?.body?.toString() || '')
        }

        return [
          ...capturedRequests,
          {
            method: init?.method || 'GET',
            url: input.toString(),
            event: body?.event,
            attributes: body?.attributes,
          },
        ]
      })
      return originalFetch(input, init)
    }
  }, [])

  const content = (
    <div className="min-w-screen min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col justify-center items-center mt-24 gap-4">
          <h1 className="text-5xl font-bold">
            ARCx Analytics Example Page |{' '}
            <span>
              <Routes>
                <Route path="/" element="Home" />
                <Route path="/page-1" element="Page 1" />
                <Route path="/page-2" element="Page 2" />
                <Route path="/page-3" element="Page 3" />
              </Routes>
            </span>
          </h1>
          <p className="text-center">
            Welcome to the ARCx Analytics example page!
            <br />
            Click on the buttons below to change routes and fire events. You can observe what is
            being sent to the API below
          </p>
          {!isInitialized && (
            <button
              className="rounded-full px-4 py-2 bg-slate-50 text-black disabled:bg-gray-500 disabled:text-slate-50"
              disabled={isInitialized}
              onClick={() => setInitialized(true)}
            >
              Initialize
            </button>
          )}
          <TestPageButtons />
          <TestEventButtons />
          <ConsoleView capturedRequests={capturedRequests} />
        </div>
      </div>
    </div>
  )

  return (
    <BrowserRouter>
      {isInitialized ? (
        <ArcxAnalyticsProvider apiKey={API_KEY} config={{ url }}>
          {content}
        </ArcxAnalyticsProvider>
      ) : (
        content
      )}
    </BrowserRouter>
  )
}

export default App
