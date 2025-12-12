// RadialPatientView.jsx
// Core layout component - patient at center with fanning info panels

import { motion, AnimatePresence } from 'framer-motion'
import BackgroundGrid from '../effects/BackgroundGrid'
import FanPanels from '../effects/FanPanels'
import SymptomsDisplay from '../patient/SymptomsDisplay'
import PatientCenter from '../patient/PatientCenter'

export function RadialPatientView({
  patient,
  symptoms = [],
  medications = [],
  labs = [],
  isDropZoneActive,
  dropEffect,
  onDrop,
  interpolate,
  children // Decision cards slot
}) {
  return (
    <div className="radial-container relative">
      {/* Background grid pattern */}
      <BackgroundGrid />
      
      {/* Fan panels with meds/labs info */}
      <FanPanels 
        medications={medications}
        labs={labs}
        interpolate={interpolate}
      />
      
      {/* Top bar - Symptoms */}
      <div className="absolute top-2 left-3 right-3 z-20">
        <SymptomsDisplay symptoms={symptoms} interpolate={interpolate} />
      </div>
      
      {/* Center - Patient + Drop Zone */}
      <PatientCenter
        patient={patient}
        isActive={isDropZoneActive}
        dropEffect={dropEffect}
        onDrop={onDrop}
      />
      
      {/* Bottom - Decision cards (passed as children) */}
      <div className="decision-slot">
        {children}
      </div>
    </div>
  )
}

export default RadialPatientView

