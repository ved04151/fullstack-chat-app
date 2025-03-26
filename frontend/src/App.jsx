import React, { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import {Routes, Route, Navigate} from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore.js'

import {Loader} from "lucide-react"
import { useThemeStore } from './store/useThemeStore.js'

const App = () => {

  // const Navigate = useNavigate();
  const { authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore();
  const { theme }=useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth])

  console.log({authUser})

  if(isCheckingAuth && !authUser) return(
    <div className = "flex items-center justify-center h-screen">
      <Loader className = "size-10 animate-spin"/>
    </div>
  )
  return (
    <div data-theme = {theme}>
      {/* <h1>Hello world</h1> */}
      <Navbar/>

      <Routes>
        <Route path= "/" element = {authUser ? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path= "/signup" element = {!authUser ? <SignupPage/> : <Navigate to = "/"/>}/>
        <Route path= "/login" element = {!authUser ? <LoginPage/> : <Navigate to = "/"/>}/>
        <Route path= "/settings" element = {<SettingsPage/>}/>
        <Route path= "/profile" element = {authUser ? <ProfilePage/> : <Navigate to = '/login'/>}/>

      </Routes>

    </div>
  )
}

export default App