"use client"
import { Link, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import "./Navbar.css"

function Navbar({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Memory Game</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <span className="welcome-message">Welcome, {user.displayName || "User"}</span>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
            <Link to="/" className="nav-link">
              Game
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar

