import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Wrap the app with BrowserRouter
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* One Router here wrapping the whole app */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();