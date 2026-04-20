'use client'
import { scoreToColor, scoreToLabel } from '@/lib/calculateScore'
import { memo } from 'react'

// Pure SVG gauge — no Recharts import = much faster bundle & render
export const ComplianceGauge = memo(function ComplianceGauge({ score }: { score: number }) {
  const color = scoreToColor(score)
  const label = scoreToLabel(score)

  // SVG arc math
  const radius = 72
  const stroke = 14
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <svg height={160} width={160} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            stroke="#e8eaf6"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={80}
            cy={80}
          />
          {/* Progress */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s ease' }}
            r={normalizedRadius}
            cx={80}
            cy={80}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center'
        }}>
          <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color, margin: 0, lineHeight: 1 }}>
            {score}
          </p>
          <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>/100</p>
        </div>
      </div>
      <p style={{ color, fontWeight: '600', fontSize: '1rem', marginTop: 4 }}>{label}</p>
    </div>
  )
})
