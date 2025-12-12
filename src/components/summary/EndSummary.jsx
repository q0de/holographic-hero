// EndSummary.jsx
// End game summary with dosage chart and star rating

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button, Avatar } from '@heroui/react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function EndSummary({
  patient,
  finalDosage,
  targetDosage,
  totalWeeks,
  dosageHistory = [],
  decisionHistory = [],
  onReplay,
  onCaseSummary,
  onTimeline
}) {
  // Calculate star rating (1-3)
  const starRating = useMemo(() => {
    if (finalDosage <= targetDosage && totalWeeks <= 20) return 3
    if (finalDosage <= targetDosage && totalWeeks <= 30) return 2
    return 1
  }, [finalDosage, targetDosage, totalWeeks])

  // Chart data
  const chartData = useMemo(() => ({
    labels: dosageHistory.map(d => `Week ${d.week}`),
    datasets: [
      {
        label: 'Dosage (mg)',
        data: dosageHistory.map(d => d.dosage),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Target',
        data: dosageHistory.map(() => targetDosage),
        borderColor: '#22c55e',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  }), [dosageHistory, targetDosage])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { size: 10 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { size: 9 } },
        min: 0,
        max: 70
      }
    }
  }

  // Feedback message based on performance
  const feedbackMessage = useMemo(() => {
    if (starRating === 3) {
      return "Excellent! You achieved a physiologic maintenance dose safely and efficiently."
    }
    if (starRating === 2) {
      return "Good job! You reached the target dosage, but there may be room for optimization."
    }
    return "You completed the treatment. Consider reviewing decision timing for future cases."
  }, [starRating])

  return (
    <div className="h-full w-full max-w-[400px] mx-auto flex flex-col bg-slate-900 overflow-auto">
      <div className="p-6 space-y-6">
        {/* Patient Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/10"
        >
          <Avatar
            size="lg"
            name={patient?.name}
            className="bg-primary-500/20"
            fallback={<span className="text-3xl">{patient?.avatar || '👩'}</span>}
          />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {patient?.name} - {patient?.age}, {patient?.gender}
            </h3>
            <p className="text-sm text-slate-400">
              Feeling much better with improved energy levels and stable hormone levels.
            </p>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white text-center"
        >
          Treatment Summary
        </motion.h2>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="h-[200px] p-4 rounded-xl bg-slate-800/50 border border-white/10"
        >
          <Line data={chartData} options={chartOptions} />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-white/10">
            <div className="text-xs text-slate-500 uppercase">Duration</div>
            <div className="text-lg font-bold text-white">{totalWeeks} wks</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-white/10">
            <div className="text-xs text-slate-500 uppercase">Final Dose</div>
            <div className="text-lg font-bold text-success-400">{finalDosage}mg</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-white/10">
            <div className="text-xs text-slate-500 uppercase">Decisions</div>
            <div className="text-lg font-bold text-white">{decisionHistory.length}</div>
          </div>
        </motion.div>

        {/* Star Rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex justify-center gap-2"
        >
          {[1, 2, 3].map((star) => (
            <motion.span
              key={star}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + star * 0.1 }}
              className={`text-3xl ${star <= starRating ? '' : 'opacity-30 grayscale'}`}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        {/* Feedback */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-slate-400"
        >
          {feedbackMessage}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-2"
        >
          <Button
            color="primary"
            variant="solid"
            onPress={onReplay}
            className="w-full font-medium"
          >
            🔄 Replay
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="flat"
              className="bg-slate-800 text-slate-300"
              onPress={onCaseSummary}
            >
              📋 Case Summary
            </Button>
            <Button
              variant="flat"
              className="bg-slate-800 text-slate-300"
              onPress={onTimeline}
            >
              📊 Timeline
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EndSummary

