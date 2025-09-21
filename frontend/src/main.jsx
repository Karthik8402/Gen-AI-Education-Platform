// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // ✅ Use App.jsx which has ThemeProvider
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* ✅ App.jsx handles all providers */}
  </React.StrictMode>
)
