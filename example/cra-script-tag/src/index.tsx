import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

// Needed for wallet connect connector as Buffer is missing with react scripts 5
window.Buffer = window.Buffer || Buffer

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
