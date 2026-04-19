import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      {/* React Hot Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#1A7F4B',
            },
          },
          error: {
            style: {
              background: '#C0392B',
            },
          },
        }}
      />
      
      {/* All Application Routes */}
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
