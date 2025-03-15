"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import MemoryGame from "./components/MemoryCard"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import Profile from "./components/auth/Profile"
import Navbar from "./components/Navbar"
import "./App.css"
import Footer from "./components/Footer"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} />
        <div className="container">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/" element={user ? <MemoryGame user={user} /> : <Navigate to="/login" />} />
          </Routes>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App

