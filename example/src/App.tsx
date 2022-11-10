import { ConsoleView } from './ConsoleView'
import { TestEventButtons } from './TestEventButtons'
import { TestPageButtons } from './TestPageButtons'
import { ArcxAnalyticsProvider } from '@arcxmoney/analytics'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  const API_KEY = process.env.REACT_APP_ARCX_API_KEY
  if (!API_KEY) {
    throw new Error('REACT_APP_ARCX_API_KEY is not set')
  }
  const url = process.env.REACT_APP_ARCX_API_URL

  return (
    <BrowserRouter>
      <ArcxAnalyticsProvider apiKey={API_KEY} config={{ url }}>
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
              <TestPageButtons />
              <TestEventButtons />
              <ConsoleView />
            </div>
          </div>
        </div>
      </ArcxAnalyticsProvider>
    </BrowserRouter>
  )
}

export default App
