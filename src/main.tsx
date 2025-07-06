import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// COOP/COEPの確認
if (typeof window !== 'undefined' && window.crossOriginIsolated !== true) {
  console.warn('crossOriginIsolated is false. SharedArrayBuffer may not be available.')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)