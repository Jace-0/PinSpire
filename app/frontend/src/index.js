import 'core-js/stable/index.js'
import 'regenerator-runtime/runtime.js'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import reportWebVitals from './reportWebVitals'
import { AuthProvider } from './context/AuthContext'
import { PinProvider } from './context/PinContext'
import { UserProvider } from './context/UserContext'
import { NotificationProvider } from './context/NotificationContext'
import { ChatProvider } from './context/ChatContext'
import { SnackbarNotificationProvider } from './context/snackbarNotificationContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SnackbarNotificationProvider>
        <NotificationProvider>
          <ChatProvider>
            <UserProvider>
              <PinProvider>
                <App />
              </PinProvider>
            </UserProvider>
          </ChatProvider>
        </NotificationProvider>
      </SnackbarNotificationProvider>
    </AuthProvider>
  </React.StrictMode>
)
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
