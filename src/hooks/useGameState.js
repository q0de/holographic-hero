import { useState, useCallback } from 'react'
import { scenarios, getScenarioById, gameConfig } from '../data/scenarios'

export function useGameState() {
  // Core game state
  const [currentScenarioId, setCurrentScenarioId] = useState(1)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [currentDosage, setCurrentDosage] = useState(gameConfig.initialDosage)
  const [gameComplete, setGameComplete] = useState(false)
  
  // Memory for variable interpolation
  const [memory, setMemory] = useState({
    Medication_1: 0.75,      // Dexamethasone
    Medication_2_AM: 5,      // Hydrocortisone AM
    Medication_2_Noon: 5,    // Hydrocortisone Noon
    Medication_2_PM: 2.5,    // Hydrocortisone PM
    Medication_3: 0.1,       // Fludrocortisone
    Lab_1: 65,               // A4
    Lab_2: 11.6,             // ACTH
    Lab_3: 213,              // 17-OHP
  })
  
  // History tracking
  const [decisionHistory, setDecisionHistory] = useState([])
  const [dosageHistory, setDosageHistory] = useState([{ week: 0, dosage: gameConfig.initialDosage }])
  
  // UI state
  const [isDragging, setIsDragging] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showTimePassage, setShowTimePassage] = useState(false)
  const [showKnowledgeCheck, setShowKnowledgeCheck] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState(null)
  const [pendingDuration, setPendingDuration] = useState(0)
  
  // Delta animation state - tracks changes to show floating indicators
  const [previousMemory, setPreviousMemory] = useState(null)
  const [memoryDeltas, setMemoryDeltas] = useState({}) // { Lab_1: -5, Lab_2: 2, etc }
  const [showDeltas, setShowDeltas] = useState(false)
  
  // Get current scenario
  const currentScenario = getScenarioById(currentScenarioId)
  
  // Interpolate memory keys in text
  const interpolate = useCallback((template) => {
    if (!template) return template
    
    return template.replace(/\[(\w+)(\s*[\+\-\*\/]\s*[\d.]+)?\]/g, (match, key, op) => {
      let value = memory[key]
      if (value === undefined) return match
      
      if (op) {
        try {
          // Safe evaluation of simple math operations
          const operator = op.trim()[0]
          const operand = parseFloat(op.trim().slice(1))
          switch (operator) {
            case '+': value = value + operand; break
            case '-': value = value - operand; break
            case '*': value = value * operand; break
            case '/': value = value / operand; break
          }
        } catch (e) {
          console.error('Interpolation error:', e)
        }
      }
      
      return typeof value === 'number' ? value.toFixed(1).replace(/\.0$/, '') : value
    })
  }, [memory])
  
  // Update memory value
  const updateMemory = useCallback((key, operation, value) => {
    setMemory(prev => {
      const current = prev[key] ?? 0
      let newValue
      
      switch (operation) {
        case 'set':
          newValue = value
          break
        case 'add':
          newValue = current + value
          break
        case 'subtract':
          newValue = current - value
          break
        case 'multiply':
          newValue = current * value
          break
        default:
          newValue = value
      }
      
      return { ...prev, [key]: newValue }
    })
  }, [])
  
  // Make a decision
  const makeDecision = useCallback((optionKey) => {
    const scenario = getScenarioById(currentScenarioId)
    if (!scenario?.options?.[optionKey]) return
    
    const option = scenario.options[optionKey]
    
    // Save previous memory state before applying updates (for delta animations)
    setPreviousMemory({ ...memory })
    
    // Apply memory updates
    if (option.memoryUpdates) {
      option.memoryUpdates.forEach(({ key, operation, value }) => {
        updateMemory(key, operation, value)
      })
    }
    
    // Update dosage if this is a dosage decision
    if (option.dosageChange) {
      const newDosage = Math.max(0, currentDosage + option.dosageChange)
      setCurrentDosage(newDosage)
      setDosageHistory(prev => [...prev, { week: currentWeek + option.duration, dosage: newDosage }])
    }
    
    // Record decision
    setDecisionHistory(prev => [...prev, {
      scenarioId: currentScenarioId,
      optionKey,
      week: currentWeek,
      title: option.title,
      description: option.description
    }])
    
    // Set feedback and duration for time passage
    setCurrentFeedback(option.feedback)
    setPendingDuration(option.duration || 2)
    
    // Show feedback modal
    setShowFeedback(true)
    
  }, [currentScenarioId, currentWeek, currentDosage, updateMemory, memory])
  
  // Handle feedback continue
  const handleFeedbackContinue = useCallback(() => {
    setShowFeedback(false)
    setShowTimePassage(true)
  }, [])
  
  // Handle time passage complete
  const handleTimePassageComplete = useCallback(() => {
    setShowTimePassage(false)
    
    // Calculate deltas for animation (compare previous memory to current)
    if (previousMemory) {
      const deltas = {}
      Object.keys(memory).forEach(key => {
        const prev = previousMemory[key]
        const curr = memory[key]
        if (typeof prev === 'number' && typeof curr === 'number' && prev !== curr) {
          deltas[key] = curr - prev
        }
      })
      if (Object.keys(deltas).length > 0) {
        setMemoryDeltas(deltas)
        setShowDeltas(true)
        // Clear deltas after animation completes
        setTimeout(() => {
          setShowDeltas(false)
          setMemoryDeltas({})
        }, 2000)
      }
      setPreviousMemory(null)
    }
    
    // Update week
    const newWeek = currentWeek + pendingDuration
    setCurrentWeek(newWeek)
    
    // Check for game completion
    if (currentDosage <= gameConfig.targetDosage) {
      setGameComplete(true)
      return
    }
    
    // Get next scenario
    const scenario = getScenarioById(currentScenarioId)
    const currentOption = Object.values(scenario?.options || {}).find(o => o.feedback === currentFeedback)
    const nextId = currentOption?.nextScenario || currentScenarioId
    
    // Check for knowledge check trigger
    if (currentOption?.triggerKnowledgeCheck) {
      setShowKnowledgeCheck(true)
    } else {
      setCurrentScenarioId(nextId)
    }
    
    setCurrentFeedback(null)
    setPendingDuration(0)
  }, [currentWeek, pendingDuration, currentDosage, currentScenarioId, currentFeedback, previousMemory, memory])
  
  // Handle knowledge check complete
  const handleKnowledgeCheckComplete = useCallback(() => {
    setShowKnowledgeCheck(false)
    // Move to next scenario after knowledge check
    const scenario = getScenarioById(currentScenarioId)
    const currentOption = Object.values(scenario?.options || {}).find(o => o.feedback === currentFeedback)
    const nextId = currentOption?.nextScenario || currentScenarioId
    setCurrentScenarioId(nextId)
  }, [currentScenarioId, currentFeedback])
  
  // Reset game
  const resetGame = useCallback(() => {
    setCurrentScenarioId(1)
    setCurrentWeek(0)
    setCurrentDosage(gameConfig.initialDosage)
    setGameComplete(false)
    setMemory({
      Medication_1: 0.75,
      Medication_2_AM: 5,
      Medication_2_Noon: 5,
      Medication_2_PM: 2.5,
      Medication_3: 0.1,
      Lab_1: 65,
      Lab_2: 11.6,
      Lab_3: 213,
    })
    setDecisionHistory([])
    setDosageHistory([{ week: 0, dosage: gameConfig.initialDosage }])
    setShowFeedback(false)
    setShowTimePassage(false)
    setShowKnowledgeCheck(false)
    setPreviousMemory(null)
    setMemoryDeltas({})
    setShowDeltas(false)
  }, [])
  
  return {
    // State
    currentScenarioId,
    currentScenario,
    currentWeek,
    currentDosage,
    targetDosage: gameConfig.targetDosage,
    initialDosage: gameConfig.initialDosage,
    memory,
    decisionHistory,
    dosageHistory,
    gameComplete,
    
    // UI State
    isDragging,
    setIsDragging,
    showFeedback,
    showTimePassage,
    showKnowledgeCheck,
    currentFeedback,
    pendingDuration,
    
    // Delta animation state
    memoryDeltas,
    showDeltas,
    
    // Functions
    interpolate,
    updateMemory,
    makeDecision,
    handleFeedbackContinue,
    handleTimePassageComplete,
    handleKnowledgeCheckComplete,
    resetGame,
  }
}

