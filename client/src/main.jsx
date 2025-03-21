import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { useLoadUserQuery } from './features/api/authApi'
import LoadingSpinner from './components/LoadingSpinner'

 const Custom =({children})=>{
      const {isLoading}=useLoadUserQuery();
      return isLoading?<LoadingSpinner/> :<>{children}</>
 }


createRoot(document.getElementById('root')).render(
  <StrictMode>

    <Provider store={store}>
    <Custom>
      <App />
      <Toaster />
      </Custom>
    </Provider>
  </StrictMode>,  
)
