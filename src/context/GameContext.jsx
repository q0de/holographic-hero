import { createContext, useContext } from 'react'
import { useGameState } from '../hooks/useGameState'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const gameState = useGameState()
  
  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

export default GameContext



