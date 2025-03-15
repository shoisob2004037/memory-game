"use client"

import { useState, useEffect } from "react"
import { updateProfile } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../../firebase"
import "./Profile.css"

function Profile({ user }) {
  const [displayName, setDisplayName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [gameHistory, setGameHistory] = useState([])
  const [bestScore, setBestScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setDisplayName(userData.displayName || "")
          setPhoneNumber(userData.phoneNumber || "")
          setGameHistory(userData.gameHistory || [])
          setBestScore(userData.bestScore)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setMessage({ text: "Failed to load profile data", type: "error" })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage({ text: "", type: "" })

    try {
      // Update display name in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      })

      // Update user document in Firestore
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        displayName,
        phoneNumber,
      })

      setMessage({ text: "Profile updated successfully!", type: "success" })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ text: "Failed to update profile", type: "error" })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="displayName">Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={user.email} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <button type="submit" className="update-button" disabled={updating}>
            {updating ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="game-stats-card">
        <h2>Game Statistics</h2>
        {bestScore ? (
          <div className="best-score-display">
            <h3>Best Score: {bestScore} moves</h3>
          </div>
        ) : (
          <p>No games completed yet.</p>
        )}

        {gameHistory.length > 0 && (
          <div className="game-history">
            <h3>Game History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Moves</th>
                  <th>Pairs</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory
                  .sort((a, b) => b.completedAt.toDate() - a.completedAt.toDate())
                  .map((game, index) => (
                    <tr key={index}>
                      <td>{game.completedAt.toDate().toLocaleDateString()}</td>
                      <td>{game.moves}</td>
                      <td>{game.pairs}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile

