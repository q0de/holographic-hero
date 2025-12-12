import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProvider, useGame } from './context/GameContext'
import GameScreen from './components/GameScreen'

// Edge glow effects - red for symptoms, cyan for actions
function EdgeGlowEffects() {
  const { currentScenario, currentWeek, showFeedback } = useGame()
  const hasSymptoms = currentScenario?.symptoms?.length > 0
  
  const [showSymptomGlow, setShowSymptomGlow] = useState(false)
  const [showActionGlow, setShowActionGlow] = useState(false)
  const [lastWeek, setLastWeek] = useState(0)
  
  // Trigger symptom glow when symptoms present (pulsate then fade)
  useEffect(() => {
    if (hasSymptoms) {
      setShowSymptomGlow(true)
      // Fade out after pulsing
      const timer = setTimeout(() => setShowSymptomGlow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [hasSymptoms, currentScenario?.id])
  
  // Trigger action glow when week changes (decision was made)
  useEffect(() => {
    if (currentWeek > lastWeek) {
      setShowActionGlow(true)
      const timer = setTimeout(() => setShowActionGlow(false), 2000)
      setLastWeek(currentWeek)
      return () => clearTimeout(timer)
    }
    setLastWeek(currentWeek)
  }, [currentWeek])
  
  return (
    <>
      {/* Symptom glow - red, pulsates then fades */}
      <AnimatePresence>
        {showSymptomGlow && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-[60] rounded-[52px]"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0.3, 0.7, 0.2, 0.5, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, times: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1] }}
            style={{
              boxShadow: 'inset 0 0 80px rgba(239, 68, 68, 0.4), inset 0 0 150px rgba(239, 68, 68, 0.2)',
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Action glow - cyan/blue, shows on decision */}
      <AnimatePresence>
        {showActionGlow && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-[60] rounded-[52px]"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0.5, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, times: [0, 0.15, 0.4, 0.6, 1] }}
            style={{
              boxShadow: 'inset 0 0 100px rgba(14, 165, 233, 0.5), inset 0 0 180px rgba(14, 165, 233, 0.3)',
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="phone-notch" />
        <GameProvider>
          <EdgeGlowEffects />
          <GameScreen />
        </GameProvider>
        <div className="phone-home-indicator" />
      </div>
    </div>
  )
}

export default App

