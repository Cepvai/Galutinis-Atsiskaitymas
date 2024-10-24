//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';

import './index.css'
import App from './App.tsx'
import { UsersProvider } from './contexts/UserContext.tsx';

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
  <BrowserRouter>
    <UsersProvider>
      <App />
    </UsersProvider>
 </BrowserRouter>
  //</StrictMode>,
)
