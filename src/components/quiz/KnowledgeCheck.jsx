// KnowledgeCheck.jsx
// Multi-select quiz - In-game overlay (no portal)

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@heroui/react'

export function KnowledgeCheck({
  isOpen,
  question,
  options = [],
  explanation,
  onSubmit,
  onContinue
}) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions([])
      setIsSubmitted(false)
      setIsCorrect(false)
    }
  }, [isOpen])

  // Toggle option selection
  const toggleOption = (index) => {
    if (isSubmitted) return
    setSelectedOptions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  // Handle submission
  const handleSubmit = () => {
    const correctIndices = options
      .map((opt, idx) => opt.correct ? idx : null)
      .filter(i => i !== null)
    
    const isAnswerCorrect = 
      selectedOptions.length === correctIndices.length &&
      selectedOptions.every(idx => correctIndices.includes(idx))
    
    setIsCorrect(isAnswerCorrect)
    setIsSubmitted(true)
    onSubmit?.({ 
      selected: selectedOptions, 
      correct: correctIndices, 
      isCorrect: isAnswerCorrect 
    })
  }

  // Get option styling based on state
  const getOptionStyle = (index) => {
    const isSelected = selectedOptions.includes(index)
    
    if (!isSubmitted) {
      return {
        background: isSelected ? 'rgba(14, 165, 233, 0.2)' : 'rgba(30, 41, 59, 0.5)',
        border: isSelected ? '1px solid rgba(14, 165, 233, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'
      }
    }
    
    const isCorrectOption = options[index]?.correct
    
    if (isCorrectOption) {
      return {
        background: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.5)'
      }
    }
    
    if (isSelected && !isCorrectOption) {
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.5)'
      }
    }
    
    return {
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-[340px] rounded-2xl overflow-hidden my-auto"
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(14, 165, 233, 0.4)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold"
              >
                ?
              </motion.div>
              <span className="text-white font-semibold text-sm">Knowledge Check</span>
            </div>

            {/* Body */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* Question */}
              <p className="text-slate-200 text-xs leading-relaxed mb-3">
                {question}
              </p>

              {/* Instruction */}
              <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
                Select all that apply
              </p>

              {/* Options */}
              <div className="space-y-2">
                {options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleOption(index)}
                    disabled={isSubmitted}
                    className="w-full text-left p-2.5 rounded-lg transition-all"
                    style={getOptionStyle(index)}
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{
                          borderColor: selectedOptions.includes(index) ? 'rgba(14, 165, 233, 0.8)' : 'rgba(255, 255, 255, 0.3)',
                          background: selectedOptions.includes(index) ? 'rgba(14, 165, 233, 0.3)' : 'transparent'
                        }}
                      >
                        {selectedOptions.includes(index) && (
                          <span className="text-sky-400 text-xs">✓</span>
                        )}
                      </div>
                      <span className={`text-xs ${isSubmitted && options[index]?.correct ? 'text-green-400' : 'text-slate-300'} ${isSubmitted && selectedOptions.includes(index) && !options[index]?.correct ? 'line-through text-red-400' : ''}`}>
                        {option.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Feedback and explanation */}
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    {/* Result indicator */}
                    <div className={`flex items-center gap-2 mb-2 ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}>
                      <span className="text-sm">{isCorrect ? '✅' : '💡'}</span>
                      <span className="text-xs font-medium">
                        {isCorrect ? 'Correct!' : 'Review the explanation'}
                      </span>
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 rounded-lg bg-slate-800/50 border border-white/10">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                        Explanation
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              {!isSubmitted ? (
                <Button
                  color="primary"
                  variant="solid"
                  onPress={handleSubmit}
                  isDisabled={selectedOptions.length === 0}
                  className="w-full font-medium"
                >
                  Submit Answers
                </Button>
              ) : (
                <Button
                  color="success"
                  variant="solid"
                  onPress={onContinue}
                  className="w-full font-medium"
                >
                  Continue
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default KnowledgeCheck

