
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from "./rootReducer"
import { authApi } from '@/features/api/authApi'
import { courseApi } from '@/features/api/courseApi'
import { purchaseApi } from '@/features/api/purchaseApi'
import { courseProgressApi } from '@/features/api/courseProgressApi'
export const store = configureStore({
   // Add the generated reducer as a specific top-level slice
     reducer:rootReducer,
     // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
    middleware:(defaultMiddleware)=> defaultMiddleware().concat(authApi.middleware,courseApi.middleware,purchaseApi.middleware,courseProgressApi.middleware)
    
  })


  //load user when this loadUser from authapi is called 
  const intializeApp= async()=>{
         await store.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}))
  }
  intializeApp();
  
  
 