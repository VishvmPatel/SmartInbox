import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Bootstrap the single-page app. Keeping this file lightweight ensures
// Vite can hot-reload instantly while App.tsx handles the heavy UI.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)



