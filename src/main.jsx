import "aos/dist/aos.js"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './redux/store.js'
import { Provider } from "react-redux";
import AuthInitializer from './pages/auth/AuthInitializer.jsx';

 
 
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> 
    <BrowserRouter> 
    <AuthInitializer > 
    <App />
    </AuthInitializer>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
