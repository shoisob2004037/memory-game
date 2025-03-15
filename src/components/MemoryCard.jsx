"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore"
import { db } from "../firebase"
import "./MemoryCard.css"

const cardTypes = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁"]

function MemoryGame({ user }) {
  // Create pairs of cards and shuffle them
  const createCards = () => {
    const pairs = [...cardTypes, ...cardTypes]
    return pairs
      .map((type, index) => ({
        id: index,
        type,
        flipped: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5)
  }

  const [cards, setCards] = useState(createCards())
  const [flippedCards, setFlippedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [bestScore, setBestScore] = useState(null)

  // Fetch user's best score on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists() && userDoc.data().bestScore) {
          setBestScore(userDoc.data().bestScore)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  // Check if the game is complete
  useEffect(() => {
    if (matchedPairs === cardTypes.length) {
      setGameComplete(true)
      saveGameResult()
    }
  }, [])

  // Save game result to Firestore
  const saveGameResult = async () => {
    if (!user) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      const gameData = {
        moves,
        completedAt: new Date(),
        pairs: cardTypes.length,
      }

      // Update game history
      await updateDoc(userDocRef, {
        gameHistory: arrayUnion(gameData),
      })

      // Update best score if this score is better or if there's no best score yet
      if (!userDoc.exists() || !userDoc.data().bestScore || moves < userDoc.data().bestScore) {
        await updateDoc(userDocRef, {
          bestScore: moves,
        })
        setBestScore(moves)
      }
    } catch (error) {
      console.error("Error saving game result:", error)
    }
  }

  // Handle card flipping logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCard, secondCard] = flippedCards

      // Check if the two flipped cards match
      if (cards[firstCard].type === cards[secondCard].type) {
        // Mark cards as matched
        setCards((prevCards) =>
          prevCards.map((card, index) =>
            index === firstCard || index === secondCard ? { ...card, matched: true } : card,
          ),
        )
        setMatchedPairs((prev) => prev + 1)
        setFlippedCards([])
      } else {
        // Flip cards back after a delay
        const timeoutId = setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, index) =>
              index === firstCard || index === secondCard ? { ...card, flipped: false } : card,
            ),
          )
          setFlippedCards([])
        }, 1000)

        return () => clearTimeout(timeoutId)
      }
    }
  }, [flippedCards, cards])

  // Handle card click
  const handleCardClick = (index) => {
    // Prevent clicking if two cards are already flipped or the card is already flipped/matched
    if (flippedCards.length === 2 || cards[index].flipped || cards[index].matched) {
      return
    }

    // Flip the card
    setCards((prevCards) => prevCards.map((card, i) => (i === index ? { ...card, flipped: true } : card)))

    setFlippedCards((prev) => [...prev, index])

    // Increment moves counter when flipping a card
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1)
    }
  }

  // Reset the game
  const resetGame = () => {
    setCards(createCards())
    setFlippedCards([])
    setMoves(0)
    setGameComplete(false)
    setMatchedPairs(0)
  }

  return (
    <div className="container">
      <h1 className="title">Memory Card Game</h1>

      <div className="stats">
        <div className="moves">Moves: {moves}</div>
        <div className="pairs">
          Pairs: {matchedPairs}/{cardTypes.length}
        </div>
        {bestScore && <div className="best-score">Best Score: {bestScore} moves</div>}
      </div>

      <div className="game-board">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${card.flipped ? "flipped" : ""} ${card.matched ? "matched" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front"></div>
              <div className="card-back">{card.type}</div>
            </div>
          </div>
        ))}
      </div>

      {gameComplete && (
        <div className="game-complete">
          <h2>Congratulations!</h2>
          <p>You completed the game in {moves} moves</p>
          <button className="reset-button" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}

      {!gameComplete && (
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
      )}
    </div>
  )
}

export default MemoryGame

