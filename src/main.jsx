import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'

// No StrictMode — prevents rAF double-invocation in dev
createRoot(document.getElementById('root')).render(<App />)
