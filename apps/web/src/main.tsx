import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/globals.css'
import { validateEnv } from './utils/env'

// Validate environment variables before starting the app
const { isValid, errors } = validateEnv()

if (!isValid) {
  // In production, fail fast
  if (import.meta.env.PROD) {
    console.error('🚨 Application cannot start due to environment configuration errors:')
    errors.forEach(error => console.error(`  - ${error}`))

    // Show a user-friendly error message
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
          text-align: center;
        ">
          <h1 style="color: #dc2626; margin-bottom: 16px;">Application Configuration Error</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">
            The application cannot start due to missing or invalid environment variables.
          </p>
          <details style="text-align: left; max-width: 600px; background: #f3f4f6; padding: 16px; border-radius: 8px;">
            <summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
            <pre style="margin-top: 12px; font-size: 14px; overflow-x: auto;">${errors.join('\n')}</pre>
          </details>
        </div>
      `
    }
    throw new Error('Environment validation failed')
  } else {
    // In development, show warnings but continue
    console.warn('⚠️ Environment variables not fully configured, but continuing in development mode')
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)