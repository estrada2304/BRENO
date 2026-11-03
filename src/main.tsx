import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './app-comfort.css'
import './professional.css'

const routerBase = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter basename={routerBase}><App /></BrowserRouter></React.StrictMode>)

