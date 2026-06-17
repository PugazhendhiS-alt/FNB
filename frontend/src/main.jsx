import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './styles/globals.css';

window.addEventListener('error', (e) => {
  if (e.message?.includes('dynamically imported module') || e.message?.includes('Loading chunk')) {
    e.preventDefault();
    window.location.reload();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('dynamically imported module') || e.reason?.message?.includes('Loading chunk')) {
    e.preventDefault();
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '10px', padding: '12px 16px' },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);