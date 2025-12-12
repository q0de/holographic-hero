// GameScreen.jsx
// Main game orchestrator component

import { useState, useCallback, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { gameConfig } from '../data/scenarios'
import GameHUD from './layout/GameHUD'
import RadialPatientView from './layout/RadialPatientView'
import DecisionGrid from './decisions/DecisionGrid'
import FeedbackModal from './feedback/FeedbackModal'
import TimePassage from './feedback/TimePassage'
import KnowledgeCheck from './quiz/KnowledgeCheck'
import EndSummary from './summary/EndSummary'
import NoiseTexture from './effects/NoiseTexture'
import SpiderGraph from './patient/SpiderGraph'
import { TimePassageEffects, TimeEffectsControl } from './effects/TimePassageEffects'

export function GameScreen() {
  const {
    currentScenario,
    currentWeek,
    currentDosage,
    targetDosage,
    initialDosage,
    memory,
    decisionHistory,
    dosageHistory,
    gameComplete,
    isDragging,
    setIsDragging,
    showFeedback,
    showTimePassage,
    showKnowledgeCheck,
    currentFeedback,
    pendingDuration,
    memoryDeltas,
    showDeltas,
    interpolate,
    makeDecision,
    handleFeedbackContinue,
    handleTimePassageComplete,
    handleKnowledgeCheckComplete,
    resetGame
  } = useGame()

  const [isDropZoneActive, setIsDropZoneActive] = useState(false)
  const [dropEffect, setDropEffect] = useState(false)
  const [timeEffectType, setTimeEffectType] = useState('ring') // 'particles' | 'ring' | 'timeline' | 'vhs'
  const [useNewTimeEffect, setUseNewTimeEffect] = useState(true) // Toggle between old modal and new effects
  const [cardAnimationKey, setCardAnimationKey] = useState(0) // Increment to re-deal cards
  const [showSpiderGraph, setShowSpiderGraph] = useState(false) // Spider graph overlay
  const patientCenterRef = useRef(null)
  
  // Wrap time passage complete to trigger card re-deal animation
  const handleTimePassageWithRedeal = useCallback(() => {
    handleTimePassageComplete()
    // Small delay to let state update, then trigger card re-animation
    setTimeout(() => {
      setCardAnimationKey(prev => prev + 1)
    }, 100)
  }, [handleTimePassageComplete])

  // Handle drag start
  const handleDragStart = useCallback((optionKey) => {
    setIsDragging(true)
    setIsDropZoneActive(true)
  }, [setIsDragging])

  // Handle drag end
  const handleDragEnd = useCallback((optionKey, info) => {
    setIsDragging(false)
    setIsDropZoneActive(false)

    // Check if dropped near center (simple distance check)
    // In a real implementation, you'd check against the actual drop zone bounds
    const { point } = info
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Center zone is roughly in the middle of the screen
    const centerX = viewportWidth / 2
    const centerY = viewportHeight * 0.4 // Slightly above center due to HUD
    
    const distance = Math.sqrt(
      Math.pow(point.x - centerX, 2) + 
      Math.pow(point.y - centerY, 2)
    )
    
    // If within 100px of center, consider it a drop
    if (distance < 120) {
      setDropEffect(true)
      setTimeout(() => setDropEffect(false), 800)
      // Delay decision to let the effect play
      setTimeout(() => makeDecision(optionKey), 500)
    }
  }, [setIsDragging, makeDecision])

  // Handle tap on card (mobile fallback)
  const handleCardTap = useCallback((optionKey) => {
    // On tap, show confirmation or directly make decision
    setDropEffect(true)
    setTimeout(() => setDropEffect(false), 800)
    // Delay decision to let the effect play
    setTimeout(() => makeDecision(optionKey), 500)
  }, [makeDecision])

  // If game is complete, show summary
  if (gameComplete) {
    return (
      <EndSummary
        patient={gameConfig.patient}
        finalDosage={currentDosage}
        targetDosage={targetDosage}
        totalWeeks={currentWeek}
        dosageHistory={dosageHistory}
        decisionHistory={decisionHistory}
        onReplay={resetGame}
      />
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 overflow-hidden safe-area-inset relative">
      {/* Film grain / noise overlay */}
      <NoiseTexture opacity={0.12} speed={40} />
      
      {/* Top HUD */}
      <GameHUD
        patient={gameConfig.patient}
        currentWeek={currentWeek}
        currentDosage={currentDosage}
        targetDosage={targetDosage}
        initialDosage={initialDosage}
        showMeter={true}
        onTimelineClick={() => setShowSpiderGraph(true)}
        onPatientClick={() => console.log('Patient clicked')}
      />

      {/* Main game area */}
      <div className="flex-1 relative">
        <RadialPatientView
          patient={gameConfig.patient}
          symptoms={currentScenario?.symptoms || []}
          medications={currentScenario?.medications || []}
          labs={currentScenario?.labs || []}
          isDropZoneActive={isDropZoneActive}
          dropEffect={dropEffect}
          onDrop={() => {}}
          interpolate={interpolate}
          memoryDeltas={showDeltas ? memoryDeltas : {}}
        >
          {/* Decision cards */}
          <DecisionGrid
            options={currentScenario?.options || {}}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTap={handleCardTap}
            interpolate={interpolate}
            animationKey={cardAnimationKey}
          />
        </RadialPatientView>
      </div>

      {/* Feedback Modal - renders inside game container */}
      <FeedbackModal
        isOpen={showFeedback && currentFeedback}
        onClose={handleFeedbackContinue}
        title={currentFeedback?.title}
        description={currentFeedback?.description}
        type={currentFeedback?.type || 'success'}
        labDeltas={currentFeedback?.labDeltas}
        interpolate={interpolate}
      />

      {/* Time Passage Effects - new visual effects */}
      <TimePassageEffects
        isActive={showTimePassage && useNewTimeEffect}
        onComplete={handleTimePassageWithRedeal}
        duration={2500}
        startWeek={currentWeek}
        endWeek={currentWeek + pendingDuration}
        effectType={timeEffectType}
      />
      
      {/* Time Passage Modal - old style (fallback) */}
      {!useNewTimeEffect && (
        <TimePassage
          isOpen={showTimePassage}
          startWeek={currentWeek}
          endWeek={currentWeek + pendingDuration}
          headerText="Time Advancement"
          progressText="Monitoring patient response and lab values..."
          onComplete={handleTimePassageWithRedeal}
        />
      )}
      
      {/* Time Effect Controls */}
      <TimeEffectsControl 
        currentEffect={timeEffectType}
        onEffectChange={setTimeEffectType}
      />
      
      {/* Spider Graph Overlay */}
      <SpiderGraph
        isOpen={showSpiderGraph}
        onClose={() => setShowSpiderGraph(false)}
        labs={currentScenario?.labs || []}
        medications={currentScenario?.medications || []}
        patient={gameConfig.patient}
        currentWeek={currentWeek}
        interpolate={interpolate}
        memory={memory}
      />

      {/* Knowledge Check - renders inside game container */}
      {currentScenario?.knowledgeCheck && (
        <KnowledgeCheck
          isOpen={showKnowledgeCheck}
          question={currentScenario.knowledgeCheck.question}
          options={currentScenario.knowledgeCheck.options}
          explanation={currentScenario.knowledgeCheck.explanation}
          onSubmit={(result) => console.log('Quiz result:', result)}
          onContinue={handleKnowledgeCheckComplete}
        />
      )}
    </div>
  )
}

export default GameScreen

