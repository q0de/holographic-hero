// Game configuration
export const gameConfig = {
  initialDosage: 60,
  targetDosage: 25,
  maxDosage: 60,
  patient: {
    name: 'Julia',
    age: 21,
    gender: 'F',
    avatar: '👩',
    avatarUrl: '/julia.png'
  }
}

// Lab value reference ranges
export const labRanges = {
  A4: {
    name: 'Androstenedione (A4)',
    unit: 'ng/dL',
    normal: [30, 120],
    elevated: [121, 200],
    danger: [201, Infinity]
  },
  ACTH: {
    name: 'ACTH',
    unit: 'pg/mL',
    normal: [7, 50],
    elevated: [51, 100],
    danger: [101, Infinity]
  },
  '17OHP': {
    name: '17-OHP',
    unit: 'ng/dL',
    normal: [50, 200],
    elevated: [201, 500],
    danger: [501, Infinity]
  }
}

// Scenarios data
export const scenarios = [
  {
    id: 1,
    type: 'decision',
    
    // Patient display data
    symptoms: [
      { text: 'Elevated blood pressure', isAlert: false },
      { text: 'Fatigue and mild headaches', isAlert: false },
      { text: 'Salt cravings despite increased intake', isAlert: true }
    ],
    
    medications: [
      { name: 'Dexamethasone', value: '[Medication_1]', unit: 'mg daily', icon: '💊' },
      { name: 'Hydrocortisone', value: '[Medication_2_AM]/[Medication_2_Noon]/[Medication_2_PM]', unit: 'mg', icon: '💊' },
      { name: 'Fludrocortisone', value: '[Medication_3]', unit: 'mg daily', icon: '💊' }
    ],
    
    labs: [
      { name: 'A4', value: '[Lab_1]', unit: 'ng/dL', ranges: labRanges.A4 },
      { name: 'ACTH', value: '[Lab_2]', unit: 'pg/mL', ranges: labRanges.ACTH },
      { name: '17-OHP', value: '[Lab_3]', unit: 'ng/dL', ranges: labRanges['17OHP'] }
    ],
    
    // Decision options (2x2 grid)
    options: {
      a: {
        title: 'Reduce HC',
        description: '5 mg / 5 mg / 0 mg',
        duration: 2,
        badge: 'reduce',
        dosageChange: -5,
        memoryUpdates: [
          { key: 'Medication_2_PM', operation: 'set', value: 0 },
          { key: 'Lab_1', operation: 'add', value: 10 },
          { key: 'Lab_3', operation: 'add', value: 50 }
        ],
        feedback: {
          title: 'Medication Reduced',
          description: "Julia's Hydrocortisone dosage has been reduced. Her symptoms will be monitored closely.",
          type: 'success',
          labDeltas: [
            { name: 'A4', before: '[Lab_1 - 10]', after: '[Lab_1]' },
            { name: '17-OHP', before: '[Lab_3 - 50]', after: '[Lab_3]' }
          ]
        },
        nextScenario: 1
      },
      b: {
        title: 'Reduce HC (PM)',
        description: '5 mg / 2.5 mg / 0 mg',
        duration: 2,
        badge: 'reduce',
        dosageChange: -2.5,
        memoryUpdates: [
          { key: 'Medication_2_Noon', operation: 'set', value: 2.5 },
          { key: 'Medication_2_PM', operation: 'set', value: 0 },
          { key: 'Lab_1', operation: 'add', value: 5 }
        ],
        feedback: {
          title: 'PM Dosage Reduced',
          description: "Julia's Hydrocortisone PM dosage has been reduced to 0. Her symptoms will be monitored closely.",
          type: 'success'
        },
        nextScenario: 1
      },
      c: {
        title: 'CRF1 Antagonist',
        description: 'Start CRF1 antagonist treatment',
        duration: 2,
        badge: 'new',
        dosageChange: -10,
        memoryUpdates: [
          { key: 'Lab_1', operation: 'subtract', value: 20 },
          { key: 'Lab_2', operation: 'subtract', value: 5 },
          { key: 'Lab_3', operation: 'subtract', value: 100 }
        ],
        feedback: {
          title: 'CRF1 Antagonist Success',
          description: 'Julia responds well to the CRF1 antagonist approach. Her symptoms improve steadily.',
          type: 'success'
        },
        triggerKnowledgeCheck: true,
        nextScenario: 1
      },
      d: {
        title: 'Increase FC',
        description: '0.15 mg daily',
        duration: 2,
        badge: 'increase',
        dosageChange: 0,
        memoryUpdates: [
          { key: 'Medication_3', operation: 'set', value: 0.15 }
        ],
        feedback: {
          title: 'Fludrocortisone Increased',
          description: "Julia's Fludrocortisone dosage has been increased. Her symptoms will be monitored closely.",
          type: 'warning'
        },
        nextScenario: 1
      }
    },
    
    // Knowledge check (triggered by option c)
    knowledgeCheck: {
      question: 'What is the primary mechanism of CRF1 antagonists in CAH treatment?',
      options: [
        { text: 'Blocks cortisol production in the adrenal glands', correct: false },
        { text: 'Reduces ACTH secretion from the pituitary', correct: true },
        { text: 'Directly suppresses androgen synthesis', correct: false },
        { text: 'Enhances mineralocorticoid receptor sensitivity', correct: false }
      ],
      explanation: 'CRF1 antagonists work by blocking the CRF1 receptor in the pituitary, which reduces ACTH secretion and subsequently lowers adrenal androgen production.'
    }
  }
]

// Helper function to get scenario by ID
export function getScenarioById(id) {
  return scenarios.find(s => s.id === id) || scenarios[0]
}

